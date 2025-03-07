import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useEffect, useState, useRef, useCallback } from "react";
import { MissingData } from "@/types/missing";
import { MissingCard } from "./missingCard";
import axios from "axios";
import { MissingDetail, ChatModalInfo } from "./missingDetail";
import { ChatModal } from "@/components/chat/ChatModal";

interface MissingListProps {
  activeFilter: string;
  backUrl: string;
}

export function MissingList({ activeFilter, backUrl }: MissingListProps) {
  const [pets, setPets] = useState<MissingData[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true); // 추가 데이터 존재 여부
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<MissingData | null>(null);
  const [initialLoad, setInitialLoad] = useState<boolean>(true); // 초기 로딩 상태

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

  // 데이터 가져오기 함수
  const fetchMissingPets = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${backUrl}/api/v1/missings?page=${pageNum}&size=10`,
          {
            withCredentials: true,
          }
        );

        const newPets = response.data.data.content || [];
        const isLast = response.data.data.last || false;

        console.log("Fetched page:", pageNum, "Data:", newPets);

        if (pageNum === 0) {
          setPets(newPets); // 첫 페이지면 데이터 교체
        } else {
          setPets((prevPets) => [...prevPets, ...newPets]); // 기존 데이터에 추가
        }

        // 마지막 페이지인지 확인
        setHasMore(!isLast);

        return newPets;
      } catch (error) {
        console.error("실종 동물 정보 가져오기 실패:", error);
        if (pageNum === 0) {
          setPets([]);
        }
        setHasMore(false);
        return [];
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [backUrl]
  );

  // 초기 데이터 로드
  useEffect(() => {
    fetchMissingPets(0);
    // 페이지 초기화
    setPage(0);
  }, [fetchMissingPets]);

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
      if (entry.isIntersecting && hasMore && !loading && !initialLoad) {
        console.log("Loading more data...");
        setPage((prevPage) => {
          const nextPage = prevPage + 1;
          fetchMissingPets(nextPage);
          return nextPage;
        });
      }
    };

    // observer 인스턴스 생성
    observerRef.current = new IntersectionObserver(handleObserver, options);

    // 로딩 요소 관찰 시작
    if (loadingRef.current && hasMore) {
      observerRef.current.observe(loadingRef.current);
    }

    // 클린업 함수
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, fetchMissingPets, initialLoad]);

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

  const handleSwiperReachEnd = () => {
    if (hasMore && !loading && !initialLoad && activeFilter === "전체") {
      console.log("Swiper reached end, loading more data...");
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchMissingPets(nextPage);
        return nextPage;
      });
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
          {pets.length > 0 ? (
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
                    // scrollbar={{
                    //   el: ".swiper-scrollbar",
                    //   draggable: true,
                    // }}
                    // modules={[Scrollbar]}
                    onReachEnd={handleSwiperReachEnd}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    className="relative"
                  >
                    {pets.map((pet, index) => (
                      <SwiperSlide
                        key={`missing-slide${pet.id}${index}`}
                        className="w-40 pb-2"
                      >
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => handlePetSelect(pet)}
                        >
                          <div className="p-2">
                            <MissingCard activeFilter={"전체"} pet={pet} />
                          </div>
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="p-2">
                    <ul className="grid grid-cols-2 gap-2">
                      {pets.map((pet, index) => (
                        <li key={`missing-list${pet.id}${index}`}>
                          <button
                            type="button"
                            className="text-left w-full"
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
                      {loading && hasMore && <p>더 불러오는 중...</p>}
                      {!hasMore && pets.length > 0 && (
                        <p className="text-gray-500 text-sm">
                          모든 데이터를 불러왔습니다
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
            </>
          ) : (
            <>
              <p className="p-4 text-center text-red-500">데이터가 없습니다.</p>
            </>
          )}
        </>
      )}
    </>
  );
}
