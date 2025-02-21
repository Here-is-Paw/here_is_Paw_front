import { AppSidebar } from "@/components/app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarHeader } from "@/components/sidebar/SidebarHeader"
import { SidebarMainContent } from "@/components/sidebar/SidebarContent"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

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
          {children}
        </div>
        <div className="mt-4">
          <SidebarMainContent />
        </div>
      </div>
    )
  }

  return (
    // <div className="min-h-screen bg-white relative">
    //   <div className="fixed inset-y-0 left-0 w-[320px] z-50">
    //     <AppSidebar />
    //   </div>
    //   <div className="ml-[320px] w-full">
    //     {children}
    //   </div>
    // </div>
    <div className="min-h-screen bg-white relative">
    {/* 사이드바 너비를 380px로 증가 */}
    <div className="fixed inset-y-0 left-0 w-[380px] z-50">
      <AppSidebar />
    </div>
    {/* 메인 컨텐츠 영역도 그에 맞게 조정 */}
    <div className="ml-[380px] w-[calc(100%-380px)]">
      {children}
    </div>
  </div>
  )
}