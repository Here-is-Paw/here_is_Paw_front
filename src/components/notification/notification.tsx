import React, { useState } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { FindingDetail, ChatModalInfo } from "@/components/petPost/findingPost/FindingDetail.tsx";
import { ChatModal } from "@/components/chat/ChatModal";
import { useNotification, Noti } from "@/contexts/NotificationContext";

export function NotificationBell() {
  const isMobile = useIsMobile();

  // 알림 컨텍스트 사용
  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();

  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const [chatModalInfo, setChatModalInfo] = useState<ChatModalInfo>({
    isOpen: false,
    targetUserImageUrl: null,
    targetUserNickname: null,
    chatRoomId: null,
  });

  const DEFAULT_IMAGE_URL =
      "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

  // ChatModal 관련 함수
  const handleChatModalOpen = (info: ChatModalInfo) => {
    setChatModalInfo(info);
  };

  const handleChatModalClose = () => {
    setChatModalInfo({
      ...chatModalInfo,
      isOpen: false,
    });
  };

  // 알림 클릭 처리 - 관련 페이지로 이동
  const handleNotificationClick = async (notification?: Noti) => {
    if (!notification) return;

    // 팝오버 닫기
    setOpen(false);

    // 읽음 처리
    await markAsRead(notification.id);

    switch (notification.eventName) {
      case 'imageMatch':
        // 관련 게시물 ID로 MissingDetail 열기
        if (notification.postId) {
          setSelectedPostId(notification.postId);
          setDetailOpen(true);
        }
        break;
      default:
        console.log('알림 클릭:', notification);
        break;
    }
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
  React.useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className={`relative ${isMobile && "text-white"}`}
            >
              <Bell className="h-4 w-4"/>
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
                                onClick={() => handleNotificationClick(notification)}
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
                                      deleteNotification(notification.id);
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

        {/* MissingDetail 컴포넌트 추가 */}
        {selectedPostId !== null && (
            <FindingDetail
                petId={selectedPostId}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onChatModalOpen={handleChatModalOpen}
            />
        )}

        {/* ChatModal 컴포넌트 추가 */}
        <ChatModal
            isOpen={chatModalInfo.isOpen}
            onClose={handleChatModalClose}
            targetUserImageUrl={chatModalInfo.targetUserImageUrl}
            targetUserNickname={chatModalInfo.targetUserNickname}
            defaultImageUrl={DEFAULT_IMAGE_URL}
            chatRoomId={chatModalInfo.chatRoomId}
        />
      </>
  );
}

export default NotificationBell;