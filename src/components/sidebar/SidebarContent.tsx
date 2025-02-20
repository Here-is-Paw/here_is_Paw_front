import { Link } from 'react-router-dom'
import { SidebarGroup } from "@/components/ui/sidebar"

export function SidebarMainContent() {
  return (
    <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)]">
      <SidebarGroup className="space-y-2 p-4">
        <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          홈
        </Link>
        <Link to="/adoption" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          입양하기
        </Link>
        <Link to="/lost" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          실종신고
        </Link>
      </SidebarGroup>
      <SidebarGroup className="space-y-2 p-4">
        <Link to="/mypage" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          마이페이지
        </Link>
        <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          설정
        </Link>
      </SidebarGroup>
      <div className="p-4 mt-auto text-center text-gray-500">
        <div>© 2024 Here Is Paw</div>
      </div>
    </div>
  )
}
