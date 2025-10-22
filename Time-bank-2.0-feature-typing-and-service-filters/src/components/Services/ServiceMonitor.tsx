import React, { useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';

/**
 * ServiceMonitor - Real-time Firebase service monitoring component
 * Shows all services being created in real-time with visual indicators
 */
export const ServiceMonitor: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceCount, setServiceCount] = useState(0);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // First load existing services
    firebaseService.getServices().then(loadedServices => {
      setServices(loadedServices);
      setServiceCount(loadedServices.length);
      setIsLoading(false);

      // Then subscribe to real-time updates
      const unsub = firebaseService.subscribeToServices(updatedServices => {
        setServices(updatedServices);
        setServiceCount(updatedServices.length);
      });

      if (unsub) setUnsubscribe(() => unsub);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return 'N/A';
    }
  };

  const recentServices = services.slice(0, 5);

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">🔍 Firebase Service Monitor</h2>
        </div>
        <p className="text-sm text-slate-600">Real-time view of all services stored in Firestore</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-xs text-slate-600 mb-1">Total Services</p>
          <p className="text-2xl font-bold text-blue-600">
            {isLoading ? '...' : serviceCount}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-emerald-500">
          <p className="text-xs text-slate-600 mb-1">Status</p>
          <p className="text-lg font-semibold text-emerald-600">
            {isLoading ? 'Loading...' : 'Connected ✓'}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
          <p className="text-xs text-slate-600 mb-1">Last Update</p>
          <p className="text-xs text-amber-600">
            {isLoading ? 'Syncing...' : 'Real-time active'}
          </p>
        </div>
      </div>

      {/* Services List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Recent Services
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentServices.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">No services found in Firestore yet.</p>
            <p className="text-xs text-slate-400 mt-1">Create a service to see it here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentServices.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-800">{service.title || 'Untitled'}</h4>
                    <p className="text-xs text-slate-500">{service.description || 'No description'}</p>
                  </div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {service.skill_id || 'Unknown'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(service.created_at)}</span>
                  </div>
                  {service.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{service.location}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded p-2 text-xs">
                  <p className="text-slate-700">
                    <span className="font-mono text-slate-500">ID:</span> {service.id}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-mono text-slate-500">Provider:</span> {service.provider_id}
                  </p>
                </div>
              </div>
            ))}

            {serviceCount > 5 && (
              <div className="text-center py-2">
                <p className="text-xs text-slate-500">
                  Showing 5 of {serviceCount} services
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Firebase Status Indicator */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">💾 Firebase Firestore:</span> All services are stored and synced in real-time.
          Data persists across sessions and is accessible to all users.
        </p>
      </div>
    </div>
  );
};

export default ServiceMonitor;
