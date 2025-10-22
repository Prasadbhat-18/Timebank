import { User, Skill, Service, TimeCredit, Booking, Transaction, Review, UserSkill } from '../types';
import { db, isFirebaseConfigured } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Mock data service for when Firebase is not configured
import { mockUsers, mockSkills, mockServices, mockBookings, mockTransactions, mockReviews } from './mockData';

function tsToIso(value: any): string {
  if (!value) return new Date().toISOString();
  if ((value as Timestamp).toDate) return (value as Timestamp).toDate().toISOString();
  return String(value);
}

class DataService {
  async getUserById(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: userId,
      email: data.email,
      username: data.username || '',
      bio: data.bio || '',
      avatar_url: data.avatar_url,
      reputation_score: data.reputation_score ?? 5.0,
      total_reviews: data.total_reviews ?? 0,
      created_at: data.created_at ? tsToIso(data.created_at) : new Date().toISOString(),
    } as User;
  }

  async getTimeCredits(userId: string): Promise<TimeCredit | null> {
    const q = query(collection(db, 'timeCredits'), where('user_id', '==', userId));
    const snaps = await getDocs(q);
    const docSnap = snaps.docs[0];
    if (!docSnap) return null;
    const d = docSnap.data();
    return {
      id: docSnap.id,
      user_id: d.user_id,
      balance: d.balance,
      total_earned: d.total_earned,
      total_spent: d.total_spent,
      updated_at: tsToIso(d.updated_at),
    } as TimeCredit;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const q1 = query(collection(db, 'transactions'), where('from_user_id', '==', userId), orderBy('created_at', 'desc'));
    const q2 = query(collection(db, 'transactions'), where('to_user_id', '==', userId), orderBy('created_at', 'desc'));
    const [r1, r2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const docs = [...r1.docs, ...r2.docs];
    const txs = await Promise.all(docs.map(async (d) => {
      const data = d.data();
      const fromUser = data.from_user_id ? await this.getUserById(data.from_user_id) : undefined;
      const toUser = data.to_user_id ? await this.getUserById(data.to_user_id) : undefined;
      return {
        id: d.id,
        from_user_id: data.from_user_id,
        to_user_id: data.to_user_id,
        booking_id: data.booking_id,
        amount: data.amount,
        transaction_type: data.transaction_type,
        description: data.description,
        created_at: tsToIso(data.created_at),
        from_user: fromUser,
        to_user: toUser,
      } as Transaction;
    }));

    txs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return txs;
  }

  async getSkills(): Promise<Skill[]> {
    const snaps = await getDocs(collection(db, 'skills'));
  return snaps.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) } as Skill));
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const snaps = await getDocs(query(collection(db, 'userSkills'), where('user_id', '==', userId)));
    const skills = await this.getSkills();
  return snaps.docs.map((d: any) => ({ id: d.id, ...(d.data() as any), skill: skills.find((s) => s.id === (d.data() as any).skill_id) } as UserSkill));
  }

  async addUserSkill(userId: string, skillId: string, type: 'offered' | 'needed', proficiencyLevel: string): Promise<UserSkill> {
    const payload = { user_id: userId, skill_id: skillId, type, proficiency_level: proficiencyLevel } as any;
    const ref = await addDoc(collection(db, 'userSkills'), payload);
    return { id: ref.id, ...payload } as UserSkill;
  }

  async removeUserSkill(userSkillId: string): Promise<void> {
    await deleteDoc(doc(db, 'userSkills', userSkillId));
  }

  async getServices(filters?: { category?: string; type?: string; search?: string }): Promise<Service[]> {
    const snaps = await getDocs(query(collection(db, 'services')));
  const all = snaps.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) } as Service));
  let filtered = all.filter((s: Service) => s.status === 'active');
  if (filters?.type) filtered = filtered.filter((s: Service) => s.type === filters.type);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
  filtered = filtered.filter((s: Service) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (filters?.category) {
      const skills = await this.getSkills();
      const matching = skills.filter((sk) => sk.category === filters.category).map((sk) => sk.id);
  filtered = filtered.filter((s: Service) => matching.includes((s as any).skill_id));
    }

    // Enrich provider and skill
    const usersMap = new Map<string, User>();
    const skillsList = await this.getSkills();
  const result = await Promise.all(filtered.map(async (s: Service) => {
      if (!usersMap.has((s as any).provider_id)) {
        const u = await this.getUserById((s as any).provider_id);
        if (u) usersMap.set((s as any).provider_id, u);
      }
      return { ...s, provider: usersMap.get((s as any).provider_id), skill: skillsList.find((sk) => sk.id === (s as any).skill_id) } as Service;
    }));

  result.sort((a: Service, b: Service) => new Date((b as any).created_at || '').getTime() - new Date((a as any).created_at || '').getTime());
    return result;
  }

  async getUserServices(userId: string): Promise<Service[]> {
    const snaps = await getDocs(query(collection(db, 'services'), where('provider_id', '==', userId)));
    const skills = await this.getSkills();
  return snaps.docs.map((d: any) => ({ id: d.id, ...(d.data() as any), skill: skills.find((sk) => sk.id === (d.data() as any).skill_id) } as Service)).sort((a: Service, b: Service) => new Date((b as any).created_at || '').getTime() - new Date((a as any).created_at || '').getTime());
  }

  async createService(service: Omit<Service, 'id' | 'created_at'>): Promise<Service> {
    const payload = { ...service, created_at: serverTimestamp() } as any;
    const ref = await addDoc(collection(db, 'services'), payload);
    const snap = await getDoc(ref);
    return { id: ref.id, ...(snap.data() as any), created_at: tsToIso((snap.data() as any).created_at) } as Service;
  }

  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    await updateDoc(doc(db, 'services', serviceId), updates as any);
    const snap = await getDoc(doc(db, 'services', serviceId));
    return { id: snap.id, ...(snap.data() as any) } as Service;
  }

  async deleteService(serviceId: string): Promise<void> {
    await deleteDoc(doc(db, 'services', serviceId));
  }

  async getBookings(userId: string): Promise<Booking[]> {
    const q1 = query(collection(db, 'bookings'), where('provider_id', '==', userId));
    const q2 = query(collection(db, 'bookings'), where('requester_id', '==', userId));
    const [r1, r2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const docs = [...r1.docs, ...r2.docs];
    const services = await this.getServices();
    const usersCache = new Map<string, User>();
  const bookings = await Promise.all(docs.map(async (d: any) => {
      const data = d.data() as any;
      if (data.provider_id && !usersCache.has(data.provider_id)) {
        const u = await this.getUserById(data.provider_id);
        if (u) usersCache.set(data.provider_id, u);
      }
      if (data.requester_id && !usersCache.has(data.requester_id)) {
        const u = await this.getUserById(data.requester_id);
        if (u) usersCache.set(data.requester_id, u);
      }
      return {
        id: d.id,
        ...data,
        provider: usersCache.get(data.provider_id),
        requester: usersCache.get(data.requester_id),
        service: services.find((s) => s.id === data.service_id),
        created_at: tsToIso(data.created_at),
      } as Booking;
    }));

  bookings.sort((a: Booking, b: Booking) => new Date((b as any).scheduled_start).getTime() - new Date((a as any).scheduled_start).getTime());
    return bookings;
  }

  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'status'>): Promise<Booking> {
    const payload = { ...booking, status: 'pending', created_at: serverTimestamp() } as any;
    const ref = await addDoc(collection(db, 'bookings'), payload);
    const snap = await getDoc(ref);
    return { id: ref.id, ...(snap.data() as any), created_at: tsToIso((snap.data() as any).created_at) } as Booking;
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    await updateDoc(doc(db, 'bookings', bookingId), updates as any);
    const snap = await getDoc(doc(db, 'bookings', bookingId));
    const data = snap.data() as any;

    if (updates.status === 'completed') {
      // adjust time credits and create transaction
      const booking = { id: snap.id, ...data } as Booking;
      const providerTcQ = query(collection(db, 'timeCredits'), where('user_id', '==', booking.provider_id));
      const requesterTcQ = query(collection(db, 'timeCredits'), where('user_id', '==', booking.requester_id));
      const [pSnaps, rSnaps] = await Promise.all([getDocs(providerTcQ), getDocs(requesterTcQ)]);
      const pDoc = pSnaps.docs[0];
      const rDoc = rSnaps.docs[0];
      if (pDoc && rDoc) {
        const duration = booking.duration_hours || 0;
        await updateDoc(doc(db, 'timeCredits', pDoc.id), { balance: (pDoc.data() as any).balance + duration, total_earned: (pDoc.data() as any).total_earned + duration } as any);
        await updateDoc(doc(db, 'timeCredits', rDoc.id), { balance: (rDoc.data() as any).balance - duration, total_spent: (rDoc.data() as any).total_spent + duration } as any);

        await addDoc(collection(db, 'transactions'), {
          from_user_id: booking.requester_id,
          to_user_id: booking.provider_id,
          booking_id: booking.id,
          amount: duration,
          transaction_type: 'service_completed',
          description: `Payment for booking ${booking.id}`,
          created_at: serverTimestamp(),
        } as any);
      }
    }

    return { id: snap.id, ...(snap.data() as any) } as Booking;
  }

  async getReviews(userId: string): Promise<Review[]> {
    const snaps = await getDocs(query(collection(db, 'reviews'), where('reviewee_id', '==', userId), orderBy('created_at', 'desc')));
  const reviews = await Promise.all(snaps.docs.map(async (d: any) => {
      const data = d.data() as any;
      const reviewer = await this.getUserById(data.reviewer_id);
      return { id: d.id, ...(d.data() as any), reviewer, created_at: tsToIso(data.created_at) } as Review;
    }));
    return reviews;
  }

  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const payload = { ...review, created_at: serverTimestamp() } as any;
    const ref = await addDoc(collection(db, 'reviews'), payload);
    // recompute rating
    const snaps = await getDocs(query(collection(db, 'reviews'), where('reviewee_id', '==', review.reviewee_id)));
  const all = snaps.docs.map((d: any) => d.data() as any);
  const avg = all.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / (all.length || 1);
    const userRef = doc(db, 'users', review.reviewee_id);
    await updateDoc(userRef, { reputation_score: Number(avg.toFixed(1)), total_reviews: all.length } as any);
    const snap = await getDoc(ref);
    return { id: ref.id, ...(snap.data() as any), created_at: tsToIso((snap.data() as any).created_at) } as Review;
  }
}

export const dataService = new DataService();