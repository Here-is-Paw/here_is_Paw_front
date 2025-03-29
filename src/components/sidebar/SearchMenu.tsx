import { IntegratedSearch } from "./IntegratedSearch";
import { SideMenu } from "./SideMenu";
import { SearchTabs } from "./SearchTabs";

export const SearchMenu = () => {
  const handleSearchStart = () => {
    // setIsSearching(true);
  };

  return (
    <>
      {/* 검색 모드 스위치 - shadcn/ui 탭 컴포넌트 사용 */}
      <SearchTabs />
      {/* 통합형 검색 컴포넌트 */}
      <IntegratedSearch onSearchStart={handleSearchStart} />
      {/* 필터 버튼 컴포넌트 */}
      <SideMenu />
    </>
  );
};
