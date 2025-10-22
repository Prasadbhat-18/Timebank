import { db, isFirebaseConfigured } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Chat } from '../types';

const useFirebase = isFirebaseConfigured() && !!db;

export async function getUserChats(userId: string): Promise<Chat[]> {
  if (useFirebase) {
    try {
      // Find all chats where user is a participant
      const qy = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
      const snap = await getDocs(qy);
      const chats: Chat[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        chats.push({ id: d.id, ...data, created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString() });
      });
      return chats;
    } catch (err) {
      console.warn('getUserChats falling back to local due to error:', err);
    }
  }
  // Local fallback
  const chats = JSON.parse(localStorage.getItem('timebank_shared_chats') || '[]');
  return chats.filter((c: Chat) => c.participants.includes(userId));
}
