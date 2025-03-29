import { FC } from "react";
import paw from "../../assets/paw.svg";
import { SearchResult } from "@/services/searchService";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavBar } from "../navBar/navBar";
import { SearchMenu } from "./SearchMenu";

// import { useToast } from "@/components/ui/use-toast";

interface SidebarHeaderProps {
  onSearchResults?: (results: SearchResult) => void;
}

export const SidebarHeader: FC<SidebarHeaderProps> = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="p-4 max-lg:p-2 border-b bg-green-600 text-white">
        <div
          className={`
          ${isMobile && "flex items-center gap-2"}
        `}
        >
          <div className="flex items-center gap-2 md:mb-4 md:mt-1">
            <div className="md:text-2xl font-bold">Here'sPaw</div>
            <img src={paw} alt="Logo" className="md:w-8 md:h-8 w-6 h-6" />
          </div>

          <div className="flex-1 text-black">
            <NavBar />
          </div>
        </div>

        {!isMobile && <SearchMenu />}
      </div>
      {/* {isMobile && (
        <div className="inline-flex mt-2 mx-2">
          <FilterButton />
        </div>
      )} */}
    </>
  );
};
