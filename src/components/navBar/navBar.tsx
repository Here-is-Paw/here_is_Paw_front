import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Bell, LogOut } from "lucide-react";
import { FilterButton } from "./filterButton";
import { KakaoLoginPopup } from "@/components/kakaoLogin/KakaoLoginPopup.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { usePetContext } from "@/contexts/findPetContext";
import axios from "axios";
import { backUrl } from "@/constants";
import { useState, useEffect, useRef } from "react";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { ChatModal } from "@/components/chat/ChatModal";
import * as StompJs from '@stomp/stompjs';
// import NcpMap from './findNcpMap'
// import useGeolocation from '@/hooks/Geolocation'

// import { Dialog, DialogContent } from "@/components/ui/dialog"

interface NavBarProps {
  buttonStates: {
    lost: boolean;
    found: boolean;
    hospital: boolean;
  };
  toggleButton: (buttonName: "lost" | "found" | "hospital") => void;
}

// ChatRoom 인터페이스 추가
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

interface OpenChatRoom extends ChatRoom {
  isOpen: boolean;
}

const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

export function NavBar({ buttonStates, toggleButton }: NavBarProps) {
  const { isLoggedIn, logout } = useAuth();
  // const findLocation = useGeolocation()

  console.log(isLoggedIn);

  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출 (필요한 경우)
      await axios.delete(`${backUrl}/api/v1/members/logout`, {
        withCredentials: true,
      });
      logout(); // Context 상태 업데이트
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const [isResistModalOpen, setIsResistModalOpen] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [breed, setBreed] = useState("");
  // const [geo, setGeo] = useState("");
  // const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [gender, setGender] = useState("");
  const [etc, setEtc] = useState("");
  const [situation, setSituation] = useState("");
  const [title, setTitle] = useState("");
  const [age, setAge] = useState("");
  const [neutered, setNeutered] = useState("");
  const [me_id, setMe_id] = useState(0);

  const { incrementSubmissionCount } = usePetContext();

  //   private Long member_id; // 신고한 회원 id
  //   private Long shelter_id; // 보호소 id

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
    setGender(e.target.value);
  };

  const handleAge = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(e.target.value);
  };

  const handleNeutered = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNeutered(e.target.value);
  };

  // 파일 업로드 핸들러
  // const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const imageUrl = URL.createObjectURL(file);
  //     setImagePreview(imageUrl);
  //   }
  // };
  useEffect(() => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  // 🔹 파일 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        localStorage.setItem("uploadedImage", base64String); // 🔹 localStorage에 저장
      };
      reader.readAsDataURL(file);
    }
  };

  // 파일 삭제 핸들러
  const handleRemoveImage = () => {
    setImagePreview(null);
    localStorage.removeItem("uploadedImage"); // 🔹 localStorage에서도 삭제
  };

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const memberResponse = await axios.get(`${backUrl}/api/v1/members/me`, {
          withCredentials: true,
        });
        setMe_id(memberResponse.data.id);
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    };

    fetchUserInfo();
  }, []); // 빈 배열을 넣어 한 번만 실행되도록 설정

  const handleFindSubmit = async () => {
    if (isLoggedIn) {
      const memberResponse = await axios.get(`${backUrl}/api/v1/members/me`, {
        withCredentials: true,
      });

      const member_id = memberResponse.data.id;
      setMe_id(member_id);

      try {
        const response = await fetch(`${backUrl}/find/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            situation: situation,
            breed: breed,
            location: "서울 강남구 어딘가",
            geo: { x: 12, y: 12},
            name: name,
            color: color,
            etc: etc,
            gender: gender,
            age: age,
            neutered: neutered,
            find_date: "2025-02-20T00:00:00",
            member_id: member_id,
            shelter_id: 1,
            path_url: imagePreview,
          }),
          credentials: "include",
        });

        if (response.ok) {
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
  
  // 채팅방 입장 핸들러
  const handleEnterChatRoom = (room: ChatRoom) => {
    setOpenChatRooms(prev => {
      // 이미 열려있는 채팅방인지 확인
      const existingRoomIndex = prev.findIndex(r => r.id === room.id);
      
      if (existingRoomIndex >= 0) {
        // 이미 열려있는 채팅방이면 해당 채팅방만 활성화
        return prev.map((r, index) => ({
          ...r,
          isOpen: index === existingRoomIndex
        }));
      } else {
        // 새로운 채팅방이면 추가
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

  // 채팅방 닫기 핸들러
  const handleCloseChatRoom = (roomId: number) => {
    setOpenChatRooms(prev => prev.filter(room => room.id !== roomId));
  };

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
      
      console.log("채팅방 나가기 응답:", response.data);
      
      // 서버 응답 구조 확인하고 적절히 처리
      if (response.status === 200) {
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

  // 채팅 메시지 포맷팅 함수
  const formatLastMessage = (room: ChatRoom) => {
    if (!room.chatMessages || room.chatMessages.length === 0) {
      return "대화 내용이 없습니다.";
    }
    
    // 가장 최근 메시지 가져오기
    const lastMessage = room.chatMessages[room.chatMessages.length - 1];
    return lastMessage.content || "메시지를 불러올 수 없습니다.";
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

  // 이미지 URL 검증 함수
  const getValidImageUrl = (imageUrl: string | undefined) => {
    const isKakaoDefaultProfile = (url: string) => {
      return url && url.includes('kakaocdn.net') && url.includes('default_profile');
    };

    if (!imageUrl || imageUrl === 'profile' || isKakaoDefaultProfile(imageUrl)) {
      return DEFAULT_IMAGE_URL;
    }
    return imageUrl;
  };

  // 채팅 상대방 정보를 가져오는 함수
  const getOtherUserInfo = (room: ChatRoom) => {
    const isMyChat = me_id === room.chatUserId;
    
    return {
      nickname: isMyChat ? room.targetUserNickname : room.chatUserNickname,
      imageUrl: getValidImageUrl(isMyChat ? room.targetUserImageUrl : room.chatUserImageUrl),
      userId: isMyChat ? room.targetUserId : room.chatUserId
    };
  };

  // WebSocket 연결 설정
  useEffect(() => {
    if (isLoggedIn && isChatListOpen) {
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
        console.log('NavBar WebSocket Connected');
        
        // 새로운 채팅방 생성 구독
        stompClient.subscribe('/topic/api/v1/chat/new-room', (message) => {
          try {
            const newRoomData = JSON.parse(message.body);
            console.log('새로운 채팅방 생성됨:', newRoomData);
            
            // 새로운 채팅방 추가
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
                
                // 새로운 채팅방에 대한 메시지 구독 설정
                subscribeToRoom(newRoomData.id);
                
                return [...prevRooms, newRoom].sort((a, b) => 
                  new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime()
                );
              }
              return prevRooms;
            });
          } catch (error) {
            console.error('새로운 채팅방 데이터 처리 오류:', error);
          }
        });
        
        // 채팅방 메시지 구독 설정
        const subscribeToRoom = (roomId: number) => {
          console.log(`채팅방 ${roomId} 메시지 구독 설정`);
          stompClient.subscribe(`/topic/api/v1/chat/${roomId}/messages`, (message) => {
            try {
              const messageData = JSON.parse(message.body);
              console.log(`채팅방 ${roomId} 새 메시지:`, messageData);
              
              // 일반 메시지 업데이트
              setChatRooms(prevRooms => 
                prevRooms.map(r => {
                  if (r.id === roomId) {
                    return {
                      ...r,
                      chatMessages: [...(r.chatMessages || []), messageData],
                      modifiedDate: messageData.createDate
                    };
                  }
                  return r;
                }).sort((a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime())
              );
            } catch (error) {
              console.error(`채팅방 ${roomId} 메시지 처리 오류:`, error);
            }
          });
        };

        // 기존 채팅방들에 대한 구독 설정
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

  // 채팅방 목록 초기 로드
  useEffect(() => {
    if (isLoggedIn && isChatListOpen) {
      fetchChatRooms();
    }
  }, [isLoggedIn, isChatListOpen]);

  return (
    <>
      <nav className="mt-5 fixed right-0 z-50 w-[calc(95%-320px)]">
        <div className="px-4">
          <div className="flex justify-between items-center h-12 bg-white/80 backdrop-blur-sm rounded-full mx-4 shadow-lg">
            <div className="flex-none pl-4">
              <Button variant="outline" size="icon" className="bg-green-600 rounded-full" onClick={() => setIsResistModalOpen(!isResistModalOpen)}>
                <Plus className="h-4 w-4 text-white" />
              </Button>
              {/* 모달 on off */}
              {isResistModalOpen && (
                <div className="absolute top-[3%] left-[0%] bg-white rounded-lg  w-[200px] overflow-hidden z-50">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start hover:bg-gray-100 bgr-white h-12"
                      onClick={() => {
                        // 실종 신고하기 로직
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
                        // 실종 신고하기 로직
                        setIsResistModalOpen(false);
                      }}
                    >
                      <div className="w-10 h-10 mr-2 rounded-full flex items-center justify-center">
                        {/* <Plus className="h-4 w-4 text-white" /> */}
                        <svg viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-2">
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
                        // 발견 등록하기 로직
                        if (!isLoggedIn) {
                          alert("로그인 후 이용해주세요!");
                        } else {
                          setIsFindModalOpen(!isFindModalOpen);
                        }
                        setIsResistModalOpen(false);
                      }}
                    >
                      <div className="w-6 h-6 mr-2 rounded-full flex items-center justify-center btn-size">
                        <svg viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-2">
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

            <div className="flex items-center gap-1 flex-none pr-4">
              <FilterButton buttonStates={buttonStates} toggleButton={toggleButton} />

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
                      chatRooms={chatRooms}
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
      </nav>

      {isFindModalOpen && (
        // 배경 오버레이
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* 반투명 배경 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFindModalOpen(false)} // 배경 클릭시 모달 닫기
          ></div>

          {/* 모달 컨테이너 */}
          <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
            </div>

            {/* 모달 내용(이미지, 폼 등) */}
            <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.</p>

            <div className="space-between text-[15px]">
              {/* 예: 사진 업로드, 위치, 기타 폼 */}
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
                    <label className="block font-medium mb-2">반려동물 사진</label>
                    <div className="mt-2 flex">
                      <img src={imagePreview} alt="미리보기" className="w-60 h-60 object-cover rounded" />
                      <div className="mt-[77%]">
                        <button className=" bg-red-500 h-4 w-4 " onClick={handleRemoveImage}>
                          <Plus className="text-white rotate-45 absolute top-[54.7%] left-[34%]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block font-medium mb-2">반려동물 사진</label>
                    <input type="file" className="border p-2 w-full" onChange={handleImageUpload} />
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
                    <input className="border p-2 w-full bg-white" placeholder="견종" onChange={handleBreed} />
                  </div>
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">색상</label>
                    <input className="border p-2 w-full bg-white" placeholder="색상" onChange={handleColor} />
                  </div>
                  <div className="w-20">
                    <label className="block font-medium mb-2 ">이름</label>
                    <input className="border p-2 w-full bg-white" placeholder="이름" onChange={handleName} />
                  </div>
                </div>
                <div className="mb-4 flex justify-between">
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">성별</label>
                    {/* <input className="border p-2 w-full bg-white" placeholder="성별" onChange={handleGender} /> */}
                    <select className="border p-2 w-full bg-white" onChange={handleGender}>
                      <option value="미상">미상</option>
                      <option value="수컷">수컷</option>
                      <option value="암컷">암컷</option>
                    </select>
                  </div>
                  <div className="mr-4 w-20">
                    <label className="block font-medium mb-2 ">중성화</label>
                    {/* <input className="border p-2 w-full bg-white" placeholder="중성화 여부" onChange={handleNeutered} /> */}
                    <select className="border p-2 w-full bg-white" onChange={handleNeutered}>
                      <option value="">미상</option>
                      <option value="true">중성화 됌</option>
                      <option value="false">중성화 안됌</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block font-medium mb-2 ">나이</label>
                    <input className="border p-2 w-full bg-white" placeholder="추정 나이" onChange={handleAge} />
                  </div>
                </div>
              </div>
              <div className="w-80">
                <div className="w-20 h-20 bg-pink">지도 들어갈 곳</div>
                {/* <NcpMap
          currentLocation={findLocation}
        /> */}
                <div className="mb-4 ">
                  <label className="block font-medium mb-2 ">특이 사항</label>
                  <textarea className="border p-2 w-full bg-white resize-none" rows={2} placeholder="특징을 설명해주세요." onChange={handleEtc} />
                </div>
              </div>
            </div>
            {/* 예: 등록/취소 버튼 */}
            <div className="flex justify-end gap-2 h-6">
              <button className="px-4 py-0 rounded bg-gray-200 hover:bg-gray-300 " onClick={() => setIsFindModalOpen(false)}>
                취소하기
              </button>
              <button
                className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  // 등록 처리 로직
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

      {/* 열려있는 모든 채팅방 렌더링 */}
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
