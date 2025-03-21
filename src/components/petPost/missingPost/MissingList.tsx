import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import { MissingCard } from "./MissingCard.tsx";
import { MissingDetail, ChatModalInfo } from "./MissingDetail.tsx";
import { ChatModal } from "@/components/chat/ChatModal.tsx";
import { usePetContext } from "@/contexts/PetContext.tsx";
import { PetList } from "@/types/mypet.ts";

export function MissingList() {
  // Context에서 데이터와 상태 가져오기
  const {
    missingPets, // filteredPets 대신 missingPets 사용
    activeFilter,
    isLoading,
    missingHasMore,
    loadMorePets,
  } = usePetContext();

  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<PetList | null>(null);

  const swiperRef = useRef<any>(null);

  // 무한 스크롤링을 위한 observer ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // ChatModal 관련 상태 추가
  const [chatModalInfo, setChatModalInfo] = useState<ChatModalInfo>({
    isOpen: false,
    targetUserImageUrl: null,
    targetUserNickname: null,
    chatRoomId: null,
  });

  const DEFAULT_IMAGE_URL =
    "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

  // 초기 로드 상태 업데이트
  useEffect(() => {
    if (!isLoading) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  // Intersection Observer 설정
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    // observer 콜백 함수
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        missingHasMore &&
        !isLoading &&
        !initialLoad
      ) {
        // 여기를 수정: "missing" 타입 명시적으로 전달
        loadMorePets("missing");
      }
    };

    // observer 인스턴스 생성
    observerRef.current = new IntersectionObserver(handleObserver, options);

    // 로딩 요소 관찰 시작
    if (loadingRef.current && missingHasMore) {
      observerRef.current.observe(loadingRef.current);
    }

    // 클린업 함수
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [missingHasMore, isLoading, loadMorePets, initialLoad]);

  // 펫 선택 핸들러 추가
  const handlePetSelect = (pet: PetList) => {
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

  const handleSwiperReachEnd = () => {
    if (
      missingHasMore &&
      !isLoading &&
      !initialLoad &&
      activeFilter === "전체"
    ) {
      // 여기를 수정: "missing" 타입 명시적으로 전달
      loadMorePets("missing");
    }
  };

  return (
    <>
      {initialLoad ? (
        <div className="p-4 text-center">
          <p>데이터를 불러오는 중...</p>
        </div>
      ) : (
        <>
          {missingPets.length > 0 ? (
            <>
              <div
                className={`h-auto ${
                  activeFilter !== "전체" ? `overflow-y-auto` : ``
                }`}
              >
                {activeFilter === "전체" ? (
                  <Swiper
                    slidesPerView={"auto"}
                    spaceBetween={8}
                    pagination={{
                      type: "fraction",
                    }}
                    navigation={true}
                    modules={[Pagination, Navigation]}
                    onReachEnd={handleSwiperReachEnd}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    className="relative"
                  >
                    {missingPets.map((pet, index) => (
                      <SwiperSlide
                        key={`missing-slide${pet.id}${index}`}
                        className="w-40 pb-2"
                      >
                        <button
                          type="button"
                          className="text-left p-0"
                          onClick={() => handlePetSelect(pet)}
                        >
                          <div>
                            <MissingCard activeFilter={"전체"} pet={pet} />
                          </div>
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="p-2">
                    <p className="mb-2 text-sm text-right text-gray-400">
                      실종 게시글: {missingPets.length}
                    </p>
                    <ul className="grid grid-cols-2 gap-2">
                      {missingPets.map((pet, index) => (
                        <li key={`missing-list${pet.id}${index}`}>
                          <button
                            type="button"
                            className="text-left w-full p-0"
                            onClick={() => handlePetSelect(pet)}
                          >
                            <div className="w-full">
                              <MissingCard
                                activeFilter={"잃어버렸개"}
                                pet={pet}
                              />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* 로딩 상태 표시 및 Intersection Observer 타겟 */}
                    <div ref={loadingRef} className="py-4 text-center">
                      {isLoading && missingHasMore && <p>더 불러오는 중...</p>}
                      {!missingHasMore && missingPets.length > 0 && (
                        <p className="text-gray-500 text-sm">
                          모든 데이터를 불러왔습니다.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 모달은 한 번만 렌더링 */}
                <MissingDetail
                  petId={selectedPet?.id}
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
            </>
          ) : (
            <>
              <p className="p-4 text-center text-gray-400">
                등록된 실종 게시글이 없습니다.
              </p>
            </>
          )}
        </>
      )}
    </>
  );
}
