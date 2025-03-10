import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarMainContent } from "./sidebar/SidebarContent";
import { MyPage } from "@/components/mypage/MyPage.tsx";
import { usePetContext } from "@/contexts/PetContext";
import { MissingList } from "@/components/posts/missingPost/MissingList.tsx";
import { FindingList } from "@/components/posts/findingPost/FindingList.tsx";

export function AppSidebar() {
    const {
        activeFilter,
        setActiveFilter,
        searchMode,
        setSearchMode
    } = usePetContext();

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter as any);
    };

    // 컴포넌트 렌더링 선택
    const renderContent = () => {
        switch (activeFilter) {
            case "My":
                return <MyPage />;
            case "잃어버렸개":
                return <MissingList activeFilter="잃어버렸개" />;
            case "발견했개":
                return <FindingList activeFilter="발견했개"/>;
                return null;
            default:
                return <SidebarMainContent />;
        }
    };

    return (
        <Sidebar className="max-lg:w-[18rem]">
            {/* 헤더 영역 */}
            <SidebarHeader
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                searchMode={searchMode}
                setSearchMode={setSearchMode as any}
            />

            {/* 컨텐츠 영역 */}
            {renderContent()}
        </Sidebar>
    );
}