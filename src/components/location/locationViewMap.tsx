import { useEffect, useRef, useState } from "react";

interface LocationViewMapProps {
  location: { x: number; y: number; address?: string };
}

const LocationViewMap = ({ location }: LocationViewMapProps) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const markerInstance = useRef<naver.maps.Marker | null>(null);
  const [naverMapsLoaded, setNaverMapsLoaded] = useState<boolean>(false);
  const [address, setAddress] = useState<string>(location.address || "");

  useEffect(() => {
    // 네이버 지도 API 로드 여부 확인
    const checkNaverMapsLoaded = () => {
      return window.naver && window.naver.maps && window.naver.maps.Service;
    };

    const loadNaverMaps = () => {
      if (checkNaverMapsLoaded()) {
        setNaverMapsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ozayj4fkh5&submodules=geocoder";
      script.async = true;
      script.onload = () => {
        // API 로드 후 상태 업데이트
        setNaverMapsLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadNaverMaps();
  }, []);

  useEffect(() => {
    // 네이버 맵 API가 로드된 후에만 지도 초기화
    if (!naverMapsLoaded || !mapElement.current) return;

    const initializeMap = () => {
      try {
        // 좌표 생성
        const position = new window.naver.maps.LatLng(location.y, location.x);

        // 지도 생성
        const mapOptions = {
          center: position,
          zoom: 16,
          minZoom: 5,
          tileDuration: 300,
          zoomControl: true,
          zoomControlOptions: {
            style: naver.maps.ZoomControlStyle.SMALL,
            position: naver.maps.Position.TOP_RIGHT,
          },
          draggable: true,
          pinchZoom: true,
          scrollWheel: true,
          keyboardShortcuts: true,
        };

        // 지도 생성
        const map = new naver.maps.Map(mapElement.current!, mapOptions);
        mapInstance.current = map;

        // SVG 마커 생성
        const iconContent = `
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
               width="24" height="24" viewBox="0 0 81 113"
               preserveAspectRatio="xMidYMid meet">
            <g transform="translate(0,113) scale(0.1,-0.1)"
               fill="#FF0000" stroke="none">
              <path d="M291 1115 c-164 -46 -278 -174 -289 -326 -12 -169 110 -427 333 -708
              l67 -84 24 29 c202 241 333 474 370 655 14 68 14 90 4 145 -23 120 -118 228
              -243 276 -69 27 -195 33 -266 13z m204 -92 c73 -24 158 -112 179 -182 32 -110
              9 -213 -66 -290 -174 -181 -472 -73 -495 179 -8 87 17 152 87 222 84 84 186
              108 295 71z"/>
              <path d="M299 924 c-17 -21 -17 -87 0 -108 33 -40 91 -5 91 56 0 57 -59 91
              -91 52z"/>
              <path d="M436 924 c-22 -22 -21 -87 2 -107 24 -22 56 -22 73 -1 17 21 17 87 0
              108 -17 20 -55 21 -75 0z"/>
              <path d="M213 822 c-25 -16 -25 -58 0 -88 22 -25 27 -27 51 -16 21 9 26 19 26
              45 0 49 -42 82 -77 59z"/>
              <path d="M537 812 c-10 -10 -17 -33 -17 -51 0 -24 6 -34 26 -43 24 -11 29 -9
              51 16 49 57 -10 133 -60 78z"/>
              <path d="M360 773 c-38 -20 -80 -83 -80 -124 0 -45 25 -57 125 -57 127 0 151
              28 105 118 -34 68 -93 92 -150 63z"/>
            </g>
          </svg>`;

        // 네이버 마커 생성
        const marker = new naver.maps.Marker({
          position: position,
          map: map,
          icon: {
            content: iconContent,
            size: new naver.maps.Size(24, 24),
            anchor: new naver.maps.Point(12, 24),
          },
        });

        markerInstance.current = marker;

        // 주소가 없으면 가져오기
        if (!location.address) {
          reverseGeocode(location.y, location.x);
        }
      } catch (error) {
        console.error("Error creating map:", error);
      }
    };

    initializeMap();

    return () => {
      // 클린업
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
        markerInstance.current = null;
      }
      mapInstance.current = null;
    };
  }, [naverMapsLoaded, location]);

  // 위도, 경도로 주소 가져오기 (역지오코딩)
  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.naver || !window.naver.maps || !window.naver.maps.Service) {
      console.error("Naver Maps Service is not available");
      return;
    }

    try {
      naver.maps.Service.reverseGeocode(
        {
          coords: new naver.maps.LatLng(lat, lng),
          orders: [
            naver.maps.Service.OrderType.ADDR,
            naver.maps.Service.OrderType.ROAD_ADDR,
          ].join(","),
        },
        (status, response) => {
          if (status === naver.maps.Service.Status.ERROR) {
            console.error("Geocoding Error");
            return;
          }

          // 주소 정보 추출
          if (response.v2.results && response.v2.results.length > 0) {
            const result = response.v2;
            const address =
              result.address.roadAddress ||
              result.address.jibunAddress ||
              "주소 정보 없음";
            setAddress(address);
          } else {
            setAddress("주소 정보를 찾을 수 없습니다");
          }
        }
      );
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setAddress("주소 조회 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={mapElement}
        style={{
          width: "100%",
          height: "300px",
          borderRadius: "8px",
          position: "relative",
        }}
        className="border border-gray-200"
      />
      {address && (
        <div className="text-sm text-gray-700 mt-1 sr-only">
          위치: {address}
        </div>
      )}
    </div>
  );
};

export default LocationViewMap;
