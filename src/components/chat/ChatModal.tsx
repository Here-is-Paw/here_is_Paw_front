import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";
import axios from "axios";
import { backUrl } from "@/constants";
import { useChatContext } from "@/contexts/ChatContext";
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Avatar } from "@/components/ui/avatar";

interface ChatMessage {
  id?: number;
  sender: string;
  message: string;
  time: string;
}

interface WebSocketMessage {
  id: number;
  senderId: number;
  content: string;
  createDate: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultImageUrl: string;
  chatRoomId: number | null;
  targetUserId?: number;
  preventAutoClose?: boolean;
  initialMessages?: ChatMessage[];
  targetUserImageUrl?: string | null;
  targetUserNickname?: string | null;
}

export function ChatModal({ 
  isOpen, 
  onClose, 
  targetUserImageUrl,
  targetUserNickname,
  defaultImageUrl,
  chatRoomId,
  targetUserId,
  preventAutoClose = true,
  initialMessages = []
}: ChatModalProps) {
  const { addChatRoom, removeChatRoom } = useChatContext();
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const client = useRef<StompJs.Client | null>(null);
  
  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [position, setPosition] = useState(() => {
    const baseOffset = chatRoomId ? (chatRoomId % 5) * 50 : 0;
    return {
      x: window.innerWidth - 432 - baseOffset,
      y: window.innerHeight - 532 - baseOffset
    };
  });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  // 리사이징 관련 상태
  const [isResizing, setIsResizing] = useState(false);
  const [isResizeMouseDown, setIsResizeMouseDown] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 500 });
  const resizeRef = useRef<{ x: number; y: number } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // 내 사용자 ID 가져오기
  useEffect(() => {
    const fetchMyUserId = async () => {
      try {
        const response = await axios.get(`${backUrl}/api/v1/members/me`, {
          withCredentials: true
        });
        setMyUserId(response.data.id);
        console.log('내 사용자 ID:', response.data.id);
        console.log('상대방 사용자 ID:', targetUserId);
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      }
    };

    if (isVisible) {
      fetchMyUserId();
    }
  }, [isVisible]);

  // 이전 메시지 불러오기
  const fetchPreviousMessages = async () => {
    if (!chatRoomId || !myUserId) return;

    try {
      const response = await axios.get(
        `${backUrl}/api/v1/chat/${chatRoomId}/messages`,
        { withCredentials: true }
      );

      if (response.data && Array.isArray(response.data.data)) {
        const messages = response.data.data
          .filter((msg: any) => msg && msg.content)
          .map((msg: any) => {
            const isMyMessage = msg.senderId === myUserId;
            console.log('메시지 송신자 ID:', msg.senderId, '내 ID:', myUserId, '내 메시지?:', isMyMessage);
            return {
              id: msg.id,
              senderId: msg.senderId,
              sender: isMyMessage ? "me" : "other",
              message: msg.content || "",
              time: new Date(msg.createDate).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })
            };
          });

        console.log("변환된 메시지:", messages);
        setChatMessages(messages);
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

  // 컴포넌트 마운트 시 중복 체크
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
    if (isVisible && chatRoomId && myUserId) {
      const stompClient = new StompJs.Client({
        brokerURL: 'ws://localhost:8090/ws',
        connectHeaders: {},
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: () => {
          const ws = new WebSocket('ws://localhost:8090/ws');
          ws.onerror = (err) => {
            console.error('WebSocket 에러:', err);
          };
          return ws;
        }
      });

      client.current = stompClient;

      let subscription: StompJs.StompSubscription | null = null;

      stompClient.onConnect = (frame) => {
        console.log('STOMP Connected:', frame);

        const topic = `/topic/api/v1/chat/${chatRoomId}/messages`;
        console.log(`Subscribing to topic: ${topic}`);

        try {
          subscription = stompClient.subscribe(topic, (message) => {
            console.log('Raw message received:', message);
            try {
              const receivedMessage = JSON.parse(message.body) as WebSocketMessage;
              console.log('Parsed message:', receivedMessage);
              const isMyMessage = receivedMessage.senderId === myUserId;
              console.log('메시지 송신자 ID:', receivedMessage.senderId, '내 ID:', myUserId, '내 메시지?:', isMyMessage);
              
              const newMessage: ChatMessage = {
                id: receivedMessage.id,
                senderId: receivedMessage.senderId,
                sender: isMyMessage ? "me" : "other",
                message: receivedMessage.content,
                time: new Date(receivedMessage.createDate).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              };
              
              setChatMessages(prev => [...prev, newMessage]);
            } catch (error) {
              console.error('메시지 파싱 오류:', error);
            }
          });
        } catch (error) {
          console.error('구독 오류:', error);
        }
      };

      stompClient.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
      };

      stompClient.onWebSocketError = (event) => {
        console.error('WebSocket Error:', event);
      };

      console.log('Attempting to connect to WebSocket...');
      stompClient.activate();

      return () => {
        console.log('Cleaning up WebSocket connection...');
        if (subscription) {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error('구독 해제 오류:', error);
          }
        }
        if (stompClient.active) {
          stompClient.deactivate();
        }
      };
    }
  }, [isVisible, chatRoomId, myUserId]);

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (isVisible) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        // 드래그 처리
        if (isMouseDown && dragRef.current) {
          e.preventDefault(); // 드래그 중 텍스트 선택 방지
          const newX = e.clientX - dragRef.current.x;
          const newY = e.clientY - dragRef.current.y;
          
          // 화면 경계 체크
          const maxX = window.innerWidth - 420;
          const maxY = window.innerHeight - 520;
          
          setPosition({
            x: Math.min(Math.max(0, newX), maxX),
            y: Math.min(Math.max(0, newY), maxY)
          });
          setIsDragging(true);
        }
        
        // 리사이징 처리
        if (isResizeMouseDown && resizeRef.current) {
          e.preventDefault(); // 리사이징 중 텍스트 선택 방지
          const deltaX = resizeRef.current.x - e.clientX;
          const deltaY = resizeRef.current.y - e.clientY;
          
          const newWidth = Math.max(300, Math.min(800, size.width + deltaX));
          const newHeight = Math.max(400, Math.min(800, size.height + deltaY));
          
          const newX = position.x - (newWidth - size.width);
          const newY = position.y - (newHeight - size.height);
          
          setSize({ width: newWidth, height: newHeight });
          setPosition({ x: newX, y: newY });
          
          resizeRef.current = {
            x: e.clientX,
            y: e.clientY
          };
          setIsResizing(true);
        }
      };

      const handleGlobalMouseUp = () => {
        // 모든 마우스 상태 초기화
        setIsMouseDown(false);
        setIsDragging(false);
        dragRef.current = null;
        
        setIsResizeMouseDown(false);
        setIsResizing(false);
        resizeRef.current = null;
      };

      // 마우스가 창 밖으로 나갔을 때도 드래그 중지
      const handleMouseLeave = () => {
        handleGlobalMouseUp();
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isVisible, isMouseDown, isResizeMouseDown, size, position]);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    const chatHeader = e.target as HTMLElement;
    if (chatHeader.closest('.no-drag')) {
      return;
    }
    if (chatHeader.closest('.chat-header')) {
      e.preventDefault(); // 텍스트 선택 방지
      setIsMouseDown(true);
      setIsDragging(false);
      dragRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  // 리사이징 시작
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizeMouseDown(true);
    setIsResizing(false);
    resizeRef.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  // 채팅 메시지 전송 함수
  const handleSendMessage = async () => {
    if (chatMessage.trim() === "" || !chatRoomId || isSending || !myUserId) return;
    
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const tempId = Date.now();
    
    // 메시지 전송 시도
    setChatMessage("");
    setIsSending(true);
    
    try {
      const response = await axios.post(
        `${backUrl}/api/v1/chat/${chatRoomId}/messages`, 
        {
          content: chatMessage,
          chatMessageId: null
        },
        {
          withCredentials: true
        }
      );

      console.log("메시지 전송 응답:", response.data);
      
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      alert("메시지 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  // 채팅방 닫기 핸들러
  const handleClose = () => {
    setIsVisible(false);
    if (chatRoomId) {
      removeChatRoom(chatRoomId);
    }
    onClose();
  };

  // 프로필 이미지 가져오는 함수
  const getProfileImage = useCallback(() => {
    // targetUserImageUrl이 'profile'이거나 없을 때 defaultImageUrl 사용
    if (!targetUserImageUrl || targetUserImageUrl === 'profile') {
      return defaultImageUrl;
    }
    return targetUserImageUrl;
  }, [targetUserImageUrl, defaultImageUrl]);

  if (!isVisible) return null;

  return createPortal(
    <div 
      className="fixed z-[150]"
      style={{ 
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: (isDragging || isResizing) ? 'none' : 'all 0.1s ease',
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col relative"
        style={{ 
          width: `${size.width}px`,
          height: `${size.height}px`,
          border: '1px solid #e5e7eb'
        }}
      >
        {/* 리사이징 핸들 - 왼쪽 상단으로 이동 */}
        <div
          className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50"
          onMouseDown={handleResizeStart}
          style={{
            background: 'transparent',
            position: 'absolute',
            left: '0',
            top: '0',
            width: '15px',
            height: '15px'
          }}
        >
          <div
            className="absolute top-0 left-0"
            style={{
              width: '0',
              height: '0',
              borderStyle: 'solid',
              borderWidth: '15px 15px 0 0',
              borderColor: '#10B981 transparent transparent transparent'
            }}
          />
        </div>

        {/* 채팅 헤더 */}
        <div 
          className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-emerald-500 to-green-500 chat-header"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex items-center">
            <img 
              src={getProfileImage()}
              alt="프로필" 
              className="w-10 h-10 rounded-full object-cover mr-3 select-none border-2 border-white shadow-md"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = defaultImageUrl;
              }}
            />
            <div>
              <h3 className="font-medium select-none text-white">{targetUserNickname || "사용자"}</h3>
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
              <p className="text-emerald-600 font-medium">채팅을 시작해보세요!</p>
              <p className="text-xs mt-2 text-gray-400">반려동물에 대한 정보를 물어볼 수 있습니다.</p>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, index) => {
                if (!msg || !msg.message) return null; // 메시지가 유효하지 않으면 건너뜁니다
                
                return (
                  <div key={msg.id || index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-2`}>
                    {msg.sender !== 'me' && (
                      <Avatar className="h-8 w-8 mr-2 ring-2 ring-white shadow-sm">
                        <img
                          src={getProfileImage()}
                          alt="프로필"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = defaultImageUrl;
                          }}
                        />
                      </Avatar>
                    )}
                    <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                      {msg.sender !== 'me' && (
                        <span className="text-xs text-gray-600 mb-1">{targetUserNickname}</span>
                      )}
                      <div className="flex flex-row items-end">
                        {msg.sender === 'me' && (
                          <span className="text-[10px] text-gray-400 mr-2 shrink-0">{msg.time}</span>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            (msg.message?.length || 0) <= 12 ? 'whitespace-nowrap w-fit' : 'whitespace-pre-wrap break-all'
                          } ${
                            msg.sender === 'me'
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.message}
                        </div>
                        {msg.sender !== 'me' && (
                          <span className="text-[10px] text-gray-400 ml-2 shrink-0">{msg.time}</span>
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
        <div className="p-3 border-t flex items-center bg-white">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
            placeholder="메시지를 입력하세요..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending || !chatRoomId}
          />
          <button 
            className={`ml-2 ${
              isSending || !chatRoomId 
                ? 'bg-gray-400' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
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