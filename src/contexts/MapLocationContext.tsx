import React, { createContext, useContext, useState, ReactNode } from "react";

// 위치 정보 타입 정의
export interface LocationInfo {
    x: number
    y: number
    _lat: number
    _lng: number
}

// Context 타입 정의
interface MapLocationContextType {
    userLocation: LocationInfo | null;
    setUserLocation: (location: LocationInfo | null) => void;
}

// Context 생성
const MapLocationContext = createContext<MapLocationContextType | undefined>(undefined);

// Context Provider 컴포넌트
export const MapLocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);

    return (
        <MapLocationContext.Provider value={{ userLocation, setUserLocation }}>
            {children}
        </MapLocationContext.Provider>
    );
};

// Context 사용을 위한 Custom Hook
export const useMapLocation = () => {
    const context = useContext(MapLocationContext);
    if (context === undefined) {
        throw new Error("useMapLocation must be used within a MapLocationProvider");
    }
    return context;
};