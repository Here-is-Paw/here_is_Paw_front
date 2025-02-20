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
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-y-0 left-0 w-[320px] z-50">
        <AppSidebar />
      </div>
      <div className="ml-[320px] w-full">
        {children}
      </div>
    </div>
  )
}