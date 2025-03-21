import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";
import axios from "axios";
import { backUrl } from "@/constants";
import { useChatContext } from "@/contexts/ChatContext";
import * as StompJs from "@stomp/stompjs";
import { Avatar } from "@/components/ui/avatar";
import { chatEventBus } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatMessage {
  id?: number;
  sender: string;
  message: string;
  time: string;
}

interface WebSocketMessage {
  chatMessageId: number;
  chatRoomId: number;
  createdDate: string;
  modifiedDate: string;
  memberId: number;
  memberNickname: string;
  content: string;
}

interface ChatRoom {
  chatUserId: number;
  targetUserId: number;
  chatUserNickname: string;
  chatUserImageUrl: string;
  targetUserNickname: string;
  targetUserImageUrl: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultImageUrl: string;
  chatRoomId: number | null;
  initialMessages?: ChatMessage[];
  targetUserImageUrl?: string | null;
  targetUserNickname?: string | null;
  chatRoom?: ChatRoom | null;
}

export function ChatModal({
  isOpen,
  onClose,
  targetUserImageUrl,
  targetUserNickname,
  defaultImageUrl,
  chatRoomId,
  initialMessages = [],
  chatRoom,
}: ChatModalProps) {
  const isMobile = useIsMobile();
  const { addChatRoom, removeChatRoom, refreshChatRooms } = useChatContext();
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(initialMessages);
  const userId = useAuth().userData?.id;
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const client = useRef<StompJs.Client | null>(null);

  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    const baseOffset = chatRoomId ? (chatRoomId % 5) * 50 : 0;
    return {
      x: window.innerWidth - 432 - baseOffset,
      y: window.innerHeight - 532 - baseOffset,
    };
  });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  // 리사이징 관련 상태
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 500 });
  const resizeRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isVisible && inputRef.current && !isSending) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  // 상대방 정보 상태 추가
  const [otherUserInfo, setOtherUserInfo] = useState<{
    nickname: string;
    imageUrl: string;
    userId: number | null;
  }>({
    nickname: targetUserNickname || "사용자",
    imageUrl: targetUserImageUrl || defaultImageUrl,
    userId: null,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // 이전 메시지 불러오기
  const fetchPreviousMessages = async () => {
    if (!chatRoomId) return;

    try {
      if (userId == null || undefined) {
        console.log("현재 미로그인, 로그인 필요");
        return;
      }

      // 사용자 ID가 확보된 후 메시지 불러오기
      const response = await axios.get(
        `${backUrl}/api/v1/chat/${chatRoomId}/messages`,
        { withCredentials: true }
      );

      if (response.data && Array.isArray(response.data.data)) {
        const messages = response.data.data
          .filter((msg: any) => msg && msg.content)
          .map((msg: any) => {
            // 백엔드에서 제공한 memberId 사용
            const messageUserId = msg.memberId;

            // 명확한 비교를 위해 숫자 값으로 변환
            const isMine = Number(messageUserId) === Number(userId);

            return {
              id: msg.chatMessageId || msg.id,
              sender: isMine ? "me" : "other",
              message: msg.content || "",
              time: new Date(
                msg.createdDate || msg.createDate
              ).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
          });
        setChatMessages(messages);
      } else {
        console.error("잘못된 메시지 데이터 형식:", response.data);
        setChatMessages([]);
      }
    } catch (error) {
      console.error("이전 메시지 로딩 오류:", error);
      setChatMessages([]);
    }
  };

  // 컴포넌트가 마운트되거나 chatRoomId가 변경될 때 이전 메시지 불러오기
  useEffect(() => {
    if (isOpen && chatRoomId) {
      fetchPreviousMessages();
    }
  }, [isOpen, chatRoomId]);

  useEffect(() => {
    if (isOpen && chatRoomId) {
      const canOpen = addChatRoom(chatRoomId);
      if (!canOpen) {
        // 이미 열려있는 채팅방이면 닫기
        onClose();
        return;
      }
      setIsVisible(true);
    }

    // 컴포넌트 언마운트 시 채팅방 목록에서 제거
    return () => {
      if (chatRoomId) {
        removeChatRoom(chatRoomId);
      }
    };
  }, [isOpen, chatRoomId]);

  // WebSocket 연결 설정
  useEffect(() => {
    if (isVisible && chatRoomId) {
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
      });

      client.current = stompClient;

      let subscription: StompJs.StompSubscription | null = null;

      stompClient.onConnect = () => {
        if (userId == null || undefined) return;

        // 사용자 ID 확인 후 구독 진행
        const topic = `/topic/api/v1/chat/${chatRoomId}/messages`;
        try {
          subscription = stompClient.subscribe(topic, (message) => {
            try {
              const receivedMessage = JSON.parse(
                message.body
              ) as WebSocketMessage;

              // 메시지 발신자 구분 - 현재 로그인한 사용자 ID를 확인
              const messageUserId = receivedMessage.memberId;

              // 클로저에 저장된 currentUserId 사용 또는 상태 값 사용
              const userIdToCompare = userId;

              // 명확한 비교를 위해 숫자 값으로 변환
              const isMine = Number(messageUserId) === Number(userIdToCompare);

              const newMessage: ChatMessage = {
                id: receivedMessage.chatMessageId,
                sender: isMine ? "me" : "other",
                message: receivedMessage.content,
                time: new Date(receivedMessage.createdDate).toLocaleTimeString(
                  "ko-KR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                ),
              };

              setChatMessages((prev) => [...prev, newMessage]);

              // 내가 보낸 메시지가 아닌 경우 자동으로 읽음 처리
              if (!isMine) {
                try {
                  // 읽음 처리 API 호출 및 채팅방 목록 갱신
                  markMessagesAsReadAndRefresh();
                } catch (error) {
                  console.error("새 메시지 읽음 처리 오류:", error);
                }
              }
            } catch (error) {
              console.error("메시지 파싱 오류:", error);
            }
          });
        } catch (error) {
          console.error("구독 오류:", error);
        }
      };

      stompClient.onStompError = (frame) => {
        console.error("STOMP Error:", frame);
      };

      stompClient.onWebSocketError = (event) => {
        console.error("WebSocket Error:", event);
      };

      console.log("Attempting to connect to WebSocket...");
      stompClient.activate();

      // 메시지 읽음 처리 API를 호출하고 채팅방 목록 갱신
      const markMessagesAsReadAndRefresh = async () => {
        try {
          const response = await axios.post(
            `${backUrl}/api/v1/chat/${chatRoomId}/mark-as-read`,
            {},
            { withCredentials: true }
          );
          console.log("메시지 읽음 처리 결과:", response.data);

          // 채팅방 목록 갱신 이벤트 발행
          refreshChatRooms();

          // 읽음 상태가 변경되었음을 알리는 이벤트 발행
          try {
            // 채팅방 목록 API를 직접 호출하여 최신 데이터 가져오기
            const chatRoomsResponse = await axios.get(
              `${backUrl}/api/v1/chat/rooms/list-with-unread`,
              {
                withCredentials: true,
              }
            );

            // 이 부분에서 이벤트 버스 또는 WebSocket을 통해 NavBar에 알림을 전송할 수 있음
            console.log(
              "채팅방 목록 데이터 갱신 완료:",
              chatRoomsResponse.data
            );

            // chatEventBus를 통해 채팅방 목록 갱신 이벤트 다시 발행
            chatEventBus.emitRefreshChatRooms();
          } catch (error) {
            console.error("채팅방 목록 갱신 오류:", error);
          }
        } catch (error) {
          console.error("메시지 읽음 처리 오류:", error);
        }
      };

      // 채팅방이 열리면 메시지 읽음 처리 API 호출
      markMessagesAsReadAndRefresh();

      // 주기적으로 메시지 읽음 처리를 갱신하기 위한 인터벌 설정
      const readInterval = setInterval(() => {
        // 채팅방이 열려있는 동안 주기적으로 읽음 처리 API 호출 및 채팅방 목록 갱신
        markMessagesAsReadAndRefresh();
      }, 10000); // 10초마다 갱신

      return () => {
        console.log(`채팅방 ${chatRoomId} WebSocket 연결 해제`);
        if (client.current && client.current.active) {
          client.current.deactivate();
        }
        if (subscription) {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error("구독 해제 오류:", error);
          }
        }
        clearInterval(readInterval); // 인터벌 정리
      };
    }
  }, [isVisible, chatRoomId, userId]);

  // 상대방 정보 가져오는 함수
  const getOtherUserInfo = useCallback(() => {
    if (!chatRoom || !userId) {
      return {
        nickname: targetUserNickname || "사용자",
        imageUrl: targetUserImageUrl || defaultImageUrl,
        userId: null,
      };
    }

    // NavBar의 getOtherUserInfo와 유사한 로직
    const myId = Number(userId);
    const chatUserId = Number(chatRoom.chatUserId);

    const isMyChat = myId === chatUserId;

    const validImageUrl = (imageUrl: string | undefined) => {
      if (
        !imageUrl ||
        imageUrl === "profile" ||
        imageUrl === "null" ||
        imageUrl === "undefined"
      ) {
        return defaultImageUrl;
      }
      return imageUrl;
    };

    const result = {
      nickname: isMyChat
        ? chatRoom.targetUserNickname
        : chatRoom.chatUserNickname,
      imageUrl: validImageUrl(
        isMyChat ? chatRoom.targetUserImageUrl : chatRoom.chatUserImageUrl
      ),
      userId: isMyChat ? chatRoom.targetUserId : chatRoom.chatUserId,
    };

    return result;
  }, [
    userId,
    chatRoom,
    targetUserNickname,
    targetUserImageUrl,
    defaultImageUrl,
  ]);

  // 사용자 ID가 설정되거나 채팅방이 변경될 때 상대방 정보 업데이트
  useEffect(() => {
    if (userId || chatRoom) {
      const info = getOtherUserInfo();
      setOtherUserInfo(info);
    }
  }, [userId, chatRoom, getOtherUserInfo]);

  // 채팅방 닫기 핸들러
  const handleClose = () => {
    setIsVisible(false);
    if (chatRoomId) {
      removeChatRoom(chatRoomId);
    }
    onClose();
  };

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (isVisible) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDragging && dragRef.current) {
          const newX = e.clientX - dragRef.current.x;
          const newY = e.clientY - dragRef.current.y;

          // 화면 경계 체크 (여유 공간 추가)
          const maxX = window.innerWidth - 420; // 채팅방 너비 + 여유
          const maxY = window.innerHeight - 520; // 채팅방 높이 + 여유

          setPosition({
            x: Math.min(Math.max(0, newX), maxX),
            y: Math.min(Math.max(0, newY), maxY),
          });
        } else if (isResizing && resizeRef.current) {
          const deltaX = resizeRef.current.x - e.clientX;
          const deltaY = resizeRef.current.y - e.clientY;

          // 새로운 크기 계산
          const newWidth = Math.max(300, Math.min(800, size.width + deltaX));
          const newHeight = Math.max(400, Math.min(800, size.height + deltaY));

          // 위치 조정 (왼쪽 상단에서 리사이징할 때 위치도 조정해야 함)
          const newX = position.x - (newWidth - size.width);
          const newY = position.y - (newHeight - size.height);

          setSize({ width: newWidth, height: newHeight });
          setPosition({ x: newX, y: newY });

          resizeRef.current = {
            x: e.clientX,
            y: e.clientY,
          };
        }
      };

      const handleGlobalMouseUp = () => {
        if (isDragging) {
          setIsDragging(false);
          dragRef.current = null;
        }
        if (isResizing) {
          setIsResizing(false);
          resizeRef.current = null;
        }
      };

      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("mouseleave", handleGlobalMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        window.removeEventListener("mouseleave", handleGlobalMouseUp);
      };
    }
  }, [isVisible, isDragging, isResizing, size, position]);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    const chatHeader = e.target as HTMLElement;
    if (chatHeader.closest(".chat-header")) {
      setIsDragging(true);
      dragRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  // 리사이징 시작
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  // 채팅 메시지 전송 함수
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      setIsSending(true);
      const currentMessage = chatMessage;
      setChatMessage("");

      // 백엔드로 메시지 전송
      const response = await axios.post(
        `${backUrl}/api/v1/chat/${chatRoomId}/messages`,
        {
          content: currentMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // 새 메시지 로컬에 추가 (필요한 경우)
      const newMessage = response.data.data;

      // 필요하다면 새 메시지를 로컬 상태에 추가
      if (newMessage) {
        setChatMessages((prev) => [...prev, newMessage]);
        // 메시지 전송 시 스크롤 아래로 이동
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      alert("메시지를 전송하지 못했습니다.");
      // 실패한 경우 입력창에 메시지 복원
      setChatMessage(chatMessage);
    } finally {
      setIsSending(false);

      // 메시지 전송 후 입력창에 포커스 설정
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  };

  // 프로필 이미지 가져오는 함수
  const getValidUserImage = useCallback(() => {
    if (!otherUserInfo.imageUrl) {
      return defaultImageUrl;
    }

    if (
      otherUserInfo.imageUrl === "profile" ||
      otherUserInfo.imageUrl === "null" ||
      otherUserInfo.imageUrl === "undefined"
    ) {
      return defaultImageUrl;
    }

    return otherUserInfo.imageUrl;
  }, [otherUserInfo.imageUrl, defaultImageUrl, chatRoomId]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className="fixed z-[150] w-full max-w-[380px]"
      style={
        !isMobile
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              transition: isDragging || isResizing ? "none" : "all 0.1s ease",
              cursor: isDragging ? "grabbing" : "auto",
            }
          : {
              left: `50%`,
              top: `50%`,
              transform: `translate(-50%, -50%)`,
              transition: isDragging || isResizing ? "none" : "all 0.1s ease",
              cursor: isDragging ? "grabbing" : "auto",
            }
      }
    >
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col relative w-full max-w-[380px]"
        style={
          !isMobile
            ? {
                width: `${size.width}px`,
                height: `${size.height}px`,
                border: "1px solid #e5e7eb",
              }
            : {
                height: `${size.height}px`,
                border: "1px solid #e5e7eb",
              }
        }
      >
        {/* 리사이징 핸들 - 왼쪽 상단으로 이동 */}
        <div
          className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50"
          onMouseDown={handleResizeStart}
          style={{
            background: "transparent",
            position: "absolute",
            left: "0",
            top: "0",
            width: "15px",
            height: "15px",
          }}
        >
          <div
            className="absolute top-0 left-0"
            style={{
              width: "0",
              height: "0",
              borderStyle: "solid",
              borderWidth: "15px 15px 0 0",
              borderColor: "#10B981 transparent transparent transparent",
            }}
          />
        </div>

        {/* 채팅 헤더 */}
        <div
          className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-emerald-500 to-green-500 chat-header"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div className="flex items-center">
            <img
              src={getValidUserImage()}
              alt="프로필"
              className="w-10 h-10 rounded-full object-cover mr-3 select-none border-2 border-white shadow-md"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = defaultImageUrl;
              }}
            />
            <div>
              <h3 className="font-medium select-none text-white">
                {otherUserInfo.nickname}
              </h3>
            </div>
          </div>
          <button
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-1.5 rounded-full hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-sm"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* 채팅 내용 */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p className="text-emerald-600 font-medium">
                채팅을 시작해보세요!
              </p>
              <p className="text-xs mt-2 text-gray-400">
                반려동물에 대한 정보를 물어볼 수 있습니다.
              </p>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, index) => {
                if (!msg || !msg.message) return null; // 메시지가 유효하지 않으면 건너뜁니다

                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    } mb-2`}
                  >
                    {msg.sender !== "me" && (
                      <Avatar className="h-8 w-8 mr-2 ring-2 ring-white shadow-sm">
                        <img
                          src={getValidUserImage()}
                          alt="프로필"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = defaultImageUrl;
                          }}
                        />
                      </Avatar>
                    )}
                    <div
                      className={`flex flex-col ${
                        msg.sender === "me" ? "items-end" : "items-start"
                      }`}
                    >
                      {msg.sender !== "me" && (
                        <span className="text-xs text-gray-600 mb-1">
                          {otherUserInfo.nickname}
                        </span>
                      )}
                      <div className="flex flex-row items-end">
                        {msg.sender === "me" && (
                          <span className="text-[10px] text-gray-400 mr-2 shrink-0">
                            {msg.time}
                          </span>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            (msg.message?.length || 0) <= 12
                              ? "whitespace-nowrap w-fit"
                              : "whitespace-pre-wrap break-all"
                          } ${
                            msg.sender === "me"
                              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {msg.message}
                        </div>
                        {msg.sender !== "me" && (
                          <span className="text-[10px] text-gray-400 ml-2 shrink-0">
                            {msg.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 메시지 입력 */}
        <div className="p-3 border-t flex items-center gap-2 bg-white">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
            placeholder="메시지를 입력하세요..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isSending || !chatRoomId}
            ref={inputRef}
            onFocus={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className={`${
              isSending || !chatRoomId
                ? "bg-gray-400"
                : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            } text-white rounded-full p-2.5 shadow-sm transition-all duration-200`}
            onClick={handleSendMessage}
            disabled={isSending || !chatRoomId}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
