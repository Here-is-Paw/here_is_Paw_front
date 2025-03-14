import NcpMap from "./NcpMap-1";
import { useIsMobile } from "@/hooks/use-mobile";
import useGeolocation from "@/hooks/useGeolocation";

export default function MainPage() {
  const isMobile = useIsMobile();
  const location = useGeolocation();

  return (
    <div>
      {/* <NavBar buttonStates={buttonStates} toggleButton={toggleButton} /> */}

      <div className={`fixed ${isMobile ? "inset-0 top-[169px]" : "inset-0"}`}>
        <NcpMap currentLocation={location} />
      </div>
    </div>
  );
}
