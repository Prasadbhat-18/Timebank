import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Wallet,
  Calendar,
  TrendingUp,
  Star,
  Clock,
  Users,
  ArrowRight,
} from 'lucide-react';
import { TimeCredit, Booking, Service, Review } from '../../types';
import { dataService } from '../../services/dataService';
import { bookingNotificationService } from '../../services/bookingNotificationService';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [timeCredit, setTimeCredit] = useState<TimeCredit | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookingBanner, setNewBookingBanner] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    // Listen for booking completion to reload dashboard (XP/credits)
    const handler = () => {
      loadDashboardData();
    };
    window.addEventListener('timebank:refreshProfileAndDashboard', handler);
    return () => window.removeEventListener('timebank:refreshProfileAndDashboard', handler);
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    const [credit, bookings, services, reviews] = await Promise.all([
      dataService.getTimeCredits(user.id),
      dataService.getBookings(user.id),
      dataService.getUserServices(user.id),
      dataService.getReviews(user.id),
    ]);

    setTimeCredit(credit);
    // Sort newest first so latest requests appear on top
    const active = bookings
      .filter((b) => b.status !== 'completed' && b.status !== 'cancelled')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
    setUpcomingBookings(active);
    setRecentServices(services.slice(0, 3));
    setRecentReviews(reviews.slice(0, 3));
    setLoading(false);
  };

  // Live notification banner for providers when a new booking is created
  useEffect(() => {
    if (!user) return;
    const unsub = bookingNotificationService.subscribeToProviderBookings(user.id, (booking) => {
      const requester = booking?.requester?.username || booking?.requester_name || booking?.requester_id || 'A user';
      const service = booking?.service?.title || booking?.service_title || 'your service';
      setNewBookingBanner(`${requester} booked "${service}"`);
      loadDashboardData();
      setTimeout(() => setNewBookingBanner(null), 5000);
    });
    return () => { try { unsub(); } catch {} };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      {newBookingBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-emerald-600 text-white shadow-lg flex items-center gap-3">
          <span>{newBookingBanner}</span>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('timebank:navigate', { detail: { view: 'bookings' } }));
            }}
            className="px-3 py-1 rounded bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm"
          >
            View booking
          </button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.username}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your TimeBank account</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 opacity-90" />
            <Clock className="w-12 h-12 opacity-20" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Time Credits</h3>
          <p className="text-4xl font-bold">{timeCredit?.balance.toFixed(1) || '0.0'}</p>
          <p className="text-sm opacity-75 mt-2">Available to spend</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Bookings</h3>
          <p className="text-4xl font-bold text-gray-800">{upcomingBookings.length}</p>
          <p className="text-sm text-gray-500 mt-2">Upcoming exchanges</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Reputation</h3>
          <p className="text-4xl font-bold text-gray-800">{user?.reputation_score.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-2">{user?.total_reviews} reviews</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Bookings</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>

          <div className="divide-y divide-gray-100">
            {upcomingBookings.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming bookings</p>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{booking.service?.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(booking.scheduled_start).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {' at '}
                        {new Date(booking.scheduled_start).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Recent Reviews</h2>
            <Star className="w-5 h-5 text-gray-400" />
          </div>

          <div className="divide-y divide-gray-100">
            {recentReviews.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <Star className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reviews yet</p>
              </div>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {review.reviewer?.avatar_url ? (
                          <img
                            src={review.reviewer.avatar_url}
                            alt={review.reviewer.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {review.reviewer?.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Your Services</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>

        <div className="divide-y divide-gray-100">
          {recentServices.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No services posted yet</p>
            </div>
          ) : (
            recentServices.map((service) => (
              <div key={service.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{service.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        service.type === 'offer'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {service.type}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Quick Stats
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Earned:</span>
              <span className="font-semibold text-gray-800">
                {timeCredit?.total_earned.toFixed(1)} credits
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-semibold text-gray-800">
                {timeCredit?.total_spent.toFixed(1)} credits
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since:</span>
              <span className="font-semibold text-gray-800">
                {user?.created_at &&
                  new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Community Impact
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>You're making a difference in the TimeBank community!</p>
            <p className="text-xs">
              Every service exchange strengthens our skill-sharing network and helps build a more
              collaborative society.
            </p>
          </div>
        </div>
      </div>

      {/* Firebase Service Monitor removed per request */}
    </div>
  );
};