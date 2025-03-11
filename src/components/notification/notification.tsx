import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { backUrl } from '@/constants';

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
  const [notifications, setNotifications] = useState<Noti[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // SSE 연결 설정
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = async () => {
      try {
        // SSE 연결
        eventSource = new EventSource(`${backUrl}/api/v1/sse/connect`, { withCredentials: true });

        // 연결 성공 이벤트
        eventSource.addEventListener('connect', (event) => {
          console.log('SSE 연결 성공:', event);
          setSseConnected(true);
        });

        // 알림 이벤트 수신
        eventSource.addEventListener('noti', (event) => {
          try {
            const newNoti = JSON.parse(event.data) as Noti;
            console.log('새 알림 수신:', newNoti);

            setNotifications(prev => {
              // 이미 존재하는 알림인지 확인
              const exists = prev.some(n => n.id === newNoti.id);
              if (exists) return prev;

              // 새 알림을 맨 앞에 추가
              return [newNoti, ...prev];
            });
          } catch (error) {
            console.error('알림 데이터 파싱 오류:', error);
          }
        });

        // 에러 처리
        eventSource.onerror = (error) => {
          console.error('SSE 연결 오류:', error);
          eventSource?.close();
          setSseConnected(false);

          // 재연결 시도
          setTimeout(connectSSE, 5000);
        };
      } catch (error) {
        console.error('SSE 연결 실패:', error);
      }
    };

    connectSSE();

    // 컴포넌트 언마운트 시 SSE 연결 종료
    return () => {
      if (eventSource) {
        eventSource.close();
      }
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
      console.error('알림 목록 가져오기 실패:', error);
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
      setNotifications(prev =>
          prev.map(notif =>
              notif.id === id ? { ...notif, read: true } : notif
          )
      );

      // 알림 클릭 처리
      handleNotificationClick(notifications.find(n => n.id === id));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 모든 알림 읽음 표시 (백엔드 API 구현 필요)
  const markAllAsRead = async () => {
    try {
      // TODO: 백엔드 API 구현 후 호출
      await axios.post(`${backUrl}/api/v1/noti/read-all`, {}, {
        withCredentials: true,
      });

      // 임시: 클라이언트에서만 처리
      setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
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
    switch(eventName) {
      case 'imageMatch':
        return '🔍';
      default:
        return '📣';
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
          <Button variant="ghost" size="icon" className="relative">
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
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">알림</h3>
            {unreadCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-500"
                >
                  모두 읽음 표시
                </Button>
            )}
          </div>

          <ScrollArea className="h-80">
            {loading ? (
                <div className="p-4 text-center text-gray-500">
                  알림을 로딩 중입니다...
                </div>
            ) : notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                      <Card
                          key={notification.id}
                          className={`border-0 rounded-none ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                      >
                        <CardContent className="p-4 cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="text-xl">{getNotificationIcon(notification.eventName)}</div>
                              <div>
                                <h4 className="text-sm font-medium">{notification.senderNickname}</h4>
                                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                        {formatTime(notification.createdAt)}
                      </span>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
            ) : (
                <div className="p-4 text-center text-gray-500">
                  알림이 없습니다
                </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
  );
}

export default NotificationBell;