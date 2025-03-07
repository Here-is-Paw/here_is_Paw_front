import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Bell, LogOut } from "lucide-react";
import { FilterButton } from "./filterButton";
import { KakaoLoginPopup } from "@/components/kakaoLogin/KakaoLoginPopup.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { MissingFormPopup } from "../missingPost/missingPost";
import { usePetContext } from "@/contexts/findPetContext";
import axios from "axios";
import { backUrl } from "@/constants";
import FindLocationPicker from "@/components/petCard/findNcpMap";
import { useState, useEffect, useRef } from "react";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { ChatModal } from "@/components/chat/ChatModal";
import * as StompJs from "@stomp/stompjs";
import { chatEventBus } from "@/contexts/ChatContext";
import { ChatRoom, OpenChatRoom } from "@/types/chat";
import { useRadius } from "@/contexts/RadiusContext.tsx";

interface NavBarProps {
  buttonStates: {
    lost: boolean;
    found: boolean;
    hospital: boolean;
  };
  toggleButton: (buttonName: "lost" | "found" | "hospital") => void;
}

const DEFAULT_IMAGE_URL =
  "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

export function NavBar({ buttonStates, toggleButton }: NavBarProps) {
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { radius } = useRadius();
  // const findLocation = useGeolocation()

  // 마지막 메시지 시간으로 채팅방 정렬 함수
  const sortChatRoomsByLastMessageTime = (rooms: ChatRoom[]) => {
    return [...rooms].sort((a, b) => {
      const aLastMessageTime = a.chatMessages && a.chatMessages.length > 0
        ? new Date(a.chatMessages[a.chatMessages.length - 1].createdDate ||
                  a.chatMessages[a.chatMessages.length - 1].createDate ||
                  a.modifiedDate).getTime()
        : new Date(a.modifiedDate).getTime();

      const bLastMessageTime = b.chatMessages && b.chatMessages.length > 0
        ? new Date(b.chatMessages[b.chatMessages.length - 1].createdDate ||
                  b.chatMessages[b.chatMessages.length - 1].createDate ||
                  b.modifiedDate).getTime()
        : new Date(b.modifiedDate).getTime();

      return bLastMessageTime - aLastMessageTime;
    });
  };

  console.log(isLoggedIn);

  const handleLogout = async () => {
    try {
      await axios.patch(
        `${backUrl}/api/v1/members/radius`,
        { radius },
        { withCredentials: true }
      );
      await axios.delete(`${backUrl}/api/v1/members/logout`, {
        withCredentials: true,
      });
      logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const [isResistModalOpen, setIsResistModalOpen] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [breed, setBreed] = useState("");
  const [geoX, setGeoX] = useState(0);
  const [geoY, setGeoY] = useState(0);
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [etc, setEtc] = useState("");
  const [situation, setSituation] = useState("");
  const [title, setTitle] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(0);
  const [neutered, setNeutered] = useState(0);
  const [me_id, setMe_id] = useState(0);

  const { incrementSubmissionCount } = usePetContext();

  const handleLocationSelect = (location: {
    x: number;
    y: number;
    address: string;
  }) => {
    setGeoX(location.x);
    setGeoY(location.y);
    setLocation(location.address);

    console.log("missing geo", location);
  };

  const handleBreed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBreed(e.target.value);
  };

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEtc = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEtc(e.target.value);
  };

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const handleSituation = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSituation(e.target.value);
  };

  const handleTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleGender = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(parseInt(e.target.value));
  };

  const handleAge = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(e.target.value);
  };

  const handleNeutered = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNeutered(parseInt(e.target.value));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);

      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  useEffect(() => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    localStorage.removeItem("uploadedImage");
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const memberResponse = await axios.get(`${backUrl}/api/v1/members/me`, {
          withCredentials: true,
        });

        console.log("memberResponse.data.data.id", memberResponse.data.data.id);

        setMe_id(memberResponse.data.data.id);
      } catch (error) {
        console.error("유저 정보 가져오기 실패:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleFindSubmit = async () => {
    if (isLoggedIn) {
      const memberResponse = await axios.get(`${backUrl}/api/v1/members/me`, {
        withCredentials: true,
      });

      const member_id = memberResponse.data.data.id;
      setMe_id(member_id);

      try {
        const formData = new FormData();

        if (imageFile) {
          formData.append("file", imageFile);
        }

        formData.append("title", title);
        formData.append("situation", situation);
        formData.append("breed", breed);
        formData.append("location", location);
        formData.append("x", geoX.toString());
        formData.append("y", geoY.toString());
        formData.append("name", name);
        formData.append("color", color);
        formData.append("etc", etc);
        formData.append("gender", gender.toString());
        formData.append("age", age);
        formData.append("neutered", neutered.toString());
        formData.append("find_date", "2025-02-20T00:00:00");
        formData.append("member_id", member_id);
        formData.append("shelter_id", "1");

        const response = await axios.post(`${backUrl}/find/new`, formData, {
          withCredentials: true,
        });

        if (response.status === 200 || response.status === 201) {
          alert("발견 신고가 성공적으로 저장되었습니다!");
          incrementSubmissionCount();
          handleRemoveImage();
        } else {
          alert("저장 실패");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("오류가 발생했습니다.");
        handleRemoveImage();
      }
    } else {
      alert("로그인 후 이용 가능한 서비스 입니다!");
      return;
    }
  };

  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const chatListRef = useRef<HTMLDivElement>(null);
  const [openChatRooms, setOpenChatRooms] = useState<OpenChatRoom[]>([]);
  const client = useRef<StompJs.Client | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnterChatRoom = (room: ChatRoom) => {
    setOpenChatRooms(prev => {
      const existingRoomIndex = prev.findIndex(r => r.id === room.id);

      if (existingRoomIndex >= 0) {
        return prev.map((r, index) => ({
          ...r,
          isOpen: index === existingRoomIndex,
        }));
      } else {
        const otherUser = getOtherUserInfo(room);
        return [...prev, { 
          ...room, 
          isOpen: true,
          targetUserNickname: otherUser.nickname,
          targetUserImageUrl: otherUser.imageUrl,
          targetUserId: otherUser.userId
        }];
      }
    });
  };

  const handleCloseChatRoom = (roomId: number) => {
    setOpenChatRooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("======= 채팅방 목록 데이터 로드 시작 =======");
      
      // 채팅방 목록 API 호출
      const response = await axios.get(`${backUrl}/api/v1/chat/rooms/list`, {
        withCredentials: true,
      });
      
      console.log("====== 원본 API 응답 데이터 ======");
      console.log("채팅방 목록 데이터:", response.data.data);
      
      // 첫 번째 채팅방 상세 정보 (있는 경우)
      if (response.data.data && response.data.data.length > 0) {
        const firstRoom = response.data.data[0];
        console.log("====== 첫 번째 채팅방 상세 구조 ======");
        console.log("채팅방 ID:", firstRoom.id);
        console.log("채팅방 객체 키 목록:", Object.keys(firstRoom));
        
        // 메시지 데이터 확인
        if (firstRoom.chatMessages && firstRoom.chatMessages.length > 0) {
          const firstMessage = firstRoom.chatMessages[0];
          console.log("====== 첫 번째 메시지 상세 구조 ======");
          console.log("메시지 객체 키 목록:", Object.keys(firstMessage));
          console.log("메시지 JSON 전체 데이터:", JSON.stringify(firstMessage, null, 2));
          
          // 메시지에 읽음 상태 필드가 있는지 확인
          const hasReadField = Object.keys(firstMessage).some(key => 
            key.toLowerCase().includes('read') || key.toLowerCase().includes('unread')
          );
          console.log("메시지에 읽음 상태 관련 필드 존재:", hasReadField);
          
          // 읽음 상태 관련 필드 찾기
          const readFields = Object.keys(firstMessage).filter(key => 
            key.toLowerCase().includes('read') || key.toLowerCase().includes('unread')
          );
          if (readFields.length > 0) {
            console.log("읽음 상태 관련 필드:", readFields);
            readFields.forEach(field => {
              console.log(`- ${field}: ${firstMessage[field]}`);
            });
          }
        } else {
          console.log("채팅 메시지 없음");
        }
        
        // 현재 로그인 사용자와의 관계 확인
        console.log("====== 사용자 관계 확인 ======");
        console.log("현재 로그인 사용자 ID:", me_id);
        console.log("채팅 생성 사용자 ID:", firstRoom.chatUserId);
        console.log("타겟 사용자 ID:", firstRoom.targetUserId);
        console.log("현재 사용자가 채팅 생성자인가:", firstRoom.chatUserId === me_id);
        console.log("현재 사용자가 타겟 사용자인가:", firstRoom.targetUserId === me_id);
      }
      
      // 사용자와 관련된 채팅방만 필터링
      const filteredRooms = response.data.data.filter(
        (room: ChatRoom) =>
          room.chatUserId === me_id || room.targetUserId === me_id
      );
      
      // 최근 메시지 순으로 정렬
      const sortedRooms = sortChatRoomsByLastMessageTime(filteredRooms);
      
      console.log("======= 안 읽은 메시지 수 계산 =======");
      // 각 채팅방의 안 읽은 메시지 수 계산
      sortedRooms.forEach((room: any) => {
        // 현재 사용자가 채팅 사용자인지 대상 사용자인지 확인
        const isCurrentUserChatUser = room.chatUserId === me_id;
        const isCurrentUserTargetUser = room.targetUserId === me_id;
        
        console.log(`[채팅방 ${room.id}] 현재 사용자는 채팅 사용자=${isCurrentUserChatUser}, 대상 사용자=${isCurrentUserTargetUser}`);
        
        // 안 읽은 메시지 수 계산
        let unreadCount = 0;
        
        if (room.chatMessages && room.chatMessages.length > 0) {
          console.log(`[채팅방 ${room.id}] 메시지 총 개수: ${room.chatMessages.length}`);
          
          // 메시지 객체에 어떤 읽음 상태 필드가 있는지 확인
          const lastMessage = room.chatMessages[room.chatMessages.length - 1];
          const readFields = Object.keys(lastMessage).filter(key => 
            key.toLowerCase().includes('read')
          );
          console.log(`[채팅방 ${room.id}] 메시지의 읽음 상태 필드:`, readFields);
          
          // 각 메시지의 읽음 상태를 확인하여 안 읽은 메시지 수 계산
          room.chatMessages.forEach((msg: any, index: number) => {
            let isRead = false;
            
            // 현재 사용자가 채팅 사용자인 경우 chatUserRead 필드를 확인
            if (isCurrentUserChatUser) {
              isRead = msg.chatUserRead === true;
              if (!isRead) {
                unreadCount++;
                console.log(`  - 메시지 ${index + 1} (${msg.content.substring(0, 10)}...): chatUserRead = ${msg.chatUserRead}, 안 읽음`);
              }
            }
            // 현재 사용자가 대상 사용자인 경우 targetUserRead 필드를 확인
            else if (isCurrentUserTargetUser) {
              isRead = msg.targetUserRead === true;
              if (!isRead) {
                unreadCount++;
                console.log(`  - 메시지 ${index + 1} (${msg.content.substring(0, 10)}...): targetUserRead = ${msg.targetUserRead}, 안 읽음`);
              }
            }
          });
        }
        
        // 계산된 안 읽은 메시지 수 설정
        room.unreadCount = unreadCount;
        console.log(`[채팅방 ${room.id}] 계산된 안 읽은 메시지 수: ${unreadCount}`);
      });
      
      console.log("======= 채팅방 목록 데이터 로드 완료 =======");
      
      setChatRooms(sortedRooms);
    } catch (err) {
      console.error("[채팅방 API] 채팅방 목록 조회 오류:", err);
      setError("채팅방 목록을 불러오는데 오류가 발생했습니다.");
    } finally {
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
        { withCredentials: true }
      );

      console.log("채팅방 나가기 응답:", response.data);

      if (response.status === 200) {
        setChatRooms(prev => prev.filter(room => room.id !== roomId));
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
      if (!room.chatMessages || !Array.isArray(room.chatMessages) || room.chatMessages.length === 0) {
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
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${hours < 12 ? '오전' : '오후'} ${hours % 12 || 12}:${minutes}`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const getValidImageUrl = (imageUrl: string | undefined) => {
    const isKakaoDefaultProfile = (url: string) => {
      return url && url.includes('kakaocdn.net') && url.includes('default_profile');
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
    const isMyChat = me_id === room.chatUserId;
    
    return {
      nickname: isMyChat ? room.targetUserNickname : room.chatUserNickname,
      imageUrl: getValidImageUrl(isMyChat ? room.targetUserImageUrl : room.chatUserImageUrl),
      userId: isMyChat ? room.targetUserId : room.chatUserId
    };
  };

  useEffect(() => {
    if (isLoggedIn && isChatListOpen) {
      const stompClient = new StompJs.Client({
        brokerURL: `${backUrl.replace('http', 'ws')}/ws`,
        connectHeaders: {},
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: () => {
          const ws = new WebSocket(`${backUrl.replace('http', 'ws')}/ws`);
          ws.onerror = (err) => {
            console.error('WebSocket 에러:', err);
          };
          return ws;
        }
      });

      client.current = stompClient;

      stompClient.onConnect = () => {
        console.log('NavBar WebSocket Connected');
        
        stompClient.subscribe('/topic/api/v1/chat/new-room', (message) => {
          try {
            const newRoomData = JSON.parse(message.body);
            console.log('새로운 채팅방 생성됨:', newRoomData);
            
            if (newRoomData.chatUserId === me_id || newRoomData.targetUserId === me_id) {
              setChatRooms(prevRooms => {
                if (!prevRooms.some(room => room.id === newRoomData.id)) {
                  const newRoom = {
                    id: newRoomData.id,
                    chatUserNickname: newRoomData.chatUserNickname,
                    chatUserImageUrl: newRoomData.chatUserImageUrl || DEFAULT_IMAGE_URL,
                    chatUserId: newRoomData.chatUserId,
                    targetUserNickname: newRoomData.targetUserNickname,
                    targetUserImageUrl: newRoomData.targetUserImageUrl || DEFAULT_IMAGE_URL,
                    targetUserId: newRoomData.targetUserId,
                    chatMessages: [],
                    modifiedDate: new Date().toISOString()
                  };

                  subscribeToRoom(newRoomData.id);

                  return sortChatRoomsByLastMessageTime([...prevRooms, newRoom]);
                }
                return prevRooms;
              });
            } else {
              console.log('새 채팅방이 현재 사용자와 관련이 없어 무시됨:', newRoomData);
            }
          } catch (error) {
            console.error('새로운 채팅방 데이터 처리 오류:', error);
          }
        });

        // 읽음 상태 변경 이벤트 구독
        stompClient.subscribe('/topic/api/v1/chat/read-status', (message) => {
          try {
            const readStatusData = JSON.parse(message.body);
            console.log('읽음 상태 변경 이벤트 수신:', readStatusData);
            
            // 채팅방 목록 갱신
            fetchChatRooms();
          } catch (error) {
            console.error('읽음 상태 변경 이벤트 처리 오류:', error);
          }
        });

        const subscribeToRoom = (roomId: number) => {
          console.log(`채팅방 ${roomId} 메시지 구독 설정`);
          stompClient.subscribe(`/topic/api/v1/chat/${roomId}/messages`, (message) => {
            try {
              const messageData = JSON.parse(message.body);
              console.log(`채팅방 ${roomId} 새 메시지:`, messageData);
              
              setChatRooms(prevRooms => {
                const updatedRooms = prevRooms.map(room => {
                  if (room.id === roomId) {
                    console.log(`채팅방 ${room.id}에 새 메시지 추가:`, {
                      id: messageData.chatMessageId,
                      content: messageData.content,
                      createDate: messageData.createdDate
                    });

                    return {
                      ...room,
                      chatMessages: [...room.chatMessages, {
                        id: messageData.chatMessageId,
                        content: messageData.content,
                        createDate: messageData.createdDate,
                        createdDate: messageData.createdDate
                      }],
                      modifiedDate: messageData.createdDate
                    };
                  }
                  return room;
                });

                const filteredRooms = updatedRooms.filter((room: ChatRoom) =>
                  room.chatUserId === me_id || room.targetUserId === me_id
                );

                return sortChatRoomsByLastMessageTime(filteredRooms);
              });
            } catch (error) {
              console.error(`채팅방 ${roomId} 메시지 처리 오류:`, error);
            }
          });
        };

        chatRooms.forEach(room => {
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
  }, [isLoggedIn, isChatListOpen, chatRooms]);

  useEffect(() => {
    if (isLoggedIn) {
      const unsubscribe = chatEventBus.onRefreshChatRooms(() => {
        console.log("채팅방 목록 갱신 이벤트 수신됨");
        
        // 채팅방 목록 데이터 갱신
        fetchChatRooms();
        
        // 콘솔에 로그 출력하여 갱신 여부 확인
        console.log("채팅방 목록 갱신 API 호출 완료");
      });

      // 새 채팅방 추가 이벤트 구독
      const unsubscribeAddRoom = chatEventBus.onAddChatRoom((newChatRoom) => {
        console.log("새 채팅방 추가 이벤트 수신됨:", newChatRoom);

        // 기존 채팅방 목록에 새 채팅방 추가
        setChatRooms(prevRooms => {
          // 이미 존재하는 채팅방인지 확인
          const existingRoomIndex = prevRooms.findIndex(room => room.id === newChatRoom.id);

          // 존재하지 않는 경우에만 새로 추가
          if (existingRoomIndex === -1) {
            const updatedRooms = [...prevRooms, newChatRoom];

            // 필터링 및 정렬
            const filteredRooms = updatedRooms.filter((room) =>
              room.chatUserId === me_id || room.targetUserId === me_id
            );

            return sortChatRoomsByLastMessageTime(filteredRooms);
          }

          // 기존에 동일한 ID의 채팅방이 있으면 업데이트
          const updatedRooms = [...prevRooms];
          updatedRooms[existingRoomIndex] = {
            ...updatedRooms[existingRoomIndex],
            ...newChatRoom
          };

          // 필터링 및 정렬
          const filteredRooms = updatedRooms.filter((room) =>
            room.chatUserId === me_id || room.targetUserId === me_id
          );

          return sortChatRoomsByLastMessageTime(filteredRooms);
        });
      });

      return () => {
        unsubscribe();
        unsubscribeAddRoom();
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && isChatListOpen) {
      fetchChatRooms();
    }
  }, [isLoggedIn, isChatListOpen]);

  return (
    <>
      <nav className="mt-5 fixed right-0 z-50 w-[calc(100%-24rem)] max-lg:w-[calc(100%-18rem)]">
        <div className="px-4 max-lg:px-1">
          <div className="flex gap-1 justify-between items-center py-1 min-h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
            <div className="flex-none pl-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-green-600 rounded-full"
                onClick={() => setIsResistModalOpen(!isResistModalOpen)}
              >
                <Plus className="h-4 w-4 text-white" />
              </Button>
              {isResistModalOpen && (
                <div className="absolute top-[3%] left-[0%] bg-white rounded-lg  w-[200px] overflow-hidden z-50">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start hover:bg-gray-100 bgr-white h-12"
                      onClick={() => {
                        setIsResistModalOpen(false);
                      }}
                    >
                      <div className="w-6 h-6 mr-2 rounded-full bg-green-600 flex items-center justify-center btn-size">
                        <Plus className="h-4 w-4 text-white" />
                      </div>
                      등록하기
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start p-4 hover:bg-gray-100 bgr-white h-12"
                      onClick={() => {
                        setIsAddPetOpen(true);
                      }}
                    >
                      <div className="w-10 h-10 mr-2 rounded-full flex items-center justify-center">
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
                      className="flex items-center justify-start p-4 hover:bg-gray-100 bgr-white h-12"
                      onClick={() => {
                        if (!isLoggedIn) {
                          alert("로그인 후 이용해주세요!");
                        } else {
                          setIsFindModalOpen(!isFindModalOpen);
                        }
                        setIsResistModalOpen(false);
                      }}
                    >
                      <div className="w-6 h-6 mr-2 rounded-full flex items-center justify-center btn-size">
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
              )}
            </div>

            <div className="flex-1 flex flex-wrap justify-end items-center gap-1 pr-4">
              <div className="flex flex-wrap justify-end w-full gap-3">
                <FilterButton
                  buttonStates={buttonStates}
                  toggleButton={toggleButton}
                />

                {isLoggedIn ? (
                  <>
                    <div ref={chatListRef}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsChatListOpen(!isChatListOpen)}
                      >
                        <MessageSquare className="h-4 w-4" />
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
                      />
                    </div>
                    <Button variant="ghost" size="icon">
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      로그아웃
                    </Button>
                  </>
                ) : (
                  <KakaoLoginPopup />
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <MissingFormPopup open={isAddPetOpen} onOpenChange={setIsAddPetOpen} />

      {isFindModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFindModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
            </div>

            <p className="mb-4 text-gray-600">
              등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.
            </p>

            <div className="space-between text-[15px]">
              <div className="w-80">
                <div className="mb-4 ">
                  <label className="block font-medium mb-2">* 제목</label>
                  <textarea
                    className="border p-2 w-full bg-white resize-none"
                    rows={1}
                    placeholder="게시글의 제목을 입력해주세요."
                    onChange={handleTitle}
                  />
                </div>

                {imagePreview ? (
                  <div className="mb-4">
                    <label className="block font-medium mb-2">
                      반려동물 사진
                    </label>
                    <div className="mt-2 flex">
                      <img
                        src={imagePreview}
                        alt="미리보기"
                        className="w-60 h-60 object-cover rounded"
                      />
                      <div className="mt-[77%]">
                        <button
                          className=" bg-red-500 h-4 w-4 "
                          onClick={handleRemoveImage}
                        >
                          <Plus className="text-white rotate-45 absolute top-[54.7%] left-[34%]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block font-medium mb-2">
                      반려동물 사진
                    </label>
                    <input
                      type="file"
                      className="border p-2 w-full"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}

                <div className="mb-4 ">
                  <label className="block font-medium mb-2 ">* 발견 상황</label>
                  <textarea
                    className="border p-2 w-full bg-white resize-none"
                    rows={2}
                    placeholder="발견 당시 상황을 입력해주세요."
                    onChange={handleSituation}
                  />
                </div>

                <div className="mb-4 flex justify-between">
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">견종</label>
                    <input
                      className="border p-2 w-full bg-white"
                      placeholder="견종"
                      onChange={handleBreed}
                    />
                  </div>
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">색상</label>
                    <input
                      className="border p-2 w-full bg-white"
                      placeholder="색상"
                      onChange={handleColor}
                    />
                  </div>
                  <div className="w-20">
                    <label className="block font-medium mb-2 ">이름</label>
                    <input
                      className="border p-2 w-full bg-white"
                      placeholder="이름"
                      onChange={handleName}
                    />
                  </div>
                </div>
                <div className="mb-4 flex justify-between">
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">성별</label>
                    <select
                      className="border p-2 w-full bg-white"
                      onChange={handleGender}
                    >
                      <option value="0">미상</option>
                      <option value="1">수컷</option>
                      <option value="2">암컷</option>
                    </select>
                  </div>
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">중성화</label>
                    <select
                      className="border p-2 w-full bg-white"
                      onChange={handleNeutered}
                    >
                      <option value="0">미상</option>
                      <option value="1">중성화 됌</option>
                      <option value="2">중성화 안됌</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block font-medium mb-2 ">나이</label>
                    <input
                      className="border p-2 w-full bg-white"
                      placeholder="추정 나이"
                      onChange={handleAge}
                    />
                  </div>
                </div>
              </div>
              <div className="w-80">
                <FindLocationPicker onLocationSelect={handleLocationSelect} />
                <div className="mb-4 ">
                  <label className="block font-medium mb-2 ">특이 사항</label>
                  <textarea
                    className="border p-2 w-full bg-white resize-none"
                    rows={2}
                    placeholder="특징을 설명해주세요."
                    onChange={handleEtc}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 h-6">
              <button
                className="px-4 py-0 rounded bg-gray-200 hover:bg-gray-300 "
                onClick={() => setIsFindModalOpen(false)}
              >
                취소하기
              </button>
              <button
                className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  handleFindSubmit();
                  setIsFindModalOpen(false);
                }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {openChatRooms.map((room) => (
        <ChatModal
          key={room.id}
          isOpen={room.isOpen}
          onClose={() => handleCloseChatRoom(room.id)}
          defaultImageUrl={DEFAULT_IMAGE_URL}
          chatRoomId={room.id}
          targetUserImageUrl={room.targetUserImageUrl}
          targetUserNickname={room.targetUserNickname}
        />
      ))}
    </>
  );
}
