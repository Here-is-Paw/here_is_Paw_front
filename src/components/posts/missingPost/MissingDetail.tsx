import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import React, {useEffect, useState} from "react";
import { MissingDetailData, missingUtils } from "@/types/missing.ts";
import { petUtils } from "@/types/pet.common.ts";
import axios from "axios";
import { backUrl } from "@/constants.ts";
import { useChatContext } from "@/contexts/ChatContext.tsx";
import { chatEventBus } from "@/contexts/ChatContext.tsx";
import { OpenChatRoom } from "@/types/chat.ts";

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
}

export const MissingDetail: React.FC<MissingDetailProps> = ({
  petId,
  open,
  onOpenChange,
  onChatModalOpen,
}) => {
  const [pet, setPet] = useState<MissingDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const DEFAULT_IMAGE_URL =
    "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";
  const { refreshChatRooms } = useChatContext();

  useEffect(() => {
    const fetchPetDetail = async () => {
      if (!open || !petId) return;

      setLoading(true);
      setError(null);

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
      // 펫 데이터 확인 - 상세 로깅
      console.log("채팅 대상 펫 데이터:", pet);
      
      // 작성자 ID를 targetUserId로 사용 - 명확한 검사 추가
      const petAny = pet as any;
      let targetUserId;
      
      // authorId 확인 및 로깅
      console.log("작성자 ID(authorId):", petAny.authorId);
      console.log("작성자 ID 타입:", typeof petAny.authorId);
      
      if (petAny.authorId && typeof petAny.authorId === 'number' && petAny.authorId > 0) {
        targetUserId = petAny.authorId;
      } else if (petAny.member && petAny.member.id && typeof petAny.member.id === 'number' && petAny.member.id > 0) {
        targetUserId = petAny.member.id;
      } else {
        targetUserId = pet.id; // 최후의 수단으로 pet.id 사용
      }
      
      // 최종 targetUserId 로깅
      console.log("최종 선택된 targetUserId:", targetUserId);
      console.log("targetUserId 타입:", typeof targetUserId);
      
      // 🔴 추가: 전역에서 이미 열린 채팅방인지 확인
      const isAlreadyOpenEvent = new CustomEvent('check_open_chat_room', {
        detail: { targetUserId: targetUserId },
        cancelable: true // 이벤트 취소 가능하도록 설정
      });
      
      const canProceed = window.dispatchEvent(isAlreadyOpenEvent);
      
      // 이미 열린 채팅방이면 함수 종료
      if (!canProceed) {
        console.log("이미 열려있는 채팅방입니다. 새 창을 열지 않습니다.");
        onOpenChange(false); // 상세 Dialog 닫기
        return; // 함수 종료
      }
      
      // NavBar의 SSE 연결 상태 확인 또는 트리거 - 중요!
      console.log("연락하기 - NavBar SSE 연결 상태 확인");
      const sseConnected = window.dispatchEvent(new CustomEvent('check_sse_connection', {
        detail: {
          userId: targetUserId,
          source: 'contact_button'
        }
      }));
      console.log("SSE 연결 확인 이벤트 발생:", sseConnected);
      
      // API 요청 - targetUserId를 명시적으로 숫자로 변환하여 전송
      const requestParams = { targetUserId: Number(targetUserId) };
      console.log("채팅방 생성 API 요청 파라미터:", requestParams);
      
      // NavBar의 createChatRoom 함수와 유사한 방식으로 구현
      const response = await axios.post(
        `${backUrl}/api/v1/chat/rooms`,
        requestParams,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: document.cookie.includes("accessToken")
              ? `Bearer ${document.cookie.split('accessToken=')[1].split(';')[0]}`
              : '',
          },
          withCredentials: true,
        }
      );
      
      // 응답 로깅
      console.log("채팅방 생성/조회 응답:", response.data);
      console.log("생성된 채팅방 ID:", response.data.data.id);
      console.log("채팅 사용자 ID:", response.data.data.chatUserId);
      console.log("타겟 사용자 ID:", response.data.data.targetUserId);

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

      // OpenChatRoom을 생성하여 isOpen 속성을 명시적으로 설정
      const openChatRoom: OpenChatRoom = {
        id: chatRoomId,
        chatUserNickname: response.data.data.chatUserNickname,
        chatUserImageUrl: getValidImageUrl(response.data.data.chatUserImageUrl),
        chatUserId: response.data.data.chatUserId,
        targetUserNickname: response.data.data.targetUserNickname,
        targetUserImageUrl: validImageUrl,
        targetUserId: response.data.data.targetUserId,
        chatMessages: [],
        modifiedDate: new Date().toISOString(),
        isOpen: true // 명시적으로 열린 상태로 설정
      };

      // 채팅방 목록에 새 채팅방 추가 이벤트 발행
      chatEventBus.emitAddChatRoom(openChatRoom);

      // 채팅방 열림 상태를 전역 상태에 등록 (중요!)
      window.dispatchEvent(new CustomEvent('chat_room_opened', {
        detail: {
          roomId: chatRoomId,
          isOpen: true
        }
      }));

      // 추가: 연락하기에서 열린 채팅방 이벤트 발생 (네이밍 다르게 하여 중복 방지)
      console.log(`MissingDetail에서 채팅방 ${chatRoomId} 열림 이벤트 발생`);
      window.dispatchEvent(new CustomEvent('contact_chat_opened', {
        detail: {
          roomId: chatRoomId,
          chatRoom: openChatRoom,
          source: 'missing_detail',
          timestamp: new Date().getTime()
        }
      }));

      // 채팅방 목록 갱신 이벤트 발행
      refreshChatRooms();

      // Dialog 닫기
      onOpenChange(false);

      // 읽음 처리 API 호출 - 중요!
      try {
        console.log(`채팅방 ${chatRoomId} 읽음 처리 API 호출`);
        await axios.post(
          `${backUrl}/api/v1/chat/${chatRoomId}/mark-as-read`,
          {},
          { withCredentials: true }
        );
        console.log(`채팅방 ${chatRoomId} 읽음 처리 성공`);
      } catch (error) {
        console.error(`채팅방 ${chatRoomId} 읽음 처리 실패:`, error);
      }

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

          // OpenChatRoom을 생성하여 isOpen 속성을 명시적으로 설정
          const openChatRoom: OpenChatRoom = {
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
            isOpen: true // 명시적으로 열린 상태로 설정
          };

          // 채팅방 목록에 추가
          chatEventBus.emitAddChatRoom(openChatRoom);

          // 채팅방 열림 상태를 전역 상태에 등록 (중요!)
          window.dispatchEvent(new CustomEvent('chat_room_opened', {
            detail: {
              roomId: chatRoomId,
              isOpen: true
            }
          }));

          // 채팅방 목록 갱신
          refreshChatRooms();

          // 읽음 처리 API 호출 - 중요!
          try {
            console.log(`채팅방 ${chatRoomId} 읽음 처리 API 호출`);
            axios.post(
              `${backUrl}/api/v1/chat/${chatRoomId}/mark-as-read`,
              {},
              { withCredentials: true }
            );
            console.log(`채팅방 ${chatRoomId} 읽음 처리 성공`);
          } catch (error) {
            console.error(`채팅방 ${chatRoomId} 읽음 처리 실패:`, error);
          }

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
              <Button
                  onClick={() => onOpenChange(false)}
                  className="mt-4"
              >
                닫기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    );
  }

  return (
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
              <dt className="text-sm font-medium text-gray-500">견종</dt>
              <dd>{pet.breed || "견종 미상"}</dd>
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
              <dt className="text-sm font-medium text-gray-500">중성화 여부</dt>
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
              <dd>{pet.location || "지역 없음"}</dd>
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
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              className="bg-green-600"
              onClick={handleContactClick}
            >
              연락하기
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
