import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { backUrl } from '@/constants';

// 알림 타입 정의
export interface Noti {
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

// 컨텍스트 타입 정의
interface NotificationContextType {
  notifications: Noti[];
  loading: boolean;
  sseConnected: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<Noti | undefined>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  addNewNotification: (notification: Noti) => void;
  unreadCount: number;
}

// 컨텍스트 생성
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 커스텀 훅 정의
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

// Provider 컴포넌트
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Noti[]>([]);
  const [loading, setLoading] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [notiSseRef, setNotiSseRef] = useState<EventSource | null>(null);

  // 안 읽은 알림 개수 계산 (메모이제이션 가능)
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // 알림 데이터 가져오기
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backUrl}/api/v1/noti`, {
        withCredentials: true,
      });

      if (response.data.statusCode === 200) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('알림 목록 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

      // 해당 알림 반환
      return notifications.find((n) => n.id === id);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      return undefined;
    }
  };

  // 모든 알림 읽음 표시
  const markAllAsRead = async () => {
    try {
      await axios.post(
          `${backUrl}/api/v1/noti/read-all`,
          {},
          {
            withCredentials: true,
          }
      );

      // 클라이언트 상태 업데이트
      setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  // 알림 삭제
  const deleteNotification = async (id: number) => {
    try {
      await axios.delete(`${backUrl}/api/v1/noti/${id}`, {
        withCredentials: true,
      });

      // 로컬 상태 업데이트
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error('알림 삭제 처리 실패:', error);
    }
  };

  // 새 알림 추가
  const addNewNotification = useCallback((notification: Noti) => {
    setNotifications((prev) => {
      // 이미 존재하는 알림인지 확인
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) return prev;

      // 새 알림을 맨 앞에 추가
      return [notification, ...prev];
    });
  }, []);

  // SSE 이벤트 처리를 위한 이벤트 리스너
  useEffect(() => {
    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.notification) {
        const newNoti = customEvent.detail.notification as Noti;
        addNewNotification(newNoti);
      }
    };

    window.addEventListener('new_notification', handleNewNotification);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('new_notification', handleNewNotification);
    };
  }, []);

  const value = {
    notifications,
    loading,
    sseConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNewNotification,
    unreadCount,
  };

  return (
      <NotificationContext.Provider value={value}>
        {children}
      </NotificationContext.Provider>
  );
};