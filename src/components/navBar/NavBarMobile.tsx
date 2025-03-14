import { Button } from "@/components/ui/button";
import { Plus, Bell, LogOut, Minus } from "lucide-react";
import { FilterButton } from "./filterButton";
import { KakaoLoginPopup } from "@/components/kakaoLogin/KakaoLoginPopup.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { MissingFormPopup } from "@/components/petPost/missingPost/MissingPost.tsx";
import { FindingFormPopup } from "@/components/petPost/findingPost/FindingPost.tsx";
import { useState } from "react";
import { useRadius } from "@/contexts/RadiusContext.tsx";
import axios from "axios";
import { backUrl } from "@/constants";

interface NavBarMobileProps {
  buttonStates: {
    lost: boolean;
    found: boolean;
    hospital: boolean;
  };
  toggleButton: (buttonName: "lost" | "found" | "hospital") => void;
}

export function NavBarMobile({
  buttonStates,
  toggleButton,
}: NavBarMobileProps) {
  const [isMissingAddOpen, setIsMissingAddOpen] = useState(false);
  const [isFindingAddOpen, setIsFindingAddOpen] = useState(false);
  const [isResistModalOpen, setIsResistModalOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { radius } = useRadius();

  const handleLogout = async () => {
    try {
      await axios.patch(
        `${backUrl}/api/v1/members/radius`,
        { radius },
        { withCredentials: true }
      );
      await axios.delete(`${backUrl}/api/v1/members/logout`, {
        withCredentials: true,
      });
      logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <>
      {/* 모바일용 상단 NavBar - 위치를 아래로 내림 */}
      <nav className="w-full">
        <div className="px-4 py-2">
          <div className="flex justify-between items-center bg-white rounded-full px-3 py-1">
            <div>
              <Button
                variant="outline"
                size="icon"
                className="bg-green-600 rounded-full"
                onClick={() => setIsResistModalOpen(true)}
              >
                <Plus className="h-4 w-4 text-white" />
              </Button>
              {isResistModalOpen && (
                <div className="absolute top-[45px] left-[10px] bg-white rounded-2xl w-[200px] overflow-hidden z-50">
                  <div className="flex-none px-2 py-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-green-600 rounded-full"
                      onClick={() => {
                        setIsResistModalOpen(false);
                      }}
                    >
                      <Minus className="h-4 w-4 text-white" />
                    </Button>
                    <div className="py-1">
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start w-full p-4 hover:bg-gray-100 bgr-white h-12"
                        onClick={() => {
                          setIsMissingAddOpen(true);
                          setIsResistModalOpen(false);
                        }}
                      >
                        <div className="w-6 h-6 mr-2 rounded-full flex items-center justify-center">
                          <svg
                            viewBox="0 0 30 31"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="svg-2"
                          >
                            <path
                              d="M26.25 8H23.75L22.1625 6.4125C21.5876 5.8389 20.812 5.51163 20 5.5H16.875C16.6999 4.7985 16.2993 4.17391 15.7347 3.72224C15.1701 3.27057 14.4728 3.01682 13.75 3V10.95C13.8142 12.2124 14.3133 13.4137 15.1625 14.35C16.5607 15.6941 18.3895 16.5001 20.325 16.625L24.6375 14.9C25.1435 14.6969 25.5991 14.3859 25.9726 13.9887C26.3461 13.5914 26.6284 13.1175 26.8 12.6L27.5 10.6875C27.5201 10.5591 27.5201 10.4284 27.5 10.3V9.25C27.5 8.91848 27.3683 8.60054 27.1339 8.36612C26.8995 8.1317 26.5815 8 26.25 8ZM20 10.5C19.7528 10.5 19.5111 10.4267 19.3055 10.2893C19.1 10.152 18.9398 9.95676 18.8452 9.72835C18.7505 9.49995 18.7258 9.24861 18.774 9.00614C18.8222 8.76366 18.9413 8.54093 19.1161 8.36612C19.2909 8.1913 19.5137 8.07225 19.7561 8.02402C19.9986 7.97579 20.2499 8.00054 20.4784 8.09515C20.7068 8.18976 20.902 8.34998 21.0393 8.55554C21.1767 8.7611 21.25 9.00277 21.25 9.25C21.25 9.58152 21.1183 9.89946 20.8839 10.1339C20.6495 10.3683 20.3315 10.5 20 10.5Z"
                              fill="#DC2627"
                            />
                            <path
                              d="M14.225 15.175C13.353 14.22 12.7833 13.0283 12.5875 11.75H7.5C7.16598 11.7721 6.83109 11.7226 6.51776 11.6048C6.20442 11.4869 5.91988 11.3035 5.68317 11.0668C5.44647 10.8301 5.26306 10.5456 5.14524 10.2322C5.02742 9.91891 4.9779 9.58402 5 9.25C5 8.91848 4.8683 8.60054 4.63388 8.36612C4.39946 8.1317 4.08152 8 3.75 8C3.41848 8 3.10054 8.1317 2.86612 8.36612C2.6317 8.60054 2.5 8.91848 2.5 9.25C2.51297 10.1174 2.71788 10.9712 3.1 11.75C3.52301 12.5667 4.1861 13.2341 5 13.6625V28H8.75V21.75H16.25V28H20V17.8375C17.8194 17.6657 15.7717 16.7216 14.225 15.175Z"
                              fill="#DC2627"
                            />
                          </svg>
                        </div>
                        실종 신고하기
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start w-full p-4 hover:bg-gray-100 bgr-white h-12"
                        onClick={() => {
                          if (!isLoggedIn) {
                            alert("로그인 후 이용해주세요!");
                          } else {
                            setIsFindingAddOpen(true);
                          }
                          setIsResistModalOpen(false);
                        }}
                      >
                        <div className="w-6 h-6 mr-2 rounded-full flex items-center justify-center btn-size">
                          <svg
                            viewBox="0 0 30 31"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="svg-2"
                          >
                            <path
                              d="M26.25 8H23.75L22.1625 6.4125C21.5876 5.8389 20.812 5.51163 20 5.5H16.875C16.6999 4.7985 16.2993 4.17391 15.7347 3.72224C15.1701 3.27057 14.4728 3.01682 13.75 3V10.95C13.8142 12.2124 14.3133 13.4137 15.1625 14.35C16.5607 15.6941 18.3895 16.5001 20.325 16.625L24.6375 14.9C25.1435 14.6969 25.5991 14.3859 25.9726 13.9887C26.3461 13.5914 26.6284 13.1175 26.8 12.6L27.5 10.6875C27.5201 10.5591 27.5201 10.4284 27.5 10.3V9.25C27.5 8.91848 27.3683 8.60054 27.1339 8.36612C26.8995 8.1317 26.5815 8 26.25 8ZM20 10.5C19.7528 10.5 19.5111 10.4267 19.3055 10.2893C19.1 10.152 18.9398 9.95676 18.8452 9.72835C18.7505 9.49995 18.7258 9.24861 18.774 9.00614C18.8222 8.76366 18.9413 8.54093 19.1161 8.36612C19.2909 8.1913 19.5137 8.07225 19.7561 8.02402C19.9986 7.97579 20.2499 8.00054 20.4784 8.09515C20.7068 8.18976 20.902 8.34998 21.0393 8.55554C21.1767 8.7611 21.25 9.00277 21.25 9.25C21.25 9.58152 21.1183 9.89946 20.8839 10.1339C20.6495 10.3683 20.3315 10.5 20 10.5Z"
                              fill="#15AF55"
                            />
                            <path
                              d="M14.225 15.175C13.353 14.22 12.7833 13.0283 12.5875 11.75H7.5C7.16598 11.7721 6.83109 11.7226 6.51776 11.6048C6.20442 11.4869 5.91988 11.3035 5.68317 11.0668C5.44647 10.8301 5.26306 10.5456 5.14524 10.2322C5.02742 9.91891 4.9779 9.58402 5 9.25C5 8.91848 4.8683 8.60054 4.63388 8.36612C4.39946 8.1317 4.08152 8 3.75 8C3.41848 8 3.10054 8.1317 2.86612 8.36612C2.6317 8.60054 2.5 8.91848 2.5 9.25C2.51297 10.1174 2.71788 10.9712 3.1 11.75C3.52301 12.5667 4.1861 13.2341 5 13.6625V28H8.75V21.75H16.25V28H20V17.8375C17.8194 17.6657 15.7717 16.7216 14.225 15.175Z"
                              fill="#15AF55"
                            />
                          </svg>
                        </div>
                        발견 등록하기
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              {isLoggedIn ? (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="text-xs">로그아웃</span>
                  </Button>
                </div>
              ) : (
                <KakaoLoginPopup />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Popup 컴포넌트들 */}
      <MissingFormPopup
        open={isMissingAddOpen}
        onOpenChange={setIsMissingAddOpen}
      />
      <FindingFormPopup
        open={isFindingAddOpen}
        onOpenChange={setIsFindingAddOpen}
      />
    </>
  );
}
