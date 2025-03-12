import { FC } from "react";
import paw from "../../assets/paw.svg";
import { IntegratedSearch } from "./IntegratedSearch";
import { SearchResult } from "@/services/searchService";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { usePetContext } from "@/contexts/PetContext.tsx";

// import { useToast } from "@/components/ui/use-toast";

interface SidebarHeaderProps {
  onSearchResults?: (results: SearchResult) => void;
}

export const SidebarHeader: FC<SidebarHeaderProps> = () => {
  const filters = ["전체", "잃어버렸개", "발견했개", "My"];

  const { activeFilter, searchMode, setActiveFilter, setSearchMode } =
    usePetContext();

  const handleSearchStart = () => {
    // setIsSearching(true);
  };

  return (
    <div className="p-4 max-lg:px-2 border-b bg-green-600 text-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl font-bold">Here'sPaw</div>
        <img src={paw} alt="Logo" className="w-8 h-8" />
      </div>
      {/* 검색 모드 스위치 - shadcn/ui 탭 컴포넌트 사용 */}
      <Tabs
        value={searchMode}
        onValueChange={(value) => setSearchMode(value as "전체" | "반경")}
        className="mb-2"
      >
        <TabsList className="grid w-full grid-cols-2 bg-green-700/60 h-10">
          <TabsTrigger
            value="전체"
            className="text-white hover:bg-green-500 data-[state=active]:shadow-none data-[state=active]:bg-green-700 data-[state=active]:text-white"
          >
            전체 검색
          </TabsTrigger>
          <TabsTrigger
            value="반경"
            className="text-white hover:bg-green-500 data-[state=active]:shadow-none data-[state=active]:bg-green-700 data-[state=active]:text-white"
          >
            반경 검색
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {/* 통합형 검색 컴포넌트 */}
      <IntegratedSearch onSearchStart={handleSearchStart} />
      <div className="grid grid-cols-12 gap-3">
        {filters.map((filter) => (
          <Button
            key={filter}
            onClick={() => {
              setActiveFilter(
                filter as "전체" | "잃어버렸개" | "발견했개" | "My"
              );
            }}
            className={`px-1 rounded-lg text-sm font-medium focus:outline-none shadow-none ${
              activeFilter === filter
                ? "bg-green-700 text-white"
                : "bg-green-600 text-white hover:bg-green-500 focus:outline-none hover:outline-none"
            } ${
              filter === "전체" || filter === "My" ? "col-span-2" : "col-span-4"
            }`}
            // disabled={isSearching}
          >
            {filter}
          </Button>
        ))}
      </div>
    </div>
  );
};
