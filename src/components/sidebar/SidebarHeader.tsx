import { FC } from "react";
import { Menu } from "lucide-react";
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

  // const [isSearching, setIsSearching] = useState(false);
  // const { toast } = useToast();

  // const handleSearchResults = (missingResults: Pet[], findResults: Pet[]) => {
  //     만약 결과가 없다면 토스트 메시지 표시
  //     if (results.totalCount === 0) {
  //         toast({
  //             title: "검색 결과 없음",
  //             description: "검색 결과가 없습니다. 다른 키워드로 검색해 보세요.",
  //             variant: "destructive",
  //         });
  //     }
  //
  //     // 상위 컴포넌트로 검색 결과 전달
  //     if (resultLost || resultFind) {
  //         if (resultLost) resultLost = missingResults;
  //         if (resultFind) resultFind = findResults;
  //     }
  // };

  // const handleSearchError = (error: Error) => {
  //     toast({
  //         title: "검색 오류",
  //         description: error.message || "검색 중 오류가 발생했습니다.",
  //         variant: "destructive",
  //     });
  // };

  const handleSearchStart = () => {
    // setIsSearching(true);
  };

  return (
    <div className="p-4 max-lg:px-2 border-b bg-green-600 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Menu className="w-6 h-6" />
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
