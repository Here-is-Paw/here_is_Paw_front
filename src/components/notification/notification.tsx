import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { backUrl } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";

// 알림 타입 정의
interface Noti {
  id: number;
  senderId: number;
  senderNickname: string;
  senderAvatar: string;
  receiverId: number;
  receiverNickname: string;
  receiverAvatar: string;
  eventName: string;
  message: string;
  postId: number;
  read: boolean;
  createdAt: string;
  modifiedDate: string;
}

export function NotificationBell() {
  const isMobile = useIsMobile();

  const [notifications, setNotifications] = useState<Noti[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // // SSE 연결 설정
  // useEffect(() => {
  //   let eventSource: EventSource | null = null;
  //
  //   const connectSSE = async () => {
  //     try {
  //       // SSE 연결
  //       eventSource = new EventSource(`${backUrl}/api/v1/sse/connect`, {
  //         withCredentials: true,
  //       });
  //
  //       // 연결 성공 이벤트
  //       eventSource.addEventListener("connect", (event) => {
  //         console.log("SSE 연결 성공:", event);
  //         setSseConnected(true);
  //       });
  //
  //       // 알림 이벤트 수신
  //       eventSource.addEventListener("noti", (event) => {
  //         try {
  //           const newNoti = JSON.parse(event.data) as Noti;
  //           console.log("새 알림 수신:", newNoti);
  //
  //           setNotifications((prev) => {
  //             // 이미 존재하는 알림인지 확인
  //             const exists = prev.some((n) => n.id === newNoti.id);
  //             if (exists) return prev;
  //
  //             // 새 알림을 맨 앞에 추가
  //             return [newNoti, ...prev];
  //           });
  //         } catch (error) {
  //           console.error("알림 데이터 파싱 오류:", error);
  //         }
  //       });
  //
  //       // 에러 처리
  //       eventSource.onerror = (error) => {
  //         console.error("SSE 연결 오류:", error);
  //         eventSource?.close();
  //         setSseConnected(false);
  //
  //         // 재연결 시도
  //         setTimeout(connectSSE, 5000);
  //       };
  //     } catch (error) {
  //       console.error("SSE 연결 실패:", error);
  //     }
  //   };
  //
  //   connectSSE();
  //
  //   // 컴포넌트 언마운트 시 SSE 연결 종료
  //   return () => {
  //     if (eventSource) {
  //       eventSource.close();
  //     }
  //   };
  // }, []);

  // notification.tsx의 SSE 관련 코드 수정
  useEffect(() => {
    // NavBar에서 발생시키는 알림 이벤트 리스너 추가
    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.notification) {
        const newNoti = customEvent.detail.notification as Noti;

        setNotifications((prev) => {
          // 이미 존재하는 알림인지 확인
          const exists = prev.some((n) => n.id === newNoti.id);
          if (exists) return prev;

          // 새 알림을 맨 앞에 추가
          return [newNoti, ...prev];
        });
      }
    };

    window.addEventListener("new_notification", handleNewNotification);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("new_notification", handleNewNotification);
    };
  }, []);

  // 알림 데이터 가져오기
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backUrl}/api/v1/noti`, {
        withCredentials: true,
      });

      console.log(response);
      console.log(response.data);
      console.log(response.data.data);

      if (response.data.statusCode === 200) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("알림 목록 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 특정 알림 읽음 표시
  const markAsRead = async (id: number) => {
    try {
      await axios.get(`${backUrl}/api/v1/noti/${id}/read`, {
        withCredentials: true,
      });

      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );

      // 알림 클릭 처리
      handleNotificationClick(notifications.find((n) => n.id === id));
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  // 모든 알림 읽음 표시 (백엔드 API 구현 필요)
  const markAllAsRead = async () => {
    try {
      // TODO: 백엔드 API 구현 후 호출
      await axios.post(
        `${backUrl}/api/v1/noti/read-all`,
        {},
        {
          withCredentials: true,
        }
      );

      // 임시: 클라이언트에서만 처리
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
    }
  };

  const handleDelteNotification = async (id: number) => {
    try {
      const response = await axios.delete(`${backUrl}/api/v1/noti/${id}`, {
        withCredentials: true,
      });

      console.log("알림 삭제 완료:", response);

      // 로컬 상태 업데이트
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("알림 삭제 처리 실패:", error);
    }
  };

  // 알림 클릭 처리 - 관련 페이지로 이동
  const handleNotificationClick = (notification?: Noti) => {
    if (!notification) return;

    // // 이벤트 이름에 따른 네비게이션 처리
    // switch(notification.eventName) {
    //   case 'imageMatch':
    //     // 발견된 이미지 매칭 게시물로 이동
    //     console.log(`포스트 ID: ${notification.postId}로 이동`);
    //     window.location.href = `/posts/${notification.postId}`;
    //     break;
    //   default:
    //     console.log('알림 클릭:', notification);
    //     break;
    // }

    // 팝오버 닫기
    setOpen(false);
  };

  // 알림 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
  };

  // 알림 아이콘 가져오기
  const getNotificationIcon = (eventName: string) => {
    switch (eventName) {
      case "imageMatch":
        return (
          <svg
            width="35"
            height="35"
            viewBox="0 0 53 54"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.0415 38.0417C11.0415 29.5043 17.9624 22.5834 26.4998 22.5834C35.0373 22.5834 41.9582 29.5043 41.9582 38.0417C41.9582 38.2294 41.9545 38.4164 41.9471 38.6026C41.8478 41.4194 40.3152 43.5316 38.2449 44.8897C36.2044 46.2291 33.6029 46.875 31.1031 46.875H21.8966C19.3967 46.875 16.7953 46.2291 14.7548 44.8897C12.6845 43.5316 11.1519 41.4194 11.0514 38.6026C11.0448 38.4164 11.0415 38.2294 11.0415 38.0417Z"
              fill="#17803D"
            />
            <path
              d="M20.151 7.125C17.0152 7.125 14.9062 10.1063 14.9062 13.1979C14.9062 16.2896 17.0152 19.2708 20.151 19.2708C23.2869 19.2708 25.3958 16.2896 25.3958 13.1979C25.3958 10.1063 23.2869 7.125 20.151 7.125ZM3.3125 19.8229C3.3125 16.7313 5.42146 13.75 8.55729 13.75C11.6931 13.75 13.8021 16.7313 13.8021 19.8229C13.8021 22.9146 11.6931 25.8958 8.55729 25.8958C5.42146 25.8958 3.3125 22.9146 3.3125 19.8229ZM28.1562 13.1979C28.1562 10.1063 30.2652 7.125 33.401 7.125C36.5369 7.125 38.6458 10.1063 38.6458 13.1979C38.6458 16.2896 36.5369 19.2708 33.401 19.2708C30.2652 19.2708 28.1562 16.2896 28.1562 13.1979ZM39.1979 19.8229C39.1979 16.7313 41.3069 13.75 44.4427 13.75C47.5785 13.75 49.6875 16.7313 49.6875 19.8229C49.6875 22.9146 47.5785 25.8958 44.4427 25.8958C41.3069 25.8958 39.1979 22.9146 39.1979 19.8229Z"
              fill="#17803D"
            />
          </svg>
        );
      default:
        return "📣";
    }
  };

  // 팝오버 열릴 때 알림 데이터 가져오기
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${isMobile && "text-white"}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-1 py-1 border-b bg-green-600">
          <h4 className="font-medium text-white ml-4">알림</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-yellow-300 hover:bg-transparent hover:text-yellow-300"
            >
              모두 읽음 표시
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 text-center text-gray-500 ">
              알림을 로딩 중입니다...
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-0 rounded-none ${
                    !notification.read ? "bg-green-50" : ""
                  }`}
                >
                  <CardContent className="p-3 relative">
                    <div
                      className="flex justify-between items-start cursor-pointer pr-1"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="text-xl">
                          {getNotificationIcon(notification.eventName)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">
                            {notification.senderNickname}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <button
                          className="text-gray-400 hover:text-gray-700 p-0 rounded-full hover:bg-gray-100 mb-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelteNotification(notification.id);
                          }}
                          aria-label="알림 삭제"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">알림이 없습니다</div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
