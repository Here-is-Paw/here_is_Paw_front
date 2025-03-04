import { useState, useEffect } from 'react'
// import NcpMap from './NcpMap'
import NcpMap from './NcpMap-1'
import { useIsMobile } from "@/hooks/use-mobile"
import { NavBar } from "@/components/navBar/navBar"
import useGeolocation from '@/hooks/useGeolocation'
import { Pet } from '@/types/pet'

interface MainPageProps {
  mockLostPets: Pet[];
  mockFindPets: Pet[];
}

export default function MainPage({ mockLostPets, mockFindPets }: MainPageProps) {
  const isMobile = useIsMobile()
  const location = useGeolocation()

  // MainPage에서 props 수신 확인
  useEffect(() => {
    console.log('MainPage received:', {
      mockLostPets,
      mockFindPets
    });
  }, [mockLostPets, mockFindPets]);

  const [buttonStates, setButtonStates] = useState({
    lost: false,
    found: false,
    hospital: false
  })

  const toggleButton = (buttonName: 'lost' | 'found' | 'hospital') => {
    setButtonStates(prev => ({
      ...prev,
      [buttonName]: !prev[buttonName]
    }))
  }

  return (
    <div>
      <NavBar buttonStates={buttonStates} toggleButton={toggleButton} />
      <div className={`fixed ${isMobile ? 'inset-0 top-[120px]' : 'inset-0'}`}>
        <NcpMap
            currentLocation={location}
            lostPets={mockLostPets}
            findPets={mockFindPets}
        />
        {/*<NcpMap*/}
        {/*  currentLocation={location}*/}
        {/*  lostPets={mockLostPets}*/}
        {/*  findPets={mockFindPets}*/}
        {/*/>*/}
      </div>
    </div>
  )
}