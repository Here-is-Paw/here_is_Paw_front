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
  coordinates: Coordinates;
  error?: GeolocationError;
}

// 서울 좌표를 기본값으로 설정
const defaultLocation: LocationState = {
  loaded: false,
  coordinates: { lat: 37.52133, lng: 126.9522 }
};

export function useGeolocation(options: PositionOptions = {}) {
  const [location, setLocation] = useState<LocationState>(defaultLocation);

  useEffect(() => {
    console.log('Requesting geolocation...');
    
    // 위치 정보 로딩 중임을 표시
    setLocation(prev => ({ ...prev, loaded: false }));

    if (!("geolocation" in navigator)) {
      console.error('Geolocation API is not supported in this browser');
      setLocation({
        ...defaultLocation,
        loaded: true,
        error: {
          code: 0,
          message: "Geolocation not supported"
        }
      });
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      console.log('Geolocation success:', position.coords);
      setLocation({
        loaded: true,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
      });
    };

    const onError = (error: GeolocationPositionError) => {
      console.error(`Geolocation error (${error.code}): ${error.message}`);
      
      // 오류 코드에 따른 메시지 추가
      let errorMsg = error.message;
      if (error.code === 1) {
        errorMsg = "위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
      } else if (error.code === 2) {
        errorMsg = "위치를 가져올 수 없습니다. GPS 신호가 약하거나 네트워크 문제가 있을 수 있습니다.";
      } else if (error.code === 3) {
        errorMsg = "위치 정보 요청 시간이 초과되었습니다.";
      }
      
      setLocation({
        ...defaultLocation,
        loaded: true,
        error: {
          code: error.code,
          message: errorMsg
        }
      });
    };

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true, // 정확도 높게 설정
      timeout: 10000, // 10초로 타임아웃 증가
      maximumAge: 0 // 항상 최신 위치 정보 요청
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      // 일회성으로 위치를 가져옴
      console.log('Calling getCurrentPosition with options:', mergedOptions);
      navigator.geolocation.getCurrentPosition(onSuccess, onError, mergedOptions);
    } catch (err) {
      console.error('Unexpected error requesting geolocation:', err);
    }

    return () => {}; // 빈 클린업 함수
  }, []);

  return location;
}

export default useGeolocation;