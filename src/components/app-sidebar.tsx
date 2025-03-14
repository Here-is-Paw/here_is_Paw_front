import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarMainContent } from "./sidebar/SidebarContent";
import { MyPage } from "@/components/mypage/MyPage.tsx";
import { usePetContext } from "@/contexts/PetContext";
import { MissingList } from "@/components/petPost/missingPost/MissingList.tsx";
import { FindingList } from "@/components/petPost/findingPost/FindingList.tsx";

export function AppSidebar() {
  const { activeFilter } = usePetContext();

  // 컴포넌트 렌더링 선택
  const renderContent = () => {
    switch (activeFilter) {
      case "My":
        return <MyPage />;
      case "잃어버렸개":
        return <MissingList />;
      case "발견했개":
        return <FindingList />;
      default:
        return <SidebarMainContent />;
    }
  };

  return (
    <Sidebar>
      {/* 헤더 영역 */}
      <SidebarHeader />

      {/* 컨텐츠 영역 */}
      {renderContent()}
    </Sidebar>
  );
}
