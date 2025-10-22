import { User, Skill, Service, TimeCredit, Booking, Transaction, Review, UserSkill, EmergencyContact } from '../types';
import { 
  mockUsers as initialMockUsers, 
  mockSkills, 
  mockServices as initialMockServices, 
  mockBookings as initialMockBookings, 
  mockTransactions as initialMockTransactions, 
  mockReviews as initialMockReviews,
  mockTimeCredits as initialMockTimeCredits,
  mockUserSkills as initialMockUserSkills 
} from './mockData';
import {
  calculateLevel,
  calculateServiceExperience,
  getLevelUpBonusCredits
} from './levelService';

// Firebase imports
import { db, isFirebaseConfigured } from '../firebase';
import { firebaseService } from './firebaseService';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

import { deleteDoc } from 'firebase/firestore';

// Check if Firebase is available
const useFirebase = isFirebaseConfigured() && !!db;

// Load data from Firebase or localStorage or use initial data
const loadFromStorage = <T>(key: string, fallback: T[]): T[] => {
  try {
    const stored = localStorage.getItem(`timebank_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(`timebank_${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
};

// Shared localStorage (cross-login in same browser) fallback for dev when Firestore is unavailable
const sharedKey = (key: string) => `timebank_shared_${key}`;
const loadShared = <T>(key: string, fallback: T[] = []): T[] => {
  try {
    const stored = localStorage.getItem(sharedKey(key));
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveShared = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(sharedKey(key), JSON.stringify(data));
  } catch {}
};

// Firebase helper functions
const saveToFirestore = async <T>(collectionName: string, id: string, data: T) => {
  if (!useFirebase) return;
  try {
    await setDoc(doc(db, collectionName, id), {
      ...data,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error saving to Firestore ${collectionName}:`, error);
  }
};

const loadFromFirestore = async <T>(collectionName: string): Promise<T[]> => {
  if (!useFirebase) return [];
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at
    })) as T[];
  } catch (error) {
    console.error(`Error loading from Firestore ${collectionName}:`, error);
    return [];
  }
};

// Initialize persistent arrays
let mockUsers = loadFromStorage('users', initialMockUsers);
// Ensure demo accounts always exist in mockUsers
const ensureDemoAccounts = () => {
  const demoAccountIds = ['current-user', 'official-account', 'level5-demo', 'level7-demo'];
  demoAccountIds.forEach(accountId => {
    const existsInMock = mockUsers.some(u => u.id === accountId);
    if (!existsInMock) {
      const initialUser = initialMockUsers.find(u => u.id === accountId);
      if (initialUser) {
        mockUsers.push(initialUser);
      }
    }
  });
  saveToStorage('users', mockUsers);
};
ensureDemoAccounts();

let mockServices = loadFromStorage('services', initialMockServices);
let mockBookings = loadFromStorage('bookings', initialMockBookings);
let mockTransactions = loadFromStorage('transactions', initialMockTransactions);
let mockReviews = loadFromStorage('reviews', initialMockReviews);
let mockTimeCredits = loadFromStorage('time_credits', initialMockTimeCredits);
let mockUserSkills = loadFromStorage('user_skills', initialMockUserSkills);

// Helper function to add test services for cross-user booking
const addTestServices = () => {
  const testServices = [
    {
      id: 'test-service-1',
      provider_id: 'demo-user-1',
      skill_id: '1',
      title: 'React Tutorial Session',
      description: 'Learn React fundamentals with hands-on coding examples.',
      credits_per_hour: 1.0,
      status: 'active' as const,
      type: 'offer' as const,
      created_at: new Date().toISOString()
    },
    {
      id: 'test-service-2', 
      provider_id: 'demo-user-2',
      skill_id: '3',
      title: 'Home Cooking Basics',
      description: 'Learn to cook simple, healthy meals at home.',
      credits_per_hour: 1.0,
      status: 'active' as const,
      type: 'offer' as const,
      created_at: new Date().toISOString()
    }
  ];

  // Add test users if they don't exist
  const testUsers = [
    {
      id: 'demo-user-1',
      email: 'testuser1@example.com',
      username: 'test_user_1',
      bio: 'Experienced React developer',
      reputation_score: 4.5,
      total_reviews: 8,
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-user-2',
      email: 'testuser2@example.com', 
      username: 'test_user_2',
      bio: 'Home cooking enthusiast',
      reputation_score: 4.7,
      total_reviews: 12,
      created_at: new Date().toISOString()
    }
  ];

  // Add test users if not already present
  testUsers.forEach(testUser => {
    if (!mockUsers.find(u => u.id === testUser.id)) {
      mockUsers.push(testUser);
    }
  });

  // Add test services if not already present
  testServices.forEach(testService => {
    if (!mockServices.find(s => s.id === testService.id)) {
      mockServices.push(testService);
    }
  });

  // Save to localStorage
  saveToStorage('users', mockUsers);
  saveToStorage('services', mockServices);
};

// Initialize test services
addTestServices();

// Add test bookings so cross-user booking UI can be tested
const addTestBookings = () => {
  const testBookings = [
    {
      id: 'test-booking-1',
      service_id: 'test-service-1',
      provider_id: 'demo-user-1',
      requester_id: 'demo-user-2',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      duration_hours: 1,
      status: 'completed',
      confirmation_status: 'provider_confirmed',
      credits_held: 1,
      credits_transferred: true,
      created_at: new Date().toISOString(),
    }
  ];

  testBookings.forEach(tb => {
    if (!mockBookings.find(b => b.id === tb.id)) mockBookings.push(tb as any);
  });

  saveToStorage('bookings', mockBookings);
  // Save to shared storage for cross-login visibility
  const shared = loadShared<Booking>('bookings', mockBookings);
  testBookings.forEach(tb => {
    if (!shared.find(b => b.id === tb.id)) shared.push(tb as any);
  });
  saveShared('bookings', shared);
};

addTestBookings();

export const dataService = {
  async getUserById(userId: string): Promise<User | null> {
    return mockUsers.find(user => user.id === userId) || null;
  },

  async createUser(user: User): Promise<User> {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.id === user.id);
    if (existingUser) {
      return existingUser;
    }
    
    // Add new user
    mockUsers.push(user);
    saveToStorage('users', mockUsers);
    
    // Save to Firestore if available
    if (useFirebase) {
      await saveToFirestore('users', user.id, user);
    }
    
    return user;
  },

  async getTimeCredits(userId: string): Promise<TimeCredit | null> {
    return mockTimeCredits.find(tc => tc.user_id === userId) || null;
  },

  async ensureInitialCredits(userId: string, amount: number = 10): Promise<TimeCredit> {
    let tc = mockTimeCredits.find(t => t.user_id === userId);
    if (!tc) {
      tc = {
        id: Date.now().toString(),
        user_id: userId,
        balance: amount,
        total_earned: amount,
        total_spent: 0,
        updated_at: new Date().toISOString(),
      };
      mockTimeCredits.push(tc);
      saveToStorage('time_credits', mockTimeCredits);
    }
    return tc;
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    return mockTransactions.filter(t => t.from_user_id === userId || t.to_user_id === userId);
  },

  async getSkills(): Promise<Skill[]> {
    return mockSkills;
  },

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return mockUserSkills.filter(us => us.user_id === userId);
  },

  async addUserSkill(userId: string, skillId: string, type: 'offered' | 'needed', proficiencyLevel: string): Promise<UserSkill> {
    const newUserSkill: UserSkill = {
      id: Date.now().toString(),
      user_id: userId,
      skill_id: skillId,
      type,
      proficiency_level: proficiencyLevel as 'beginner' | 'intermediate' | 'expert',
      skill: mockSkills.find(s => s.id === skillId)
    };
    // Persist in-memory and localStorage
    mockUserSkills.push(newUserSkill);
    saveToStorage('user_skills', mockUserSkills);
    return newUserSkill;
  },

  async removeUserSkill(userSkillId: string): Promise<void> {
    const idx = mockUserSkills.findIndex(us => us.id === userSkillId);
    if (idx !== -1) {
      mockUserSkills.splice(idx, 1);
      saveToStorage('user_skills', mockUserSkills);
    }
  },

  async getServices(filters?: { category?: string; type?: string; search?: string }): Promise<Service[]> {
  // If Firebase is enabled, load services from Firestore so they are shared across users
  if (useFirebase) {
      try {
        const servicesFromFs = await loadFromFirestore<Service>('services');

        // Merge services from Firestore with local mock and shared fallback so local posts are visible
        const sharedServices = loadShared<Service>('services', []);
        const allCandidates = [...servicesFromFs, ...sharedServices, ...mockServices];
        // Deduplicate by id, prefer Firestore entry when present
        const byId = new Map<string, Service>();
        for (const s of allCandidates) {
          if (!s || !s.id) continue;
          if (!byId.has(s.id) || servicesFromFs.find(sf => sf.id === s.id)) {
            byId.set(s.id, s);
          }
        }
        let filtered = Array.from(byId.values());

        if (filters?.type) {
          filtered = filtered.filter(s => s.type === filters.type);
        }

        if (filters?.search) {
          const term = filters.search.toLowerCase();
          filtered = filtered.filter(s =>
            (s.title as string)?.toLowerCase().includes(term) ||
            (s.description as string)?.toLowerCase().includes(term)
          );
        }

        if (filters?.category) {
          const categorySkills = mockSkills.filter(sk => sk.category === filters.category);
          const skillIds = categorySkills.map(sk => sk.id);
          filtered = filtered.filter(s => skillIds.includes(s.skill_id));
        }

        // Enrich with provider (load provider from Firestore when available) and local skill data
        const providerIds = Array.from(new Set(filtered.map(s => s.provider_id).filter(Boolean)));
        const providerMap = new Map<string, any>();
        await Promise.all(
          providerIds.map(async (pid) => {
            try {
              const p = await firebaseService.getCurrentUser(pid);
              if (p) providerMap.set(pid, p);
            } catch (err) {
              // ignore per-user fetch errors
            }
          })
        );

        const enriched = filtered.map(s => ({
          ...s,
          // Preserve existing embedded provider snapshot first, then try Firebase user, then mock
          provider: s.provider || providerMap.get(s.provider_id) || mockUsers.find(u => u.id === s.provider_id) || undefined,
          skill: mockSkills.find(sk => sk.id === s.skill_id) || undefined,
        })) as Service[];

        return enriched;
      } catch (error) {
        console.error('Failed to load services from Firestore, will try shared local fallback', error);
        // Try shared local fallback
        const shared = loadShared<Service>('services', mockServices);
        let filteredShared = [...shared];
        if (filters?.type) filteredShared = filteredShared.filter(s => s.type === filters.type);
        if (filters?.search) {
          const term = filters.search.toLowerCase();
          filteredShared = filteredShared.filter(s => (s.title as string)?.toLowerCase().includes(term) || (s.description as string)?.toLowerCase().includes(term));
        }
        if (filters?.category) {
          const categorySkills = mockSkills.filter(sk => sk.category === filters.category);
          const skillIds = categorySkills.map(sk => sk.id);
          filteredShared = filteredShared.filter(s => skillIds.includes(s.skill_id));
        }

        const enrichedShared = filteredShared.map(s => ({
          ...s,
          provider: s.provider || mockUsers.find(u => u.id === s.provider_id) || undefined,
          skill: mockSkills.find(sk => sk.id === s.skill_id) || undefined,
        })) as Service[];
        return enrichedShared;
      }
    }
    // If Firebase is not available, try shared localStorage (cross-login in same browser)
    if (!useFirebase) {
      const shared = loadShared<Service>('services', mockServices);
      let filteredShared = [...shared];
      if (filters?.type) filteredShared = filteredShared.filter(s => s.type === filters.type);
      if (filters?.search) {
        const term = filters.search.toLowerCase();
        filteredShared = filteredShared.filter(s => s.title.toLowerCase().includes(term) || s.description.toLowerCase().includes(term));
      }
      if (filters?.category) {
        const skillIds = mockSkills.filter(sk => sk.category === filters.category).map(sk => sk.id);
        filteredShared = filteredShared.filter(s => skillIds.includes(s.skill_id));
      }
      const enrichedShared = filteredShared.map(s => ({
        ...s,
        provider: s.provider || mockUsers.find(u => u.id === s.provider_id),
        skill: mockSkills.find(sk => sk.id === s.skill_id),
      })) as Service[];
      return enrichedShared;
    }

    let filtered = [...mockServices];

    if (filters?.type) {
      filtered = filtered.filter(s => s.type === filters.type);
    }

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(term) || 
        s.description.toLowerCase().includes(term)
      );
    }

    if (filters?.category) {
      const categorySkills = mockSkills.filter(s => s.category === filters.category);
      const skillIds = categorySkills.map(s => s.id);
      filtered = filtered.filter(s => skillIds.includes(s.skill_id));
    }

    // Enrich with provider and skill so UI can render footer and booking button
    const enriched = filtered.map(s => ({
      ...s,
      provider: s.provider || mockUsers.find(u => u.id === s.provider_id),
      skill: mockSkills.find(sk => sk.id === s.skill_id),
    })) as Service[];
    return enriched;
  },

  async getUserServices(userId: string): Promise<Service[]> {
    if (useFirebase) {
      try {
        const servicesFromFs = await loadFromFirestore<Service>('services');
        // Merge Firestore + shared + mock, then filter by provider
        const sharedServices = loadShared<Service>('services', []);
        const allCandidates = [...servicesFromFs, ...sharedServices, ...mockServices];
        const byId = new Map<string, Service>();
        for (const s of allCandidates) {
          if (!s || !s.id) continue;
          if (!byId.has(s.id) || servicesFromFs.find(sf => sf.id === s.id)) {
            byId.set(s.id, s);
          }
        }
        const services = Array.from(byId.values()).filter(s => s.provider_id === userId);
        return services.map(s => ({
          ...s,
          provider: s.provider || mockUsers.find(u => u.id === s.provider_id) || undefined,
          skill: mockSkills.find(sk => sk.id === s.skill_id) || undefined,
        })) as Service[];
      } catch (error) {
        console.error('Failed to load user services from Firestore, falling back to local services', error);
      }
    }

    const services = mockServices.filter(service => service.provider_id === userId);
    return services.map(s => ({
      ...s,
      provider: s.provider || mockUsers.find(u => u.id === s.provider_id),
      skill: mockSkills.find(sk => sk.id === s.skill_id),
    })) as Service[];
  },

  async createService(service: Omit<Service, 'id' | 'created_at'> & { imageFiles?: File[] }): Promise<Service> {
    // Resolve provider object early so we store it with the service (prevents fallback random IDs in UI)
    const providerId = service.provider_id;
    let providerObj: any = mockUsers.find(u => u.id === providerId);
    if (!providerObj) {
      try {
        const saved = localStorage.getItem('timebank_user');
        if (saved) {
          const savedUser = JSON.parse(saved);
          if (savedUser?.id === providerId) providerObj = savedUser;
        }
      } catch {}
    }
    if (!providerObj && useFirebase) {
      try {
        const p = await firebaseService.getCurrentUser(providerId);
        if (p) providerObj = p as any;
      } catch {}
    }
    if (!providerObj) {
      providerObj = {
        id: providerId,
        username: providerId, // last resort; should rarely show now
        email: '',
        reputation_score: 0,
        total_reviews: 0,
        created_at: new Date().toISOString(),
      };
    }

    // Only use imageUrls (Cloudinary)
    const imageUrls: string[] = service.imageUrls && service.imageUrls.length > 0 ? service.imageUrls : [];

    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      provider: providerObj,
      imageUrls,
    } as Service;

    // Persist in-memory and localStorage with provider snapshot
    mockServices.push(newService);
    saveToStorage('services', mockServices);

    // Persist to Firestore when available
    if (useFirebase) {
      try {
        await firebaseService.saveService(newService);
        console.log('🎉 Service successfully saved to Firestore:', newService.id);
      } catch (error) {
        console.error('Failed to save service to Firestore, saving to shared fallback:', error);
        const sharedFs = loadShared<Service>('services', mockServices.filter(s => !s.id.startsWith('test-')));
        sharedFs.push(newService);
        saveShared('services', sharedFs);
      }
    } else {
      const shared = loadShared<Service>('services', mockServices.filter(s => !s.id.startsWith('test-')));
      shared.push(newService);
      saveShared('services', shared);
    }

    return newService;
  },

  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    const idx = mockServices.findIndex(s => s.id === serviceId);
    if (idx === -1) throw new Error('Service not found');
    const updated = { ...mockServices[idx], ...updates } as Service;
    mockServices[idx] = updated;
    saveToStorage('services', mockServices);
    if (useFirebase) {
      try {
        await firebaseService.updateService(serviceId, updated);
        console.log('✅ Service updated in Firestore:', serviceId);
      } catch (error) {
        console.error('Failed to update service in Firestore:', error);
      }
    }
    return {
      ...updated,
      provider: mockUsers.find(u => u.id === updated.provider_id),
      skill: mockSkills.find(sk => sk.id === updated.skill_id),
    } as Service;
  },

  async deleteService(serviceId: string): Promise<void> {
    console.log('🗑️ dataService.deleteService called with ID:', serviceId);
    
    const idx = mockServices.findIndex(s => s.id === serviceId);
    console.log('🔍 Found service at index:', idx);
    
    if (idx !== -1) {
      mockServices.splice(idx, 1);
      saveToStorage('services', mockServices);
      console.log('✅ Service deleted from localStorage');
      
      if (useFirebase) {
        try {
          await deleteDoc(doc(db, 'services', serviceId));
          console.log('✅ Service deleted from Firestore');
        } catch (error) {
          console.error('❌ Failed to delete service from Firestore:', error);
        }
      }
    } else {
      console.warn('⚠️ Service not found with ID:', serviceId);
    }
  },

  async getBookings(userId: string): Promise<Booking[]> {
    // Prefer Firestore when available so both participants see bookings across accounts
    if (useFirebase) {
      try {
        const fromFs = await loadFromFirestore<Booking>('bookings');
        const shared = loadShared<Booking>('bookings', []);
        const allCandidates = [...fromFs, ...shared, ...mockBookings];
        const byId = new Map<string, Booking>();
        for (const b of allCandidates) {
          if (!b || !b.id) continue;
          if (!byId.has(b.id) || fromFs.find((fb: any) => fb.id === b.id)) {
            byId.set(b.id, b);
          }
        }
        const mine = Array.from(byId.values()).filter(b => b.provider_id === userId || b.requester_id === userId);

        // Enrich with provider, requester and service
        const userIds = Array.from(new Set(mine.flatMap(b => [b.provider_id, b.requester_id]).filter(Boolean)));
        const userMap = new Map<string, any>();
        await Promise.all(userIds.map(async (uid) => {
          try {
            const u = await firebaseService.getCurrentUser(uid);
            if (u) userMap.set(uid, u);
          } catch {}
        }));

        return mine.map(b => ({
          ...b,
          provider: b.provider || userMap.get(b.provider_id) || mockUsers.find(u => u.id === b.provider_id) || undefined,
          requester: b.requester || userMap.get(b.requester_id) || mockUsers.find(u => u.id === b.requester_id) || undefined,
          service: b.service || mockServices.find(s => s.id === b.service_id) || undefined,
        })) as Booking[];
      } catch (err) {
        console.error('Failed to load bookings from Firestore, falling back to shared/local', err);
      }
    }

    // Fallback: use shared localStorage so cross-login in same browser works
    const sharedBookings = loadShared<Booking>('bookings', mockBookings);
    const bookings = sharedBookings.filter(booking => booking.provider_id === userId || booking.requester_id === userId);
    return bookings.map(b => ({
      ...b,
      provider: mockUsers.find(u => u.id === b.provider_id),
      requester: mockUsers.find(u => u.id === b.requester_id),
      service: mockServices.find(s => s.id === b.service_id),
    })) as Booking[];
  },

  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'status'>): Promise<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      status: 'pending',
      confirmation_status: 'awaiting_provider',
      credits_transferred: false,
      created_at: new Date().toISOString()
    };

    // Check if requester has enough credits
    const requesterCredits = mockTimeCredits.find(tc => tc.user_id === booking.requester_id);
    const service = mockServices.find(s => s.id === booking.service_id);
    
    if (requesterCredits && service) {
      const requiredCredits = booking.duration_hours * service.credits_per_hour;
      if (requesterCredits.balance < requiredCredits) {
        throw new Error('Insufficient credits to book this service');
      }
      
      // Hold credits (reserve but don't transfer yet)
      newBooking.credits_held = requiredCredits;
      requesterCredits.balance -= requiredCredits; // Reserve the credits
      requesterCredits.updated_at = new Date().toISOString();
      
      // Note: credits_transferred remains false until provider confirms
    }

    // Persist in-memory and localStorage
    mockBookings.push(newBooking);
    saveToStorage('bookings', mockBookings);
    saveToStorage('time_credits', mockTimeCredits);
    // Try to persist to Firestore when available; on failure, persist to shared fallback
    if (useFirebase) {
      try {
        await saveToFirestore('bookings', newBooking.id, newBooking);
        if (requesterCredits) {
          await saveToFirestore('time_credits', booking.requester_id, requesterCredits);
        }
      } catch (error) {
        console.error('Failed to save booking to Firestore, falling back to shared storage:', error);
        const shared = loadShared<Booking>('bookings', mockBookings);
        shared.push(newBooking);
        saveShared('bookings', shared);
        saveShared('time_credits', mockTimeCredits);
      }
    } else {
      const shared = loadShared<Booking>('bookings', mockBookings);
      shared.push(newBooking);
      saveShared('bookings', shared);
      saveShared('time_credits', mockTimeCredits);
    }
    return {
      ...newBooking,
      provider: mockUsers.find(u => u.id === newBooking.provider_id),
      requester: mockUsers.find(u => u.id === newBooking.requester_id),
      service: mockServices.find(s => s.id === newBooking.service_id),
    } as Booking;
  },

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    let idx = mockBookings.findIndex(b => b.id === bookingId);
    let originalBooking = mockBookings[idx];
    // If not found locally, try shared storage or Firestore
    if (!originalBooking) {
      const shared = loadShared<Booking>('bookings', []);
      const found = shared.find(b => b.id === bookingId);
      if (found) originalBooking = found as Booking;
    }
    if (!originalBooking && useFirebase) {
      try {
        const snap = await getDoc(doc(db, 'bookings', bookingId));
        if (snap.exists()) {
          const data: any = snap.data();
          originalBooking = {
            id: bookingId,
            ...data,
            created_at: data.created_at?.toDate?.()?.toISOString?.() || data.created_at || new Date().toISOString(),
          } as Booking;
          mockBookings.push(originalBooking);
          saveToStorage('bookings', mockBookings);
          idx = mockBookings.findIndex(b => b.id === bookingId);
        }
      } catch (err) {
        console.error('Failed to load booking from Firestore for update', err);
      }
    }
    if (!originalBooking) throw new Error('Booking not found');
    if (idx === -1) { mockBookings.push(originalBooking); idx = mockBookings.length - 1; }
    const updated = { ...originalBooking, ...updates } as Booking;
    
    // If booking is being marked as completed, award XP and (if not already done) credits to provider
    if (updates.status === 'completed' && originalBooking.status !== 'completed') {
      const providerCredits = mockTimeCredits.find(tc => tc.user_id === updated.provider_id);
      const requesterCredits = mockTimeCredits.find(tc => tc.user_id === updated.requester_id);
      let service = mockServices.find(s => s.id === updated.service_id);
      if (!service && useFirebase && updated.service_id) {
        try {
          const sSnap = await getDoc(doc(db, 'services', updated.service_id));
          if (sSnap.exists()) {
            const sd: any = sSnap.data();
            service = { id: updated.service_id, ...sd } as any;
          }
        } catch (err) {
          console.warn('Could not fetch service from Firestore for booking completion', err);
        }
      }
      const provider = mockUsers.find(u => u.id === updated.provider_id);

      if (service && updated.duration_hours && provider) {
        const baseCredits = updated.duration_hours * (service.credits_per_hour ?? 1);

        if (providerCredits) {
          // If base credits weren't transferred yet (no confirm), transfer base now
          if (!updated.credits_transferred) {
            providerCredits.balance += baseCredits;
            providerCredits.total_earned += baseCredits;
            providerCredits.updated_at = new Date().toISOString();
            updated.credits_transferred = true;

            // Burn base from requester as spent (it was already reserved at booking time)
            if (requesterCredits) {
              requesterCredits.total_spent = (requesterCredits.total_spent || 0) + baseCredits;
              requesterCredits.updated_at = new Date().toISOString();
            }

            // Base payment transaction only
            mockTransactions.push({
              id: Date.now().toString(),
              from_user_id: updated.requester_id,
              to_user_id: updated.provider_id,
              booking_id: bookingId,
              amount: baseCredits,
              transaction_type: 'service_completed' as const,
              description: `Payment for: ${service.title}`,
              created_at: new Date().toISOString(),
            });
          }
        }

        // Award XP and update provider level regardless of credit transfer state
        const currentExperience = provider.experience_points || 0;
        const currentServicesCompleted = provider.services_completed || 0;
        const previousLevel = provider.level || 1;
        const isFirstService = currentServicesCompleted === 0;
        const experienceGained = calculateServiceExperience(5, isFirstService, 1);
        provider.experience_points = currentExperience + experienceGained;
        provider.services_completed = currentServicesCompleted + 1;
        provider.level = calculateLevel(provider.experience_points);
        if (provider.level >= 5 && !provider.custom_credits_enabled) {
          provider.custom_credits_enabled = true;
        }
        if (provider.level > previousLevel) {
          // Mint a one-time level-up credit bonus
          const levelBonus = getLevelUpBonusCredits(provider.level);
          const providerTc = mockTimeCredits.find(tc => tc.user_id === updated.provider_id);
          if (levelBonus > 0 && providerTc) {
            providerTc.balance += levelBonus;
            providerTc.total_earned += levelBonus;
            providerTc.updated_at = new Date().toISOString();
            mockTransactions.push({
              id: (Date.now() + 2).toString(),
              to_user_id: updated.provider_id,
              amount: levelBonus,
              transaction_type: 'adjustment' as const,
              description: `🎉 Level Up Bonus! Reached Level ${provider.level}`,
              created_at: new Date().toISOString(),
            } as any);
          } else {
            // Still record a level-up note for history if no credits
            mockTransactions.push({
              id: (Date.now() + 2).toString(),
              to_user_id: updated.provider_id,
              amount: 0,
              transaction_type: 'adjustment' as const,
              description: `🎉 Level Up! You reached Level ${provider.level}!`,
              created_at: new Date().toISOString(),
            } as any);
          }
        }
        saveToStorage('users', mockUsers);
        if (useFirebase) {
          try {
            await saveToFirestore('users', provider.id, provider as any);
          } catch (e) {
            console.warn('Failed to persist provider user update to Firestore', e);
          }
        }
      }
    }
    
    mockBookings[idx] = updated;
    saveToStorage('bookings', mockBookings);
    saveToStorage('time_credits', mockTimeCredits);
    saveToStorage('transactions', mockTransactions);

    // Write-through to Firestore and shared fallback so both users see updates
    if (useFirebase) {
      try {
        await saveToFirestore('bookings', bookingId, updated);
        // Persist credit and transactions if applicable
        const providerTc = mockTimeCredits.find(tc => tc.user_id === updated.provider_id);
        if (providerTc) await saveToFirestore('time_credits', providerTc.user_id, providerTc);
        const requesterTc = mockTimeCredits.find(tc => tc.user_id === updated.requester_id);
        if (requesterTc) await saveToFirestore('time_credits', requesterTc.user_id, requesterTc);
        // Persist latest transaction record (id is timestamp-based; save all for simplicity)
        const tx = mockTransactions[mockTransactions.length - 1];
        if (tx) await saveToFirestore('transactions', tx.id, tx as any);
      } catch (err) {
        console.error('Failed to update booking in Firestore, falling back to shared', err);
        const shared = loadShared<Booking>('bookings', mockBookings);
        const i = shared.findIndex(b => b.id === bookingId);
        if (i !== -1) {
          shared[i] = updated;
          saveShared('bookings', shared);
        }
      }
    } else {
      const shared = loadShared<Booking>('bookings', mockBookings);
      const i = shared.findIndex(b => b.id === bookingId);
      if (i !== -1) {
        shared[i] = updated;
        saveShared('bookings', shared);
      }
    }
    return {
      ...updated,
      provider: mockUsers.find(u => u.id === updated.provider_id),
      requester: mockUsers.find(u => u.id === updated.requester_id),
      service: mockServices.find(s => s.id === updated.service_id),
    } as Booking;
  },

  // Admin helper: return all services (raw, merged from Firestore/shared/mock)
  async getAllRawServices(): Promise<any[]> {
    if (useFirebase) {
      try {
        const servicesFromFs = await loadFromFirestore<any>('services');
        const sharedServices = loadShared<any>('services', []);
        const allCandidates = [...servicesFromFs, ...sharedServices, ...mockServices];
        const byId = new Map<string, any>();
        for (const s of allCandidates) {
          if (!s || !s.id) continue;
          if (!byId.has(s.id) || servicesFromFs.find((sf: any) => sf.id === s.id)) {
            byId.set(s.id, s);
          }
        }
        return Array.from(byId.values());
      } catch (err) {
        console.error('Failed to load all raw services from Firestore, falling back to shared/mock', err);
        return loadShared<any>('services', mockServices);
      }
    }
    return loadShared<any>('services', mockServices);
  },

  // Admin helper: return all bookings (raw)
  async getAllRawBookings(): Promise<any[]> {
    if (useFirebase) {
      try {
        const bookingsFromFs = await loadFromFirestore<any>('bookings');
        const shared = loadShared<any>('bookings', mockBookings);
        const byId = new Map<string, any>();
        for (const b of [...bookingsFromFs, ...shared, ...mockBookings]) {
          if (!b || !b.id) continue;
          if (!byId.has(b.id) || bookingsFromFs.find((bf: any) => bf.id === b.id)) {
            byId.set(b.id, b);
          }
        }
        return Array.from(byId.values());
      } catch (err) {
        console.error('Failed to load bookings from Firestore, falling back to shared/mock', err);
        return loadShared<any>('bookings', mockBookings);
      }
    }
    return loadShared<any>('bookings', mockBookings);
  },

  // Admin helper: return all users (raw)
  async getAllRawUsers(): Promise<any[]> {
    if (useFirebase) {
      try {
        const usersFromFs = await loadFromFirestore<any>('users');
        // Merge with mock users
        const byId = new Map<string, any>();
        for (const u of [...usersFromFs, ...mockUsers]) {
          if (!u || !u.id) continue;
          if (!byId.has(u.id) || usersFromFs.find((uf: any) => uf.id === u.id)) {
            byId.set(u.id, u);
          }
        }
        return Array.from(byId.values());
      } catch (err) {
        console.error('Failed to load users from Firestore, falling back to mock', err);
        return mockUsers;
      }
    }
    return mockUsers;
  },

  async getReviews(userId: string): Promise<Review[]> {
    const reviews = mockReviews.filter(review => review.reviewee_id === userId);
    return reviews.map(r => ({
      ...r,
      reviewer: mockUsers.find(u => u.id === r.reviewer_id),
      reviewee: mockUsers.find(u => u.id === r.reviewee_id),
    })) as Review[];
  },

  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    console.log('⭐ dataService.createReview called with:', review);
    
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    mockReviews.push(newReview);
    saveToStorage('reviews', mockReviews);
    console.log('✅ Review saved to localStorage');
    
    return {
      ...newReview,
      reviewer: mockUsers.find(u => u.id === newReview.reviewer_id),
      reviewee: mockUsers.find(u => u.id === newReview.reviewee_id),
    } as Review;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    console.log('updateUser called with userId:', userId, 'updates:', updates);
    
    const idx = mockUsers.findIndex(u => u.id === userId);
    if (idx === -1) {
      console.error('User not found in mockUsers:', userId);
      console.log('Available users:', mockUsers.map(u => ({ id: u.id, username: u.username })));
      throw new Error(`User not found: ${userId}`);
    }
    
    const updated = { ...mockUsers[idx], ...updates };
    mockUsers[idx] = updated;
    
    console.log('User updated successfully:', updated);
    
    // Save to localStorage
    saveToStorage('users', mockUsers);
    console.log('Saved to localStorage');
    
    // Also save to Firebase if available
    if (useFirebase) {
      try {
        await saveToFirestore('users', userId, updated);
        console.log('Saved to Firestore');
      } catch (error) {
        console.error('Failed to save user to Firebase:', error);
      }
    }
    
    return updated;
  },

  async confirmBooking(bookingId: string, providerId: string, notes?: string): Promise<Booking> {
    let idx = mockBookings.findIndex(b => b.id === bookingId);
    let booking = mockBookings[idx];
    if (!booking) {
      const shared = loadShared<Booking>('bookings', []);
      const found = shared.find(b => b.id === bookingId);
      if (found) booking = found as Booking;
    }
    if (!booking && useFirebase) {
      try {
        const snap = await getDoc(doc(db, 'bookings', bookingId));
        if (snap.exists()) {
          const data: any = snap.data();
          booking = { id: bookingId, ...data, created_at: data.created_at?.toDate?.()?.toISOString?.() || data.created_at || new Date().toISOString() } as Booking;
          mockBookings.push(booking);
          saveToStorage('bookings', mockBookings);
          idx = mockBookings.findIndex(b => b.id === bookingId);
        }
      } catch (err) {
        console.error('Failed to fetch booking for confirm', err);
      }
    }
    if (!booking) throw new Error('Booking not found');
    if (idx === -1) { mockBookings.push(booking); idx = mockBookings.length - 1; }
    if (booking.provider_id !== providerId) {
      throw new Error('Only the service provider can confirm this booking');
    }
    
    if (booking.confirmation_status !== 'awaiting_provider') {
      throw new Error('Booking is not in a confirmable state');
    }

    // Update booking status
    const updatedBooking = {
      ...booking,
      confirmation_status: 'provider_confirmed' as const,
      status: 'confirmed' as const,
      provider_notes: notes,
      confirmed_at: new Date().toISOString(),
      credits_transferred: true
    };

    // Transfer credits from held to provider
    if (booking.credits_held && !booking.credits_transferred) {
      const providerCredits = mockTimeCredits.find(tc => tc.user_id === booking.provider_id);
      if (providerCredits) {
        providerCredits.balance += booking.credits_held;
        providerCredits.total_earned += booking.credits_held;
        providerCredits.updated_at = new Date().toISOString();

        // Create transaction record
        const transaction = {
          id: Date.now().toString(),
          from_user_id: booking.requester_id,
          to_user_id: booking.provider_id,
          booking_id: booking.id,
          amount: booking.credits_held,
          transaction_type: 'service_completed' as const,
          description: `Payment for confirmed service booking`,
          created_at: new Date().toISOString()
        };
        mockTransactions.push(transaction);
        saveToStorage('transactions', mockTransactions);
      }

      // Update requester's spent credits
      const requesterCredits = mockTimeCredits.find(tc => tc.user_id === booking.requester_id);
      if (requesterCredits) {
        requesterCredits.total_spent += booking.credits_held;
        requesterCredits.updated_at = new Date().toISOString();
      }
    }

    mockBookings[idx] = updatedBooking;
    saveToStorage('bookings', mockBookings);
    saveToStorage('time_credits', mockTimeCredits);

    // Persist to Firestore/shared for cross-user visibility
    if (useFirebase) {
      try {
        await saveToFirestore('bookings', updatedBooking.id, updatedBooking);
        const providerCredits = mockTimeCredits.find(tc => tc.user_id === updatedBooking.provider_id);
        if (providerCredits) await saveToFirestore('time_credits', providerCredits.user_id, providerCredits);
        const requesterCredits = mockTimeCredits.find(tc => tc.user_id === updatedBooking.requester_id);
        if (requesterCredits) await saveToFirestore('time_credits', requesterCredits.user_id, requesterCredits);
        const lastTx = mockTransactions[mockTransactions.length - 1];
        if (lastTx) await saveToFirestore('transactions', lastTx.id, lastTx as any);
      } catch (err) {
        console.error('Failed to persist confirmed booking to Firestore, saving to shared fallback', err);
        const shared = loadShared<Booking>('bookings', mockBookings);
        const i = shared.findIndex(b => b.id === updatedBooking.id);
        if (i === -1) shared.push(updatedBooking); else shared[i] = updatedBooking;
        saveShared('bookings', shared);
      }
    } else {
      const shared = loadShared<Booking>('bookings', mockBookings);
      const i = shared.findIndex(b => b.id === updatedBooking.id);
      if (i === -1) shared.push(updatedBooking); else shared[i] = updatedBooking;
      saveShared('bookings', shared);
    }

    return {
      ...updatedBooking,
      provider: mockUsers.find(u => u.id === updatedBooking.provider_id),
      requester: mockUsers.find(u => u.id === updatedBooking.requester_id),
      service: mockServices.find(s => s.id === updatedBooking.service_id),
    } as Booking;
  },

  async declineBooking(bookingId: string, providerId: string, reason?: string): Promise<Booking> {
    let idx = mockBookings.findIndex(b => b.id === bookingId);
    let booking = mockBookings[idx];
    if (!booking) {
      const shared = loadShared<Booking>('bookings', []);
      const found = shared.find(b => b.id === bookingId);
      if (found) booking = found as Booking;
    }
    if (!booking && useFirebase) {
      try {
        const snap = await getDoc(doc(db, 'bookings', bookingId));
        if (snap.exists()) {
          const data: any = snap.data();
          booking = { id: bookingId, ...data, created_at: data.created_at?.toDate?.()?.toISOString?.() || data.created_at || new Date().toISOString() } as Booking;
          mockBookings.push(booking);
          saveToStorage('bookings', mockBookings);
          idx = mockBookings.findIndex(b => b.id === bookingId);
        }
      } catch (err) {
        console.error('Failed to fetch booking for decline', err);
      }
    }
    if (!booking) throw new Error('Booking not found');
    if (idx === -1) { mockBookings.push(booking); idx = mockBookings.length - 1; }
    if (booking.provider_id !== providerId) {
      throw new Error('Only the service provider can decline this booking');
    }
    
    if (booking.confirmation_status !== 'awaiting_provider') {
      throw new Error('Booking is not in a declinable state');
    }

    // Update booking status
    const updatedBooking = {
      ...booking,
      confirmation_status: 'declined' as const,
      status: 'cancelled' as const,
      provider_notes: reason,
      credits_transferred: false
    };

    // Return held credits to requester
    if (booking.credits_held && !booking.credits_transferred) {
      const requesterCredits = mockTimeCredits.find(tc => tc.user_id === booking.requester_id);
      if (requesterCredits) {
        requesterCredits.balance += booking.credits_held; // Return the held credits
        requesterCredits.updated_at = new Date().toISOString();
      }
    }

    mockBookings[idx] = updatedBooking;
    saveToStorage('bookings', mockBookings);
    saveToStorage('time_credits', mockTimeCredits);

    // Persist to Firestore/shared for cross-user visibility
    if (useFirebase) {
      try {
        await saveToFirestore('bookings', updatedBooking.id, updatedBooking);
        const requesterCredits = mockTimeCredits.find(tc => tc.user_id === updatedBooking.requester_id);
        if (requesterCredits) await saveToFirestore('time_credits', requesterCredits.user_id, requesterCredits);
      } catch (err) {
        console.error('Failed to persist declined booking to Firestore, saving to shared fallback', err);
        const shared = loadShared<Booking>('bookings', mockBookings);
        const i = shared.findIndex(b => b.id === updatedBooking.id);
        if (i === -1) shared.push(updatedBooking); else shared[i] = updatedBooking;
        saveShared('bookings', shared);
      }
    } else {
      const shared = loadShared<Booking>('bookings', mockBookings);
      const i = shared.findIndex(b => b.id === updatedBooking.id);
      if (i === -1) shared.push(updatedBooking); else shared[i] = updatedBooking;
      saveShared('bookings', shared);
    }

    return {
      ...updatedBooking,
      provider: mockUsers.find(u => u.id === updatedBooking.provider_id),
      requester: mockUsers.find(u => u.id === updatedBooking.requester_id),
      service: mockServices.find(s => s.id === updatedBooking.service_id),
    } as Booking;
  },

  // Emergency contacts methods
  async addEmergencyContact(userId: string, contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString()
    };

    user.emergency_contacts = user.emergency_contacts || [];
    user.emergency_contacts.push(newContact);
    
    saveToStorage('users', mockUsers);
    
    // Also save to Firebase if available
    if (useFirebase) {
      try {
        await saveToFirestore('users', userId, user);
      } catch (error) {
        console.error('Failed to save emergency contact to Firebase:', error);
      }
    }

    return newContact;
  },

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    user.emergency_contacts = user.emergency_contacts?.filter(c => c.id !== contactId) || [];
    
    saveToStorage('users', mockUsers);
    
    // Also save to Firebase if available
    if (useFirebase) {
      try {
        await saveToFirestore('users', userId, user);
      } catch (error) {
        console.error('Failed to delete emergency contact from Firebase:', error);
      }
    }
  },
};
