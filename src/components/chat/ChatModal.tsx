import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";
import axios from "axios";
import { backUrl } from "@/constants";
import { useChatContext } from "@/contexts/ChatContext";

interface ChatMessage {
  id?: number;
  sender: string;
  message: string;
  time: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
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
  const [size, setSize] = useState({ width: 400, height: 500 });
  const resizeRef = useRef<{ x: number; y: number } | null>(null);

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
      const response = await axios.get(
        `${backUrl}/api/v1/chat/${chatRoomId}/messages`,
        { withCredentials: true }
      );

      // API 응답 구조 확인을 위한 로그
      console.log("채팅방 ID:", response.data);
      // console.log("이전 메시지 응답:", response.data);
      // console.log("메시지 배열:", response.data.data);

      // 서버에서 받은 메시지를 UI에 맞게 변환
      const messages = response.data.data.map((msg: any) => ({
        id: msg.id,
        sender: msg.senderId === targetUserId ? "other" : "me",
        message: msg.content,
        time: new Date(msg.createDate).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

      console.log("변환된 메시지:", messages);
      setChatMessages(messages);
    } catch (error) {
      console.error("이전 메시지 로딩 오류:", error);
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

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (isVisible) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDragging && dragRef.current) {
          const newX = e.clientX - dragRef.current.x;
          const newY = e.clientY - dragRef.current.y;
          
          // 화면 경계 체크 (여유 공간 추가)
          const maxX = window.innerWidth - 420;  // 채팅방 너비 + 여유
          const maxY = window.innerHeight - 520; // 채팅방 높이 + 여유
          
          setPosition({
            x: Math.min(Math.max(0, newX), maxX),
            y: Math.min(Math.max(0, newY), maxY)
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
            y: e.clientY
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

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mouseleave', handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mouseleave', handleGlobalMouseUp);
      };
    }
  }, [isVisible, isDragging, isResizing, size, position]);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    const chatHeader = e.target as HTMLElement;
    if (chatHeader.closest('.chat-header')) {
      setIsDragging(true);
      dragRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  // 리사이징 시작
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  // 채팅 메시지 전송 함수
  const handleSendMessage = async () => {
    if (chatMessage.trim() === "" || !chatRoomId || isSending) return;
    
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 임시 메시지 ID (UI 업데이트용)
    const tempId = Date.now();
    
    // 메시지 UI에 먼저 추가 (낙관적 UI 업데이트)
    const newMessage: ChatMessage = {
      id: tempId,
      sender: "me",
      message: chatMessage,
      time: timeString
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatMessage("");
    setIsSending(true);
    
    try {
      // 백엔드 API를 통해 메시지 전송 (인증 없이)
      const response = await axios.post(
        `${backUrl}/api/v1/chat/${chatRoomId}/messages`, 
    
        {
          content: chatMessage,
          chatMessageId: null // 새 메시지이므로 null
        },
         {
          withCredentials: true // 쿠키 기반 인증 사용
        }
      );

      console.log(response.data);
      
      // if (response.data.success) {
      //   // 서버에서 반환된 실제 메시지로 업데이트
      //   const serverMessage = response.data.data;
        
      //   setChatMessages(prev => 
      //     prev.map(msg => 
      //       msg.id === tempId 
      //         ? { 
      //             id: serverMessage.id,
      //             sender: "me",
      //             message: serverMessage.content,
      //             time: timeString
      //           } 
      //         : msg
      //     )
      //   );
      // } else {
      //   // 메시지 전송 실패 시 UI에서 제거
      //   setChatMessages(prev => prev.filter(msg => msg.id !== tempId));
      //   alert("메시지 전송에 실패했습니다.");
      // }
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      // 메시지 전송 실패 시 UI에서 제거
      setChatMessages(prev => prev.filter(msg => msg.id !== tempId));
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

  if (!isVisible) return null;

  return createPortal(
    <div 
      className="fixed z-[150]"
      style={{ 
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging || isResizing ? 'none' : 'all 0.1s ease',
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col relative"
        style={{ 
          width: `${size.width}px`,
          height: `${size.height}px`
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
              borderColor: '#22C55E transparent transparent transparent'
            }}
          />
        </div>

        {/* 채팅 헤더 */}
        <div 
          className="flex justify-between items-center p-4 border-b bg-white chat-header"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex items-center">
            <img 
              src={targetUserImageUrl || defaultImageUrl} 
              alt="프로필" 
              className="w-10 h-10 rounded-full object-cover mr-3 select-none" 
            />
            <div>
              <h3 className="font-medium select-none">{targetUserNickname || "사용자"}</h3>
            </div>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 채팅 내용 */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>채팅을 시작해보세요!</p>
              <p className="text-xs mt-2">반려동물에 대한 정보를 물어볼 수 있습니다.</p>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-3 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender !== 'me' && (
                    <img 
                      src={targetUserImageUrl || defaultImageUrl} 
                      alt="프로필" 
                      className="w-8 h-8 rounded-full object-cover mr-2 self-end" 
                    />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-xs mb-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                      {msg.sender === 'me' ? '나' : targetUserNickname || '상대방'}
                    </span>
                    <div 
                      className={`rounded-lg px-3 py-2 max-w-[70%] ${
                        msg.sender === 'me' 
                          ? 'bg-green-500 text-white self-end' 
                          : 'bg-white border self-start'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* 메시지 입력 */}
        <div className="p-3 border-t flex items-center bg-white">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="메시지를 입력하세요..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending || !chatRoomId}
          />
          <button 
            className={`ml-2 ${isSending || !chatRoomId ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white rounded-full p-2`}
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