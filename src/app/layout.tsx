import React from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarHeader } from "@/components/sidebar/SidebarHeader"
import { SidebarMainContent } from "@/components/sidebar/SidebarContent"
import petsData from '../../../mocks/data/pets.json'
import MainPage from '@/pages/MainPage.tsx'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  // pets 데이터 확인
  console.log('Layout의 petsData:', petsData);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <SidebarHeader 
            activeFilter="전체"
            onFilterChange={() => {}}
          />
        </div>
        <div className="w-full">
          <MainPage 
            mockLostPets={petsData.lostPets}
            mockFindPets={petsData.findPets}
          />
        </div>
        <div className="mt-4">
          <SidebarMainContent 
            lostPets={petsData.lostPets}
            findPets={petsData.findPets}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-y-0 left-0 w-[380px] z-50">
        <AppSidebar 
          lostPets={petsData.lostPets}
          findPets={petsData.findPets}
        />
      </div>
      <div className="ml-[380px] w-[calc(100%-380px)]">
        <MainPage 
          mockLostPets={petsData.lostPets}
          mockFindPets={petsData.findPets}
        />
      </div>
    </div>
  )
}