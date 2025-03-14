import { FC } from "react";
import paw from "../../assets/paw.svg";
import { IntegratedSearch } from "./IntegratedSearch";
import { SearchResult } from "@/services/searchService";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { usePetContext } from "@/contexts/PetContext.tsx";
import { SideMenu } from "./SideMenu";
import { useIsMobile } from "@/hooks/use-mobile";

// import { useToast } from "@/components/ui/use-toast";

interface SidebarHeaderProps {
  onSearchResults?: (results: SearchResult) => void;
}

export const SidebarHeader: FC<SidebarHeaderProps> = () => {
  const { searchMode, setSearchMode } = usePetContext();
  const isMobile = useIsMobile();

  const handleSearchStart = () => {
    // setIsSearching(true);
  };

  return (
    <div className="p-4 max-lg:px-2 border-b bg-green-600 text-white">
      <div className="flex items-center gap-2 md:mb-4 mb-5 mt-1">
        <div className="md:text-2xl font-bold">Here'sPaw</div>
        <img src={paw} alt="Logo" className="md:w-8 md:h-8 w-6 h-6" />
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
      {/* 필터 버튼 컴포넌트 */}
      {!isMobile && <SideMenu />}
    </div>
  );
};
