import { AppSidebar } from "@/components/app-sidebar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white relative">
      {/* 사이드바 */}
      <div className="fixed inset-y-0 left-0 w-full md:w-[320px] z-50">
        <AppSidebar />
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="hidden md:block md:ml-[320px] w-full">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
