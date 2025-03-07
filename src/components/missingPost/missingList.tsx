import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination } from "swiper/modules";
import { useEffect, useState } from "react";
import { MissingData } from "@/types/missing";
import { MissingCard } from "./missingCard";
import axios from "axios";
import { MissingDetail, ChatModalInfo } from "./missingDetail";
import { Pagination } from "swiper/modules";
import { ChatModal } from "@/components/chat/ChatModal";

interface MissingListProps {
  backUrl: string;
}

export function MissingList({ backUrl }: MissingListProps) {
  const [pets, setPets] = useState<MissingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // 선택된 펫을 추적하는 상태 추가
  const [selectedPet, setSelectedPet] = useState<MissingData | null>(null);

  // ChatModal 관련 상태 추가
  const [chatModalInfo, setChatModalInfo] = useState<ChatModalInfo>({
    isOpen: false,
    targetUserImageUrl: null,
    targetUserNickname: null,
    chatRoomId: null,
  });
  const DEFAULT_IMAGE_URL =
    "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

  useEffect(() => {
    const fetchMissingPoints = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${backUrl}`, {
          withCredentials: true,
        });

        // console.log("missing", response.data.data);

        setPets(response.data.data.content || []);
        setLoading(false);

        console.log("missingList", response.data.data);

        return response.data.data.content;
      } catch (error) {
        console.error("포인트 정보 가져오기 실패:", error);
        setPets([]);
        setLoading(false);
      }
    };

    fetchMissingPoints();
  }, [backUrl]);

  // console.log("missingList", pets);

  // 펫 선택 핸들러 추가
  const handlePetSelect = (pet: MissingData) => {
    setSelectedPet(pet);
    setIsOpen(true);
  };

  // ChatModal을 닫는 핸들러
  const handleChatModalClose = () => {
    setChatModalInfo({
      ...chatModalInfo,
      isOpen: false,
    });
  };

  // ChatModalInfo를 받아 상태를 업데이트하는 핸들러
  const handleChatModalOpen = (info: ChatModalInfo) => {
    setChatModalInfo(info);
  };

  return (
    <>
      {loading ? (
        <p>loading...</p>
      ) : (
        <div className="h-auto">
          {/* pb-6에서 pb-2로 변경 */}
          <Swiper
            slidesPerView={"auto"}
            spaceBetween={8}
            pagination={{
              clickable: true,
            }}
            modules={[Pagination]}
            className="relative" // h-full 제거
          >
            {/* {console.log(pets)} */}
            {pets.map((pet) => (
              <SwiperSlide key={`missing${pet.id}`} className="w-40 pb-2">
                <button
                  type="button"
                  className="text-left"
                  onClick={() => handlePetSelect(pet)}
                >
                  <div className="p-2">
                    <MissingCard pet={pet} />
                  </div>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 모달은 한 번만 렌더링 */}
          <MissingDetail
            pet={selectedPet}
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) setSelectedPet(null); // 모달이 닫힐 때 선택된 펫 초기화
            }}
            onChatModalOpen={handleChatModalOpen}
          />

          {/* ChatModal - Dialog 외부에서 관리 */}
          <ChatModal
            isOpen={chatModalInfo.isOpen}
            onClose={handleChatModalClose}
            targetUserImageUrl={chatModalInfo.targetUserImageUrl}
            targetUserNickname={chatModalInfo.targetUserNickname}
            defaultImageUrl={DEFAULT_IMAGE_URL}
            chatRoomId={chatModalInfo.chatRoomId}
          />
        </div>
      )}
    </>
  );
}
