import {createContext, useContext, useState, ReactNode, useEffect} from 'react';

interface RadiusContextType {
    radius: number;
    setRadius: (radius: number) => void;
}

const RadiusContext = createContext<RadiusContextType | undefined>(undefined);

export function RadiusProvider({ children }: { children: ReactNode }) {
    // localStorage에서 초기값 불러오기, 없으면 기본값 500
    const [radius, setRadius] = useState<number>(() => {
        const savedRadius = localStorage.getItem('searchRadius');
        return savedRadius ? Number(savedRadius) : 500;
    });

    // radius 값이 변경될 때마다 localStorage에 저장
    useEffect(() => {
        localStorage.setItem('searchRadius', radius.toString());
    }, [radius]);

    return (
        <RadiusContext.Provider value={{ radius, setRadius }}>
            {children}
        </RadiusContext.Provider>
    );
}

export function useRadius() {
    const context = useContext(RadiusContext);

    if (context === undefined) {
        throw new Error('useRadius must be used within a RadiusProvider');
    }

    return context;
}