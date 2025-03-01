import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import axios from "axios";
import { backUrl } from "@/constants";
import { X } from "lucide-react";
import { ChatModal } from "./ChatModal";
import * as StompJs from '@stomp/stompjs';

const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

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
  const client = useRef<StompJs.Client | null>(null);

  // WebSocket 연결 설정
  useEffect(() => {
    if (isOpen) {
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

      stompClient.onConnect = () => {
        console.log('ChatRoomList WebSocket Connected');
        
        // 전체 채팅방 업데이트를 위한 구독
        stompClient.subscribe('/topic/chat/rooms', (message) => {
          try {
            const updatedRoom = JSON.parse(message.body);
            setChatRooms(prevRooms => {
              return prevRooms.map(room => {
                if (room.id === updatedRoom.id) {
                  return {
                    ...room,
                    chatMessages: updatedRoom.chatMessages,
                    modifiedDate: updatedRoom.modifiedDate
                  };
                }
                return room;
              });
            });
          } catch (error) {
            console.error('채팅방 업데이트 처리 오류:', error);
          }
        });

        // 개별 채팅방 메시지 업데이트를 위한 구독
        chatRooms.forEach(room => {
          stompClient.subscribe(`/topic/api/v1/chat/${room.id}/messages`, (message) => {
            try {
              const newMessage = JSON.parse(message.body);
              setChatRooms(prevRooms => {
                return prevRooms.map(r => {
                  if (r.id === room.id) {
                    return {
                      ...r,
                      chatMessages: [...r.chatMessages, {
                        id: newMessage.id,
                        content: newMessage.content,
                        createDate: newMessage.createDate
                      }],
                      modifiedDate: newMessage.createDate
                    };
                  }
                  return r;
                });
              });
            } catch (error) {
              console.error('메시지 업데이트 처리 오류:', error);
            }
          });
        });
      };

      stompClient.activate();

      return () => {
        if (stompClient.active) {
          stompClient.deactivate();
        }
      };
    }
  }, [isOpen, chatRooms]);

  // 채팅방 목록 불러오기
  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${backUrl}/api/v1/chat/rooms/list`, {
        withCredentials: true
      });
      console.log("=== 채팅방 목록 전체 데이터 ===");
      console.log(response.data.data);
      
      // 각 채팅방의 상세 정보 확인
      response.data.data.forEach((room: ChatRoom) => {
        console.log(`=== 채팅방 ${room.id} 상세 정보 ===`);
        console.log("채팅 시작한 사용자:", {
          id: room.chatUserId,
          nickname: room.chatUserNickname,
          imageUrl: room.chatUserImageUrl
        });
        console.log("채팅 대상 사용자:", {
          id: room.targetUserId,
          nickname: room.targetUserNickname,
          imageUrl: room.targetUserImageUrl
        });
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
    console.log("=== 채팅방 정보 ===");
    console.log("내 ID:", me_id);
    console.log("채팅 시작한 사용자 ID:", room.chatUserId);
    console.log("채팅 대상 사용자 ID:", room.targetUserId);
    console.log("채팅 시작한 사용자 이미지:", room.chatUserImageUrl);
    console.log("채팅 대상 사용자 이미지:", room.targetUserImageUrl);

    const isKakaoDefaultProfile = (url: string) => {
      return url && url.includes('kakaocdn.net') && url.includes('default_profile');
    };

    const getValidImageUrl = (imageUrl: string | undefined) => {
      if (!imageUrl || imageUrl === 'profile' || isKakaoDefaultProfile(imageUrl)) {
        return DEFAULT_IMAGE_URL;
      }
      return imageUrl;
    };

    // 내가 채팅을 시작한 경우
    if (me_id === room.chatUserId) {
      return {
        nickname: room.targetUserNickname,
        imageUrl: getValidImageUrl(room.targetUserImageUrl),
        userId: room.targetUserId
      };
    } 
    // 상대방이 채팅을 시작한 경우
    return {
      nickname: room.chatUserNickname,
      imageUrl: getValidImageUrl(room.chatUserImageUrl),
      userId: room.chatUserId
    };
  };

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
                onClick={() => handleEnterRoom({
                  ...room,
                  targetUserNickname: otherUser.nickname,
                  targetUserImageUrl: otherUser.imageUrl,
                  targetUserId: otherUser.userId
                })}
              >
                <Avatar className="h-10 w-10 mr-3 bg-gray-200 ring-2 ring-emerald-100">
                  <img 
                    src={otherUser.imageUrl || DEFAULT_IMAGE_URL} 
                    alt="프로필" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = DEFAULT_IMAGE_URL;
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
                      {formatTime(room.modifiedDate)}
                    </span>
                  </div>
                </div>
                
                {/* 나가기 버튼 */}
                <button
                  className="absolute right-2 top-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white p-1.5 rounded-full hover:from-emerald-600 hover:to-green-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                  onClick={(e) => handleLeaveRoom(room.id, e)}
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