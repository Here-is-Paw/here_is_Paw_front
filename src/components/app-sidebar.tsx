import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { MyPage } from "@/components/mypage/MyPage.tsx";
import { usePetContext } from "@/contexts/PetContext";
import { MissingList } from "@/components/posts/missingPost/MissingList.tsx";
import { FindingList } from "@/components/posts/findingPost/FindingList.tsx";

// props 타입을 정의합니다 (사용하지 않지만 타입 오류 해결을 위해 추가)
interface AppSidebarProps {
  lostPets?: any[];
  findPets?: any[];
}

// props를 받도록 수정하지만 내부에서는 사용하지 않습니다
export function AppSidebar(_props: AppSidebarProps) {
    const { activeFilter } = usePetContext();

    // 컴포넌트 렌더링 선택
    const renderContent = () => {
        switch (activeFilter) {
            case "My":
                return <MyPage />;
            case "잃어버렸개":
                return <MissingList/>;
            case "발견했개":
                return <FindingList />;
            default:
                return <div>선택된 필터가 없습니다.</div>;
        }
    };

    return (
        <Sidebar className="max-lg:w-[18rem]">
            {/* 헤더 영역 */}
            <SidebarHeader />

            {/* 컨텐츠 영역 */}
            {renderContent()}
        </Sidebar>
    );
}