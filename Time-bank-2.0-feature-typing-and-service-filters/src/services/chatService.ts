import { db, isFirebaseConfigured } from '../firebase';
import {
  addDoc,
  collection,
  doc,
  onSnapshot as onDocSnapshot,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import type { Chat, ChatMessage } from '../types';

const useFirebase = isFirebaseConfigured() && !!db;

const sharedKey = (k: string) => `timebank_shared_${k}`;
const loadShared = <T>(key: string, fb: T[] = []) => {
  try { const s = localStorage.getItem(sharedKey(key)); return s ? JSON.parse(s) : fb; } catch { return fb; }
};
const saveShared = <T>(key: string, data: T[]) => { try { localStorage.setItem(sharedKey(key), JSON.stringify(data)); } catch {} };

export const chatService = {
  subscribeUserChats(userId: string, cb: (chats: Chat[]) => void): () => void {
    if (useFirebase) {
      try {
        const qy = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
        const unsub = onSnapshot(qy, (snap) => {
          const arr: Chat[] = [];
          snap.forEach((d) => {
            const data = d.data() as any;
            arr.push({ id: d.id, ...data, created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString() } as Chat);
          });
          cb(arr);
        });
        return unsub;
      } catch (err) {
        console.warn('subscribeUserChats falling back to local due to error:', err);
      }
    }
    // Local fallback polling from shared storage
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      const all = loadShared<Chat>('chats', []);
      cb(all.filter((c: any) => Array.isArray(c.participants) && c.participants.includes(userId)) as Chat[]);
      setTimeout(tick, 1000);
    };
    tick();
    return () => { stopped = true; };
  },
  subscribeChatDoc(chatId: string, cb: (data: any) => void): () => void {
    if (useFirebase) {
      try {
        const ref = doc(db, 'chats', chatId);
        const unsub = onDocSnapshot(ref, (snap) => {
          if (!snap.exists()) return cb({});
          const data = snap.data() as any;
          cb({ ...data, created_at: data.created_at?.toDate?.()?.toISOString?.() || undefined });
        });
        return unsub;
      } catch (err) {
        console.warn('subscribeChatDoc falling back to local due to error:', err);
      }
    }
    // local fallback
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      const chats = loadShared<any>('chats', []);
      const found = chats.find((c: any) => c.id === chatId) || {};
      cb(found);
      setTimeout(tick, 1000);
    };
    tick();
    return () => { stopped = true; };
  },

  async setTyping(chatId: string, userId: string): Promise<void> {
    // Lightweight typing ping: updates chats.typing[userId] with a timestamp
    if (useFirebase) {
      try {
        const ref = doc(db, 'chats', chatId);
        const d = await getDoc(ref);
        const data = d.exists() ? (d.data() as any) : {};
        const updated = { ...(data || {}), typing: { ...(data?.typing || {}), [userId]: serverTimestamp() } };
        await setDoc(ref, updated, { merge: true });
        return;
      } catch (err) {
        console.warn('setTyping falling back to local due to error:', err);
      }
    }
    // local fallback using shared storage
    const chats = loadShared<any>('chats', []);
    const idx = chats.findIndex((c: any) => c.id === chatId);
    if (idx !== -1) {
      const c = chats[idx] || {};
      c.typing = { ...(c.typing || {}), [userId]: new Date().toISOString() };
      chats[idx] = c;
      saveShared('chats', chats);
    }
  },

  async setLastSeen(chatId: string, userId: string): Promise<void> {
    if (useFirebase) {
      try {
        const ref = doc(db, 'chats', chatId);
        const d = await getDoc(ref);
        const data = d.exists() ? (d.data() as any) : {};
        const updated = { ...(data || {}), lastSeen: { ...(data?.lastSeen || {}), [userId]: serverTimestamp() } };
        await setDoc(ref, updated, { merge: true });
        return;
      } catch (err) {
        console.warn('setLastSeen falling back to local due to error:', err);
      }
    }
    const chats = loadShared<any>('chats', []);
    const idx = chats.findIndex((c: any) => c.id === chatId);
    if (idx !== -1) {
      const c = chats[idx];
      c.lastSeen = { ...(c.lastSeen || {}), [userId]: new Date().toISOString() };
      chats[idx] = c;
      saveShared('chats', chats);
    }
  },
  async getOrCreateChat(userId: string, peerId: string, serviceId?: string, myPubKey?: JsonWebKey): Promise<Chat> {
    if (useFirebase) {
      try {
        // Find existing chat with both participants
        const qy = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
        const snap = await getDocs(qy);
        let chat: Chat | null = null;
        snap.forEach((d) => {
          const data = d.data() as any;
          if (Array.isArray(data.participants) && data.participants.includes(peerId)) {
            chat = { id: d.id, ...data, created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString() } as Chat;
          }
        });
        if (chat) return chat;

        // Create new chat
        const payload: any = {
          participants: [userId, peerId],
          participantsPublicKeys: myPubKey ? { [userId]: myPubKey } : {},
          service_id: serviceId || null,
          created_at: serverTimestamp(),
        };
        const ref = await addDoc(collection(db, 'chats'), payload);
        return { id: ref.id, participants: [userId, peerId], participantsPublicKeys: payload.participantsPublicKeys, service_id: serviceId, created_at: new Date().toISOString() } as Chat;
      } catch (err) {
        console.warn('getOrCreateChat falling back to local due to error:', err);
      }
    }

    // Shared local fallback
    const chats = loadShared<Chat>('chats', []);
  let chat = chats.find((c: Chat) => c.participants.includes(userId) && c.participants.includes(peerId));
    if (chat) return chat;
    chat = { id: Date.now().toString(), participants: [userId, peerId], participantsPublicKeys: myPubKey ? { [userId]: myPubKey } : {}, service_id: serviceId, created_at: new Date().toISOString() };
    chats.push(chat);
    saveShared('chats', chats);
    return chat;
  },

  async publishPublicKey(chatId: string, userId: string, jwk: JsonWebKey): Promise<void> {
    if (useFirebase) {
      try {
        const ref = doc(db, 'chats', chatId);
        const d = await getDoc(ref);
        const data = d.exists() ? d.data() as any : {};
        const updated = { ...(data || {}), participantsPublicKeys: { ...(data?.participantsPublicKeys || {}), [userId]: jwk } };
        await setDoc(ref, updated, { merge: true });
        return;
      } catch (err) {
        console.warn('publishPublicKey falling back to local due to error:', err);
      }
    }
    const chats = loadShared<Chat>('chats', []);
  const idx = chats.findIndex((c: Chat) => c.id === chatId);
    if (idx !== -1) {
      const c = chats[idx];
      c.participantsPublicKeys = { ...(c.participantsPublicKeys || {}), [userId]: jwk } as any;
      chats[idx] = c;
      saveShared('chats', chats);
    }
  },

  async getChatPublicKeys(chatId: string): Promise<Record<string, JsonWebKey>> {
    if (useFirebase) {
      try {
        const d = await getDoc(doc(db, 'chats', chatId));
        const data = d.exists() ? (d.data() as any) : {};
        return (data?.participantsPublicKeys || {}) as Record<string, JsonWebKey>;
      } catch (err) {
        console.warn('getChatPublicKeys falling back to local due to error:', err);
      }
    }
  const chat = loadShared<Chat>('chats', []).find((c: Chat) => c.id === chatId);
    return (chat?.participantsPublicKeys || {}) as Record<string, JsonWebKey>;
  },

  async sendMessage(chatId: string, msg: Omit<ChatMessage, 'id' | 'created_at' | 'chat_id'>): Promise<ChatMessage> {
    if (useFirebase) {
      try {
        const payload: any = {
          ...msg,
          created_at: serverTimestamp(),
        };
        const ref = await addDoc(collection(db, 'chats', chatId, 'messages'), payload);
        return { id: ref.id, chat_id: chatId, ...msg, created_at: new Date().toISOString() } as ChatMessage;
      } catch (err) {
        console.warn('sendMessage falling back to local due to error:', err);
      }
    }
    const messages = loadShared<ChatMessage>(`chat_${chatId}_messages`, []);
    const newMsg: ChatMessage = { id: Date.now().toString(), chat_id: chatId, ...msg, created_at: new Date().toISOString() };
    messages.push(newMsg);
    saveShared(`chat_${chatId}_messages`, messages);
    return newMsg;
  },

  subscribeMessages(chatId: string, cb: (msgs: ChatMessage[]) => void): () => void {
    if (useFirebase) {
      try {
        const qy = query(collection(db, 'chats', chatId, 'messages'), orderBy('created_at', 'asc'));
        const unsub = onSnapshot(qy, (snap) => {
          const arr: ChatMessage[] = [];
          snap.forEach((d) => {
            const data = d.data() as any;
            arr.push({ id: d.id, chat_id: chatId, ...data, created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString() });
          });
          cb(arr);
        });
        return unsub;
      } catch (err) {
        console.warn('subscribeMessages falling back to local due to error:', err);
      }
    }
    // Polling fallback for shared local
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      const arr = loadShared<ChatMessage>(`chat_${chatId}_messages`, []);
      cb(arr);
      setTimeout(tick, 1000);
    };
    tick();
    return () => { stopped = true; };
  },
};
