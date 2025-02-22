import { Link } from 'react-router-dom'
import { Sidebar } from "@/components/ui/sidebar"
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarMainContent } from './sidebar/SidebarContent'
import { useState, useEffect } from 'react';
import { Pet } from '@/types/pet';

interface AppSidebarProps {
  lostPets: Pet[];
  findPets: Pet[];
}

export function AppSidebar({ lostPets, findPets }: AppSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<string>('전체');

  // 상태 변경을 감지하는 useEffect 추가
  useEffect(() => {
    console.log("activeFilter 상태 변경됨:", activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <Sidebar>
      {/* 헤더 영역 */}
      <SidebarHeader
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* 컨텐츠 영역 */}
      <SidebarMainContent 
        lostPets={lostPets}
        findPets={findPets}
      />
    </Sidebar>
  );
}
