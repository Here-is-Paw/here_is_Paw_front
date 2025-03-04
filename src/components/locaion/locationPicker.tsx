import { useEffect, useRef, useState } from "react";

interface LocationPickerProps {
  onLocationSelect: (location: {
    x: number;
    y: number;
    address: string;
  }) => void;
  initialLocation?: { x: number; y: number };
}

const LocationPicker = ({
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [naverMapsLoaded, setNaverMapsLoaded] = useState<boolean>(false);
  const [infoContent, setInfoContent] = useState<HTMLDivElement | null>(null);

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
        // 초기 위치 설정 (기본값 또는 초기 위치)
        const initialCenter = initialLocation
          ? new window.naver.maps.LatLng(initialLocation.y, initialLocation.x)
          : new window.naver.maps.LatLng(37.52133, 126.9522); // 서울 기본 좌표

        const mapOptions = {
          center: initialCenter,
          zoom: 15,
          minZoom: 10,
          tileDuration: 300,
          zoomControl: true,
          zoomControlOptions: {
            style: naver.maps.ZoomControlStyle.SMALL,
            position: naver.maps.Position.TOP_RIGHT,
          },
        };

        // 지도 생성
        const map = new naver.maps.Map(mapElement.current, mapOptions);
        mapInstance.current = map;

        // 중앙에 고정된 마커 UI 요소 추가
        const centerMarker = document.createElement("div");
        centerMarker.className = "center-marker";
        centerMarker.style.cssText =
          "position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);z-index:1000;width:20px;height:20px;background-color:red;border-radius:50%;border:2px solid white;pointer-events:none;";
        mapElement.current.appendChild(centerMarker);

        // 지도 정보 표시 요소 생성
        const contentEl = document.createElement("div");
        contentEl.className = "map-info";
        contentEl.style.cssText =
          "position:absolute;top:10px;left:10px;z-index:1000;background-color:white;padding:8px 12px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;";
        contentEl.innerHTML = "<p>지도의 중심 위치가 선택됩니다</p>";

        mapElement.current.appendChild(contentEl);
        setInfoContent(contentEl);

        // 초기 위치 주소 가져오기
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
