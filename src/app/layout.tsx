import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SidebarProvider>
          <div className="flex min-h-screen bg-white relative">
            {/* 항상 보이는 사이드바 */}
            <div className="fixed inset-y-0 left-0 w-full md:w-[320px] z-50">
              <AppSidebar />
            </div>
            
            {/* 데스크탑에서만 보이는 메인 콘텐츠 */}
            <div className="hidden md:block md:ml-[320px] w-full">
              <main className="p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
