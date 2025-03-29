import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { usePetContext } from "@/contexts/PetContext.tsx";

export const SearchTabs = () => {
  const { searchMode, setSearchMode } = usePetContext();

  return (
    <>
      {/* 검색 모드 스위치 - shadcn/ui 탭 컴포넌트 사용 */}
      <Tabs
        value={searchMode}
        onValueChange={(value) => setSearchMode(value as "전체" | "반경")}
        className="mb-2"
      >
        <TabsList className="grid w-full grid-cols-2 bg-green-600/90 md:bg-green-700/60 h-10">
          <TabsTrigger
            value="전체"
            className="text-white hover:bg-green-500 data-[state=active]:shadow-none data-[state=active]:bg-green-700 data-[state=active]:text-white"
          >
            전체 조회
          </TabsTrigger>
          <TabsTrigger
            value="반경"
            className="text-white hover:bg-green-500 data-[state=active]:shadow-none data-[state=active]:bg-green-700 data-[state=active]:text-white"
          >
            반경 조회
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};
