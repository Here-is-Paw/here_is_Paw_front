import { Button } from "@/components/ui/button";
import { Hospital } from "lucide-react";
import pawGreen from "../../assets/paw_green.svg";
import pawRed from "../../assets/paw_red.svg";

interface FilterButtonProps {
  buttonStates: {
    lost: boolean;
    found: boolean;
    hospital: boolean;
  };
  toggleButton: (buttonName: "lost" | "found" | "hospital") => void;
}

export function FilterButton({
  buttonStates,
  toggleButton,
}: FilterButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 flex-auto justify-end">
      <Button
        variant="ghost"
        className={`gap-2 ${
          buttonStates.lost ? "bg-gray-300" : "bg-red-500"
        } text-white rounded-full p-2 h-8 min-w-[97px] hover:bg-red-500 hover:bg-opacity-100 focus:ring-0 focus:outline-none`}
        onClick={() => toggleButton("lost")}
      >
        <img src={pawRed} alt="Logo" className="w-4 h-4" />
        <span className="text-xs">잃어버렸개</span>
      </Button>

      <Button
        variant="ghost"
        className={`gap-2 ${
          buttonStates.found ? "bg-gray-300" : "bg-green-500"
        } text-white rounded-full p-2 h-8 min-w-[97px] hover:bg-green-500 hover:bg-opacity-100 focus:ring-0 focus:outline-none`}
        onClick={() => toggleButton("found")}
      >
        <img src={pawGreen} alt="Logo" className="w-4 h-4" />
        <span className="text-xs">발견했개</span>
      </Button>

      <Button
        variant="ghost"
        className={`gap-2 rounded-full ${
          buttonStates.hospital
            ? "bg-gray-300 text-white"
            : "bg-gray-500 text-white"
        } p-2 h-8 min-w-[97px] hover:bg-opacity-100 focus:ring-0 focus:outline-none`}
        onClick={() => toggleButton("hospital")}
      >
        <Hospital />
        <span className="text-xs">동물보호센터</span>
      </Button>
    </div>
  );
}
