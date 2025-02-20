import { Link } from 'react-router-dom'
import { Sidebar } from "@/components/ui/sidebar"
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarMainContent } from './sidebar/SidebarContent'
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
    <Sidebar className="bg-white border-r w-full md:w-[380px]">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-50 bg-white">
        <SidebarHeader 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="md:mt-0">
        <SidebarMainContent />
      </div>
    </Sidebar>
  )
}