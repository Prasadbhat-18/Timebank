import { db, isFirebaseConfigured } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const useFirebase = isFirebaseConfigured() && !!db;

export interface BookingNotification {
  id: string;
  booking_id: string;
  provider_id: string;
  requester_id: string;
  service_title: string;
  requester_name: string;
  created_at: string;
}

export const bookingNotificationService = {
  /**
   * Subscribe to new bookings for a provider
   * @param providerId The provider user ID
   * @param onNewBooking Callback when a new booking is detected
   * @returns Unsubscribe function
   */
  subscribeToProviderBookings(providerId: string, onNewBooking: (booking: any) => void): () => void {
    if (!useFirebase) {
      console.log('Firebase not configured; booking notifications disabled');
      return () => {};
    }

    // Track the last seen booking timestamp to detect truly new ones
    let lastSeenTimestamp: Date | null = null;
    let isFirstLoad = true;

    // Keep the query simple (equality filters only) to avoid composite index requirements
    const q = query(
      collection(db, 'bookings'),
      where('provider_id', '==', providerId),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (isFirstLoad) {
        // On first load, just set the baseline timestamp
        if (!snapshot.empty) {
          const firstDoc = snapshot.docs[0].data() as any;
          lastSeenTimestamp = firstDoc.created_at?.toDate?.() || new Date();
        }
        isFirstLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as any;
          const createdAt = data.created_at?.toDate?.() || new Date();
          
          // Only notify if this is truly a new booking (after the baseline)
          if (!lastSeenTimestamp || createdAt > lastSeenTimestamp) {
            onNewBooking({
              id: change.doc.id,
              ...data,
              created_at: createdAt.toISOString(),
            });
            lastSeenTimestamp = createdAt;
          }
        }
      });
    });

    return unsub;
  },
};
