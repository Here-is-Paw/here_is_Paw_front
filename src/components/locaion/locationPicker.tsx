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
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [naverMapsLoaded, setNaverMapsLoaded] = useState<boolean>(false);

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
        };

        // 지도 생성
        const map = new naver.maps.Map(mapElement.current, mapOptions);
        mapInstance.current = map;

        // 초기 마커 생성 (있는 경우)
        if (initialLocation) {
          markerRef.current = new window.naver.maps.Marker({
            position: initialCenter,
            map: map,
            draggable: true,
          });

          // 지오코딩으로 주소 가져오기
          reverseGeocode(initialLocation.y, initialLocation.x);
        }

        // 지도 클릭 이벤트 등록
        window.naver.maps.Event.addListener(
          map,
          "click",
          (e: naver.maps.PointerEvent) => {
            const clickedPosition = e.coord;

            // 마커가 없으면 새로 생성, 있으면 위치 업데이트
            if (!markerRef.current) {
              markerRef.current = new window.naver.maps.Marker({
                position: clickedPosition,
                map: map,
                draggable: true,
              });
            } else {
              markerRef.current.setPosition(clickedPosition);
            }

            // 위도, 경도 정보 추출 및 주소 조회
            const lat = clickedPosition.y;
            const lng = clickedPosition.x;
            reverseGeocode(lat, lng);
          }
        );

        // 마커 드래그 이벤트
        if (markerRef.current) {
          window.naver.maps.Event.addListener(
            markerRef.current,
            "dragend",
            () => {
              if (markerRef.current) {
                const position = markerRef.current.getPosition();
                reverseGeocode(position.y, position.x);
              }
            }
          );
        }
      } catch (error) {
        console.error("Error creating map:", error);
      }
    };

    initializeMap();

    return () => {
      mapInstance.current = null;
      markerRef.current = null;
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
            const result = response.v2.results[0];
            const address =
              result.jibunAddress || result.roadAddress || "주소 정보 없음";
            setSelectedLocation(address);

            // 부모 컴포넌트에 위치 정보 전달
            onLocationSelect({
              x: lng,
              y: lat,
              address: address,
            });
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
        style={{ width: "100%", height: "300px", borderRadius: "8px" }}
        className="border border-gray-200"
      />
      {selectedLocation && (
        <div className="text-sm text-gray-700 mt-1">
          선택된 위치: {selectedLocation}
        </div>
      )}
      <p className="text-xs text-gray-500">
        지도를 클릭하여 실종 위치를 지정해주세요
      </p>
    </div>
  );
};

export default LocationPicker;
