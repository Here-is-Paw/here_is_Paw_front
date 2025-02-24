import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Bell, LogOut } from "lucide-react";
import { FilterButton } from "./filterButton";
import { KakaoLoginPopup } from "@/components/kakaoLogin/KakaoLoginPopup.tsx";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { backUrl } from "@/constants";

interface NavBarProps {
  buttonStates: {
    lost: boolean;
    found: boolean;
    hospital: boolean;
  };
  toggleButton: (buttonName: "lost" | "found" | "hospital") => void;
}

export function NavBar({ buttonStates, toggleButton }: NavBarProps) {
  const { isLoggedIn, login, logout } = useAuth();

  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출 (필요한 경우)
      await axios.delete(`${backUrl}/api/v1/members/logout`, {
        withCredentials: true,
      });
      logout(); // Context 상태 업데이트
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <nav className="mt-5 fixed right-0 z-50 w-[calc(95%-320px)]">
      <div className="px-4">
        <div className="flex justify-between items-center h-12 bg-white/80 backdrop-blur-sm rounded-full mx-4 shadow-lg">
          <div className="flex-none pl-4">
            <Button
              variant="outline"
              size="icon"
              className="bg-green-600 rounded-full"
            >
              <Plus className="h-4 w-4 text-white" />
            </Button>
          </div>

          <div className="flex items-center gap-1 flex-none pr-4">
            <FilterButton
              buttonStates={buttonStates}
              toggleButton={toggleButton}
            />

            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>
              </>
            ) : (
              <KakaoLoginPopup onLoginSuccess={login} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
