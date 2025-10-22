import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, Clock, Star, User, Plus } from 'lucide-react';
import { Service, Skill } from '../../types';
import { dataService } from '../../services/dataService';
import { ServiceModal } from './ServiceModal';
import { BookingModal } from './BookingModal';
import { ProfileModal } from '../Profile/ProfileModal';
import { LevelBadge } from '../Level/LevelProgress';
// Chat entry is available only from BookingModal to avoid duplicates
import { InfiniteCarousel } from './InfiniteCarousel';

export const ServiceList: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'offer' | 'request'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [hideMine, setHideMine] = useState<boolean>(false);
  const [minCredits, setMinCredits] = useState<string>('');
  const [maxCredits, setMaxCredits] = useState<string>('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [profileToShow, setProfileToShow] = useState<{ id?: string; user?: any } | null>(null);
  // Removed chatPeer; chat is opened from BookingModal only

  useEffect(() => {
    loadData();
  }, [filterType, filterCategory, searchTerm, hideMine, minCredits, maxCredits, user?.id]);

  const loadData = async () => {
    setLoading(true);
    let [servicesData, skillsData] = await Promise.all([
      dataService.getServices({
        type: filterType === 'all' ? undefined : filterType,
        category: filterCategory || undefined,
        search: searchTerm || undefined,
      }),
      dataService.getSkills(),
    ]);

    // Fallback: if a service has no provider object yet (e.g. immediate reload after creation
    // before Firestore roundtrip enriches it), inject the currently logged in user for their own services.
    if (user?.id) {
      servicesData = servicesData.map(s => {
        if (!s.provider && s.provider_id === user.id) {
          return { ...s, provider: user } as Service;
        }
        return s;
      });
    }
    
    // Debug log for cross-user booking
    console.log('Current user:', user?.id, user?.email);
  console.log('All services:', servicesData.map(s => ({ id: s.id, title: s.title, provider_id: s.provider_id, provider_username: s.provider?.username })));
    console.log('Services you can book:', servicesData.filter(s => s.provider_id !== user?.id));
  // expose debug counts
  const total = servicesData.length;
  const mine = servicesData.filter(s => s.provider_id === user?.id).length;
  const others = total - mine;
  console.log(`services: total=${total}, mine=${mine}, others=${others}`);
    
    // Apply client-side additional filters
    let filtered = [...servicesData];
    if (hideMine && user?.id) {
      filtered = filtered.filter(s => s.provider_id !== user.id);
    }
    const min = parseFloat(minCredits);
    const max = parseFloat(maxCredits);
    if (!isNaN(min)) filtered = filtered.filter(s => (s.credits_per_hour ?? 0) >= min);
    if (!isNaN(max)) filtered = filtered.filter(s => (s.credits_per_hour ?? 0) <= max);

    setServices(filtered);
    setSkills(skillsData);
    setLoading(false);
  };

  const categories = Array.from(new Set(skills.map((s) => s.category)));

  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso).getTime();
    const diff = Date.now() - d;
    const sec = Math.floor(diff / 1000);
    if (sec < 10) return 'just now';
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day === 1) return '1 day ago';
    return `${day} days ago`;
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Service Marketplace</h1>
          <p className="text-gray-600 mt-1">Discover and exchange skills with the community</p>
            <div className="text-sm text-gray-500 mt-1">Debug: services total {services.length}</div>
        </div>
        <button
          onClick={() => {
            console.log('🚀 POST SERVICE BUTTON CLICKED!');
            alert('Post Service Button Clicked!');
            setShowServiceModal(true);
          }}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Post Service
        </button>
        
        {/* Test Button */}
        <button
          onClick={() => {
            console.log('🧪 TEST BUTTON CLICKED!');
            alert('Test Button Works!');
          }}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          Test Button
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'offer' | 'request')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="offer">Offers</option>
              <option value="request">Requests</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700 px-3 py-2 border border-gray-300 rounded-lg">
              <input type="checkbox" checked={hideMine} onChange={(e) => setHideMine(e.target.checked)} />
              Hide my services
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder="Min credits"
                value={minCredits}
                onChange={(e) => setMinCredits(e.target.value)}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Max credits"
                value={maxCredits}
                onChange={(e) => setMaxCredits(e.target.value)}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => { setFilterType('all'); setFilterCategory(''); setSearchTerm(''); setHideMine(false); setMinCredits(''); setMaxCredits(''); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No services found matching your criteria</p>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition group"
              >
                <div
                  className={`h-2 ${
                    service.type === 'offer'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                  }`}
                ></div>

                {/* Carousel for service images */}
                {service.imageUrls && service.imageUrls.length > 0 && (
                  <div className="mb-4">
                    <InfiniteCarousel images={service.imageUrls} />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          service.type === 'offer'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {service.type === 'offer' ? 'Service Offered' : 'Service Needed'}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition">
                          {service.title}
                        </h3>
                        <span className="text-xs text-gray-500">{timeAgo(service.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{service.credits_per_hour} credit/hr</span>
                    </div>
                    {service.skill && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {service.skill.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setProfileToShow({ id: service.provider_id, user: service.provider })}
                        className="flex items-center gap-3 text-left hover:opacity-80 transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {service.provider?.avatar_url ? (
                            <img
                              src={service.provider.avatar_url}
                              alt={service.provider?.username || service.provider_id}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{service.provider?.username || service.provider_id}</p>
                            <LevelBadge level={service.provider?.level || 1} size="sm" showTitle={false} />
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs text-gray-600">
                              {(service.provider?.reputation_score ?? 0).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>

                    {service.provider_id !== user?.id ? (
                      <button
                        onClick={() => handleBookService(service)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition"
                      >
                        Book Now
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-gray-200 text-gray-500 text-sm rounded-lg">
                          Your Service
                        </span>
                        <button
                          onClick={async () => {
                            console.log('🗑️ CANCEL SERVICE BUTTON CLICKED!');
                            alert('Cancel Service Button Clicked!');
                            if (confirm('Are you sure you want to cancel this service? This action cannot be undone.')) {
                              try {
                                console.log('Deleting service:', service.id);
                                await dataService.deleteService(service.id);
                                console.log('Service deleted successfully');
                                alert('Service cancelled successfully!');
                                // refresh list
                                await loadData();
                              } catch (err) {
                                console.error('Failed to cancel service', err);
                                alert('Failed to cancel service. Please try again.');
                              }
                            }
                          }}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded-lg border border-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {/* Chat entry point moved into BookingModal pre-booking section */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showServiceModal && (
        <ServiceModal
          onClose={() => {
            setShowServiceModal(false);
            loadData();
          }}
        />
      )}

      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          onBooked={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
        />
      )}

      {profileToShow && (
        <ProfileModal
          userId={profileToShow.id}
          userObj={profileToShow.user}
          onClose={() => setProfileToShow(null)}
        />
      )}

      {/* Chat modal intentionally removed here; use BookingModal -> Chat before booking */}
    </div>
  );
};