import { useEffect, useRef, useState } from "react";

interface LocationPickerProps {
  onLocationSelect: (location: { x: number; y: number; address: string }) => void;
  initialLocation?: { x: number; y: number; location: string };
}

const FindLocationPicker = ({ onLocationSelect, initialLocation }: LocationPickerProps) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation?.location ?? "주소를 선택해주세요.");

  // 사용자가 선택한 위치 상태 (초기 위치가 있으면 기본값 설정)
  const [selectedX, setSelectedX] = useState<number>(initialLocation?.x ?? 126.9784);
  const [selectedY, setSelectedY] = useState<number>(initialLocation?.y ?? 37.5665);
  const [naverMapsLoaded, setNaverMapsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ozayj4fkh5&submodules=geocoder";
    script.async = true;
    script.onload = () => setNaverMapsLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!naverMapsLoaded || !mapElement.current) return;

    const initialCenter = new window.naver.maps.LatLng(selectedY, selectedX);
    const mapOptions = { center: initialCenter, zoom: 15, minZoom: 10, tileDuration: 300 };

    const map = new naver.maps.Map(mapElement.current!, mapOptions);
    mapInstance.current = map;

    markerRef.current = new window.naver.maps.Marker({
      position: initialCenter,
      map: map,
      draggable: true,
    });

    reverseGeocode(selectedY, selectedX);

    // 지도 클릭 이벤트
    window.naver.maps.Event.addListener(map, "click", (e: naver.maps.PointerEvent) => {
      const lat = e.coord.y;
      const lng = e.coord.x;

      markerRef.current?.setPosition(new window.naver.maps.LatLng(lat, lng));
      setSelectedX(lng);
      setSelectedY(lat);
      reverseGeocode(lat, lng);
    });

    // 마커 드래그 이벤트
    window.naver.maps.Event.addListener(markerRef.current, "dragend", () => {
      if (markerRef.current) {
        const position = markerRef.current.getPosition();
        setSelectedX(position.x);
        setSelectedY(position.y);
        reverseGeocode(position.y, position.x);
      }
    });

    return () => {
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, [naverMapsLoaded]);

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.naver || !window.naver.maps || !window.naver.maps.Service) return;
  
    naver.maps.Service.reverseGeocode(
      {
        coords: new naver.maps.LatLng(lat, lng),
        orders: [naver.maps.Service.OrderType.ROAD_ADDR, naver.maps.Service.OrderType.ADDR].join(","),
      },
      (status, response) => {
        if (status === naver.maps.Service.Status.ERROR) return;
  
        // 도로명 주소 및 지번 주소 가져오기
        const result = response.v2.address;
        const roadAddress = result?.roadAddress || "";
        const jibunAddress = result?.jibunAddress || "";
  
        // 가장 적절한 주소 선택 (도로명 주소 우선, 없으면 지번 주소 사용)
        const finalAddress = roadAddress || jibunAddress || "주소 정보 없음";
  
        setSelectedLocation(finalAddress);
        onLocationSelect({ x: lng, y: lat, address: finalAddress });
      }
    );
  };
  

  return (
    <div className="space-y-2 pb-10">
      <div ref={mapElement} style={{ width: "100%", height: "300px", borderRadius: "8px" }} className="border border-gray-200" />
      {selectedLocation && <div className="text-sm text-gray-700 mt-1">선택된 위치: {selectedLocation}</div>}
      <p className="text-xs text-gray-500">지도를 클릭하여 실종 위치를 지정해주세요</p>
    </div>
  );
};

export default FindLocationPicker;
