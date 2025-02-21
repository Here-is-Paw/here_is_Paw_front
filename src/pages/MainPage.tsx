import { useState } from 'react'
import NcpMap from './NcpMap'
import { useIsMobile } from "@/hooks/use-mobile"
import { NavBar } from "@/components/navBar/navBar"

export default function MainPage() {
  const isMobile = useIsMobile()
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
        <NcpMap />
      </div>
    </div>
  )
}