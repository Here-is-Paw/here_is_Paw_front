import useGeolocation from "@/hooks/useGeolocation";
import { useEffect, useRef, useState } from "react";

interface LocationPickerProps {
  onLocationSelect: (location: {
    x: number;
    y: number;
    address: string;
  }) => void;
  initialLocation?: { x: number; y: number };
  isMissing: boolean;
}

const LocationPicker = ({
  onLocationSelect,
  initialLocation,
  isMissing,
}: LocationPickerProps) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [naverMapsLoaded, setNaverMapsLoaded] = useState<boolean>(false);
  const [infoContent, setInfoContent] = useState<HTMLDivElement | null>(null);

  const location = useGeolocation();

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

    // 우선순위:
    // 1. props로 전달된 초기 위치
    // 2. useGeolocation으로 가져온 현재 위치
    // 3. 서울 기본 좌표
    const getInitialCenter = () => {
      console.log("--->", location);
      if (initialLocation) {
        return new window.naver.maps.LatLng(
          initialLocation.y,
          initialLocation.x
        );
      }
      if (location.loaded && !location.error) {
        return new window.naver.maps.LatLng(
          location.coordinates.lat,
          location.coordinates.lng
        );
      }
      return new window.naver.maps.LatLng(37.52133, 126.9522); // 서울 기본 좌표
    };

    const initializeMap = () => {
      try {
        // 초기 위치 설정 (기본값 또는 초기 위치)
        const initialCenter = getInitialCenter(); // 서울 기본 좌표

        const mapOptions = {
          center: new window.naver.maps.LatLng(37.52133, 126.9522),
          zoom: 15,
          minZoom: 5,
          tileDuration: 300,
          zoomControl: true,
          zoomControlOptions: {
            style: naver.maps.ZoomControlStyle.SMALL,
            position: naver.maps.Position.TOP_RIGHT,
          },
        };

        // 지도 생성
        const map = new naver.maps.Map(mapElement.current!, mapOptions);
        mapInstance.current = map;
        mapInstance.current.setCenter(getInitialCenter());

        // 중앙에 고정된 마커 UI 요소 추가
        const centerMarker = document.createElement("div");
        centerMarker.className = "center-marker";
        
        if (isMissing) {
          centerMarker.innerHTML = `
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
        } else {
          centerMarker.innerHTML = `
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                 width="24" height="24" viewBox="0 0 81 113"
                 preserveAspectRatio="xMidYMid meet">
              <g transform="translate(0,113) scale(0.1,-0.1)"
                 fill="rgb(22, 163, 74)" stroke="none">
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
        }
        centerMarker.style.cssText =
          "position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);z-index:1000;pointer-events:none;";
        // centerMarker.style.cssText =
        //     "position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);z-index:1000;width:20px;height:20px;background-color:red;border-radius:50%;border:2px solid white;pointer-events:none;";
        if (mapElement.current) {
          mapElement.current.appendChild(centerMarker);
        }

        // 지도 정보 표시 요소 생성
        const contentEl = document.createElement("div");
        contentEl.className = "map-info";
        contentEl.style.cssText =
          "position:absolute;top:10px;left:10px;z-index:1000;background-color:white;padding:8px 12px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;";
        contentEl.innerHTML = "<p>지도의 중심 위치가 선택됩니다</p>";

        if (mapElement.current) {
          mapElement.current.appendChild(contentEl);
        }
        setInfoContent(contentEl);

        // 초기 위치 주소 가져오기
        map.setOptions("zoom", 16);
        reverseGeocode(initialCenter.y, initialCenter.x);

        // 지도 이동 완료 이벤트 등록
        window.naver.maps.Event.addListener(map, "idle", () => {
          const center = map.getCenter();

          // 주소 정보 업데이트
          reverseGeocode(center.y, center.x);
        });
      } catch (error) {
        console.error("Error creating map:", error);
      }
    };

    initializeMap();

    return () => {
      if (infoContent && mapElement.current) {
        const centerMarker = mapElement.current.querySelector(".center-marker");
        if (centerMarker) {
          mapElement.current.removeChild(centerMarker);
        }
        mapElement.current.removeChild(infoContent);
      }
      mapInstance.current = null;
    };
  }, [naverMapsLoaded, initialLocation]);

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
            setSelectedLocation(address);

            // 부모 컴포넌트에 위치 정보 전달
            onLocationSelect({
              x: lng,
              y: lat,
              address: address,
            });

            // 정보창 업데이트
            if (infoContent) {
              infoContent.innerHTML = `
                <p>좌표: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                <p>주소: ${address}</p>
              `;
            }
          } else {
            setSelectedLocation("주소 정보를 찾을 수 없습니다");
            onLocationSelect({
              x: lng,
              y: lat,
              address: "주소 정보 없음",
            });
          }
        }
      );
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setSelectedLocation("주소 조회 중 오류가 발생했습니다");
      onLocationSelect({
        x: lng,
        y: lat,
        address: "주소 조회 오류",
      });
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
      {selectedLocation && (
        <div className="text-sm text-gray-700 mt-1">
          선택된 위치: {selectedLocation}
        </div>
      )}
      <p className="text-xs text-gray-500">
        지도를 이동하면 중앙 위치가 자동으로 선택됩니다
      </p>
    </div>
  );
};

export default LocationPicker;
