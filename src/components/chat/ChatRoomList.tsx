import { Avatar } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { ChatRoom } from "@/types/chat";

interface ChatRoomListProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterRoom: (room: ChatRoom) => void;
  chatRooms: ChatRoom[];
  loading: boolean;
  error: string | null;
  formatLastMessage: (room: ChatRoom) => string;
  formatTime: (dateString: string) => string;
  getOtherUserInfo: (room: ChatRoom) => {
    nickname: string;
    imageUrl: string;
    userId: number;
  };
  onLeaveRoom: (roomId: number, e: React.MouseEvent) => void;
}

export function ChatRoomList({ 
  isOpen, 
  onClose, 
  onEnterRoom, 
  chatRooms,
  loading,
  error,
  formatLastMessage,
  formatTime,
  getOtherUserInfo,
  onLeaveRoom 
}: ChatRoomListProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-16 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-[100] border border-gray-100">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-500 to-green-500">
        <h3 className="font-semibold text-lg text-white">채팅</h3>
        <button 
          className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-1.5 rounded-full hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-sm"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">
          {error}
        </div>
      ) : chatRooms.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-emerald-600 font-medium mb-2">채팅방이 없습니다</div>
          <p className="text-xs text-gray-400">새로운 대화를 시작해보세요!</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {chatRooms.map((room) => {
            const otherUser = getOtherUserInfo(room);
            return (
              <div
                key={room.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 relative group transition-colors"
                onClick={() => onEnterRoom(room)}
              >
                <Avatar className="h-10 w-10 mr-3 bg-gray-200 ring-2 ring-emerald-100">
                  <img
                    src={otherUser.imageUrl}
                    alt="프로필" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";
                    }}
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium truncate text-gray-900">
                      {otherUser.nickname || "상대방"}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-gray-500 truncate flex-1 mr-4">
                      {formatLastMessage(room)}
                    </p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {room.chatMessages && room.chatMessages.length > 0 
                        ? formatTime(room.chatMessages[room.chatMessages.length - 1].createdDate || 
                                     room.chatMessages[room.chatMessages.length - 1].createDate || '')
                        : formatTime(room.modifiedDate)}
                    </span>
                  </div>
                </div>
                
                {/* 나가기 버튼 */}
                <button
                  className="absolute right-2 top-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white p-1.5 rounded-full hover:from-emerald-600 hover:to-green-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                  onClick={(e) => onLeaveRoom(room.id, e)}
                  title="채팅방 나가기"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 