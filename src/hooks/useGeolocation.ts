import { useState, useEffect } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface LocationState {
  loaded: boolean;
  coordinates?: Coordinates;
  error?: GeolocationError;
}

const defaultLocation: LocationState = {
  loaded: false,
  coordinates: { lat: 37.52133, lng: 126.9522 } // 기본 위치 (서울)
};

export function useGeolocation() {
  const [location, setLocation] = useState<LocationState>(defaultLocation);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocation({
        loaded: true,
        error: {
          code: 0,
          message: "Geolocation not supported"
        }
      });
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        loaded: true,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setLocation({
        loaded: true,
        error: {
          code: error.code,
          message: error.message
        }
      });
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      options
    );

    // Clean up
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
}

export default useGeolocation;
