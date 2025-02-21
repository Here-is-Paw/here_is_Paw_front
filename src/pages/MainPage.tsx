import NcpMap from "./NcpMap";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MainPage() {
  const isMobile = useIsMobile();

  return (
    // <div className={`fixed ${isMobile ? 'inset-0 top-[120px]' : 'inset-0'}`}>
    <div>
      <NcpMap />
    </div>
  );
}
