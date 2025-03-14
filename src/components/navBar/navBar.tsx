import {Button} from "@/components/ui/button";
import {LogOut, MessageSquare, Minus, Plus} from "lucide-react";
import {FilterButton} from "./filterButton";
import {KakaoLoginPopup} from "@/components/kakaoLogin/KakaoLoginPopup.tsx";
import {useAuth} from "@/contexts/AuthContext";
import {MissingFormPopup} from "@/components/petPost/missingPost/MissingPost.tsx";
import axios from "axios";
import {backUrl} from "@/constants";
import {useEffect, useRef, useState} from "react";
import {ChatRoomList} from "@/components/chat/ChatRoomList";
import {ChatModal} from "@/components/chat/ChatModal";
import * as StompJs from "@stomp/stompjs";
import {ChatRoom, OpenChatRoom} from "@/types/chat";
import {FindingFormPopup} from "@/components/petPost/findingPost/FindingPost.tsx";
import {NotificationBell} from "@/components/notification/notification";
import {useIsMobile} from "@/hooks/use-mobile";

const DEFAULT_IMAGE_URL =
    "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

export function NavBar() {
  const isMobile = useIsMobile();
  const [isMissingAddOpen, setIsMissingAddOpen] = useState(false);
  const [isFindingAddOpen, setIsFindingAddOpen] = useState(false);

  const {isLoggedIn, logout} = useAuth();

  const [isResistModalOpen, setIsResistModalOpen] = useState(false);

  const loginUserId = useAuth().userData?.id;

  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const chatListRef = useRef<HTMLDivElement>(null);
  const [openChatRooms, setOpenChatRooms] = useState<OpenChatRoom[]>([]);
  const client = useRef<StompJs.Client | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NavBar에 추가할 상태
  const [notiSseConnected, setNotiSseConnected] = useState(false);
  const notiSseRef = useRef<EventSource | null>(null);

  // 알림 SSE 연결을 위한 useEffect 추가
  useEffect(() => {
    if (isLoggedIn) {
      // 기존 연결 정리
      if (notiSseRef.current) {
        notiSseRef.current.close();
        notiSseRef.current = null;
      }

      const connectNotiSSE = async () => {
        try {
          // 알림 SSE 연결
          const eventSource = new EventSource(`${backUrl}/api/v1/sse/connect`, {
            withCredentials: true,
          });
          notiSseRef.current = eventSource;

          // 연결 성공 이벤트
          eventSource.addEventListener("connect", (event) => {
            console.log("알림 SSE 연결 성공:", event);
            setNotiSseConnected(true);
          });

          // 알림 이벤트 수신
          eventSource.addEventListener("noti", (event) => {
            try {
              const newNoti = JSON.parse(event.data);
              console.log("새 알림 수신:", newNoti);

              // NotificationBell 컴포넌트로 알림 데이터 전달을 위한 커스텀 이벤트 발생
              window.dispatchEvent(
                  new CustomEvent("new_notification", {
                    detail: {notification: newNoti}
                  })
              );
            } catch (error) {
              console.error("알림 데이터 파싱 오류:", error);
            }
          });

          // 에러 처리
          eventSource.onerror = (error) => {
            console.error("알림 SSE 연결 오류:", error);
            eventSource?.close();
            setNotiSseConnected(false);

            // 재연결 시도
            setTimeout(connectNotiSSE, 5000);
          };
        } catch (error) {
          console.error("알림 SSE 연결 실패:", error);
        }
      };

      connectNotiSSE();

      // 컴포넌트 언마운트 시 SSE 연결 종료
      return () => {
        if (notiSseRef.current) {
          notiSseRef.current.close();
          notiSseRef.current = null;
        }
      };
    }
  }, [isLoggedIn, backUrl]);

  // 마지막 메시지 시간으로 채팅방 정렬 함수
  const sortChatRoomsByLastMessageTime = (rooms: ChatRoom[]) => {
    return [...rooms].sort((a, b) => {
      const aLastMessageTime =
          a.chatMessages && a.chatMessages.length > 0
              ? new Date(
                  a.chatMessages[a.chatMessages.length - 1].createdDate ||
                  a.chatMessages[a.chatMessages.length - 1].createDate ||
                  a.modifiedDate
              ).getTime()
              : new Date(a.modifiedDate).getTime();

      const bLastMessageTime =
          b.chatMessages && b.chatMessages.length > 0
              ? new Date(
                  b.chatMessages[b.chatMessages.length - 1].createdDate ||
                  b.chatMessages[b.chatMessages.length - 1].createDate ||
                  b.modifiedDate
              ).getTime()
              : new Date(b.modifiedDate).getTime();

      return bLastMessageTime - aLastMessageTime;
    });
  };

  // 전역 SSE 이벤트 소스 레퍼런스 추가
  const sseRef = useRef<EventSource | null>(null);

  // SSE 이벤트 처리 함수
  const handleSseEvent = (eventData: any) => {
    // 이벤트 유형에 따른 처리
    const eventType = eventData.type || eventData.eventType;

    if (eventType === "READ_STATUS") {
      // 채팅방 ID 확인
      const roomId = eventData.chatRoomId || eventData.roomId;

      if (!roomId) {
        console.log("읽음 상태 이벤트에 채팅방 ID가 없어 처리 무시");
        return;
      }

      // 채팅방 목록 상태 업데이트 (unreadCount를 0으로)
      setChatRooms((prevRooms) => {
        return prevRooms.map((room) => {
          if (room.id === roomId) {
            return {...room, unreadCount: 0} as ChatRoom;
          }
          return room;
        });
      });

      return;
    }

    if (
        eventType === "unreadMessages" ||
        eventType === "NEW_MESSAGE" ||
        eventType === "FIRST_MESSAGE" ||
        eventType === "MESSAGE" ||
        eventType === "CHAT_UPDATED"
    ) {
      // 메시지가 내가 보낸 것인지 확인
      const isMyMessage = eventData.memberId === loginUserId;
      if (isMyMessage) {
        console.log("내가 보낸 메시지 SSE 이벤트, 알림 처리 제외");
        return;
      }

      fetchChatRooms().catch((err) => {
        console.error("SSE 이벤트 후 채팅방 목록 갱신 실패:", err);
      });
    }
  };

  // 전역 SSE 연결 설정 (UI 컴포넌트 상태와 독립적)
  useEffect(() => {
    if (isLoggedIn && loginUserId) {
      // 기존 연결 정리
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }

      // SSE 연결 설정 함수
      const setupSSEConnection = () => {
        try {
          // SSE 연결 설정
          const sseUrl = `${backUrl}/api/v1/sse/connect?userId=${loginUserId}`;
          const eventSource = new EventSource(sseUrl, {
            withCredentials: true,
          });
          sseRef.current = eventSource;

          // 연결 성공 핸들러
          eventSource.onopen = () => {
            console.log("SSE 연결 성공");
          };

          // 메시지 핸들러
          eventSource.onmessage = (event) => {
            try {
              const eventData = JSON.parse(event.data);
              handleSseEvent(eventData);
            } catch (error) {
              console.error("SSE 메시지 파싱 오류:", error);
            }
          };

          // 특정 이벤트 타입 핸들러 등록
          eventSource.addEventListener("message", (event) => {
            try {
              const eventData = JSON.parse(event.data);
              handleSseEvent(eventData);
            } catch (error) {
              console.error("'message' 이벤트 파싱 오류:", error);
            }
          });

          eventSource.addEventListener("new_message", (event) => {
            try {
              const eventData = JSON.parse(event.data);
              handleSseEvent(eventData);
            } catch (error) {
              console.error("'new_message' 이벤트 파싱 오류:", error);
            }
          });

          // 읽음 상태 이벤트 핸들러 등록 (추가)
          eventSource.addEventListener("read_status", (event) => {
            try {
              const eventData = JSON.parse(event.data);
              // READ_STATUS 이벤트 타입 명시
              eventData.eventType = "READ_STATUS";
              handleSseEvent(eventData);
            } catch (error) {
              console.error("'read_status' 이벤트 파싱 오류:", error);
            }
          });

          // 오류 핸들러
          eventSource.onerror = (error) => {
            console.error("SSE 연결 오류:", error);
            // 연결이 끊어진 경우 재연결 시도 (필요하면 추가)
          };
        } catch (error) {
          console.error("SSE 설정 중 오류 발생:", error);
        }
      };

      // 초기 SSE 연결 설정
      setupSSEConnection();

      // SSE 연결 확인 이벤트 리스너 추가
      const checkSSEConnection = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (
            customEvent.detail &&
            customEvent.detail.source === "contact_button"
        ) {
          // SSE 연결 상태 확인
          const isConnected =
              sseRef.current && sseRef.current.readyState === EventSource.OPEN;
          // 연결이 끊어진 경우 재연결
          if (!isConnected) {
            // 기존 연결 정리
            if (sseRef.current) {
              sseRef.current.close();
              sseRef.current = null;
            }
            // 연결 재설정
            setupSSEConnection();
          }

          // 데이터 갱신 트리거
          fetchChatRooms().catch((err) => {
            console.error("SSE 연결 확인 후 채팅방 목록 갱신 실패:", err);
          });
        }
        return true;
      };

      window.addEventListener("check_sse_connection", checkSSEConnection);

      // 채팅방 열림 상태 확인 이벤트 리스너 추가 (MissingDetail에서 발생)
      const handleChatRoomOpened = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail) {
          const {roomId, isOpen} = customEvent.detail;
          // openChatRooms 상태 업데이트 (기존 방식 재사용)
          if (isOpen) {
            const chatRoom = chatRooms.find((room) => room.id === roomId);
            if (chatRoom) {
              // 이미 있는지 확인
              const isAlreadyOpen = openChatRooms.some(
                  (room) => room.id === roomId
              );

              if (isAlreadyOpen) {
                // 이미 열려있는 채팅방의 isOpen 상태만 true로 설정
                setOpenChatRooms((prev) =>
                    prev.map((r) => ({
                      ...r,
                      isOpen: r.id === roomId,
                    }))
                );
              } else {
                // 새로운 채팅방 열기
                const openRoom: OpenChatRoom = {
                  ...chatRoom,
                  isOpen: true,
                };
                // 다른 채팅방은 isOpen을 false로 설정하고 새 채팅방 추가
                setOpenChatRooms((prev) => [
                  ...prev.map((r) => ({...r, isOpen: false})),
                  openRoom,
                ]);
              }
            }
          }
        }
        return true;
      };

      window.addEventListener("chat_room_opened", handleChatRoomOpened);

      // 연락하기에서 열린 채팅방 이벤트 처리 (새로 추가)
      const handleContactChatOpened = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail) {
          const {roomId} = customEvent.detail;
          // 채팅방 목록 갱신
          fetchChatRooms().then(() => {
            // 해당 채팅방 찾기
            const existingRoom = chatRooms.find((r) => r.id === roomId);

            if (existingRoom) {
              // 로컬 상태에서 카운트 초기화
              setChatRooms((prevRooms) =>
                  prevRooms.map((r) =>
                      r.id === roomId ? {...r, unreadCount: 0} : r
                  )
              );
            }
          });
        }
      };

      // 이미 열린 채팅방인지 확인하는 이벤트 핸들러
      const handleCheckOpenChatRoom = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail && customEvent.detail.targetUserId) {
          const {targetUserId} = customEvent.detail;

          // 현재 열린 채팅방 목록에서 확인
          const isAlreadyOpen = openChatRooms.some(
              (room) => room.targetUserId === targetUserId && room.isOpen
          );
          if (isAlreadyOpen) {
            event.preventDefault(); // 이벤트 취소
            return false; // 이벤트 진행 중지
          }
        }
        return true; // 채팅방 열기 진행
      };

      window.addEventListener("contact_chat_opened", handleContactChatOpened);

      // 채팅방 중복 확인 이벤트 리스너 추가
      window.addEventListener("check_open_chat_room", handleCheckOpenChatRoom);

      // 컴포넌트 언마운트 시 정리
      return () => {
        if (sseRef.current) {
          sseRef.current.close();
          sseRef.current = null;
        }

        // 이벤트 리스너 제거
        window.removeEventListener("check_sse_connection", checkSSEConnection);
        window.removeEventListener("chat_room_opened", handleChatRoomOpened);
        window.removeEventListener(
            "contact_chat_opened",
            handleContactChatOpened
        );
        window.removeEventListener(
            "check_open_chat_room",
            handleCheckOpenChatRoom
        );
      };
    }
  }, [isLoggedIn, loginUserId, chatRooms, openChatRooms]);

  // 채팅 목록 열기/닫기 시 초기 데이터 로드
  useEffect(() => {
    if (isLoggedIn && isChatListOpen) {
      fetchChatRooms();
    }
  }, [isLoggedIn, isChatListOpen]);

  const handleEnterChatRoom = (room: ChatRoom) => {
    // 즉시 로컬 상태 업데이트 - 카운트 증가 로직과 동일한 패턴 사용
    setChatRooms((prevRooms) => {
      return prevRooms.map((r) => {
        if (r.id === room.id) {
          return {...r, unreadCount: 0} as ChatRoom;
        }
        return r;
      });
    });

    // 이미 열려있는 채팅방인지 확인
    const isAlreadyOpen = openChatRooms.some(
        (openRoom) => openRoom.id === room.id
    );

    if (isAlreadyOpen) {
      // 이미 열려있는 채팅방의 isOpen 상태만 true로 설정
      setOpenChatRooms((prev) =>
          prev.map((r) => ({
            ...r,
            isOpen: r.id === room.id,
          }))
      );
    } else {
      // 새로운 채팅방 열기
      const openRoom: OpenChatRoom = {
        ...room,
        isOpen: true,
      };
      // 다른 채팅방은 isOpen을 false로 설정하고 새 채팅방 추가
      setOpenChatRooms((prev) => [
        ...prev.map((r) => ({...r, isOpen: false})),
        openRoom,
      ]);
    }
  };

  const handleCloseChatRoom = (roomId: number) => {
    // 열린 채팅방 목록에서 제거
    setOpenChatRooms((prev) => prev.filter((room) => room.id !== roomId));

    // 채팅방을 닫은 후 약간의 지연을 두고 목록 갱신
    setTimeout(() => {
      // 채팅 목록 데이터 새로 가져오기
      fetchChatRooms();
      // UI 강제 갱신 트리거
      forceUpdateChatList();
    }, 100);
  };

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      if (loginUserId == null || undefined) {
        console.error("로그인 안됨, 재로그인 필요");
        setError("로그인 안됨, 재로그인 필요");
        setLoading(false);
        return;
      }

      try {
        // axios로 요청 전환 (fetch API 대신)
        const response = await axios.get(
            `${backUrl}/api/v1/chat/rooms/list-with-unread`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
              timeout: 10000, // 10초 타임아웃 설정
            }
        );

        if (response.data && response.data.data) {
          // 필터링 및 정렬 로직
          const filteredRooms = response.data.data.filter(
              (room: ChatRoom) =>
                  room.chatUserId === loginUserId ||
                  room.targetUserId === loginUserId
          );

          // 서버 응답에서 안 읽은 메시지 카운트 필드 적용
          const roomsWithUnreadCount = filteredRooms.map((room: ChatRoom) => {
            // 서버 응답에서 unreadCount 또는 unreadMessageCount 필드 확인
            const serverUnreadCount =
                room.unreadCount !== undefined
                    ? room.unreadCount
                    : (room as any).unreadMessageCount || 0;

            // 기존 채팅방 객체에 안 읽은 메시지 카운트 추가
            return {
              ...room,
              unreadCount: serverUnreadCount,
            };
          });

          const sortedRooms =
              sortChatRoomsByLastMessageTime(roomsWithUnreadCount);
          setChatRooms(sortedRooms);
        } else {
          console.log(
              "응답 데이터가 없거나 형식이 올바르지 않습니다:",
              response.data
          );
          setChatRooms([]);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            setError("요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.");
          } else if (error.response) {
            // 서버가 응답을 반환했지만 2xx 범위가 아닌 경우
            setError(
                `서버 오류: ${error.response.status} - ${
                    error.response.data?.message || "알 수 없는 오류"
                }`
            );
            console.error("상세 응답:", error.response.data);
          } else if (error.request) {
            // 요청이 전송되었지만 응답이 없는 경우
            setError(
                "서버로부터 응답이 없습니다. 백엔드 서버가 실행 중인지 확인하세요."
            );
          } else {
            setError(`요청 설정 중 오류: ${error.message}`);
          }
        } else {
          const errorMessage =
              error instanceof Error ? error.message : "알 수 없는 오류";
          setError(
              `채팅방 목록을 불러오는 중 오류가 발생했습니다: ${errorMessage}`
          );
        }
        setChatRooms([]);
      }
      setLoading(false);
    } catch (error: unknown) {
      const errorMessage =
          error instanceof Error ? error.message : "알 수 없는 오류";
      setError(
          `채팅방 목록을 불러오는 중 오류가 발생했습니다: ${errorMessage}`
      );
      setLoading(false);
    }
  };

  const handleLeaveRoom = async (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("정말 채팅방을 나가시겠습니까?")) return;

    try {
      const response = await axios.post(
          `${backUrl}/api/v1/chat/rooms/${roomId}/leave`,
          {},
          {withCredentials: true}
      );
      if (response.status === 200) {
        setChatRooms((prev) => prev.filter((room) => room.id !== roomId));
        setOpenChatRooms((prev) => prev.filter((room) => room.id !== roomId));
      } else {
        alert("채팅방 나가기에 실패했습니다.");
      }
    } catch (err) {
      console.error("채팅방 나가기 오류:", err);
      alert("채팅방 나가기 중 오류가 발생했습니다.");
    }
  };

  const formatLastMessage = (room: ChatRoom) => {
    try {
      if (
          !room.chatMessages ||
          !Array.isArray(room.chatMessages) ||
          room.chatMessages.length === 0
      ) {
        return "새로운 채팅방이 열렸습니다.";
      }

      const sortedMessages = [...room.chatMessages].sort((a, b) => {
        const dateA = a.createDate || a.createdDate || "";
        const dateB = b.createDate || b.createdDate || "";
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      const lastMessage = sortedMessages[0];

      if (!lastMessage || !lastMessage.content) {
        return "새로운 메시지가 없습니다.";
      }

      return lastMessage.content;
    } catch (error) {
      console.error("채팅방 마지막 메시지 형식화 오류:", error);
      return "메시지를 불러올 수 없습니다.";
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${hours < 12 ? "오전" : "오후"} ${hours % 12 || 12}:${minutes}`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const getValidImageUrl = (imageUrl: string | undefined) => {
    const isKakaoDefaultProfile = (url: string) => {
      return (
          url && url.includes("kakaocdn.net") && url.includes("default_profile")
      );
    };
    if (
        !imageUrl ||
        imageUrl === "profile" ||
        isKakaoDefaultProfile(imageUrl)
    ) {
      return DEFAULT_IMAGE_URL;
    }
    return imageUrl;
  };

  const getOtherUserInfo = (room: ChatRoom) => {
    // loginUserId가 없는 경우 기본값 설정
    if (loginUserId == null || undefined) {
      console.warn(
          "[getOtherUserInfo] 현재 사용자 ID가 없습니다. 기본값으로 처리합니다."
      );
      return {
        nickname: room.targetUserNickname || "사용자",
        imageUrl:
            getValidImageUrl(room.targetUserImageUrl) || DEFAULT_IMAGE_URL,
        userId: room.targetUserId,
      };
    }

    // 명확한 숫자 비교를 위해 변환
    const myId = Number(loginUserId);
    const chatUserId = Number(room.chatUserId);

    // 내가 채팅 시작자인지 여부 확인
    const isMyChat = myId === chatUserId;

    // 상대방 정보 반환
    return {
      nickname: isMyChat ? room.targetUserNickname : room.chatUserNickname,
      imageUrl: getValidImageUrl(
          isMyChat ? room.targetUserImageUrl : room.chatUserImageUrl
      ),
      userId: isMyChat ? room.targetUserId : room.chatUserId,
    };
  };

  // 채팅 목록 UI 갱신을 위한 카운터 상태 추가
  const [chatListRenderTrigger] = useState(0);

  // 채팅 목록 강제 리렌더링 함수
  const forceUpdateChatList = () => {
    fetchChatRooms().catch((err) => {
      console.error("채팅방 목록 강제 갱신 실패:", err);
    });
  };

  // 주기적 채팅방 목록 갱신 설정 추가
  useEffect(() => {
    if (loginUserId == null || undefined) {
      console.log("미로그인 유저, 로그인하세요.");
      return;
    }

    // 10분마다 채팅방 목록 갱신 (30초에서 10분으로 변경)
    const intervalId = setInterval(() => {
      // 채팅방 목록이 열려있는 경우에만 갱신
      if (isChatListOpen) {
        fetchChatRooms().catch((err) => {
          console.error("주기적 채팅방 목록 갱신 실패:", err);
        });
      }
    }, 600000); // 30,000ms(30초)에서 600,000ms(10분)으로 변경

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearInterval(intervalId);
    };
  }, [isChatListOpen, backUrl, loginUserId]); // 의존성 배열에 isChatListOpen, backUrl, loginUserId 추가

  // WebSocket 연결 설정 useEffect
  useEffect(() => {
    if (isLoggedIn && isChatListOpen) {
      const stompClient = new StompJs.Client({
        brokerURL:
            backUrl.replace("https://", "wss://").replace("http://", "ws://") +
            "/ws",
        connectHeaders: {},
        debug: function (str) {
          console.log("STOMP Debug:", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: () => {
          const ws = new WebSocket(
              backUrl.replace("https://", "wss://").replace("http://", "ws://") +
              "/ws"
          );
          ws.onerror = (err) => {
            console.error("WebSocket 에러:", err);
          };
          return ws;
        },
      });

      client.current = stompClient;

      stompClient.onConnect = () => {
        // 새 채팅방 생성 이벤트 구독
        stompClient.subscribe("/topic/api/v1/chat/new-room", (message) => {
          try {
            const newRoomData = JSON.parse(message.body);

            if (
                newRoomData.chatUserId === loginUserId ||
                newRoomData.targetUserId === loginUserId
            ) {
              setChatRooms((prevRooms) => {
                if (!prevRooms.some((room) => room.id === newRoomData.id)) {
                  const newRoom = {
                    id: newRoomData.id,
                    chatUserNickname: newRoomData.chatUserNickname,
                    chatUserImageUrl:
                        newRoomData.chatUserImageUrl || DEFAULT_IMAGE_URL,
                    chatUserId: newRoomData.chatUserId,
                    targetUserNickname: newRoomData.targetUserNickname,
                    targetUserImageUrl:
                        newRoomData.targetUserImageUrl || DEFAULT_IMAGE_URL,
                    targetUserId: newRoomData.targetUserId,
                    chatMessages: [],
                    modifiedDate: new Date().toISOString(),
                  };

                  subscribeToRoom(newRoomData.id);

                  return sortChatRoomsByLastMessageTime([
                    ...prevRooms,
                    newRoom,
                  ]);
                }
                return prevRooms;
              });
            } else {
              console.log(
                  "새 채팅방이 현재 사용자와 관련이 없어 무시됨:",
                  newRoomData
              );
            }
          } catch (error) {
            console.error("새로운 채팅방 데이터 처리 오류:", error);
          }
        });

        // 읽음 상태 변경 이벤트 구독
        stompClient.subscribe("/topic/api/v1/chat/read-status", (message) => {
          try {
            const readStatusData = JSON.parse(message.body);

            // 로컬 상태 즉시 업데이트 (roomId가 있는 경우)
            if (readStatusData.roomId) {
              // 즉시 UI 업데이트를 위한 로컬 상태 변경
              setChatRooms((prevRooms) => {
                // 해당 채팅방 찾기
                const roomIndex = prevRooms.findIndex(
                    (room) => room.id === readStatusData.roomId
                );
                if (roomIndex === -1) {
                  console.log(
                      `채팅방 ${readStatusData.roomId}가 현재 목록에 없어 업데이트 무시`
                  );
                  return prevRooms; // 채팅방이 없으면 변경 없음
                }

                // 채팅방 복사
                const updatedRooms = [...prevRooms];

                // 이 부분에서 카운트 명시적으로 0으로 설정 (읽음 처리)
                updatedRooms[roomIndex] = {
                  ...updatedRooms[roomIndex],
                  unreadCount: 0,
                } as any;

                return updatedRooms;
              });

              // API 새로고침은 백그라운드로 진행 (UI는 이미 업데이트됨)
              fetchChatRooms().then(() => {
                console.log("읽음 상태 변경 후 채팅방 목록 새로 로드 완료");
              });
            } else {
              console.log("이벤트에 roomId가 없어 로컬 상태 업데이트 무시");
            }
          } catch (error) {
            console.error("읽음 상태 변경 이벤트 처리 오류:", error);
          }
        });

        // 채팅방 구독 함수
        const subscribeToRoom = (roomId: number) => {
          stompClient.subscribe(
              `/topic/api/v1/chat/${roomId}/messages`,
              (message) => {
                try {
                  const messageData = JSON.parse(message.body);
                  setChatRooms((prevRooms) => {
                    // 현재 채팅방이 목록에 없는 경우 변경하지 않음
                    const roomIndex = prevRooms.findIndex(
                        (room) => room.id === roomId
                    );
                    if (roomIndex === -1) {
                      console.log(`채팅방 ${roomId}가 목록에 없어 메시지 무시`);
                      return prevRooms;
                    }

                    const updatedRooms = prevRooms.map((room) => {
                      if (room.id === roomId) {
                        // 기존 메시지 배열 복사
                        const updatedMessages = room.chatMessages
                            ? [...room.chatMessages]
                            : [];

                        // 중복 메시지 확인
                        const isDuplicate = updatedMessages.some(
                            (msg) => msg.id === messageData.chatMessageId
                        );

                        // 메시지 발신자가 현재 사용자인지 확인 (읽음 상태 결정에 필요)
                        const isMessageFromCurrentUser =
                            messageData.memberId === loginUserId;

                        // 현재 사용자가 채팅 사용자인지 대상 사용자인지 확인
                        const isCurrentUserChatUser =
                            room.chatUserId === loginUserId;
                        const isCurrentUserTargetUser =
                            room.targetUserId === loginUserId;

                        // 현재 unreadCount 가져오기 (없으면 0으로 초기화)
                        let unreadCount = (room as any).unreadCount || 0;

                        // 현재 이 채팅방이 열려있는지 확인
                        const isRoomCurrentlyOpen = openChatRooms.some(
                            (openRoom) => openRoom.id === roomId && openRoom.isOpen
                        );

                        // 중복이 아닌 경우에만 메시지 추가 및 unreadCount 업데이트
                        if (!isDuplicate) {
                          // 새 메시지 객체 생성
                          const newMessage = {
                            id: messageData.chatMessageId,
                            content: messageData.content,
                            createdDate: messageData.createdDate,
                            createDate: messageData.createdDate,
                            memberId: messageData.memberId,
                            // 현재 사용자가 보낸 메시지인 경우 읽음으로 표시
                            chatUserRead: isCurrentUserChatUser
                                ? isMessageFromCurrentUser
                                : true,
                            targetUserRead: isCurrentUserTargetUser
                                ? isMessageFromCurrentUser
                                : true,
                          };

                          // 메시지 추가 (한 번만 추가)
                          updatedMessages.push(newMessage as any);

                          // 첫 번째 메시지인지 확인 (추가 후 길이가 1이면 첫 메시지)
                          const isFirstMessage = updatedMessages.length === 1;

                          if (isFirstMessage) {
                            // 내가 보낸 메시지가 아닌 경우에만 처리
                            if (!isMessageFromCurrentUser) {
                              // 채팅방이 닫혀 있으면 카운트 증가
                              if (!isRoomCurrentlyOpen) {
                                unreadCount += 1;
                                // 첫 메시지 후 UI 강제 업데이트
                                setTimeout(() => {
                                  forceUpdateChatList();
                                }, 200);
                              }
                            }
                          } else {
                            // 일반 메시지 처리 (첫 번째 메시지가 아닌 경우)
                            if (isMessageFromCurrentUser) {
                              // 내가 보낸 메시지는 카운트 증가하지 않음
                              // console.log(`내가 보낸 메시지 - 안읽음 카운트 유지: ${unreadCount}`);
                            } else if (isRoomCurrentlyOpen) {
                              // 열려있는 채팅방에 메시지가 오면 unreadCount는 항상 0
                              unreadCount = 0;
                            } else {
                              // 채팅방 닫혀있고 상대방이 보낸 메시지면 카운트 증가
                              unreadCount += 1;
                            }
                          }
                        }
                        // 채팅방이 열려있는지 명시적으로 다시 확인 (OpenChatRoom 상태 확인)
                        const isThisRoomOpen = openChatRooms.some(
                            (openRoom) => openRoom.id === room.id && openRoom.isOpen
                        );

                        // 업데이트된 채팅방 반환
                        return {
                          ...room,
                          chatMessages: updatedMessages,
                          modifiedDate:
                              messageData.createdDate || new Date().toISOString(),
                          unreadCount: isThisRoomOpen ? 0 : unreadCount, // 열린 채팅방은 항상 unreadCount를 0으로 설정
                        };
                      }
                      return room;
                    });

                    // 최근 메시지 순으로 정렬
                    return sortChatRoomsByLastMessageTime(updatedRooms);
                  });
                } catch (error) {
                  console.error(`채팅방 ${roomId} 메시지 처리 오류:`, error);
                }
              }
          );
        };

        // 이미 로드된 모든 채팅방에 대한 구독 설정
        chatRooms.forEach((room) => {
          subscribeToRoom(room.id);
        });
      };

      stompClient.activate();

      return () => {
        if (stompClient.active) {
          stompClient.deactivate();
        }
      };
    }
  }, [isLoggedIn, isChatListOpen, chatRooms, loginUserId, openChatRooms]);

  // 채팅 목록 아이콘 클릭 이벤트 처리 - 상세 로깅 추가
  const handleChatListToggle = () => {
    // 토글 상태 변경
    setIsChatListOpen(!isChatListOpen);

    // 채팅 목록을 열 때만 데이터 로드
    if (!isChatListOpen) {
      if (loginUserId == null || undefined) {
        console.log("미로그인 유저, 로그인 필요");
      }
      // 채팅방 목록 데이터 로드 요청
      fetchChatRooms();
    }
  };

  return (
      <>
        <nav
            className={`
                ${
                !isMobile
                    ? "fixed top-0 right-0 mt-4 z-[5] w-[calc(100%-24.5rem)]"
                    : "w-full"
            }
                `}
        >
          <div className="relative md:px-4">
            <div
                className={`relative z-10 flex gap-1 justify-between items-center py-1 min-h-12  backdrop-blur-sm rounded-full
                          ${
                    !isMobile
                        ? "shadow-lg bg-white "
                        : "border border-green-500"
                }
                        `}
            >
              <div className="flex-none pl-2">
                <Button
                    variant="outline"
                    size="icon"
                    className={`bg-green-600 rounded-full hover:bg-green-700
                                  ${isMobile && "shadow-lg"}
                                `}
                    onClick={() => setIsResistModalOpen(true)}
                >
                  <Plus className="h-4 w-4 text-white"/>
                </Button>
                {isResistModalOpen && (
                    <div
                        className="absolute top-0 left-0 bg-white rounded-3xl w-[200px] overflow-hidden z-50 shadow">
                      <div className="flex-none px-2 py-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-green-600 rounded-full hover:bg-green-600"
                            onClick={() => {
                              setIsResistModalOpen(false);
                            }}
                        >
                          <Minus className="h-4 w-4 text-white"/>
                        </Button>
                        <div className="py-1">
                          <Button
                              variant="ghost"
                              className="flex items-center justify-start w-full py-4 pl-0 hover:bg-gray-100 bgr-white h-12"
                              onClick={() => {
                                if (!isLoggedIn) {
                                  alert("로그인 후 이용해주세요!");
                                } else {
                                  setIsMissingAddOpen(true);
                                }
                              }}
                          >
                            <div
                                className="w-10 h-10 mr-2 rounded-full flex items-center justify-center">
                              <svg
                                  viewBox="0 0 30 31"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="svg-2"
                              >
                                <path
                                    d="M26.25 8H23.75L22.1625 6.4125C21.5876 5.8389 20.812 5.51163 20 5.5H16.875C16.6999 4.7985 16.2993 4.17391 15.7347 3.72224C15.1701 3.27057 14.4728 3.01682 13.75 3V10.95C13.8142 12.2124 14.3133 13.4137 15.1625 14.35C16.5607 15.6941 18.3895 16.5001 20.325 16.625L24.6375 14.9C25.1435 14.6969 25.5991 14.3859 25.9726 13.9887C26.3461 13.5914 26.6284 13.1175 26.8 12.6L27.5 10.6875C27.5201 10.5591 27.5201 10.4284 27.5 10.3V9.25C27.5 8.91848 27.3683 8.60054 27.1339 8.36612C26.8995 8.1317 26.5815 8 26.25 8ZM20 10.5C19.7528 10.5 19.5111 10.4267 19.3055 10.2893C19.1 10.152 18.9398 9.95676 18.8452 9.72835C18.7505 9.49995 18.7258 9.24861 18.774 9.00614C18.8222 8.76366 18.9413 8.54093 19.1161 8.36612C19.2909 8.1913 19.5137 8.07225 19.7561 8.02402C19.9986 7.97579 20.2499 8.00054 20.4784 8.09515C20.7068 8.18976 20.902 8.34998 21.0393 8.55554C21.1767 8.7611 21.25 9.00277 21.25 9.25C21.25 9.58152 21.1183 9.89946 20.8839 10.1339C20.6495 10.3683 20.3315 10.5 20 10.5Z"
                                    fill="#DC2627"
                                />
                                <path
                                    d="M14.225 15.175C13.353 14.22 12.7833 13.0283 12.5875 11.75H7.5C7.16598 11.7721 6.83109 11.7226 6.51776 11.6048C6.20442 11.4869 5.91988 11.3035 5.68317 11.0668C5.44647 10.8301 5.26306 10.5456 5.14524 10.2322C5.02742 9.91891 4.9779 9.58402 5 9.25C5 8.91848 4.8683 8.60054 4.63388 8.36612C4.39946 8.1317 4.08152 8 3.75 8C3.41848 8 3.10054 8.1317 2.86612 8.36612C2.6317 8.60054 2.5 8.91848 2.5 9.25C2.51297 10.1174 2.71788 10.9712 3.1 11.75C3.52301 12.5667 4.1861 13.2341 5 13.6625V28H8.75V21.75H16.25V28H20V17.8375C17.8194 17.6657 15.7717 16.7216 14.225 15.175Z"
                                    fill="#DC2627"
                                />
                              </svg>
                            </div>
                            실종 신고하기
                          </Button>
                          <Button
                              variant="ghost"
                              className="flex items-center justify-start w-full py-4 pl-0 hover:bg-gray-100 bgr-white h-12"
                              onClick={() => {
                                if (!isLoggedIn) {
                                  alert("로그인 후 이용해주세요!");
                                } else {
                                  setIsFindingAddOpen(true);
                                }
                                setIsResistModalOpen(false);
                              }}
                          >
                            <div
                                className="w-6 h-6 mr-2 rounded-full flex items-center justify-center btn-size">
                              <svg
                                  viewBox="0 0 30 31"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="svg-2"
                              >
                                <path
                                    d="M26.25 8H23.75L22.1625 6.4125C21.5876 5.8389 20.812 5.51163 20 5.5H16.875C16.6999 4.7985 16.2993 4.17391 15.7347 3.72224C15.1701 3.27057 14.4728 3.01682 13.75 3V10.95C13.8142 12.2124 14.3133 13.4137 15.1625 14.35C16.5607 15.6941 18.3895 16.5001 20.325 16.625L24.6375 14.9C25.1435 14.6969 25.5991 14.3859 25.9726 13.9887C26.3461 13.5914 26.6284 13.1175 26.8 12.6L27.5 10.6875C27.5201 10.5591 27.5201 10.4284 27.5 10.3V9.25C27.5 8.91848 27.3683 8.60054 27.1339 8.36612C26.8995 8.1317 26.5815 8 26.25 8ZM20 10.5C19.7528 10.5 19.5111 10.4267 19.3055 10.2893C19.1 10.152 18.9398 9.95676 18.8452 9.72835C18.7505 9.49995 18.7258 9.24861 18.774 9.00614C18.8222 8.76366 18.9413 8.54093 19.1161 8.36612C19.2909 8.1913 19.5137 8.07225 19.7561 8.02402C19.9986 7.97579 20.2499 8.00054 20.4784 8.09515C20.7068 8.18976 20.902 8.34998 21.0393 8.55554C21.1767 8.7611 21.25 9.00277 21.25 9.25C21.25 9.58152 21.1183 9.89946 20.8839 10.1339C20.6495 10.3683 20.3315 10.5 20 10.5Z"
                                    fill="#15AF55"
                                />
                                <path
                                    d="M14.225 15.175C13.353 14.22 12.7833 13.0283 12.5875 11.75H7.5C7.16598 11.7721 6.83109 11.7226 6.51776 11.6048C6.20442 11.4869 5.91988 11.3035 5.68317 11.0668C5.44647 10.8301 5.26306 10.5456 5.14524 10.2322C5.02742 9.91891 4.9779 9.58402 5 9.25C5 8.91848 4.8683 8.60054 4.63388 8.36612C4.39946 8.1317 4.08152 8 3.75 8C3.41848 8 3.10054 8.1317 2.86612 8.36612C2.6317 8.60054 2.5 8.91848 2.5 9.25C2.51297 10.1174 2.71788 10.9712 3.1 11.75C3.52301 12.5667 4.1861 13.2341 5 13.6625V28H8.75V21.75H16.25V28H20V17.8375C17.8194 17.6657 15.7717 16.7216 14.225 15.175Z"
                                    fill="#15AF55"
                                />
                              </svg>
                            </div>
                            발견 등록하기
                          </Button>
                        </div>
                      </div>
                    </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-end gap-1 pr-5">
                {isLoggedIn ? (
                    <>
                      <div ref={chatListRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`${isMobile && "text-white"}`}
                            onClick={handleChatListToggle}
                        >
                          <MessageSquare className="h-4 w-4"/>
                        </Button>
                        <ChatRoomList
                            isOpen={isChatListOpen}
                            onClose={() => setIsChatListOpen(false)}
                            onEnterRoom={handleEnterChatRoom}
                            chatRooms={chatRooms as any}
                            loading={loading}
                            error={error}
                            formatLastMessage={formatLastMessage}
                            formatTime={formatTime}
                            getOtherUserInfo={getOtherUserInfo}
                            onLeaveRoom={handleLeaveRoom}
                            renderTrigger={chatListRenderTrigger}
                        />
                      </div>
                      <NotificationBell/>
                      <Button
                          variant="ghost"
                          size={`${isMobile ? "icon" : "default"}`}
                          onClick={logout}
                          className={`${isMobile && "text-white"}`}
                      >
                        <LogOut className="h-4 w-4 md:mr-2"/>
                        <span className="max-md:sr-only">로그아웃</span>
                      </Button>
                    </>
                ) : (
                    <KakaoLoginPopup/>
                )}
              </div>
            </div>

            {/* FilterButton을 NavBar 아래에 배치 */}
            {!isMobile && (
                <div className="absolute top-[calc(100%+0.75rem)] right-4">
                  <FilterButton/>
                </div>
            )}
          </div>
        </nav>

        <MissingFormPopup
            open={isMissingAddOpen}
            onOpenChange={setIsMissingAddOpen}
        />
        <FindingFormPopup
            open={isFindingAddOpen}
            onOpenChange={setIsFindingAddOpen}
        />

        {openChatRooms.map((room) => (
            <ChatModal
                key={room.id}
                isOpen={room.isOpen}
                onClose={() => handleCloseChatRoom(room.id)}
                defaultImageUrl={DEFAULT_IMAGE_URL}
                chatRoomId={room.id}
                targetUserImageUrl={room.targetUserImageUrl}
                targetUserNickname={room.targetUserNickname}
                chatRoom={chatRooms.find((cr) => cr.id === room.id) || null}
            />
        ))}
      </>
  );
}
