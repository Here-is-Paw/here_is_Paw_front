import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import axios from "axios";
import { backUrl } from "@/constants";
import { X } from "lucide-react";
import { ChatModal } from "./ChatModal";

interface ChatRoom {
  id: number;
  chatUserNickname: string;
  chatUserImageUrl: string;
  chatUserId: number;
  targetUserNickname: string;
  targetUserId: number;
  targetUserImageUrl: string;
  chatMessages: ChatMessage[];
  modifiedDate: string;
}

interface ChatMessage {
  id: number;
  content: string;
  createDate: string;
}

interface ChatRoomListProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterRoom: (room: ChatRoom) => void;
  me_id: number;
}

export function ChatRoomList({ isOpen, onClose, onEnterRoom, me_id }: ChatRoomListProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 채팅방 목록 불러오기
  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${backUrl}/api/v1/chat/rooms/list`, {
        withCredentials: true
      });
      console.log("채팅방 목록 응답:", response.data);
      // 각 채팅방의 ID 확인
      response.data.data.forEach((room: ChatRoom) => {
        console.log("채팅방 ID:", room.id, "상대방:", room.targetUserNickname);
      });
      setChatRooms(response.data.data);
    } catch (err) {
      console.error("채팅방 목록 조회 오류:", err);
      setError("채팅방 목록을 불러오는데 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 채팅방 나가기
  const handleLeaveRoom = async (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (!confirm("정말 채팅방을 나가시겠습니까?")) return;
    
    try {
      const response = await axios.post(
        `${backUrl}/api/v1/chat/rooms/${roomId}/leave`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // 성공적으로 나갔으면 목록에서 제거
        setChatRooms(prev => prev.filter(room => room.id !== roomId));
      } else {
        alert("채팅방 나가기에 실패했습니다.");
      }
    } catch (err) {
      console.error("채팅방 나가기 오류:", err);
      alert("채팅방 나가기 중 오류가 발생했습니다.");
    }
  };

  // 채팅방 입장
  const handleEnterRoom = (room: ChatRoom) => {
    onEnterRoom(room);
  };

  // useEffect 수정 - 채팅방 초기화 로직 제거
  useEffect(() => {
    if (isOpen) {
      fetchChatRooms(); // 채팅방 목록만 불러오기
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 채팅 메시지 포맷팅 함수
  const formatLastMessage = (room: ChatRoom) => {
    if (!room.chatMessages || room.chatMessages.length === 0) {
      return "대화 내용이 없습니다.";
    }
    
    // 가장 최근 메시지 가져오기
    const lastMessage = room.chatMessages[room.chatMessages.length - 1];
    return lastMessage.content;
  };

  // 시간 포맷팅 함수
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  // 채팅 상대방 정보를 가져오는 함수
  const getOtherUserInfo = (room: ChatRoom) => {
    console.log("me_id:", me_id);
    console.log("room.chatUserId:", room.chatUserId);
    console.log("room.targetUserId:", room.targetUserId);

    if (me_id === room.chatUserId) {
      return {
        nickname: room.targetUserNickname,
        imageUrl: room.targetUserImageUrl,
        userId: room.targetUserId
      };
    } else {
      return {
        nickname: room.chatUserNickname,
        imageUrl: room.chatUserImageUrl,
        userId: room.chatUserId
      };
    }
  };

  return (
    <div className="absolute top-12 right-16 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-[100]">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-lg">채팅</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
      
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          채팅방 목록을 불러오는 중...
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">
          {error}
        </div>
      ) : chatRooms.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          채팅방이 없습니다.
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {chatRooms.map((room) => {
            const otherUser = getOtherUserInfo(room);
            return (
              <div
                key={room.id}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 relative"
                onClick={() => handleEnterRoom({
                  ...room,
                  targetUserNickname: otherUser.nickname,
                  targetUserImageUrl: otherUser.imageUrl,
                  targetUserId: otherUser.userId
                })}
              >
                <Avatar className="h-10 w-10 mr-3 bg-gray-200">
                  {otherUser.imageUrl ? (
                    <img 
                      src={otherUser.imageUrl} 
                      alt="프로필" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-xs">프로필</div>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium truncate">
                      {otherUser.nickname || "상대방"}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(room.modifiedDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {formatLastMessage(room)}
                  </p>
                </div>
                
                {/* 나가기 버튼 */}
                <button 
                  className="absolute right-2 top-2 text-gray-400 hover:text-red-500 p-1"
                  onClick={(e) => handleLeaveRoom(room.id, e)}
                  title="채팅방 나가기"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 