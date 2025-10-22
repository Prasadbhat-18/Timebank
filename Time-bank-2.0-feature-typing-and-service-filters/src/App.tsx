import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { LandingPage } from './components/Landing/LandingPage';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProfileView } from './components/Profile/ProfileView';
import { WalletView } from './components/Wallet/WalletView';
import { ServiceList } from './components/Services/ServiceList';
import { BookingList } from './components/Bookings/BookingList';
import { SOSButton } from './components/SOS/SOSButton';
import { useGeolocation } from './hooks/useGeolocation';
import {
  LayoutDashboard,
  User,
  Wallet,
  Briefcase,
  Calendar,
  LogOut,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AdminPanel } from './components/Admin/AdminPanel';
import { MessageCircle } from 'lucide-react';
import { useChatSection } from './components/Chat/useChatSection';
import { getUserChats } from './services/getUserChats';
import { useToast } from './contexts/ToastContext';
import { bookingNotificationService } from './services/bookingNotificationService';

type View = 'dashboard' | 'profile' | 'wallet' | 'services' | 'bookings' | 'admin';


function AppContent() {
  const { user, loading, logout, login, register, loginWithGoogle, loginWithPhone } = useAuth();
  const { showBookingNotification } = useToast();
  const [confirmLogout, setConfirmLogout] = useState(false);
  // Chat section state
  const { openInbox, ChatSectionUI } = useChatSection();
  const [unread, setUnread] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { location: userLocation } = useGeolocation();
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('timebank_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Listen for unread count using lastSeen per chat
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const unsubs: Array<() => void> = [];
    const perChatUnread: Record<string, number> = {};
    const perChatSeen: Record<string, number> = {};

    (async () => {
      const chats = await getUserChats(user.id);
      const cs = await import('./services/chatService');
      for (const c of chats) {
        // subscribe to chat doc to get lastSeen
        const unsubDoc = cs.chatService.subscribeChatDoc(c.id, (doc) => {
          if (cancelled) return;
          const seen = doc?.lastSeen?.[user.id];
          let ms = 0;
          if (typeof seen === 'string') {
            const parsed = Date.parse(seen);
            ms = isNaN(parsed) ? 0 : parsed;
          } else if (seen && typeof seen.toDate === 'function') {
            ms = seen.toDate().getTime();
          } else if (typeof seen === 'number') {
            ms = seen;
          }
          perChatSeen[c.id] = ms;
        });
        unsubs.push(unsubDoc);
        // subscribe to messages and compute unread since lastSeen
        const unsubMsgs = cs.chatService.subscribeMessages(c.id, (msgs) => {
          if (cancelled) return;
          const seenAt = perChatSeen[c.id] || 0;
          perChatUnread[c.id] = msgs.filter(m => m.sender_id !== user.id && new Date(m.created_at).getTime() > seenAt).length;
          const sum = Object.values(perChatUnread).reduce((a, b) => a + b, 0);
          setUnread(sum);
        });
        unsubs.push(unsubMsgs);
      }
    })();

    return () => {
      cancelled = true;
      unsubs.forEach(u => {
        try { u(); } catch {}
      });
    };
  }, [user?.id]);

  // Global navigation bridge (e.g., Dashboard popup -> Bookings)
  useEffect(() => {
    const handler = (e: any) => {
      const v = e?.detail?.view as View | undefined;
      if (v) setCurrentView(v);
    };
    window.addEventListener('timebank:navigate', handler);
    return () => window.removeEventListener('timebank:navigate', handler);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('timebank_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('timebank_theme', 'light');
    }
  }, [dark]);

  // Listen for new booking notifications (provider only)
  useEffect(() => {
    if (!user) return;
    
    const unsub = bookingNotificationService.subscribeToProviderBookings(
      user.id,
      async (booking) => {
        // Get requester details for the notification
        const requesterName = booking.requester?.username || booking.requester?.email || 'A user';
        const serviceTitle = booking.service?.title || 'your service';
        
        showBookingNotification(
          '🔔 New Booking Request!',
          `${requesterName} wants to book "${serviceTitle}". Check your bookings to respond.`
        );
        
        // Optional: Play a notification sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6A0fDTgTEHHm7A7+OZSA0PVajk6qxYEwtDnNzyxW0iByh+zPDJfDUHGm+/7+CcSw8NUqXi5K5cFAxEnuD2yH0pBiuBzvLYiTcIGWi77emfTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606OunVRULRp/g8r5sIQYugNHw04ExBx5uwO/jmUgND1Wo5OqsWBMLQ5zc8sVtIgcofszwyXw1BxpvwO/gmksPDlCn4uWuXBULRZzg8L1sIgYogdDw2oY1BxpvwPHgm0wQD1Oo4+muWhULRZ3f8r9uIwYugNHx2YU1BxptwPDfmUoODlKm4eStWxQKRJrb8sFuIwUugNDx2YU1Bxltv+3fnEoPDlGm4eOtXBUKQ5vb8MFuIwUugNDx2YU1BxltMjU+qrDvsVNUFhJ7utfr7+mQTQoVaqzj7bmORo8lRZ3b+uO7ZBtCk9rw4rVcFAo=');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {}
      }
    );

    return () => unsub();
  }, [user?.id, showBookingNotification]);

  // Removed global Firebase permission error popups per request


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-gray-950 dark:text-emerald-400 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage
        onLogin={async (email, password) => {
          try {
            await login(email, password);
          } catch (err: any) {
            throw err;
          }
        }}
        onRegister={async (email, password, username) => {
          try {
            await register(email, password, username);
          } catch (err: any) {
            throw err;
          }
        }}
        onLoginWithGoogle={async () => {
          try {
            await loginWithGoogle();
          } catch (err: any) {
            throw err;
          }
        }}
        onLoginWithPhone={async (phone) => {
          try {
            // For now, we'll use a mock code since the phone login requires OTP
            await loginWithPhone(phone, '123456');
          } catch (err: any) {
            throw err;
          }
        }}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        authMode={authMode}
        loading={loading}
        error=""
      />
    );
  }

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services' as View, label: 'Services', icon: Briefcase },
    { id: 'bookings' as View, label: 'Bookings', icon: Calendar },
    { id: 'wallet' as View, label: 'Wallet', icon: Wallet },
    { id: 'profile' as View, label: 'Profile', icon: User },
  ];

  // If user is the official admin id, expose admin nav
  if (user && user.id === 'official-account') {
    navItems.push({ id: 'admin' as View, label: 'Admin', icon: ShieldCheck });
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gray-950 dark:text-emerald-400 dark:from-gray-950 dark:to-gray-950 pb-20 md:pb-4">
  {/* ...existing code... */}
      <header className="bg-white shadow-lg border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-emerald-400">TimeBank</h1>
                <p className="hidden md:block text-xs text-gray-500 dark:text-emerald-400/80">Skill Exchange Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {/* Chat Inbox Button */}
              <button
                onClick={openInbox}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg transition text-gray-600 hover:bg-gray-50 dark:text-emerald-400 dark:hover:bg-gray-800"
                title="Chat Inbox"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden md:inline">Chats</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full px-1.5">{unread}</span>
                )}
              </button>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      currentView === item.id
                        ? 'bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-emerald-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              })}

              {/* Dark mode toggle */}
              <button
                onClick={() => setDark((d) => !d)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition text-gray-600 hover:bg-gray-50 dark:text-emerald-400 dark:hover:bg-gray-800"
                title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span className="hidden md:inline">{dark ? 'Light' : 'Dark'} Mode</span>
              </button>

              <button
                onClick={() => setConfirmLogout(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:hover:bg-red-900/20"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>

            {/* Mobile Logout Button */}
            <div className="md:hidden">
              <button
                onClick={() => setConfirmLogout(true)}
                className="flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition dark:hover:bg-red-900/20"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
                  currentView === item.id
                    ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50 dark:text-emerald-400 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-4 md:py-8">
  {currentView === 'dashboard' && <DashboardView />}
  {currentView === 'profile' && <ProfileView />}
  {currentView === 'wallet' && <WalletView />}
  {currentView === 'services' && <ServiceList />}
  {currentView === 'bookings' && <BookingList />}
  {currentView === 'admin' && <AdminPanel />}
      </main>

  {/* Chat Section Modal */}
  <ChatSectionUI />

  <footer className="bg-white border-t border-gray-200 mt-12 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium text-gray-800 dark:text-emerald-400 mb-1">TimeBank - Building Community Through Skill Exchange</p>
            <p className="dark:text-emerald-400/80">Every hour of service strengthens our collaborative network</p>
          </div>
        </div>
      </footer>

      {/* SOS Button - Always visible when logged in */}
      <SOSButton userLocation={userLocation} />
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm p-5">
            <div className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</div>
            <div className="text-sm text-gray-600 mb-4">Are you sure you want to logout?</div>
            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 bg-gray-100 rounded" onClick={() => setConfirmLogout(false)}>Cancel</button>
              <button
                className="px-3 py-1.5 bg-red-600 text-white rounded"
                onClick={() => { setConfirmLogout(false); logout(); }}
              >Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
