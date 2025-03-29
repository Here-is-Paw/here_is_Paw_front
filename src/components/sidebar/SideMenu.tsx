import { FC } from "react";
import { Button } from "../ui/button";
import { usePetContext } from "@/contexts/PetContext.tsx";

interface SideMenuProps {
  // Add any props you might need
}

export const SideMenu: FC<SideMenuProps> = () => {
  const filters = ["전체", "잃어버렸개", "발견했개", "My"];
  const { activeFilter, setActiveFilter } = usePetContext();

  return (
    <div className="grid grid-cols-12 gap-1">
      {filters.map((filter) => (
        <Button
          key={filter}
          onClick={() => {
            setActiveFilter(
              filter as "전체" | "잃어버렸개" | "발견했개" | "My"
            );
          }}
          className={`px-1 rounded-lg text-sm font-medium hover:text-white focus:outline-none hover:outline-none shadow-none ${
            activeFilter === filter
              ? "bg-green-700 text-white"
              : "bg-white text-black md:bg-green-600 md:text-white hover:bg-green-500 "
          } ${
            filter === "전체" || filter === "My" ? "col-span-2" : "col-span-4"
          }`}
          // disabled={isSearching}
        >
          {filter}
        </Button>
      ))}
    </div>
  );
};
