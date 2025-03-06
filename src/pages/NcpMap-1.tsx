import { useEffect, useRef, /*useMemo*/ } from 'react';
import { Pet } from "@/types/pet";
import { useRadius } from '@/contexts/RadiusContext';

interface NcpMapProps {
  currentLocation: {
    loaded: boolean;
    coordinates?: { lat: number; lng: number };
    error?: { code: number; message: string };
  };
  lostPets: Pet[];
  findPets: Pet[];
}

const NcpMap = ({ currentLocation, /*lostPets, findPets*/ }: NcpMapProps) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const isInitialized = useRef<boolean>(false);
  // const markersRef = useRef<naver.maps.Marker[]>([]);
  const circleRef = useRef<naver.maps.Circle | null>(null);

  // Get radius from context
  const { radius } = useRadius();

  // const getPawMarkerIcon = (isLost: boolean) => {
  //   const color = isLost ? '#EF4444' : '#22C55E'; // red-500 : green-500
  //   return `
  //     <svg width="24" height="24" viewBox="0 0 53 54" fill="none" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M11.0415 38.0417C11.0415 29.5043 17.9624 22.5834 26.4998 22.5834C35.0373 22.5834 41.9582 29.5043 41.9582 38.0417C41.9582 38.2294 41.9545 38.4164 41.9471 38.6026C41.8478 41.4194 40.3152 43.5316 38.2449 44.8897C36.2044 46.2291 33.6029 46.875 31.1031 46.875H21.8966C19.3967 46.875 16.7953 46.2291 14.7548 44.8897C12.6845 43.5316 11.1519 41.4194 11.0514 38.6026C11.0448 38.4164 11.0415 38.2294 11.0415 38.0417Z" fill="${color}"/>
  //       <path d="M20.151 7.125C17.0152 7.125 14.9062 10.1063 14.9062 13.1979C14.9062 16.2896 17.0152 19.2708 20.151 19.2708C23.2869 19.2708 25.3958 16.2896 25.3958 13.1979C25.3958 10.1063 23.2869 7.125 20.151 7.125ZM3.3125 19.8229C3.3125 16.7313 5.42146 13.75 8.55729 13.75C11.6931 13.75 13.8021 16.7313 13.8021 19.8229C13.8021 22.9146 11.6931 25.8958 8.55729 25.8958C5.42146 25.8958 3.3125 22.9146 3.3125 19.8229ZM28.1562 13.1979C28.1562 10.1063 30.2652 7.125 33.401 7.125C36.5369 7.125 38.6458 10.1063 38.6458 13.1979C38.6458 16.2896 36.5369 19.2708 33.401 19.2708C30.2652 19.2708 28.1562 16.2896 28.1562 13.1979ZM39.1979 19.8229C39.1979 16.7313 41.3069 13.75 44.4427 13.75C47.5785 13.75 49.6875 16.7313 49.6875 19.8229C49.6875 22.9146 47.5785 25.8958 44.4427 25.8958C41.3069 25.8958 39.1979 22.9146 39.1979 19.8229Z" fill="${color}"/>
  //     </svg>
  //   `;
  // };

  // Function to determine if a pet is within the radius
  // const isWithinRadius = (petLat: number, petLng: number, centerLat: number, centerLng: number, radius: number) => {
  //   if (!window.naver) return false;
  //
  //   // Calculate distance in meters using the Pythagorean theorem with haversine formula
  //   // This is a custom implementation since we can't use NAVER maps Geometry directly
  //   const R = 6371000; // Earth radius in meters
  //   const lat1 = centerLat * Math.PI / 180;
  //   const lat2 = petLat * Math.PI / 180;
  //   const dLat = (petLat - centerLat) * Math.PI / 180;
  //   const dLon = (petLng - centerLng) * Math.PI / 180;
  //
  //   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  //       Math.cos(lat1) * Math.cos(lat2) *
  //       Math.sin(dLon/2) * Math.sin(dLon/2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  //   const distance = R * c; // Distance in meters
  //
  //   return distance <= radius;
  // };

  // Filter pets based on radius
  // const filteredLostPets = useMemo(() => {
  //   if (!currentLocation.loaded || !currentLocation.coordinates) return lostPets;
  //
  //   return lostPets.filter(pet =>
  //       isWithinRadius(
  //           pet.lang,
  //           pet.lat,
  //           currentLocation.coordinates!.lat,
  //           currentLocation.coordinates!.lng,
  //           radius
  //       )
  //   );
  // }, [lostPets, currentLocation, radius]);

  // const filteredFindPets = useMemo(() => {
  //   if (!currentLocation.loaded || !currentLocation.coordinates) return findPets;
  //
  //   return findPets.filter(pet =>
  //       isWithinRadius(
  //           pet.lang,
  //           pet.lat,
  //           currentLocation.coordinates!.lat,
  //           currentLocation.coordinates!.lng,
  //           radius
  //       )
  //   );
  // }, [findPets, currentLocation, radius]);

  // Update circle radius when radius changes
  useEffect(() => {
    if (circleRef.current && mapInstance.current && currentLocation.coordinates) {
      // 지도 중심 및 확대 수준 유지하면서 원 크기만 변경
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  // // Clear existing markers
  // const clearMarkers = () => {
  //   if (markersRef.current.length > 0) {
  //     markersRef.current.forEach(marker => marker.setMap(null));
  //     markersRef.current = [];
  //   }
  // };
  //
  // // Add markers for filtered pets
  // const addPetMarkers = () => {
  //   if (!mapInstance.current || !window.naver) return;
  //
  //   clearMarkers();
  //
  //   // Add lost pet markers
  //   filteredLostPets.forEach(pet => {
  //     const marker = new window.naver.maps.Marker({
  //       position: new window.naver.maps.LatLng(pet.lang, pet.lat),
  //       map: mapInstance.current,
  //       title: `[실종] ${pet.breed}`,
  //       icon: {
  //         content: getPawMarkerIcon(true),
  //         anchor: new window.naver.maps.Point(12, 12),
  //       }
  //     });
  //
  //     window.naver.maps.Event.addListener(marker, 'click', () => {
  //       alert(`[실종]\n품종: ${pet.breed}\n특징: ${pet.features}\n위치: ${pet.location}\n발견일: ${pet.date}`);
  //     });
  //
  //     markersRef.current.push(marker);
  //   });
  //
  //   // Add found pet markers
  //   filteredFindPets.forEach(pet => {
  //     const marker = new window.naver.maps.Marker({
  //       position: new window.naver.maps.LatLng(pet.lang, pet.lat),
  //       map: mapInstance.current,
  //       title: `[발견] ${pet.breed}`,
  //       icon: {
  //         content: getPawMarkerIcon(false),
  //         anchor: new window.naver.maps.Point(12, 12),
  //       }
  //     });
  //
  //     window.naver.maps.Event.addListener(marker, 'click', () => {
  //       alert(`[발견]\n품종: ${pet.breed}\n특징: ${pet.features}\n위치: ${pet.location}\n발견일: ${pet.date}`);
  //     });
  //
  //     markersRef.current.push(marker);
  //   });
  // };

  // Initialize map with circle
  useEffect(() => {
    if (isInitialized.current || !currentLocation.loaded) return;

    const initializeMap = () => {
      if (!mapElement.current || !window.naver) {
        console.error("Map initialization failed");
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

        // 현재 좌표 출력
        console.log("현재 위치:", {
          lat: center.lat(),
          lng: center.lng()
        });

        const mapOptions = {
          center,
          zoom: 15,
          minZoom: 10,
          maxZoom: 19,
          tileDuration: 300,
          scaleControl: true,
          mapDataControl: false,
          logoControlOptions: {
            position: window.naver.maps.Position.BOTTOM_RIGHT
          }
        };

        const map = new naver.maps.Map(mapElement.current, mapOptions);
        mapInstance.current = map;

        // Add radius circle
        if (currentLocation.coordinates) {
          circleRef.current = new window.naver.maps.Circle({
            map: map,
            center: center,
            radius: radius, // Use radius from context
            strokeColor: '#5F9EA0',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: '#5F9EA0',
            fillOpacity: 0.2
          });
        }

        // Add pet markers
        // addPetMarkers();

        isInitialized.current = true;
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
        isInitialized.current = false;
      }
    };
  }, [currentLocation, radius]);

  // Update markers when pets or radius changes
  // useEffect(() => {
  //   if (isInitialized.current && mapInstance.current) {
  //     addPetMarkers();
  //   }
  // }, [filteredLostPets, filteredFindPets, radius]);

  return (
      <div
          id="map"
          ref={mapElement}
          style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
      />
  );
};

export default NcpMap;