import axios from "axios";
import React, { useEffect, useState } from "react";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { FindingUpdateFormPopup } from "@/components/petPost/findingPost/FindingUpdate.tsx";
import { ToastAlert } from "@/components/alert/ToastAlert.tsx";
import { Button } from "@/components/ui/button.tsx";

// Context and Constants
import { usePetContext } from "@/contexts/PetContext.tsx";
import { backUrl } from "@/constants.ts";
import { useAuth } from "@/contexts/AuthContext";

// Type
import { FindingDetailData } from "@/types/finding.ts";
import { petUtils } from "@/types/pet.common.ts";

// Chat
import { useChatContact } from "@/hooks/chat/useChatContact.tsx";
import { useChatContext } from "@/contexts/ChatContext.tsx";
import LocationViewMap from "@/components/location/locationViewMap";
import { Pencil } from "lucide-react";

// ChatModal에 필요한 정보를 담는 인터페이스
export interface ChatModalInfo {
  isOpen: boolean;
  targetUserImageUrl: string | null;
  targetUserNickname: string | null;
  chatRoomId: number | null;
}

interface FindingDetailProps {
  petId: number | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // ChatModal 관련 정보를 상위 컴포넌트로 전달하는 콜백 함수 추가
  onChatModalOpen: (chatInfo: ChatModalInfo) => void;
  onSuccess?: () => void;
}

export const FindingDetail: React.FC<FindingDetailProps> = ({
  petId,
  open,
  onOpenChange,
  onChatModalOpen,
  onSuccess,
}) => {
  const [pet, setPet] = useState<FindingDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFindingAddOpen, setIsFindingAddOpen] = useState(false);
  const { userData } = useAuth();
  const { refreshPets } = usePetContext();
  const { refreshChatRooms } = useChatContext();
  const { handleContactClick, isContacting } = useChatContact(refreshChatRooms);

  // Toast 알림 상태
  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });

  const showToast = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setToast({
      open: true,
      type,
      title,
      message,
    });
  };

  useEffect(() => {
    const fetchPetDetail = async () => {
      if (!open || !petId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${backUrl}/api/v1/finding/${petId}`);

        if (response.data && response.data.data) {
          setPet(response.data.data);
          console.log("파인딩 디테일 불러온 데이터:", response.data.data);
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
      console.log("파인드 디테일 불러온 데이터:", {
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

  const handleDeleteClick = async (findId: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await axios.delete(
          `${backUrl}/api/v1/finding/${findId}`,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200 || response.status === 201) {
          showToast(
            "success",
            "발견 신고 삭제 완료",
            "발견 신고가 성공적으로 삭제되었습니다."
          );

          await refreshPets();

          // 모달 닫기
          onOpenChange(false);

          // 삭제 성공 후 실행할 콜백 함수 호출
          if (onSuccess) {
            onSuccess();
          }
        } else {
          showToast(
            "error",
            "발견 신고 삭제 실패",
            "발견신고 삭제에 실패했습니다."
          );
        }
      } catch (err) {
        console.error("Failed to delete pet details:", err);
        showToast(
          "error",
          "발견 신고 삭제 실패",
          "발견신고 삭제에 실패했습니다."
        );
      }
    }
  };

  const handleContactButtonClick = async () => {
    await handleContactClick({
      pet,
      onOpenChange,
      onChatModalOpen,
      source: "finding_detail", // MissingDetail에서는 "missing_detail"
    });
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
        <DialogContent className="w-[calc(100%-1rem)] max-w-[500px] rounded h-5/6 py-6 px-0 bg-white">
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
        {/* Toast 알림 */}
        <ToastAlert
          open={toast.open}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={3000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        />
        <DialogContent
          className="w-[calc(100%-1rem)] max-w-[500px] rounded h-5/6 py-6 px-0 bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="space-y-2 text-left px-3 md:px-6">
            <DialogTitle className="text-2xl font-bold text-primary">
              발견했개
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              발견했개 상세정보
            </DialogDescription>
          </DialogHeader>

          {/* 내용 영역 */}
          <div className="px-3 md:px-6 py-4 overflow-auto">
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
                <dd>{pet.name || "이름 미상"}</dd>
              </dl>
              <dl>
                <dt className="text-sm font-medium text-gray-500">견종</dt>
                <dd>{pet.breed || "견종 미상"}</dd>
              </dl>
              <dl>
                <dt className="text-sm font-medium text-gray-500">색상</dt>
                <dd>{pet.color || "색상 미상"}</dd>
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
                <dd>{pet.serialNumber || "등록번호 미상"}</dd>
              </dl>
              <dl>
                <dt className="text-sm font-medium text-gray-500">발견 날짜</dt>
                <dd>
                  {pet.findDate ? pet.findDate.split("T")[0] : "발견 날짜 없음"}
                </dd>
              </dl>
              <dl className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">지역</dt>
                <dd>
                  {pet.location || "지역 없음"}

                  <div className="mt-1">
                    <LocationViewMap
                      location={{ x: pet.x, y: pet.y, address: pet.location }}
                      isMissing={false}
                    />
                  </div>
                </dd>
              </dl>
              <dl className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">상세 주소</dt>
                <dd>{pet.detailAddr || "상세 주소 없음"}</dd>
              </dl>
              <dl className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">발견 상황</dt>
                <dd>{pet.etc || "발견 상황 없음"}</dd>
              </dl>
              {/* <dl className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">발견 당시 상황</dt>
                <dd>{pet.situation || "발견 상황 없음"}</dd>
              </dl> */}
            </div>
          </div>

          <DialogFooter className="flex-row flex-wrap-reverse px-3 md:px-6 gap-2">
            {userData?.id === pet.memberId ? (
              <div className="flex-1 flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-1 bg-destructive focus:outline-none hover:bg-destructive/80"
                  onClick={() => handleDeleteClick(pet.id)}
                >
                  <span className="text-destructive-foreground">삭제</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 전파 중지
                    setIsFindingAddOpen(true);
                    onOpenChange(false);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  <span>수정</span>
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex justify-end gap-1">
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleContactButtonClick}
                  disabled={isContacting}
                >
                  {isContacting ? "연결 중..." : "연락하기"}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FindingUpdateFormPopup
        open={isFindingAddOpen}
        onOpenChange={setIsFindingAddOpen}
        findId={pet.id}
        pet={pet}
      />
    </>
  );
};
