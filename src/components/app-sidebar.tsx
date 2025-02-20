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
    <>
      {/* 헤더 - 항상 고정되어 보임 */}
      <Sidebar className="bg-white border-r w-full md:w-[380px]">
        <SidebarHeader 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />        
          <SidebarMainContent />
        </Sidebar>
    </>
  )
}