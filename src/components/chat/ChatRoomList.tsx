import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { ChatRoom } from "@/types/chat";
import { useEffect } from "react";


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
  renderTrigger?: number;
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
  onLeaveRoom,
  renderTrigger
}: ChatRoomListProps) {
  useEffect(() => {
    if (renderTrigger !== undefined) {
      console.log("ChatRoomList 강제 리렌더링 트리거:", renderTrigger);
    }
  }, [renderTrigger]);

  if (!isOpen) return null;
  
  return (
    <div className="absolute top-12 right-16 w-80 bg-white rounded-xl shadow-lg overflow-hidden z-[100] border border-gray-200">
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
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <div className="p-2">
            {chatRooms.map((room) => {
              const otherUser = getOtherUserInfo(room);
              // TypeScript에서 인식할 수 있도록 수정
              const roomWithUnread = room as ChatRoom & { unreadCount?: number };
              console.log(`채팅방 ${room.id} 안 읽은 메시지 수:`, roomWithUnread.unreadCount);
              
              // 메시지에 읽음 상태 관련 필드가 있는지 확인
              const msgAny = room.chatMessages && room.chatMessages.length > 0 ? room.chatMessages[room.chatMessages.length - 1] as any : null;
              const hasReadField = msgAny && Object.keys(msgAny).some(key => 
                key.toLowerCase().includes('read') || key.toLowerCase().includes('unread')
              );
              
              if (hasReadField) {
                // 읽음 상태 관련 필드 출력
                const readFields = Object.keys(msgAny).filter(key => 
                  key.toLowerCase().includes('read') || key.toLowerCase().includes('unread')
                );
                
                console.log("- 메시지 읽음 상태 필드:", readFields);
                readFields.forEach(field => {
                  console.log(`  - ${field}: ${msgAny[field]}`);
                });
                
                // chatUserRead와 targetUserRead 필드 확인
                if ('chatUserRead' in msgAny) {
                  console.log(`  - chatUserRead (채팅 사용자 읽음 여부): ${msgAny.chatUserRead}`);
                }
                if ('targetUserRead' in msgAny) {
                  console.log(`  - targetUserRead (대상 사용자 읽음 여부): ${msgAny.targetUserRead}`);
                }
              } else {
                console.log("- 메시지에 읽음 상태 관련 필드 없음");
              }
              
              return (
                <div className="bg-white rounded-xl p-4 mb-2 cursor-pointer hover:bg-gray-50 relative group" 
                  onClick={() => onEnterRoom(room)}
                  key={room.id}
                >
                  {/* 나가기 버튼 - 원래 위치인 오른쪽 상단으로 이동 */}
                  <button
                    className="absolute right-2 top-2 bg-gray-200 text-gray-600 p-1 rounded-full hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      onLeaveRoom(room.id, e);
                    }}
                    title="채팅방 나가기"
                  >
                    <X size={12} />
                  </button>
                  
                  <div className="flex"> {/* 패딩 제거 */}
                    <div className="relative mr-3 flex-shrink-0">
                      {/* 안 읽은 메시지 수 표시 - 아바타 옆에 배치 유지 */}
                      {(room.unreadCount || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium z-10">
                          {(room.unreadCount || 0) > 99 ? '99+' : room.unreadCount}
                        </div>
                      )}
                      <Avatar className="h-10 w-10 overflow-hidden">
                        <AvatarImage 
                          src={otherUser.imageUrl} 
                          alt={otherUser.nickname}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // @ts-ignore - src 속성 접근 오류 방지
                            e.currentTarget.src = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";
                          }}
                        />
                        <AvatarFallback>
                          {otherUser.nickname?.substring(0, 2).toUpperCase() || "사용자"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
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
                        {/* 시간 정보 원래 위치로 복원 */}
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {room.chatMessages && room.chatMessages.length > 0 
                            ? formatTime(room.chatMessages[room.chatMessages.length - 1].createdDate || 
                                       room.chatMessages[room.chatMessages.length - 1].createDate || '')
                            : formatTime(room.modifiedDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 