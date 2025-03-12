import { useState } from 'react'
// import NcpMap from './NcpMap'
import NcpMap from './NcpMap-1'
import { useIsMobile } from "@/hooks/use-mobile"
import { NavBar } from "@/components/navBar/navBar"
import useGeolocation from '@/hooks/useGeolocation'

// props 타입을 정의합니다 (사용하지 않지만 타입 오류 해결을 위해 추가)
interface MainPageProps {
  mockLostPets?: any[];
}

export default function MainPage(_props: MainPageProps) {
  const isMobile = useIsMobile()
  const location = useGeolocation()

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
        />
      </div>
    </div>
  )
}