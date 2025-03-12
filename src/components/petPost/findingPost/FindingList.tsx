import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination} from "swiper/modules";
import {useEffect, useRef, useState} from "react";
import {FindingCard} from "./FindingCard.tsx";
import {ChatModal} from "@/components/chat/ChatModal.tsx";
import {usePetContext} from "@/contexts/PetContext.tsx";
import {PetList} from "@/types/mypet.ts";
import {ChatModalInfo, FindingDetail} from "@/components/petPost/findingPost/FindingDetail.tsx";

export function FindingList() {
    // Context에서 데이터와 상태 가져오기
    const {
        findingPets, // filteredPets 대신 missingPets 사용
        activeFilter,
        isLoading,
        findingHasMore,
        loadMorePets
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
            console.log("헤스모어 : ", findingHasMore);
            if (entry.isIntersecting && findingHasMore && !isLoading && !initialLoad) {
                console.log("Loading more finding data...");
                // 여기를 수정: "finding" 타입 명시적으로 전달
                loadMorePets("finding");
            }
        };

        // observer 인스턴스 생성
        observerRef.current = new IntersectionObserver(handleObserver, options);

        // 로딩 요소 관찰 시작
        if (loadingRef.current && findingHasMore) {
            observerRef.current.observe(loadingRef.current);
        }

        // 클린업 함수
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [findingHasMore, isLoading, loadMorePets, initialLoad]);

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
        if (findingHasMore && !isLoading && !initialLoad && activeFilter === "전체") {
            console.log("Swiper reached end, loading more finding data...");
            // 여기를 수정: "finding" 타입 명시적으로 전달
            loadMorePets("finding");
        }
    };

    console.log("findingPet: ", findingPets);

    return (
        <>
            {initialLoad ? (
                <div className="p-4 text-center">
                    <p>데이터를 불러오는 중...</p>
                </div>
            ) : (
                <>
                    {findingPets.length > 0 ? (
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
                                        {findingPets.map((pet, index) => (
                                            <SwiperSlide
                                                key={`finding-slide${pet.id}${index}`}
                                                className="w-40 pb-2"
                                            >
                                                <button
                                                    type="button"
                                                    className="text-left p-0"
                                                    onClick={() => handlePetSelect(pet)}
                                                >
                                                    <div>
                                                        <FindingCard activeFilter={"전체"} pet={pet}/>
                                                    </div>
                                                </button>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                ) : (
                                    <div className="p-2">
                                        <ul className="grid grid-cols-2 gap-2">
                                            {findingPets.map((pet, index) => (
                                                <li key={`finding-list${pet.id}${index}`}>
                                                    <button
                                                        type="button"
                                                        className="text-left w-full p-0"
                                                        onClick={() => handlePetSelect(pet)}
                                                    >
                                                        <div className="w-full">
                                                            <FindingCard
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
                                            {isLoading && findingHasMore && <p>더 불러오는 중...</p>}
                                            {!findingHasMore && findingPets.length > 0 && (
                                                <p className="text-gray-500 text-sm">
                                                    모든 데이터를 불러왔습니다
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 모달은 한 번만 렌더링 */}
                                <FindingDetail
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
                            <p className="p-4 text-center text-red-500">데이터가 없습니다.</p>
                        </>
                    )}
                </>
            )}
        </>
    );
}