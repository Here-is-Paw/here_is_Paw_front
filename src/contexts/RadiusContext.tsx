import { createContext, useContext, useState, ReactNode } from 'react';

interface RadiusContextType {
    radius: number;
    setRadius: (radius: number) => void;
}

const RadiusContext = createContext<RadiusContextType | undefined>(undefined);

export function RadiusProvider({ children }: { children: ReactNode }) {
    const [radius, setRadius] = useState<number>(500); // Default radius: 1km

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