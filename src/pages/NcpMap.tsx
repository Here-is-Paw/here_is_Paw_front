import { useEffect, useRef } from "react";

declare global {
  interface Window {
    naver: any;
  }
}

const NcpMap = () => {
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const isInitialized = useRef(false); // 초기화 여부를 추적하는 ref 추가

  useEffect(() => {
    // 이미 초기화되었다면 리턴
    if (isInitialized.current) return;

    const initializeMap = () => {
      // 이미 초기화되었거나 필요한 요소가 없다면 리턴
      if (isInitialized.current || !mapElement.current || !window.naver) {
        console.error("Map initialization failed");
        return;
      }

      try {
        const center = new window.naver.maps.LatLng(37.52133, 126.9522);
        const mapOptions = {
          center,
          zoom: 17,
          minZoom: 11,
          tileDuration: 300,
        };

        mapInstance.current = new window.naver.maps.Map(
          mapElement.current,
          mapOptions
        );
        isInitialized.current = true; // 초기화 완료 표시
        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Error creating map:", error);
      }
    };

    if (window.naver && window.naver.maps) {
      initializeMap();
    } else {
      const script = document.createElement("script");
      script.src =
        "https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ozayj4fkh5";
      script.onload = initializeMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current = null;
        isInitialized.current = false; // cleanup 시 초기화 상태도 리셋
      }
    };
  }, []);

  return (
    <div
      id="map"
      ref={mapElement}
      style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
    />
  );
};

export default NcpMap;
