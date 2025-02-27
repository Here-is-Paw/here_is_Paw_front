// contexts/PetContext.tsx
import  { createContext, useState, useContext, ReactNode } from 'react';

interface PetContextType {
  submissionCount: number;
  incrementSubmissionCount: () => void;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: ReactNode }) {
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  
  const incrementSubmissionCount = () => {
    setSubmissionCount(prev => prev + 1);
  };
  
  return (
    <PetContext.Provider value={{
      submissionCount,
      incrementSubmissionCount,
    }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePetContext() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePetContext must be used within a PetProvider');
  }
  return context;
}