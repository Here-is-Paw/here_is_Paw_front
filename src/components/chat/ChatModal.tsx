import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";
import axios from "axios";
import { backUrl } from "@/constants";

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
  preventAutoClose = false,
  initialMessages = []
}: ChatModalProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);


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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[150]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={preventAutoClose ? undefined : onClose}
      ></div>
      
      <div className="relative w-full max-w-[400px] bg-white rounded-lg shadow-lg overflow-hidden z-[151] flex flex-col h-[500px]">
        {/* 채팅 헤더 */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <img 
              src={targetUserImageUrl || defaultImageUrl} 
              alt="프로필" 
              className="w-10 h-10 rounded-full object-cover mr-3" 
            />
            <div>
              <h3 className="font-medium">{targetUserNickname || "사용자"}</h3>
            </div>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
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
            chatMessages.map((msg, index) => (
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
            ))
          )}
        </div>
        
        {/* 메시지 입력 */}
        <div className="p-3 border-t flex items-center">
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