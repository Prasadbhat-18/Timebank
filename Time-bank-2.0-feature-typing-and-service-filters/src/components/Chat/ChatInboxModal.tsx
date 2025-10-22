import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Chat, ChatMessage, User } from '../../types';
import { User as UserIcon, MessageCircle } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { getUserChats } from '../../services/getUserChats';
import { dataService } from '../../services/dataService';

interface Props {
  onSelectChat: (chat: Chat, peerId: string) => void;
  onClose: () => void;
}

export const ChatInboxModal: React.FC<Props> = ({ onSelectChat, onClose }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, ChatMessage | undefined>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [peerInfo, setPeerInfo] = useState<Record<string, User | null>>({});

  useEffect(() => {
    if (!user) return;
    let stop = false;
    const unsubs: Array<() => void> = [];
    (async () => {
      // Keep chats list live
      const unsubList = chatService.subscribeUserChats(user.id, (liveChats) => {
        if (stop) return;
        setChats(liveChats);
        // Ensure subscriptions exist per chat
        liveChats.forEach((chat: Chat) => {
          // Fetch peer info
          const peerId = chat.participants.find((id) => id !== user.id);
          if (peerId && !peerInfo[peerId]) {
            dataService.getUserById(peerId).then((info) => {
              setPeerInfo((prev) => ({ ...prev, [peerId]: info }));
            });
          }
        });
      });
      unsubs.push(unsubList);

      // For each chat, subscribe to messages and count unread
      const allChats = await getUserChats(user.id);
      allChats.forEach((chat: Chat) => {
        // Fetch peer info
        const peerId = chat.participants.find((id) => id !== user.id);
        if (peerId && !peerInfo[peerId]) {
          dataService.getUserById(peerId).then((info) => {
            setPeerInfo((prev) => ({ ...prev, [peerId]: info }));
          });
        }
        unsubs.push(chatService.subscribeChatDoc(chat.id, (doc) => {
          // doc.lastSeen[userId] can be serverTimestamp; normalize to ms
          (chat as any).__lastSeenMs = (() => {
            const seen = doc?.lastSeen?.[user.id];
            if (!seen) return 0;
            if (typeof seen === 'string') { const t = Date.parse(seen); return isNaN(t) ? 0 : t; }
            if (typeof seen?.toDate === 'function') return seen.toDate().getTime();
            if (typeof seen === 'number') return seen;
            return 0;
          })();
        }));

        unsubs.push(chatService.subscribeMessages(chat.id, (msgs) => {
          const sorted = [...msgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          setLastMessages((prev) => ({ ...prev, [chat.id]: sorted[sorted.length - 1] }));
          const seenMs = (chat as any).__lastSeenMs || 0;
          const unread = sorted.filter((m) => m.sender_id !== user.id && new Date(m.created_at).getTime() > seenMs).length;
          setUnreadCounts((prev) => ({ ...prev, [chat.id]: unread }));
        }));
      });
    })();
    return () => {
      stop = true;
      unsubs.forEach((fn) => {
        try { fn(); } catch (_) { /* ignore */ }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Chats
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-gray-100">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No chats yet</div>
          ) : (
            chats.map((chat) => {
              const peerId = chat.participants.find((id) => id !== user?.id) || '';
              const last = lastMessages[chat.id];
              const unread = unreadCounts[chat.id] || 0;
              const peer = peerInfo[peerId];
              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat, peerId)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition mb-1 border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">{peer ? (peer.username || peer.email || peerId) : peerId}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {last ? (last.sender_id === user?.id ? 'You: ' : '') + (last.ciphertext ? '[Encrypted message]' : '') : 'No messages yet'}
                    </div>
                  </div>
                  {unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">{unread}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};