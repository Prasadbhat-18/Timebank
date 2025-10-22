import { useState, useEffect, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface GeolocationState {
  location: Location | undefined;
  error: string | null;
  loading: boolean;
  permissionStatus: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: undefined,
    error: null,
    loading: true,
    permissionStatus: null
  });

  const requestLocationPermission = useCallback(async () => {
    try {
      // Check if browser supports geolocation
      if (!navigator.geolocation) {
        setState(prev => ({
          ...prev,
          error: 'Geolocation is not supported by this browser',
          loading: false
        }));
        return;
      }

      // Check permission status first
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permissionStatus: permission.state }));

        // Listen for permission changes
        permission.onchange = () => {
          setState(prev => ({ ...prev, permissionStatus: permission.state }));
        };
      }

      // Request high-accuracy location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          setState(prev => ({
            ...prev,
            location: newLocation,
            loading: false,
            error: null
          }));

          // Set up continuous watching for precise location
          navigator.geolocation.watchPosition(
            (position) => {
              const updatedLocation: Location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              };
              setState(prev => ({ ...prev, location: updatedLocation }));
            },
            (error) => {
              console.warn('Location watch error:', error.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 30000, // Increased from 10s to 30s
              maximumAge: 30000 // Allow 30 second old readings
            }
          );
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please enable location permissions in your browser settings to use emergency features.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS/location services.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = `Location error: ${error.message}`;
              break;
          }

          setState(prev => ({
            ...prev,
            error: errorMessage,
            loading: false
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased from 15s to 30s
          maximumAge: 0 // Always get fresh location
        }
      );
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to access location services',
        loading: false
      }));
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const refreshLocation = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    requestLocationPermission();
  }, [requestLocationPermission]);

  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setState(prev => ({ ...prev, location: newLocation, error: null }));
          resolve(newLocation);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setState(prev => ({ ...prev, error: errorMessage }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased from 10s to 30s for slower GPS
          maximumAge: 0
        }
      );
    });
  }, []);

  return {
    location: state.location,
    error: state.error,
    loading: state.loading,
    permissionStatus: state.permissionStatus,
    refreshLocation,
    getCurrentLocation
  };
}