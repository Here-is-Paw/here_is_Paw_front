import {Button} from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog.tsx";
import React, {useEffect, useState} from "react";
import {
    MissingDetailData,
    // MissingFormData,
    missingUtils,
    parseLocation,
} from "@/types/missing.ts";
import {petUtils} from "@/types/pet.common.ts";
import axios from "axios";
import {backUrl} from "@/constants.ts";
import {useChatContext} from "@/contexts/ChatContext.tsx";
import LocationViewMap from "@/components/location/locationViewMap";
import {usePetContext} from "@/contexts/PetContext.tsx"; // 새 컴포넌트 임포트
import {UserSearchPopup} from "@/components/petPost/missingPost/reward/UserSearchPopup.tsx"; // 새 컴포넌트 임포트
import {Pencil} from "lucide-react";
import {useAuth} from "@/contexts/AuthContext";
import {MissingUpdateFormPopup} from "./missingUpdate";
import {useChatContact} from "@/hooks/chat/useChatContact.tsx";

// ChatModal에 필요한 정보를 담는 인터페이스
export interface ChatModalInfo {
    isOpen: boolean;
    targetUserImageUrl: string | null;
    targetUserNickname: string | null;
    chatRoomId: number | null;
}

interface MissingDetailProps {
    petId: number | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // ChatModal 관련 정보를 상위 컴포넌트로 전달하는 콜백 함수 추가
    onChatModalOpen: (chatInfo: ChatModalInfo) => void;
    onSuccess?: () => void;
}

