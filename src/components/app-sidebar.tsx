import { Link } from 'react-router-dom'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup } from "@/components/ui/sidebar"
import { SidebarHeader } from './sidebar/SidebarHeader'
import { useState, useEffect } from 'react';

export function AppSidebar() {
  const [activeFilter, setActiveFilter] = useState<string>('전체');

  // 상태 변경을 감지하는 useEffect 추가
  useEffect(() => {
    console.log('activeFilter 상태 변경됨:', activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <>
      {/* 헤더 - 항상 고정되어 보임 */}
      <div className="fixed top-0 left-0 right-0 md:right-auto md:w-[320px] bg-white z-50 border-b md:border-r">
        <SidebarHeader 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* 사이드바 - 모바일에서는 숨겨지고 데스크탑에서 보임 */}
      <div className="hidden md:block mt-[64px]">
        <Sidebar className="h-[calc(100vh-64px)] bg-white border-r w-full md:w-[320px]">
          <SidebarContent>
            <SidebarGroup>
              <Link to="/">홈</Link>
              <Link to="/adoption">입양하기</Link>
              <Link to="/lost">실종신고</Link>
            </SidebarGroup>
            <SidebarGroup>
              <Link to="/mypage">마이페이지</Link>
              <Link to="/settings">설정</Link>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div>© 2024 Here Is Paw</div>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  )
}