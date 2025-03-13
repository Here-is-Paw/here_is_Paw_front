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
  // Helper to determine visibility status text - false means visible, true means hidden
  const getVisibilityText = (isHidden: boolean) => isHidden ? "숨김" : "표시";

  return (
    <div className="flex flex-wrap items-center gap-1 flex-auto justify-end">
      <Button
        variant="ghost"
        className={`gap-2 ${
          buttonStates.lost ? "bg-gray-300" : "bg-red-500"
        } text-white rounded-full p-2 h-8 min-w-[97px] hover:bg-red-500 hover:bg-opacity-100 focus:ring-0 focus:outline-none`}
        onClick={() => {
          console.log(`잃어버렸개 버튼 클릭됨. 현재 상태: ${buttonStates.lost}`);
          console.log(`잃어버렸개 마커 ${getVisibilityText(buttonStates.lost)} 상태입니다.`);
          toggleButton("lost");
          console.log(`잃어버렸개 버튼 상태 변경됨. 변경 후 상태는 ${!buttonStates.lost}이 될 예정`);
          console.log(`잃어버렸개 마커가 이제 ${getVisibilityText(!buttonStates.lost)} 상태로 변경됩니다.`);
        }}
      >
        <img src={pawRed} alt="Logo" className="w-4 h-4" />
        <span className="text-xs">잃어버렸개</span>
      </Button>

      <Button
        variant="ghost"
        className={`gap-2 ${
          buttonStates.found ? "bg-gray-300" : "bg-green-500"
        } text-white rounded-full p-2 h-8 min-w-[97px] hover:bg-green-500 hover:bg-opacity-100 focus:ring-0 focus:outline-none`}
        onClick={() => {
          console.log(`발견했개 버튼 클릭됨. 현재 상태: ${buttonStates.found}`);
          console.log(`발견했개 마커 ${getVisibilityText(buttonStates.found)} 상태입니다.`);
          toggleButton("found");
          console.log(`발견했개 버튼 상태 변경됨. 변경 후 상태는 ${!buttonStates.found}이 될 예정`);
          console.log(`발견했개 마커가 이제 ${getVisibilityText(!buttonStates.found)} 상태로 변경됩니다.`);
        }}
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
        onClick={() => {
          console.log(`동물보호센터 버튼 클릭됨. 현재 상태: ${buttonStates.hospital}`);
          console.log(`동물보호센터 마커 ${getVisibilityText(buttonStates.hospital)} 상태입니다.`);
          toggleButton("hospital");
          console.log(`동물보호센터 버튼 상태 변경됨. 변경 후 상태는 ${!buttonStates.hospital}이 될 예정`);
          console.log(`동물보호센터 마커가 이제 ${getVisibilityText(!buttonStates.hospital)} 상태로 변경됩니다.`);
        }}
      >
        <Hospital />
        <span className="text-xs">동물보호센터</span>
      </Button>
    </div>
  );
}
