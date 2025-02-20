import { Link } from 'react-router-dom'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup } from "@/components/ui/sidebar"
import { SidebarHeader } from './sidebar/SidebarHeader'

export function AppSidebar() {
  return (
    <Sidebar className="h-full bg-white border-r w-full md:w-[320px]">
      <SidebarHeader />
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
  )
}
