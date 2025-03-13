// src/hooks/useChatContact.ts

import {useState} from "react";
import axios from "axios";
import {backUrl} from "@/constants.ts";
import {chatEventBus} from "@/contexts/ChatContext.tsx";
import {OpenChatRoom} from "@/types/chat.ts";
import {useAuth} from "@/contexts/AuthContext.tsx";

// ChatModal에 필요한 정보를 담는 인터페이스
export interface ChatModalInfo {
    isOpen: boolean;
    targetUserImageUrl: string | null;
    targetUserNickname: string | null;
    chatRoomId: number | null;
}

const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

// 이미지 URL이 유효한지 확인하고 기본 이미지로 대체하는 함수
const getValidImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl || imageUrl === "profile" || isKakaoDefaultProfile(imageUrl)) {
        return DEFAULT_IMAGE_URL;
    }
    return imageUrl;
};

// 카카오 기본 프로필인지 확인하는 함수
const isKakaoDefaultProfile = (url: string) => {
    return url && url.includes("kakaocdn.net") && url.includes("default_profile");
};

export const useChatContact = (refreshChatRooms: () => void) => {
    const [isContacting, setIsContacting] = useState(false);
    const [contactError, setContactError] = useState<string | null>(null);
    const userId = useAuth().userData?.id;


    const handleContactClick = async ({
                                          pet,
                                          onOpenChange,
                                          onChatModalOpen,
                                          source = "pet_detail" // 소스 식별자 (finding_detail 또는 missing_detail)
                                      }: {
        pet: any;
        onOpenChange: (open: boolean) => void;
        onChatModalOpen: (chatInfo: ChatModalInfo) => void;
        source?: string;
    }) => {
        if (!pet) return {success: false, error: "Pet data is missing"};

        setIsContacting(true);
        setContactError(null);

        if (!userId) {
            setIsContacting(false);
            alert("로그인이 필요한 서비스입니다.");
            return {success: false, error: "Login required"};
        }

        try {
            // 작성자 ID를 targetUserId로 사용 - 명확한 검사 추가
            const petAny = pet as any;
            let targetUserId;

            // 우선순위에 따라 ID 필드 확인
            if (petAny.memberId && typeof petAny.memberId === "number" && petAny.memberId > 0) {
                console.log("memberId 필드 사용");
                targetUserId = petAny.memberId;
            } else if (petAny.authorId && typeof petAny.authorId === "number" && petAny.authorId > 0) {
                console.log("authorId 필드 사용");
                targetUserId = petAny.authorId;
            } else if (petAny.member && petAny.member.id && typeof petAny.member.id === "number") {
                console.log("member.id 필드 사용");
                targetUserId = petAny.member.id;
            } else {
                console.log("fallback: pet.id 사용");
                targetUserId = pet.id; // 최후의 수단으로 pet.id 사용
            }

            // 이미 열린 채팅방인지 확인
            const isAlreadyOpenEvent = new CustomEvent("check_open_chat_room", {
                detail: {targetUserId: targetUserId},
                cancelable: true,
            });

            const canProceed = window.dispatchEvent(isAlreadyOpenEvent);

            // 이미 열린 채팅방이면 함수 종료
            if (!canProceed) {
                onOpenChange(false); // 상세 Dialog 닫기
                setIsContacting(false);
                return {success: true, info: "Chat already open"};
            }

            // NavBar의 SSE 연결 상태 확인 또는 트리거
            // const sseConnected = window.dispatchEvent(
            //             //     new CustomEvent("check_sse_connection", {
            //             //         detail: {
            //             //             userId: targetUserId,
            //             //             source: "contact_button",
            //             //         },
            //             //     })
            //             // );

            // API 요청 - targetUserId를 명시적으로 숫자로 변환하여 전송
            const requestParams = {targetUserId: Number(targetUserId)};

            // 채팅방 생성 또는 조회 API 호출
            const response = await axios.post(`${backUrl}/api/v1/chat/rooms`, requestParams, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            // 채팅방 정보 설정
            const chatRoomId = response.data.data.id;
            const targetUserNickname = response.data.data.targetUserNickname;
            const validImageUrl = getValidImageUrl(response.data.data.targetUserImageUrl);

            // 채팅방 데이터 메시지 배열 초기화 확인
            if (!response.data.data.chatMessages) {
                response.data.data.chatMessages = [];
            }

            // OpenChatRoom 객체 생성
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
                isOpen: true,
            };

            // 채팅방 목록에 새 채팅방 추가 이벤트 발행
            chatEventBus.emitAddChatRoom(openChatRoom);

            // 채팅방 열림 상태를 전역 상태에 등록
            window.dispatchEvent(
                new CustomEvent("chat_room_opened", {
                    detail: {
                        roomId: chatRoomId,
                        isOpen: true,
                    },
                })
            );

            // 연락하기에서 열린 채팅방 이벤트 발생
            window.dispatchEvent(
                new CustomEvent("contact_chat_opened", {
                    detail: {
                        roomId: chatRoomId,
                        chatRoom: openChatRoom,
                        source: source,
                        timestamp: new Date().getTime(),
                    },
                })
            );

            // 채팅방 목록 갱신 이벤트 발행
            refreshChatRooms();

            // 읽음 처리 API 호출
            try {
                await axios.post(`${backUrl}/api/v1/chat/${chatRoomId}/mark-as-read`, {}, {withCredentials: true});
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

            setIsContacting(false);
            return {success: true, chatRoomId};

        } catch (err: any) {
            // 이미 존재하는 채팅방인 경우 (HTTP 409 Conflict)
            if (err.response && err.response.status === 409) {
                // 이미 존재하는 채팅방 데이터가 있는 경우
                if (err.response.data && err.response.data.data && err.response.data.data.id) {
                    const existingChatRoom = err.response.data.data;
                    const chatRoomId = existingChatRoom.id;

                    // 기존 채팅방 정보 활용하여 채팅방 열기
                    const validImageUrl = getValidImageUrl(existingChatRoom.targetUserImageUrl);
                    const targetUserNickname = existingChatRoom.targetUserNickname || "상대방";

                    // 채팅방 데이터 메시지 배열 초기화 확인
                    if (!existingChatRoom.chatMessages) {
                        existingChatRoom.chatMessages = [];
                    }

                    // OpenChatRoom 객체 생성
                    const openChatRoom: OpenChatRoom = {
                        id: chatRoomId,
                        chatUserNickname: existingChatRoom.chatUserNickname || "사용자",
                        chatUserImageUrl: getValidImageUrl(existingChatRoom.chatUserImageUrl),
                        chatUserId: existingChatRoom.chatUserId,
                        targetUserNickname: targetUserNickname,
                        targetUserImageUrl: validImageUrl,
                        targetUserId: existingChatRoom.targetUserId,
                        chatMessages: existingChatRoom.chatMessages || [],
                        modifiedDate: existingChatRoom.modifiedDate || new Date().toISOString(),
                        isOpen: true,
                    };

                    // 채팅방 목록에 추가
                    chatEventBus.emitAddChatRoom(openChatRoom);

                    // 채팅방 열림 상태를 전역 상태에 등록
                    window.dispatchEvent(
                        new CustomEvent("chat_room_opened", {
                            detail: {
                                roomId: chatRoomId,
                                isOpen: true,
                            },
                        })
                    );

                    // 연락하기에서 열린 채팅방 이벤트 발생
                    window.dispatchEvent(
                        new CustomEvent("contact_chat_opened", {
                            detail: {
                                roomId: chatRoomId,
                                chatRoom: openChatRoom,
                                source: source,
                                timestamp: new Date().getTime(),
                            },
                        })
                    );

                    // 채팅방 목록 갱신
                    refreshChatRooms();

                    // 읽음 처리 API 호출
                    try {
                        await axios.post(`${backUrl}/api/v1/chat/${chatRoomId}/mark-as-read`, {}, {withCredentials: true});
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

                    setIsContacting(false);
                    return {success: true, chatRoomId};
                }
            }

            // 오류 메시지 구성
            let errorMessage = "채팅방을 생성하는 중 오류가 발생했습니다.";

            if (err.response) {
                if (err.response.status === 400) {
                    errorMessage = "잘못된 요청입니다. 입력한 정보를 확인해주세요.";
                } else if (err.response.status === 401 || err.response.status === 403) {
                    errorMessage = "로그인이 필요하거나 권한이 없습니다.";
                    setIsContacting(false);
                    return {success: false, error: errorMessage};
                } else if (err.response.status === 500) {
                    errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
                }

                // 서버 응답에 메시지가 있으면 사용
                if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            }

            setContactError(errorMessage);
            alert(errorMessage);
            setIsContacting(false);
            return {success: false, error: errorMessage};
        }
    };

    return {
        handleContactClick,
        isContacting,
        contactError
    };
};