import { useState, useEffect } from "react";
import NcpMap from "./NcpMap";
// import NcpMap from './NcpMap-1'
import { useIsMobile } from "@/hooks/use-mobile";
import { NavBar } from "@/components/navBar/navBar";
import useGeolocation from "@/hooks/useGeolocation";
import { Pet } from "@/types/pet";
import { FindPets } from "@/types/FindPet";
import { backUrl } from "@/constants";
import { usePetContext } from "@/contexts/findPetContext";
import axios from "axios";
import { MissingData } from "@/types/missing";

interface MainPageProps {
  mockLostPets: Pet[];
}

export default function MainPage({ mockLostPets }: MainPageProps) {
  const isMobile = useIsMobile();
  const location = useGeolocation();
  const [findPets, setFindPets] = useState<FindPets[] | null>(null);
  const [missingPets, setMissingPets] = useState<MissingData[] | null>(null);
  const { submissionCount } = usePetContext();

  useEffect(() => {
    const fetchMissingPets = async () => {
      try {
        const response = await axios.get(`${backUrl}/api/v1/missings`, {
          withCredentials: true,
        });

        const pets = response.data.data.content || [];

        setMissingPets(pets);

        console.log(">>>>>>", pets, response);

        return pets;
      } catch (error) {
        console.error("Error fetching missing pets: ", error);
      }
    };

    fetchMissingPets();
  }, []);

  // 발견 신고 전체 조회
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(`${backUrl}/api/v1/finding`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setFindPets(data.data.content);
      } catch (err) {
        console.error("Error fetching pets:", err);
      }
    };

    fetchPets();
  }, [submissionCount]);

  // MainPage에서 props 수신 확인
  useEffect(() => {
    console.log("MainPage received:", {
      mockLostPets,
    });
  }, [mockLostPets]);

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
        <NcpMap
          currentLocation={location}
          lostPets={missingPets ? missingPets : []}
          findPets={findPets ? findPets : []}
        />
        {/*<NcpMap*/}
        {/*  currentLocation={location}*/}
        {/*  lostPets={mockLostPets}*/}
        {/*  findPets={mockFindPets}*/}
        {/*/>*/}
      </div>
    </div>
  );
}