export const MissingDetail: React.FC<MissingDetailProps> = ({
                                                                petId,
                                                                open,
                                                                onOpenChange,
                                                                onChatModalOpen,
                                                                onSuccess,
                                                            }) => {
    const [pet, setPet] = useState<MissingDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isMissingAddOpen, setIsMissingAddOpen] = useState(false);
    const [showUserSearchPopup, setShowUserSearchPopup] = useState<boolean>(false);

    const {refreshPets} = usePetContext();
    const {mainAddress, detailAddress} = parseLocation(pet?.location || "");
    const {refreshChatRooms} = useChatContext();
    const {handleContactClick, isContacting} = useChatContact(refreshChatRooms);
    const loginUser = useAuth();

    useEffect(() => {
        const fetchPetDetail = async () => {
            if (!open || !petId) return;

            setLoading(true);
            setError(null);

            // console.log("loginUser", loginUser);

            try {
                const response = await axios.get(`${backUrl}/api/v1/missings/${petId}`);

                if (response.data && response.data.data) {
                    setPet(response.data.data);
                    console.log("미씽 디테일 불러온 데이터:", response.data.data);
                } else {
                    setError("데이터를 불러올 수 없습니다.");
                }
            } catch (err) {
                console.error("펫 상세 정보 로드 오류:", err);
                setError("펫 정보를 가져오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchPetDetail();
    }, [petId, open]);

    // 컴포넌트가 마운트되거나 pet 데이터가 변경될 때 콘솔에 데이터 출력
    useEffect(() => {
        if (open && pet) {
            console.log("미씽 디테일 불러온 데이터:", {
                이름: pet.name,
                품종: pet.breed,
                나이: pet.age,
                성별: pet.gender,
                색상: pet.color,
                중성화여부: pet.neutered,
                등록번호: pet.serialNumber,
                특이사항: pet.etc,
                이미지경로: pet.pathUrl,
                전체데이터: pet,
            });

            // 작성자 ID 확인 (타입 캐스팅으로 타입 에러 방지)
            const petAny = pet as any;
            if (petAny.authorId) {
                console.log("작성자 ID 확인:", petAny.authorId);
            } else if (petAny.member_id) {
                console.log("작성자 ID 확인:", petAny.member_id);
            } else if (petAny.memberId) {
                console.log("작성자 ID 확인:", petAny.memberId);
            } else if (petAny.userId) {
                console.log("작성자 ID 확인:", petAny.userId);
            } else if (petAny.ownerId) {
                console.log("작성자 ID 확인:", petAny.ownerId);
            } else {
                console.log("작성자 ID를 찾을 수 없음. 전체 데이터 확인:", pet);
            }
        }
    }, [pet, open]);

    if (!pet) return null;

    const handleDeleteClick = async (missingId: number) => {
        if (confirm("정말 삭제하시겠습니까?")) {
            try {
                const response = await axios.delete(
                    `${backUrl}/api/v1/missings/${missingId}`,
                    {
                        withCredentials: true,
                    }
                );

                if (response.status === 200 || response.status === 201) {
                    alert("발견 신고가 성공적으로 삭제되었습니다!");

                    await refreshPets();

                    // 모달 닫기
                    onOpenChange(false);

                    // 삭제 성공 후 실행할 콜백 함수 호출
                    if (onSuccess) {
                        onSuccess();
                    }
                } else {
                    alert("삭제 실패!");
                }
            } catch (err) {
                console.error("Failed to delete pet details:", err);
                alert("오류가 발생했습니다.");
            }
        }
    };

    // 연락하기 버튼 핸들러
    const handleContactButtonClick = async () => {
        await handleContactClick({
            pet,
            onOpenChange,
            onChatModalOpen,
            source: "missing_detail" // MissingDetail에서는 "missing_detail"
        });
    };

    // 사례금 전달하기 버튼 핸들러
    const handleRewardClick = () => {
        // 로그인 여부 확인
        if (loginUser == null || undefined) {
            alert("로그인이 필요한 서비스입니다.");
        }

        // 사례금이 0원이면 알림
        if (!pet.reward || pet.reward <= 0) {
            handleRewardSuccess();
            return;
        }

        // 사용자 검색 팝업 열기
        setShowUserSearchPopup(true);
    };

    // 사례금 전달 완료 후 처리
    const handleRewardSuccess = () => {
        // 필요한 경우 서버에서 새로운 데이터 로드
        if (petId) {
            axios
                .patch(
                    `${backUrl}/api/v1/missings/${petId}/done`,
                    {state: 2},
                    {withCredentials: true}
                )
                .then((response) => {
                    if (response.data.statusCode === 200) {
                        onOpenChange(false);
                        refreshPets();
                    }
                })
                .catch((err) => {
                    console.error("게시글 비활성화 중 오류:", err);
                });
        }
    };

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-full w-[500px] h-5/6 py-6 px-0 bg-white">
                    <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">데이터를 불러오는 중...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error || !pet) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-full w-[500px] h-5/6 py-6 px-0 bg-white">
                    <div className="flex justify-center items-center h-full flex-col">
                        <p className="text-red-500">데이터를 불러올 수 없습니다.</p>
                        <Button onClick={() => onOpenChange(false)} className="mt-4">
                            닫기
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-full w-[500px] h-5/6 py-6 px-0 bg-white">
                    <DialogHeader className="space-y-2 text-center px-6">
                        <DialogTitle className="text-2xl font-bold text-primary">
                            잃어버렸개
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            잃어버렸개 상세정보
                        </DialogDescription>
                    </DialogHeader>

                    {/* 내용 영역 */}
                    <div className="px-6 py-4 overflow-auto">
                        <div className="flex flex-col items-center mb-6">
                            <div className="h-60 w-full mb-4">
                                {pet?.pathUrl && (
                                    <img
                                        src={pet.pathUrl}
                                        alt={pet.name || "이름 없음"}
                                        className="object-contain w-full h-full"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500">이름</dt>
                                <dd>{pet.name || "이름 없음"}</dd>
                            </dl>
                            <dl>
                                <dt className="text-sm font-medium text-gray-500">품종</dt>
                                <dd>{pet.breed || "품종 미상"}</dd>
                            </dl>
                            <dl>
                                <dt className="text-sm font-medium text-gray-500">색상</dt>
                                <dd>{pet.color || "정보 없음"}</dd>
                            </dl>
                            <dl>
                                <dt className="text-sm font-medium text-gray-500">나이</dt>
                                <dd>{pet.age ? `${pet.age}살` : "나이 미상"}</dd>
                            </dl>
                            <dl>
                                <dt className="text-sm font-medium text-gray-500">성별</dt>
                                <dd>{petUtils.getGenderText(pet.gender || 0)}</dd>
                            </dl>
                            <dl>
                                <dt className="text-sm font-medium text-gray-500">
                                    중성화 여부
                                </dt>
                                <dd>{petUtils.getNeuteredText(pet.neutered || 0)}</dd>
                            </dl>
                            <dl>
                                <dt className="text-sm font-medium text-gray-500">등록 번호</dt>
                                <dd>{pet.serialNumber || "등록번호 없음"}</dd>
                            </dl>
                            <dl>
                                <dt className="text-sm font-medium text-gray-500">실종 날짜</dt>
                                <dd>{pet.lostDate || "실종 날짜 없음"}</dd>
                            </dl>
                            <dl className="col-span-2">
                                <dt className="text-sm font-medium text-gray-500">지역</dt>

                                <dd>
                                    {`${mainAddress} ${detailAddress || ""}`}

                                    <div className="mt-1">
                                        <LocationViewMap
                                            location={{x: pet.x, y: pet.y, address: pet.location}}
                                        />
                                    </div>
                                </dd>
                            </dl>
                            <dl className="col-span-2">
                                <dt className="text-sm font-medium text-gray-500">특이사항</dt>
                                <dd>{pet.etc || "특이사항 없음"}</dd>
                            </dl>
                            <dl className="col-span-2">
                                <dt className="text-sm font-medium text-gray-500">사례금</dt>
                                <dd>{missingUtils.formatReward(pet.reward || 0)}</dd>
                            </dl>
                        </div>
                    </div>

                    <DialogFooter className="px-6">
                        {loginUser.userData?.id === pet.memberId ? (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    className="bg-amber-500 hover:bg-amber-600"
                                    onClick={handleRewardClick}
                                >
                                    사례금 전달하기
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-1"
                                    onClick={(e) => {
                                        e.stopPropagation(); // 이벤트 전파 중지
                                        // handleUpdateClick();
                                        setIsMissingAddOpen(true);
                                        onOpenChange(false);
                                    }}
                                >
                                    <Pencil className="h-4 w-4"/>
                                    <span>정보 수정</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-1 bg-destructive focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-destructive/80"
                                    onClick={() => handleDeleteClick(pet.id)}
                                >
                                    <span className="text-destructive-foreground">삭제</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-2 w-full">
                                <Button
                                    type="button"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={handleContactButtonClick}
                                    disabled={isContacting}
                                >
                                    {isContacting ? "연결 중..." : "연락하기"}
                                </Button>
                            </div>
                        )
                        }

                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 실종 신고 수정 폼 */}
            <MissingUpdateFormPopup
                open={isMissingAddOpen}
                onOpenChange={setIsMissingAddOpen}
                missingId={pet.id}
                pet={pet}
            />

            {/* UserSearchPopup 컴포넌트 */}
            {petId && (
                <UserSearchPopup
                    open={showUserSearchPopup}
                    onOpenChange={setShowUserSearchPopup}
                    petId={petId}
                    rewardAmount={pet.reward || 0}
                    onSuccess={handleRewardSuccess}
                />
            )}
        </>
    );
};
