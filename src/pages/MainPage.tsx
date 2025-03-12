import { useState } from 'react'
// import NcpMap from './NcpMap'
import NcpMap from "./NcpMap-1";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavBar } from "@/components/navBar/navBar";
import useGeolocation from "@/hooks/useGeolocation";

export default function MainPage() {
  const isMobile = useIsMobile();
  const location = useGeolocation();

  const [buttonStates, setButtonStates] = useState({
    lost: false,
    found: false,
    hospital: false,
  });

  const toggleButton = (buttonName: "lost" | "found" | "hospital") => {
    setButtonStates((prev) => ({
      ...prev,
      [buttonName]: !prev[buttonName],
    }));
  };

  return (
    <div>
      <NavBar buttonStates={buttonStates} toggleButton={toggleButton} />
      <div className={`fixed ${isMobile ? "inset-0 top-[120px]" : "inset-0"}`}>
        <NcpMap currentLocation={location} />
      </div>
    </div>
  );
}
