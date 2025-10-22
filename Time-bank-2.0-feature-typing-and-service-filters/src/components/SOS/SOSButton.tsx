import { useState, useEffect } from 'react';
import { Phone, AlertTriangle, X, MapPin, RefreshCw, Shield } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuth } from '../../contexts/AuthContext';

interface SOSButtonProps {
  userLocation?: { lat: number; lng: number };
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export function SOSButton({ userLocation }: SOSButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [personalContacts, setPersonalContacts] = useState<EmergencyContact[]>([]);
  
  // Get user data for emergency contacts
  const { user } = useAuth();
  
  // Use enhanced geolocation hook
  const { location, error: locationError, loading: locationLoading, permissionStatus, refreshLocation } = useGeolocation();
  
  // Use precise location from hook, fallback to prop
  const currentLocation = location || userLocation;

  // Load emergency contacts from user profile
  useEffect(() => {
    if (user?.emergency_contacts) {
      // Convert user emergency contacts to SOS format
      const contacts = user.emergency_contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship
      }));
      setPersonalContacts(contacts);
    } else {
      // Fallback to localStorage for backward compatibility
      const savedContacts = localStorage.getItem('emergencyContacts');
      if (savedContacts) {
        setPersonalContacts(JSON.parse(savedContacts));
      }
    }
  }, [user]);

  const officialEmergencyContacts = [
    { name: 'Emergency Services', number: '112', type: 'emergency' },
    { name: 'Police', number: '100', type: 'police' },
    { name: 'Ambulance', number: '100', type: 'medical' },
    { name: 'Fire Department', number: '112', type: 'fire' },
  ];

  const handleSOSActivation = () => {
    console.log('🚨 SOS activation started');
    setIsActivated(true);
    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        // Trigger SOS actions
        triggerSOSActions();
        setTimeout(() => {
          setIsActivated(false);
          setIsExpanded(false);
        }, 2000);
      }
    }, 1000);
  };

  const cancelSOS = () => {
    console.log('SOS cancelled');
    setIsActivated(false);
    setCountdown(0);
    setIsExpanded(false);
  };

  const triggerSOSActions = () => {
    console.log('Triggering SOS actions...');
    // Send location to emergency contacts
    if (currentLocation) {
      const accuracy = location?.accuracy ? ` (±${Math.round(location.accuracy)}m)` : '';
      const locationMessage = `🚨 EMERGENCY ALERT 🚨\n\nI need immediate help!\n\nPrecise Location: https://maps.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}${accuracy}\n\nCoordinates:\nLatitude: ${currentLocation.lat.toFixed(6)}\nLongitude: ${currentLocation.lng.toFixed(6)}\n\nTime: ${new Date().toLocaleString()}`;
      
      // In a real app, this would send SMS/notifications to emergency contacts
      console.log('🚨 SOS ACTIVATED:', locationMessage);
      
      // Copy location to clipboard for easy sharing
      if (navigator.clipboard) {
        navigator.clipboard.writeText(locationMessage).then(() => {
          console.log('Location copied to clipboard');
        }).catch((error) => {
          console.log('Could not copy to clipboard:', error);
        });
      }
      
      // Show alert to user
      alert('🚨 SOS ACTIVATED! Your location has been copied to clipboard. Share it with emergency contacts immediately!');
    } else {
      console.warn('No location available for SOS');
      alert('⚠️ SOS activated but no location available. Please share your location manually.');
    }
  };

  const callEmergencyNumber = (number: string) => {
    // In a real app, this would initiate a phone call
    window.location.href = `tel:${number}`;
  };

  if (isActivated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">SOS ACTIVATING</h2>
          <div className="text-6xl font-bold text-red-500 mb-4">{countdown}</div>
          <p className="text-gray-600 mb-6">Emergency alert will be sent</p>
          <button
            onClick={cancelSOS}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main SOS Button */}
      <button
        onClick={() => {
          console.log('🚨 MAIN SOS BUTTON CLICKED!');
          alert('SOS Button Clicked!');
          setIsExpanded(!isExpanded);
        }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all duration-300 animate-pulse border-4 border-white"
        aria-label="Emergency SOS Button"
      >
        <AlertTriangle className="w-7 h-7 md:w-8 md:h-8" />
      </button>

      {/* Test SOS Button */}
      <button
        onClick={() => {
          console.log('🧪 TEST SOS BUTTON CLICKED!');
          alert('Test SOS Button Works!');
        }}
        className="fixed bottom-32 md:bottom-18 right-4 md:right-6 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-300"
        aria-label="Test SOS Button"
      >
        <span className="text-xs font-bold">TEST</span>
      </button>

      {/* Expanded SOS Panel */}
      {isExpanded && (
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-6 z-40 w-80 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-red-600">Emergency SOS</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Status */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Location Status</span>
              </div>
              {currentLocation && (
                <button
                  onClick={refreshLocation}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Refresh location"
                >
                  <RefreshCw className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
            
            <div className="text-sm">
              {locationLoading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                  <span>Getting precise location...</span>
                </div>
              )}
              
              {currentLocation && !locationLoading && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="w-3 h-3" />
                    <span className="font-medium">Location acquired</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-5">
                    <div>Lat: {currentLocation.lat.toFixed(6)}</div>
                    <div>Lng: {currentLocation.lng.toFixed(6)}</div>
                    {location?.accuracy && (
                      <div>Accuracy: ±{Math.round(location.accuracy)}m</div>
                    )}
                  </div>
                </div>
              )}
              
              {locationError && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-medium">Location access needed</span>
                  </div>
                  <div className="text-xs text-gray-600">{locationError}</div>
                  {permissionStatus === 'denied' && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      Please enable location permissions in your browser settings for emergency features to work properly.
                    </div>
                  )}
                </div>
              )}
              
              {!currentLocation && !locationLoading && !locationError && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Location not available</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick SOS Activation */}
          <button
            onClick={() => {
              console.log('🚨 SOS button clicked - activating emergency alert');
              handleSOSActivation();
            }}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl font-bold text-lg mb-4 transition-all duration-200 shadow-lg"
          >
            🚨 ACTIVATE SOS ALERT
          </button>

          {/* Personal Emergency Contacts */}
          {personalContacts.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Emergency Contacts:</h4>
              {personalContacts.slice(0, 3).map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => callEmergencyNumber(contact.phone)}
                  className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition border border-green-200"
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm text-green-800">{contact.name}</div>
                    <div className="text-xs text-green-600">{contact.phone} • {contact.relationship}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Official Emergency Contacts */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Emergency Services:</h4>
            {officialEmergencyContacts.map((contact, index) => (
              <button
                key={index}
                onClick={() => callEmergencyNumber(contact.number)}
                className="w-full flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200"
              >
                <Phone className="w-4 h-4 text-red-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm text-red-800">{contact.name}</div>
                  <div className="text-xs text-red-600">{contact.number}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Information */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              SOS will send your location to emergency contacts and nearby TimeBank community members
            </p>
          </div>
        </div>
      )}
    </>
  );
}