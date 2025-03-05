import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Bell, LogOut } from "lucide-react";
import { FilterButton } from "./filterButton";
import { KakaoLoginPopup } from "@/components/kakaoLogin/KakaoLoginPopup.tsx";
import { useAuth } from "@/contexts/AuthContext";
// import { AddPetFormPopup } from "../mypage/AddMyPetFormPopup";
import { MissingFormPopup } from "../missingPost/missingPost";
import { usePetContext } from "@/contexts/findPetContext";
import axios from "axios";
import { backUrl } from "@/constants";
import { useState, useEffect } from "react";
import FindLocationPicker from "@/components/petCard/findNcpMap";
// import NcpMap from './findNcpMap'
// import useGeolocation from '@/hooks/Geolocation'

// import { Dialog, DialogContent } from "@/components/ui/dialog"

interface NavBarProps {
  buttonStates: {
    lost: boolean;
    found: boolean;
    hospital: boolean;
  };
  toggleButton: (buttonName: "lost" | "found" | "hospital") => void;
}

export function NavBar({ buttonStates, toggleButton }: NavBarProps) {
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  // const findLocation = useGeolocation()

  console.log(isLoggedIn);

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

  const [isResistModalOpen, setIsResistModalOpen] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [breed, setBreed] = useState("");
  const [geoX, setGeoX] = useState(0);
  const [geoY, setGeoY] = useState(0);
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [etc, setEtc] = useState("");
  const [situation, setSituation] = useState("");
  const [title, setTitle] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(0);
  const [neutered, setNeutered] = useState(0);

  const { incrementSubmissionCount } = usePetContext();

  const handleLocationSelect = (location: {
    x: number;
    y: number;
    address: string;
  }) => {
    setGeoX(location.x);
    setGeoY(location.y);
    setLocation(location.address);

    console.log("missing geo", location);
  };

  //   private Long member_id; // 신고한 회원 id
  //   private Long shelter_id; // 보호소 id

  const handleBreed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBreed(e.target.value);
  };

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEtc = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEtc(e.target.value);
  };

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const handleSituation = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSituation(e.target.value);
  };

  const handleTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleGender = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(parseInt(e.target.value));
  };

  const handleAge = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(e.target.value);
  };

  const handleNeutered = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNeutered(parseInt(e.target.value));
  };

  // 파일 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 객체 자체를 저장
      setImageFile(file);

      // 미리보기용 URL 생성 (필요한 경우)
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  useEffect(() => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  // 파일 삭제 핸들러
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    localStorage.removeItem("uploadedImage"); // 🔹 localStorage에서도 삭제
  };

  // 발견 신고 작성
  const handleFindSubmit = async () => {
    if (isLoggedIn) {
      const memberResponse = await axios.get(`${backUrl}/api/v1/members/me`, {
        withCredentials: true,
      });

      const member_id = memberResponse.data.data.id;

      try {
        const formData = new FormData();

        // 파일 추가
        if (imageFile) {
          formData.append("file", imageFile);
        }

        // JSON 객체의 각 필드를 개별적으로 추가
        formData.append("title", title);
        formData.append("situation", situation);
        formData.append("breed", breed);
        formData.append("location", location);
        // Point 객체는 문자열로 변환해서 보내야 함
        formData.append("x", geoX.toString()); // geo 객체의 x 값
        formData.append("y", geoY.toString()); // geo 객체의 y 값
        formData.append("name", name);
        formData.append("color", color);
        formData.append("etc", etc);
        formData.append("gender", gender.toString());
        formData.append("age", age);
        formData.append("neutered", neutered.toString());
        formData.append("find_date", "2025-02-20T00:00:00");
        formData.append("member_id", member_id);
        formData.append("shelter_id", "1");

        const response = await axios.post(`${backUrl}/find/new`, formData, {
          withCredentials: true,
        });

        if (response.status === 200 || response.status === 201) {
          alert("발견 신고가 성공적으로 저장되었습니다!");
          incrementSubmissionCount();
          handleRemoveImage();
        } else {
          alert("저장 실패");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("오류가 발생했습니다.");
        handleRemoveImage();
      }
    } else {
      alert("로그인 후 이용 가능한 서비스 입니다!");
      return;
    }
  };

  return (
    <>
      <nav className="mt-5 fixed right-0 z-50 w-[calc(95%-320px)]">
        <div className="px-4">
          <div className="flex justify-between items-center h-12 bg-white/80 backdrop-blur-sm rounded-full mx-4 shadow-lg">
            <div className="flex-none pl-4">
              <Button variant="outline" size="icon" className="bg-green-600 rounded-full" onClick={() => setIsResistModalOpen(!isResistModalOpen)}>
                <Plus className="h-4 w-4 text-white" />
              </Button>
              {/* 모달 on off */}
              {isResistModalOpen && (
                <div className="absolute top-[3%] left-[0%] bg-white rounded-lg  w-[200px] overflow-hidden z-50">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start hover:bg-gray-100 bgr-white h-12"
                      onClick={() => {
                        // 실종 신고하기 로직
                        setIsResistModalOpen(false);
                      }}
                    >
                      <div className="w-6 h-6 mr-2 rounded-full bg-green-600 flex items-center justify-center btn-size">
                        <Plus className="h-4 w-4 text-white" />
                      </div>
                      등록하기
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start p-4 hover:bg-gray-100 bgr-white h-12"
                      onClick={() => {
                        // 실종 신고하기 로직
                        setIsAddPetOpen(true);
                      }}
                    >
                      <div className="w-10 h-10 mr-2 rounded-full flex items-center justify-center">
                        {/* <Plus className="h-4 w-4 text-white" /> */}
                        <svg viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-2">
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
                      className="flex items-center justify-start p-4 hover:bg-gray-100 bgr-white h-12"
                      onClick={() => {
                        // 발견 등록하기 로직
                        if (!isLoggedIn) {
                          alert("로그인 후 이용해주세요!");
                        } else {
                          setIsFindModalOpen(!isFindModalOpen);
                        }
                        setIsResistModalOpen(false);
                      }}
                    >
                      <div className="w-6 h-6 mr-2 rounded-full flex items-center justify-center btn-size">
                        <svg viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-2">
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
              )}
            </div>

            <div className="flex items-center gap-1 flex-none pr-4">
              <FilterButton buttonStates={buttonStates} toggleButton={toggleButton} />

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
                <KakaoLoginPopup />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 반려동물 추가 팝업 */}
      <MissingFormPopup open={isAddPetOpen} onOpenChange={setIsAddPetOpen} />

      {isFindModalOpen && (
        // 배경 오버레이
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* 반투명 배경 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFindModalOpen(false)} // 배경 클릭시 모달 닫기
          ></div>

          {/* 모달 컨테이너 */}
          <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
            </div>

            {/* 모달 내용(이미지, 폼 등) */}
            <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.</p>

            <div className="space-between text-[15px]">
              {/* 예: 사진 업로드, 위치, 기타 폼 */}
              <div className="w-80">
                <div className="mb-4 ">
                  <label className="block font-medium mb-2">* 제목</label>
                  <textarea
                    className="border p-2 w-full bg-white resize-none"
                    rows={1}
                    placeholder="게시글의 제목을 입력해주세요."
                    onChange={handleTitle}
                  />
                </div>

                {imagePreview ? (
                  <div className="mb-4">
                    <label className="block font-medium mb-2">반려동물 사진</label>
                    <div className="mt-2 flex">
                      <img src={imagePreview} alt="미리보기" className="w-60 h-60 object-cover rounded" />
                      <div className="mt-[77%]">
                        <button className=" bg-red-500 h-4 w-4 " onClick={handleRemoveImage}>
                          <Plus className="text-white rotate-45 absolute top-[54.7%] left-[34%]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block font-medium mb-2">반려동물 사진</label>
                    <input type="file" className="border p-2 w-full" onChange={handleImageUpload} />
                  </div>
                )}

                <div className="mb-4 ">
                  <label className="block font-medium mb-2 ">* 발견 상황</label>
                  <textarea
                    className="border p-2 w-full bg-white resize-none"
                    rows={2}
                    placeholder="발견 당시 상황을 입력해주세요."
                    onChange={handleSituation}
                  />
                </div>

                <div className="mb-4 flex justify-between">
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">견종</label>
                    <input className="border p-2 w-full bg-white" placeholder="견종" onChange={handleBreed} />
                  </div>
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">색상</label>
                    <input className="border p-2 w-full bg-white" placeholder="색상" onChange={handleColor} />
                  </div>
                  <div className="w-20">
                    <label className="block font-medium mb-2 ">이름</label>
                    <input className="border p-2 w-full bg-white" placeholder="이름" onChange={handleName} />
                  </div>
                </div>
                <div className="mb-4 flex justify-between">
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">성별</label>
                    {/* <input className="border p-2 w-full bg-white" placeholder="성별" onChange={handleGender} /> */}
                    <select className="border p-2 w-full bg-white" onChange={handleGender}>
                      <option value="0">미상</option>
                      <option value="1">수컷</option>
                      <option value="2">암컷</option>
                    </select>
                  </div>
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">중성화</label>
                    {/* <input className="border p-2 w-full bg-white" placeholder="중성화 여부" onChange={handleNeutered} /> */}
                    <select className="border p-2 w-full bg-white" onChange={handleNeutered}>
                      <option value="0">미상</option>
                      <option value="1">중성화 됌</option>
                      <option value="2">중성화 안됌</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block font-medium mb-2 ">나이</label>
                    <input className="border p-2 w-full bg-white" placeholder="추정 나이" onChange={handleAge} />
                  </div>
                </div>
              </div>
              <div className="w-80">
                {/* <div className="w-20 h-20 bg-pink">지도 들어갈 곳</div> */}
                <FindLocationPicker onLocationSelect={handleLocationSelect} />
                {/* <NcpMap
          currentLocation={findLocation}
        /> */}
                <div className="mb-4 ">
                  <label className="block font-medium mb-2 ">특이 사항</label>
                  <textarea className="border p-2 w-full bg-white resize-none" rows={2} placeholder="특징을 설명해주세요." onChange={handleEtc} />
                </div>
              </div>
            </div>
            {/* 예: 등록/취소 버튼 */}
            <div className="flex justify-end gap-2 h-6">
              <button className="px-4 py-0 rounded bg-gray-200 hover:bg-gray-300 " onClick={() => setIsFindModalOpen(false)}>
                취소하기
              </button>
              <button
                className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  // 등록 처리 로직
                  handleFindSubmit();
                  setIsFindModalOpen(false);
                }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
