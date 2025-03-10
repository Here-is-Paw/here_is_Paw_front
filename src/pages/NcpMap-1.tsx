import {useEffect, useRef, useState} from "react";
import {useRadius} from "@/contexts/RadiusContext.tsx";
import {useMapLocation} from "@/contexts/MapLocationContext.tsx";
import {usePetContext} from "@/contexts/PetContext.tsx"; // PetContext 추가

interface NcpMapProps {
    currentLocation: {
        loaded: boolean;
        coordinates?: { lat: number; lng: number };
        error?: { code: number; message: string };
    };
    onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

const NcpMap = ({currentLocation, onLocationSelect}: NcpMapProps) => {
    const mapElement = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<naver.maps.Map | null>(null);
    const isInitialized = useRef<boolean>(false);
    const circleRef = useRef<naver.maps.Circle | null>(null);
    const clickMarkerRef = useRef<naver.maps.Marker | null>(null);

    const {radius} = useRadius();
    const [selectedLocation, setSelectedLocation] = useState<naver.maps.LatLng | null>(null);
    const {setUserLocation} = useMapLocation();
    const {refreshPets, setSearchMode, findingPets, missingPets} = usePetContext(); // PetContext에서 필요한 함수 가져오기

    // 마커 레퍼런스 배열 추가
    const missingMarkersRef = useRef<naver.maps.Marker[]>([]);
    const findingMarkersRef = useRef<naver.maps.Marker[]>([]);

    const getPawMarkerIcon = (isLost: boolean) => {
        const color = isLost ? "#EF4444" : "#22C55E"; // red-500 : green-500
        return `
      <svg width="24" height="24" viewBox="0 0 53 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.0415 38.0417C11.0415 29.5043 17.9624 22.5834 26.4998 22.5834C35.0373 22.5834 41.9582 29.5043 41.9582 38.0417C41.9582 38.2294 41.9545 38.4164 41.9471 38.6026C41.8478 41.4194 40.3152 43.5316 38.2449 44.8897C36.2044 46.2291 33.6029 46.875 31.1031 46.875H21.8966C19.3967 46.875 16.7953 46.2291 14.7548 44.8897C12.6845 43.5316 11.1519 41.4194 11.0514 38.6026C11.0448 38.4164 11.0415 38.2294 11.0415 38.0417Z" fill="${color}"/>
        <path d="M20.151 7.125C17.0152 7.125 14.9062 10.1063 14.9062 13.1979C14.9062 16.2896 17.0152 19.2708 20.151 19.2708C23.2869 19.2708 25.3958 16.2896 25.3958 13.1979C25.3958 10.1063 23.2869 7.125 20.151 7.125ZM3.3125 19.8229C3.3125 16.7313 5.42146 13.75 8.55729 13.75C11.6931 13.75 13.8021 16.7313 13.8021 19.8229C13.8021 22.9146 11.6931 25.8958 8.55729 25.8958C5.42146 25.8958 3.3125 22.9146 3.3125 19.8229ZM28.1562 13.1979C28.1562 10.1063 30.2652 7.125 33.401 7.125C36.5369 7.125 38.6458 10.1063 38.6458 13.1979C38.6458 16.2896 36.5369 19.2708 33.401 19.2708C30.2652 19.2708 28.1562 16.2896 28.1562 13.1979ZM39.1979 19.8229C39.1979 16.7313 41.3069 13.75 44.4427 13.75C47.5785 13.75 49.6875 16.7313 49.6875 19.8229C49.6875 22.9146 47.5785 25.8958 44.4427 25.8958C41.3069 25.8958 39.1979 22.9146 39.1979 19.8229Z" fill="${color}"/>
      </svg>
    `;
    };

    const createPetMarkers = () => {
        const map = mapInstance.current;
        if (!map) return;

        // 기존 마커 제거 - 순서 수정
        missingMarkersRef.current.forEach(marker => marker.setMap(null));
        findingMarkersRef.current.forEach(marker => marker.setMap(null));

        // 마커 배열 초기화
        missingMarkersRef.current = [];
        findingMarkersRef.current = [];

        // 잃어버린 반려동물 마커 (빨간색)
        const newMissingMarkers = missingPets.map(pet => {
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

        // 발견된 반려동물 마커 (초록색)
        const newFindingMarkers = findingPets.map(pet => {
            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(pet.y, pet.x),
                map: map,
                title: `[발견] ${pet.breed}`,
                icon: {
                    content: getPawMarkerIcon(false),
                    anchor: new window.naver.maps.Point(12, 12),
                },
            });

            window.naver.maps.Event.addListener(marker, "click", () => {
                alert(
                    `[발견]\n품종: ${pet.breed}\n특징: ${pet.etc}\n위치: ${pet.location}\n발견일: ${pet.id}`
                );
            });

            return marker;
        });

        findingMarkersRef.current = newFindingMarkers;
    };


    // 지도 클릭 이벤트 핸들러
    const handleMapClick = (event: naver.maps.MouseEvent) => {
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
                strokeColor: '#5F9EA0',
                strokeOpacity: 0.6,
                strokeWeight: 2,
                fillColor: '#5F9EA0',
                fillOpacity: 0.2
            });
        }

        // 클릭 마커 생성
        clickMarkerRef.current = new window.naver.maps.Marker({
            position: clickedLocation,
            map: map,
            icon: {
                content: `<div style="width:12px;height:12px;border-radius:50%;background:#3B82F6;border:2px solid white;"></div>`,
                anchor: new window.naver.maps.Point(6, 6)
            }
        });

        // 선택된 위치 상태 업데이트
        setSelectedLocation(clickedLocation);

        // onLocationSelect 콜백 호출 (마커 선택 시)
        if (onLocationSelect) {
            onLocationSelect({
                lat: clickedLocation.lat(),
                lng: clickedLocation.lng()
            });
        }
    };


    // 검색 버튼 클릭 핸들러 - 선택된 위치로 검색 실행
    const handleSearchClick = () => {
        if (!selectedLocation) return;

        // UserLocation 상태 업데이트
        const locationObj = {
            "x": selectedLocation.lat(),
            "y": selectedLocation.lng(),
            "_lat": selectedLocation.lat(),
            "_lng": selectedLocation.lng()
        };

        setUserLocation(locationObj);

        // 검색 모드를 '반경'으로 설정
        setSearchMode('반경');

        // 데이터 새로고침 (반경 검색 실행)
        refreshPets();

        console.log("현재 반경에서 검색 실행:", {
            위치: `${selectedLocation.lat()}, ${selectedLocation.lng()}`,
            반경: radius
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
                        strokeColor: '#5F9EA0',
                        strokeOpacity: 0.6,
                        strokeWeight: 2,
                        fillColor: '#5F9EA0',
                        fillOpacity: 0.2
                    });

                    // 현재 위치 마커 추가
                    clickMarkerRef.current = new window.naver.maps.Marker({
                        position: center,
                        map: map,
                        icon: {
                            content: `<div style="width:12px;height:12px;border-radius:50%;background:#3B82F6;border:2px solid white;"></div>`,
                            anchor: new window.naver.maps.Point(6, 6)
                        }
                    });
                }

                // 지도 클릭 이벤트 리스너 추가
                window.naver.maps.Event.addListener(map, 'click', handleMapClick);

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

    useEffect(() => {
        if (mapInstance.current && (missingPets.length > 0 || findingPets.length > 0)) {
            createPetMarkers();
        }
    }, [missingPets, findingPets, mapInstance.current]);

    return (
        <div style={{position: "relative", width: "100%", height: "100%"}}>
            <div
                id="map"
                ref={mapElement}
                style={{position: "absolute", left: 0, top: 0, right: 0, bottom: 0}}
            />

            {/* 검색 버튼 */}
            <div
                style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 100
                }}
            >
                <button
                    onClick={handleSearchClick}
                    disabled={!selectedLocation}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                    style={{
                        minWidth: "180px",
                        opacity: selectedLocation ? 1 : 0.6
                    }}
                >
                    현재 반경에서 검색
                </button>
            </div>
        </div>
    );
};

export default NcpMap;