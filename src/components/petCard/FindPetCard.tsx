import { FindPet } from "@/types/FindPet";
import { findDetail } from "@/types/findDetail";
import { useState } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { backUrl } from "@/constants";
import axios from "axios";
import { Plus, X, Send } from "lucide-react";
import { usePetContext } from "@/contexts/findPetContext";
import { useAuth } from "@/contexts/AuthContext";
import NcpMap from "./findNcpMap";
import useGeolocation from "@/hooks/Geolocation";
import { ChatModal } from "@/components/chat/ChatModal";
import { ChatMessage } from "@/types/chat";

const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

interface PetCardProps {
  pet: FindPet;
  // findDetail: findDetail;
}

export function FindPetCard({ pet }: PetCardProps) {
  const [isFindDetailModalOpen, setIsFindDetailModalOpen] = useState(false);
  const [findDetail, setFindDetail] = useState<findDetail | null>(null);
  const [member, setMember] = useState(null);
  const { isLoggedIn } = useAuth();
  const findLocation = useGeolocation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { incrementSubmissionCount } = usePetContext();

  const [breed, setBreed] = useState("");
  // const [geo, setGeo] = useState("");
  // const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [gender, setGender] = useState("");
  const [etc, setEtc] = useState("");
  const [situation, setSituation] = useState("");
  const [title, setTitle] = useState<string | "">("");
  const [age, setAge] = useState("");
  const [neutered, setNeutered] = useState("");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [currentChatRoomId, setCurrentChatRoomId] = useState<number | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);

  const [targetUserImageUrl, setTargetUserImageUrl] = useState<string | null>(null);
  const [targetUserNickname, setTargetUserNickname] = useState<string | null>(null);

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
    setGender(e.target.value);
  };

  const handleAge = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(e.target.value);
  };

  const handleNeutered = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNeutered(e.target.value);
  };

  useEffect(() => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  // 🔹 파일 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        localStorage.setItem("uploadedImage", base64String); // 🔹 localStorage에 저장
      };
      reader.readAsDataURL(file);
    }
  };

  // 파일 삭제 핸들러
  const handleRemoveImage = () => {
    setImagePreview(null);

    localStorage.removeItem("uploadedImage"); // localStorage에서도 삭제
  };

  useEffect(() => {
    const loginCheck = async () => {
      const memberResponse = await axios.get(`${backUrl}/api/v1/members/me`, {
        withCredentials: true,
      });

      setMember(memberResponse.data.id);
    };

    loginCheck();
    console.log(1234);
  }, [findDetail]);

  const handleFindDetail = async (postId: number) => {
    try {
      const detailResponse = await axios.get(`${backUrl}/find/${postId}`, {});
      setFindDetail(detailResponse.data);
      // console.log(findDetail);
    } catch (error) {
      console.error("Failed to fetch pet details:", error);
    }
  };

  const openDetailModal = async (postId: number) => {
    handleFindDetail(postId);
    // console.log(findDetail);
    console.log("Updated findDetail:", findDetail);
    setIsFindDetailModalOpen(true);
  };

  const handleFindUpdateSubmit = async (postId: number) => {
    if (isLoggedIn) {
      const memberResponse = await axios.get(`${backUrl}/api/v1/members/me`, {
        withCredentials: true,
      });

      const member_id = memberResponse.data.id;

      try {
        const response = await fetch(`${backUrl}/find/update/${postId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            situation: situation,
            breed: breed,
            location: "서울 강남구 어딘가",
            geo: 123,
            name: name,
            color: color,
            etc: etc,
            gender: gender,
            age: age,
            neutered: neutered,
            find_date: "2025-02-27T00:00:00",
            member_id: member_id,
            shelter_id: 1,
            path_url: imagePreview,
          }),
          credentials: "include",
        });

        if (response.ok) {
          alert("발견 신고가 성공적으로 수정 되었습니다!");
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
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        onClick={() => {
          openDetailModal(pet.id);
        }}
      >
        <img src={pet.path_url ? pet.path_url : DEFAULT_IMAGE_URL} alt={`실종동물`} className="w-full h-20 object-cover" />
        <div className="p-3">
          <div className="font-medium mb-3">{pet.breed}</div>
          <div className="space-y-1">
            <div className="text-xs flex gap-4">
              <span className="text-gray-600 w-12">특징</span>
              <span className="flex-1 truncate">{pet.etc}</span>
            </div>
            <div className="text-xs flex gap-4">
              <span className="text-gray-600 w-12">발견장소</span>
              <span className="flex-1 truncate">{pet.location}</span>
            </div>
          </div>
        </div>
      </div>

      {isFindDetailModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* 반투명 배경 */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsFindDetailModalOpen(false)} // 배경 클릭시 모달 닫기
            ></div>

            {/* findDetail 매핑은 모달 컨테이너 안에서 수행 */}
            {findDetail ? (
              findDetail.member_id === member ? (
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
                          defaultValue={findDetail.title}
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
                          defaultValue={findDetail.situation}
                        />
                      </div>

                      <div className="mb-4 flex justify-between">
                        <div className="mr-4 w-20">
                          <label className="block font-medium mb-2 ">견종</label>
                          <input className="border p-2 w-full bg-white" placeholder="견종" defaultValue={findDetail.breed} onChange={handleBreed} />
                        </div>
                        <div className="mr-4 w-20">
                          <label className="block font-medium mb-2 ">색상</label>
                          <input className="border p-2 w-full bg-white" placeholder="색상" defaultValue={findDetail.color} onChange={handleColor} />
                        </div>
                        <div className="w-20">
                          <label className="block font-medium mb-2 ">이름</label>
                          <input className="border p-2 w-full bg-white" placeholder="이름" defaultValue={findDetail.name} onChange={handleName} />
                        </div>
                      </div>
                      <div className="mb-4 flex justify-between">
                        <div className="mr-4 w-20">
                          <label className="block font-medium mb-2 ">성별</label>
                          {/* <input className="border p-2 w-full bg-white" placeholder="성별" onChange={handleGender} /> */}
                          <select className="border p-2 w-full bg-white" onChange={handleGender}>
                            <option value="미상">미상</option>
                            <option value="수컷">수컷</option>
                            <option value="암컷">암컷</option>
                          </select>
                        </div>
                        <div className="mr-4 w-20">
                          <label className="block font-medium mb-2 ">중성화</label>
                          {/* <input className="border p-2 w-full bg-white" placeholder="중성화 여부" onChange={handleNeutered} /> */}
                          <select className="border p-2 w-full bg-white" onChange={handleNeutered}>
                            <option value="">미상</option>
                            <option value="true">중성화 됌</option>
                            <option value="false">중성화 안됌</option>
                          </select>
                        </div>
                        <div className="w-20">
                          <label className="block font-medium mb-2 ">나이</label>
                          <input className="border p-2 w-full bg-white" placeholder="나이" defaultValue={findDetail.age} onChange={handleAge} />
                        </div>
                      </div>
                    </div>
                    <div className="w-80">
                      {/* <div className="w-20 h-20 bg-pink">지도 들어갈 곳</div> */}
                      <NcpMap currentLocation={findLocation} findDetail={findDetail}/>
                      <div className="mb-4 ">
                        <label className="block font-medium mb-2 ">특이 사항</label>
                        <textarea
                          className="border p-2 w-full bg-white resize-none"
                          rows={2}
                          placeholder="특이사항"
                          defaultValue={findDetail.etc}
                          onChange={handleEtc}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 h-6">
                    <button
                      className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
                      onClick={() => {
                        handleFindUpdateSubmit(pet.id);
                        setIsFindDetailModalOpen(false);
                      }}
                    >
                      수정하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
                  {/* 모달 헤더 */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">반려동물 발견</h2>
                  </div>

                  {/* 모달 내용(이미지, 폼 등) */}
                  <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.</p>

                  <div className="space-between text-[15px]">
                    {/* 예: 사진 업로드, 위치, 기타 폼 */}
                    <div className="w-80">
                      <div className="mb-4 ">
                        <label className="block font-medium mb-2">* 제목</label>
                        <div className="w-full bg-white text-gray-500 text-gray-500">{findDetail.title}</div>
                      </div>

                      <div className="mb-4">
                        <label className="block font-medium mb-2">반려동물 사진</label>
                        <div className="mt-2 flex">
                          <img src={findDetail.path_url || DEFAULT_IMAGE_URL} alt="반려동물 사진" className="w-60 h-60 object-cover rounded" />
                        </div>
                      </div>

                      <div className="mb-4 ">
                        <label className="block font-medium mb-2 ">* 발견 상황</label>
                        <div className="w-full bg-white text-gray-500">{findDetail.situation}</div>
                      </div>

                      <div className="mb-4 flex justify-between">
                        <div className="mr-4 w-20">
                          <label className="block font-medium mb-2 ">견종</label>
                          <div className="w-full bg-white text-gray-500">{findDetail.breed}</div>
                        </div>
                        <div className="mr-4 w-20">
                          <label className="block font-medium mb-2 ">색상</label>
                          <div className="w-full bg-white text-gray-500">{findDetail.color}</div>
                        </div>
                        <div className="w-20">
                          <label className="block font-medium mb-2 ">이름</label>
                          <div className="w-full bg-white text-gray-500">{findDetail.name}</div>
                        </div>
                      </div>
                      <div className="mb-4 flex justify-between">
                        <div className="mr-4 w-20">
                          <label className="block font-medium mb-2 ">성별</label>
                          <div className="w-full bg-white text-gray-500">{findDetail.gender}</div>
                        </div>
                        <div className="mr-4 w-20">
                          <label className="block font-medium mb-2 ">중성화</label>
                          <div className="w-full bg-white text-gray-500">{findDetail.neutered ? "했음" : "안함"}</div>
                        </div>
                        <div className="w-20">
                          <label className="block font-medium mb-2 ">나이</label>
                          <div className="w-full bg-white text-gray-500">{findDetail.age}</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-80">
                      <div className="w-20 h-20 bg-pink">지도 들어갈 곳</div>
                      <div className="mb-4 ">
                        <label className="block font-medium mb-2 ">특이 사항</label>
                        <div className="w-full bg-white text-gray-500">{findDetail.etc}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 h-6">
                    <button 
                      className="px-4 py-0 rounded bg-gray-200 hover:bg-gray-300" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        
                        if (!isLoggedIn) {
                          alert("로그인이 필요한 서비스입니다.");
                          window.location.href = "/login"; // 로그인 페이지로 이동
                          return;
                        }
                        
                        try {
                          const response = await axios.post(`${backUrl}/api/v1/chat/rooms`, 
                            { targetUserId: findDetail.member_id },
                            { withCredentials: true }
                          );
                          console.log("채팅방 생성/조회 응답:", response.data);
                          // 생성된 채팅방 ID 확인
                          console.log("생성된 채팅방 ID:", response.data.data.id);

                          // 타켓 유저 프로필 사진
                          setTargetUserImageUrl(response.data.data.targetUserImageUrl);
                          // 타켓 유저 닉네임
                          setTargetUserNickname(response.data.data.targetUserNickname);
                          
                          const chatRoomId = response.data.data.id;
                          setCurrentChatRoomId(chatRoomId);
                          setIsChatModalOpen(true);
                          setIsFindDetailModalOpen(false);
                          setInitialMessages(response.data.data.chatMessages);

                        } catch (err: any) {
                          console.error("채팅방 생성 오류:", err);
                          alert("채팅방을 생성하는 중 오류가 발생했습니다.");
                        }
                      }}
                    >
                      연락하기
                    </button>
                    <button
                      className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
                      onClick={() => {
                        setIsFindDetailModalOpen(false);
                      }}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
                <p className="text-center py-4">데이터를 불러오는 중입니다...</p>
              </div>
            )}
          </div>,
          document.body
        )}
      {/* 채팅 모달 컴포넌트 사용 */}
      <ChatModal 
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        petImage={findDetail?.path_url || ""}
        petBreed={findDetail?.breed || ""}
        targetUserImageUrl={targetUserImageUrl}
        targetUserNickname={targetUserNickname}
        petLocation={findDetail?.location || ""}
        defaultImageUrl={DEFAULT_IMAGE_URL}
        chatRoomId={currentChatRoomId}
        targetUserId={findDetail?.member_id}
      />
    </>
  );
}
