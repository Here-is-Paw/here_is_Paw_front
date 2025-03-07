import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import React, { useEffect } from "react";
import { MissingData } from "@/types/missing";
import { X } from "lucide-react";
import axios from "axios";
import { backUrl } from "@/constants";
import { useChatContext } from "@/contexts/ChatContext";
import { chatEventBus } from "@/contexts/ChatContext";

// ChatModal에 필요한 정보를 담는 인터페이스
export interface ChatModalInfo {
  isOpen: boolean;
  targetUserImageUrl: string | null;
  targetUserNickname: string | null;
  chatRoomId: number | null;
}

interface MissingDetailProps {
  pet: MissingData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // ChatModal 관련 정보를 상위 컴포넌트로 전달하는 콜백 함수 추가
  onChatModalOpen: (chatInfo: ChatModalInfo) => void;
}

export const MissingDetail: React.FC<MissingDetailProps> = ({
  pet,
  open,
  onOpenChange,
  onChatModalOpen,
}) => {
  const DEFAULT_IMAGE_URL =
    "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";
  const { refreshChatRooms } = useChatContext();

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

  // gender 값에 따른 표시 문자열 결정
  const getGenderText = (gender: number) => {
    switch (gender) {
      case 0:
        return "정보없음";
      case 1:
        return "수컷";
      case 2:
        return "암컷";
      default:
        return "정보없음";
    }
  };

  // 이미지 URL이 유효한지 확인하고 기본 이미지로 대체하는 함수
  const isKakaoDefaultProfile = (url: string) => {
    return (
      url && url.includes("kakaocdn.net") && url.includes("default_profile")
    );
  };

  const getValidImageUrl = (imageUrl: string | undefined) => {
    if (
      !imageUrl ||
      imageUrl === "profile" ||
      isKakaoDefaultProfile(imageUrl)
    ) {
      return DEFAULT_IMAGE_URL;
    }
    return imageUrl;
  };

  // 닫기 버튼 핸들러
  const handleClose = () => {
    onOpenChange(false);
  };

  // 연락하기 버튼 핸들러
  const handleContactClick = async () => {
    if (!pet) return;

    // 로그인 여부 확인
    const isLoggedIn =
      document.cookie.includes("accessToken") ||
      localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      window.location.href = "/login"; // 로그인 페이지로 이동
      return;
    }

    try {
      // 펫 데이터 확인
      console.log("채팅 대상 펫 데이터:", pet);

      // 작성자 ID를 targetUserId로 사용
      const petAny = pet as any;
      const targetUserId = petAny.authorId || pet.id; // authorId가 없으면 기본값으로 pet.id 사용

      console.log("채팅 요청 targetUserId:", targetUserId);

      const response = await axios.post(
        `${backUrl}/api/v1/chat/rooms`,
        { targetUserId },
        { withCredentials: true }
      );

      console.log("채팅방 생성/조회 응답:", response.data);

      // 타켓 유저 프로필 사진 처리
      const validImageUrl = getValidImageUrl(
        response.data.data.targetUserImageUrl
      );

      // 채팅방 정보 설정
      const chatRoomId = response.data.data.id;
      const targetUserNickname = response.data.data.targetUserNickname;

      // 채팅방 데이터 메시지 배열 초기화 확인
      if (!response.data.data.chatMessages) {
        response.data.data.chatMessages = [];
      }

      // 채팅방 목록에 새 채팅방 추가 이벤트 발행
      chatEventBus.emitAddChatRoom({
        id: chatRoomId,
        chatUserNickname: response.data.data.chatUserNickname,
        chatUserImageUrl: getValidImageUrl(response.data.data.chatUserImageUrl),
        chatUserId: response.data.data.chatUserId,
        targetUserNickname: response.data.data.targetUserNickname,
        targetUserImageUrl: validImageUrl,
        targetUserId: response.data.data.targetUserId,
        chatMessages: [],
        modifiedDate: new Date().toISOString(),
      });

      // 채팅방 목록 갱신 이벤트 발행
      refreshChatRooms();

      // Dialog 닫기
      onOpenChange(false);

      // 부모 컴포넌트에 ChatModal 정보 전달
      onChatModalOpen({
        isOpen: true,
        targetUserImageUrl: validImageUrl,
        targetUserNickname: targetUserNickname,
        chatRoomId: chatRoomId,
      });
    } catch (err: any) {
      console.error("채팅방 생성 오류:", err);

      // 이미 존재하는 채팅방인 경우 (HTTP 409 Conflict)
      if (err.response && err.response.status === 409) {
        console.log("이미 존재하는 채팅방:", err.response.data);

        // 이미 존재하는 채팅방 데이터가 있는 경우
        if (
          err.response.data &&
          err.response.data.data &&
          err.response.data.data.id
        ) {
          const existingChatRoom = err.response.data.data;
          const chatRoomId = existingChatRoom.id;

          // 기존 채팅방 정보 활용하여 채팅방 열기
          const validImageUrl = getValidImageUrl(
            existingChatRoom.targetUserImageUrl
          );
          const targetUserNickname =
            existingChatRoom.targetUserNickname || "상대방";

          // 중요: 채팅방 데이터 메시지 배열 초기화 확인
          if (!existingChatRoom.chatMessages) {
            existingChatRoom.chatMessages = [];
          }

          // 채팅방 목록에 추가
          chatEventBus.emitAddChatRoom({
            id: chatRoomId,
            chatUserNickname: existingChatRoom.chatUserNickname || "사용자",
            chatUserImageUrl: getValidImageUrl(
              existingChatRoom.chatUserImageUrl
            ),
            chatUserId: existingChatRoom.chatUserId,
            targetUserNickname: targetUserNickname,
            targetUserImageUrl: validImageUrl,
            targetUserId: existingChatRoom.targetUserId,
            chatMessages: existingChatRoom.chatMessages || [],
            modifiedDate:
              existingChatRoom.modifiedDate || new Date().toISOString(),
          });

          // 채팅방 목록 갱신
          refreshChatRooms();

          // Dialog 닫기
          onOpenChange(false);

          // 부모 컴포넌트에 ChatModal 정보 전달
          onChatModalOpen({
            isOpen: true,
            targetUserImageUrl: validImageUrl,
            targetUserNickname: targetUserNickname,
            chatRoomId: chatRoomId,
          });

          return;
        }
      }

      // 오류 메시지 구성
      let errorMessage = "채팅방을 생성하는 중 오류가 발생했습니다.";

      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = "잘못된 요청입니다. 입력한 정보를 확인해주세요.";
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "로그인이 필요하거나 권한이 없습니다.";
          window.location.href = "/login";
          return;
        } else if (err.response.status === 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }

        // 서버 응답에 메시지가 있으면 사용
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }

      alert(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogContent className="max-w-[450px] p-0 rounded-xl bg-white shadow-lg overflow-hidden">
          {/* 커스텀 헤더 영역 */}
          <div className="w-full bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">반려동물 상세정보</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 내용 영역 */}
          <div className="px-6 py-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                {pet?.pathUrl && (
                  <AvatarImage
                    src={pet.pathUrl}
                    alt={pet.name || "반려동물"}
                    className="object-cover w-full h-full"
                  />
                )}
                <AvatarFallback>{pet.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{pet.name || "이름 없음"}</h2>
            </div>

            {/**
             * 이름, 견종, 유기견 이미지, 지역, 좌표
             * 색상, 동물 등록 번호, 성별, 중성화 유무, 나이, 실종 날짜, 기타(특징), 사례금
             */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">품종</p>
                <p>{pet.breed || "품종 미상"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">나이</p>
                <p>{pet.age ? `${pet.age}살` : "나이 미상"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">성별</p>
                <p>{getGenderText(pet.gender || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">색상</p>
                <p>{pet.color || "정보 없음"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">중성화 여부</p>
                <p>{pet.neutered ? "예" : "아니오"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">등록번호</p>
                <p>{pet.serialNumber || "정보 없음"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">특이사항</p>
                <p>{pet.etc || "정보 없음"}</p>
              </div>
            </div>

            <Button className="" onClick={handleContactClick}>
              연락하기
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
