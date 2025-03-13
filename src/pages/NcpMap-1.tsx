import { useEffect, useRef, useState } from "react";
import { useRadius } from "@/contexts/RadiusContext.tsx";
import { useMapLocation } from "@/contexts/MapLocationContext.tsx";
import { usePetContext } from "@/contexts/PetContext.tsx";
import { useCareCenterContext } from "@/contexts/CareCenterContext.tsx";
import { Hospital } from "lucide-react";

interface NcpMapProps {
  currentLocation: {
    loaded: boolean;
    coordinates?: { lat: number; lng: number };
    error?: { code: number; message: string };
  };
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  buttonStates: {
    lost: boolean;
    found: boolean;
    hospital: boolean;
  };
}

const NcpMap = ({ currentLocation, onLocationSelect, buttonStates }: NcpMapProps) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const isInitialized = useRef<boolean>(false);
  const circleRef = useRef<naver.maps.Circle | null>(null);
  const clickMarkerRef = useRef<naver.maps.Marker | null>(null);

  const { radius } = useRadius();
  const [selectedLocation, setSelectedLocation] =
    useState<naver.maps.LatLng | null>(null);
  const { setUserLocation } = useMapLocation();
  const { refreshPets, setSearchMode, findingPets, missingPets } = usePetContext();

  // 동물보호센터 컨텍스트 추가
  const { careCenters, refreshCenters, setSearchMode: setCenterSearchMode } = useCareCenterContext();

  // 마커 레퍼런스 배열 추가
  const missingMarkersRef = useRef<naver.maps.Marker[]>([]);
  const findingMarkersRef = useRef<naver.maps.Marker[]>([]);
  const careCenterMarkersRef = useRef<naver.maps.Marker[]>([]);

  const getPawMarkerIcon = (isLost: boolean) => {
    const color = isLost ? "#EF4444" : "#22C55E"; // red-500 : green-500
    return `
      <svg width="24" height="24" viewBox="0 0 53 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.0415 38.0417C11.0415 29.5043 17.9624 22.5834 26.4998 22.5834C35.0373 22.5834 41.9582 29.5043 41.9582 38.0417C41.9582 38.2294 41.9545 38.4164 41.9471 38.6026C41.8478 41.4194 40.3152 43.5316 38.2449 44.8897C36.2044 46.2291 33.6029 46.875 31.1031 46.875H21.8966C19.3967 46.875 16.7953 46.2291 14.7548 44.8897C12.6845 43.5316 11.1519 41.4194 11.0514 38.6026C11.0448 38.4164 11.0415 38.2294 11.0415 38.0417Z" fill="${color}"/>
        <path d="M20.151 7.125C17.0152 7.125 14.9062 10.1063 14.9062 13.1979C14.9062 16.2896 17.0152 19.2708 20.151 19.2708C23.2869 19.2708 25.3958 16.2896 25.3958 13.1979C25.3958 10.1063 23.2869 7.125 20.151 7.125ZM3.3125 19.8229C3.3125 16.7313 5.42146 13.75 8.55729 13.75C11.6931 13.75 13.8021 16.7313 13.8021 19.8229C13.8021 22.9146 11.6931 25.8958 8.55729 25.8958C5.42146 25.8958 3.3125 22.9146 3.3125 19.8229ZM28.1562 13.1979C28.1562 10.1063 30.2652 7.125 33.401 7.125C36.5369 7.125 38.6458 10.1063 38.6458 13.1979C38.6458 16.2896 36.5369 19.2708 33.401 19.2708C30.2652 19.2708 28.1562 16.2896 28.1562 13.1979ZM39.1979 19.8229C39.1979 16.7313 41.3069 13.75 44.4427 13.75C47.5785 13.75 49.6875 16.7313 49.6875 19.8229C49.6875 22.9146 47.5785 25.8958 44.4427 25.8958C41.3069 25.8958 39.1979 22.9146 39.1979 19.8229Z" fill="${color}"/>
      </svg>
    `;
  };

  const getCareCenterMarkerIcon = () => {
    return `
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#4B5563"/>
          <svg x="6" y="6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2C8.55228 2 9 2.44772 9 3V5H13V3C13 2.44772 13.4477 2 14 2C14.5523 2 15 2.44772 15 3V5H19V3C19 2.44772 19.4477 2 20 2C20.5523 2 21 2.44772 21 3V5H22C22.5523 5 23 5.44772 23 6V20C23 20.5523 22.5523 21 22 21H2C1.44772 21 1 20.5523 1 20V6C1 5.44772 1.44772 5 2 5H3V3C3 2.44772 3.44772 2 4 2C4.55228 2 5 2.44772 5 3V5H9V3C9 2.44772 8.55228 2 8 2Z" fill="#4B5563" stroke="white" stroke-width="1.5"/>
          <path d="M12 16V10M9 13H15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </svg>
    `;
  };

  // Update the createPetMarkers function to show markers when toggle is true
  const createPetMarkers = () => {
    const map = mapInstance.current;
    if (!map) return;

    // 기존 마커 제거
    missingMarkersRef.current.forEach((marker) => marker.setMap(null));
    findingMarkersRef.current.forEach((marker) => marker.setMap(null));

    // 마커 배열 초기화
    missingMarkersRef.current = [];
    findingMarkersRef.current = [];

    // 잃어버린 반려동물 마커 (빨간색) - buttonStates.lost가 true일 때만 표시
    if (!buttonStates.lost) {
      const newMissingMarkers = missingPets.map((pet) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(pet.y, pet.x),
          map: map,
          title: `[실종] ${pet.breed}`,
          icon: {
            content: getPawMarkerIcon(true),
            anchor: new window.naver.maps.Point(12, 12),
          },
        });

        window.naver.maps.Event.addListener(marker, "click", () => {
          alert(
              `[실종]\n품종: ${pet.breed}\n특징: ${pet.etc}\n위치: ${pet.location}\n실종일: ${pet.id}`
          );
        });

        return marker;
      });

      missingMarkersRef.current = newMissingMarkers;
    }

    // 발견된 반려동물 마커 (초록색) - buttonStates.found가 true일 때만 표시
    if (!buttonStates.found) {
      const newFindingMarkers = findingPets.map((pet) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(pet.y, pet.x),
          map: map,
          title: `[발견] ${pet.breed}`,
          icon: {
            content: getPawMarkerIcon(false),
            anchor: new window.naver.maps.Point(12, 12),
          },
        });

        // InfoWindow 생성
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding:15px; min-width:220px; height:475px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1); font-family:'Noto Sans KR', sans-serif; ">
              <h4 style="margin:0 0 12px 0; color:rgb(22, 163, 74); font-size:16px; border-bottom:2px solid #08CF5D; padding-bottom:8px;">
                발견했개
              </h4>
              <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
                <tr>
                  <td style="font-weight:bold; color:#555; width:70px;">품종:</td>
                  <td style="color:#333;">${pet.breed ? pet.breed : "미상"}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold; color:#555;">특징:</td>
                  <td style="color:#333;">${pet.etc ? pet.etc : "없음"}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold; color:#555;">위치:</td>
                  <td style="color:#333;">${pet.location}</td>
                </tr>
              </table>
              <div style="width:100%; height: 300px; margin-bottom:5px;">
                <img src="${pet.pathUrl}" style="height:100%; width:100%; object-fit: contain;"></img>
              </div>
            </div>
          `,
          borderWidth: 1,
          disableAnchor: false, // 앵커 활성화
          backgroundColor: "white",
          borderColor: "#08CF5D", // 테두리 색상을 컨텐츠와 일치시킴
          anchorSize: new window.naver.maps.Size(12, 12), // 앵커 크기 설정
          anchorSkew: true, // 앵커 기울임 효과 활성화
          anchorColor: "white", // 앵커 색상

        });

        // 마커 클릭 이벤트 리스너 추가
        window.naver.maps.Event.addListener(marker, "click", () => {
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(map, marker);
          }
        });

        return marker;
      });

      findingMarkersRef.current = newFindingMarkers;
    }
  };

  // Update the createCareCenterMarkers function to show markers when toggle is true
  const createCareCenterMarkers = () => {
    const map = mapInstance.current;
    if (!map) return;

    // 기존 보호센터 마커 제거
    careCenterMarkersRef.current.forEach((marker) => marker.setMap(null));
    careCenterMarkersRef.current = [];

    // buttonStates.hospital이 true일 때만 보호센터 마커 표시
    if (!buttonStates.hospital) {
      // 보호센터 마커 생성
      const newCareCenterMarkers = careCenters.map((center) => {
        try {
          console.log(`보호센터 좌표: ${center.name}, x=${center.x}, y=${center.y}`);

          const position = new window.naver.maps.LatLng(center.x, center.y);

          const marker = new window.naver.maps.Marker({
            position: position,
            map: map,
            title: `[보호소] ${center.name}`,
            icon: {
              content: getCareCenterMarkerIcon(),
              anchor: new window.naver.maps.Point(18, 18),
            },
            visible: true,
            zIndex: 100
          });

          // 정보창 생성
          const infoWindow = new window.naver.maps.InfoWindow({
            content: `
              <div style="padding:15px; min-width:220px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1); font-family:'Noto Sans KR', sans-serif; border:solid 1px #000000;">
                <h4 style="margin:0 0 12px 0; color:#333; font-size:16px; border-bottom:2px solid #000000; padding-bottom:8px;">
                  ${center.name}
                </h4>
                <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
                  <tr>
                    <td style="font-weight:bold; color:#555; width:70px;">주소:</td>
                    <td style="color:#333;">${center.address}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold; color:#555;">전화:</td>
                    <td style="color:#333;">${center.phoneNumber}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold; color:#555;">운영시간:</td>
                    <td style="color:#333;">${center.operatingHours}</td>
                  </tr>
                </table>
              </div>
            `,
            borderWidth: 0,
            disableAnchor: true,
            backgroundColor: "white",
            borderColor: "transparent",
            anchorSize: new window.naver.maps.Size(0, 0),
          });

          // 마커 클릭 이벤트 리스너 추가
          window.naver.maps.Event.addListener(marker, "click", () => {
            if (infoWindow.getMap()) {
              infoWindow.close();
            } else {
              infoWindow.open(map, marker);
            }
          });

          return marker;
        } catch (error) {
          console.error(`마커 생성 오류(${center.name}):`, error);
          return null;
        }
      }).filter(Boolean); // null 값 제거

      // 생성된 마커 배열 저장
      careCenterMarkersRef.current = newCareCenterMarkers;
      console.log(`${newCareCenterMarkers.length}개의 보호센터 마커가 지도에 표시되었습니다.`);
    }
  };

  // 지도 클릭 이벤트 핸들러
  const handleMapClick = (event: any) => {
    const map = mapInstance.current;

    if (!map) return;

    // 이전 클릭 마커 제거
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
    }

    // 원은 제거하지 않고 중심과 반경 업데이트
    const clickedLocation = event.coord;

    // 기존 원이 있다면 중심만 이동
    if (circleRef.current) {
      circleRef.current.setCenter(clickedLocation);
    } else {
      // 첫 번째 클릭 시 원 생성
      circleRef.current = new window.naver.maps.Circle({
        map: map,
        center: clickedLocation,
        radius: radius,
        strokeColor: "#5F9EA0",
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: "#5F9EA0",
        fillOpacity: 0.2,
      });
    }

    // 클릭 마커 생성
    clickMarkerRef.current = new window.naver.maps.Marker({
      position: clickedLocation,
      map: map,
      icon: {
        content: `<div style="width:12px;height:12px;border-radius:50%;background:#3B82F6;border:2px solid white;"></div>`,
        anchor: new window.naver.maps.Point(6, 6),
      },
    });

    // 선택된 위치 상태 업데이트
    setSelectedLocation(clickedLocation);

    // onLocationSelect 콜백 호출 (마커 선택 시)
    if (onLocationSelect) {
      onLocationSelect({
        lat: clickedLocation.lat(),
        lng: clickedLocation.lng(),
      });
    }
  };

  // 검색 버튼 클릭 핸들러 - 선택된 위치로 검색 실행
  const handleSearchClick = () => {
    if (!selectedLocation) return;

    // 검색 전 모든 마커 명시적 초기화 추가
    careCenterMarkersRef.current.forEach(marker => marker.setMap(null));
    careCenterMarkersRef.current = [];

    missingMarkersRef.current.forEach(marker => marker.setMap(null));
    missingMarkersRef.current = [];

    findingMarkersRef.current.forEach(marker => marker.setMap(null));
    findingMarkersRef.current = [];

    // UserLocation 상태 업데이트
    const locationObj = {
      x: selectedLocation.lat(),
      y: selectedLocation.lng(),
      _lat: selectedLocation.lat(),
      _lng: selectedLocation.lng(),
    };

    setUserLocation(locationObj);

    // 검색 모드를 '반경'으로 설정
    setSearchMode("반경");
    setCenterSearchMode("반경"); // 보호센터 검색 모드도 업데이트

    // 데이터 새로고침 (반경 검색 실행)
    refreshPets();
    refreshCenters(); // 보호센터 데이터도 새로고침

    console.log("현재 반경에서 검색 실행:", {
      위치: `${selectedLocation.lat()}, ${selectedLocation.lng()}`,
      반경: radius,
    });
  };

  // 반경 변경 시 원 업데이트 useEffect
  useEffect(() => {
    if (circleRef.current) {
      // 원의 반지름만 업데이트
      circleRef.current.setRadius(radius);
      console.log("반경 업데이트: ", radius);
    }
  }, [radius]);

  useEffect(() => {
    if (isInitialized.current || !currentLocation.loaded) return;

    const initializeMap = () => {
      if (!mapElement.current || !window.naver) {
        console.error("지도 초기화 실패");
        return;
      }

      try {
        const defaultCenter = new window.naver.maps.LatLng(37.52133, 126.9522);
        const center = currentLocation.coordinates
            ? new window.naver.maps.LatLng(
                currentLocation.coordinates.lat,
                currentLocation.coordinates.lng
            )
            : defaultCenter;

        const mapOptions = {
          center: center,
          zoom: 17,
          minZoom: 11,
          tileDuration: 300,
        };

        const map = new naver.maps.Map(mapElement.current, mapOptions);
        mapInstance.current = map;

        // 초기 위치에 반경 표시 (사용자의 현재 위치)
        if (currentLocation.coordinates) {
          console.log("현재 위치: ", currentLocation.coordinates);

          // 초기 선택 위치 설정
          setSelectedLocation(center);

          circleRef.current = new window.naver.maps.Circle({
            map: map,
            center: center,
            radius: radius, // 현재 설정된 반경 사용
            strokeColor: "#5F9EA0",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: "#5F9EA0",
            fillOpacity: 0.2,
          });

          // 현재 위치 마커 추가
          clickMarkerRef.current = new window.naver.maps.Marker({
            position: center,
            map: map,
            icon: {
              content: `<div style="width:12px;height:12px;border-radius:50%;background:#3B82F6;border:2px solid white;"></div>`,
              anchor: new window.naver.maps.Point(6, 6),
            },
          });
        }

        // 지도 클릭 이벤트 리스너 추가
        window.naver.maps.Event.addListener(map, "click", handleMapClick);

        isInitialized.current = true;
        console.log("지도 초기화 성공");
      } catch (error) {
        console.error("지도 생성 중 오류:", error);
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
        isInitialized.current = false;
      }
    };
  }, [currentLocation]);

  // 반려동물 마커 업데이트 - 버튼 상태 변경에 반응하도록 수정
  useEffect(() => {
    if (mapInstance.current) {
      createPetMarkers();
    }
  }, [missingPets, findingPets, buttonStates.lost, buttonStates.found]);

  // 보호센터 마커 업데이트 - 버튼 상태 변경에 반응하도록 수정
  useEffect(() => {
    if (mapInstance.current) {
      console.log("보호센터 데이터 변경 감지:", careCenters.length);
      createCareCenterMarkers();
    }
  }, [careCenters, buttonStates.hospital]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        id="map"
        ref={mapElement}
        style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
      />

      {/* 검색 버튼 */}
      <div className="absolute bottom-5 right-4 z-50">
        <button
          onClick={handleSearchClick}
          disabled={!selectedLocation}
          className={`
            bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center w-[11.25rem]
            ${selectedLocation || "opacity-60"}
          `}
        >
          현재 반경에서 검색
        </button>
      </div>
    </div>
  );
};

export default NcpMap;