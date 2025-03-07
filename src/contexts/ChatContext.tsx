import { createContext, useContext, useState, ReactNode } from 'react';

// 채팅방 목록 갱신 이벤트를 위한 이벤트 버스
export const chatEventBus = {
  refreshChatRoomsListeners: [] as Array<() => void>,
  
  // 채팅방 목록 갱신 요청 이벤트 발행
  emitRefreshChatRooms: () => {
    chatEventBus.refreshChatRoomsListeners.forEach(listener => listener());
  },
  
  // 채팅방 목록 갱신 요청 이벤트 구독
  onRefreshChatRooms: (listener: () => void) => {
    chatEventBus.refreshChatRoomsListeners.push(listener);
    return () => {
      chatEventBus.refreshChatRoomsListeners = chatEventBus.refreshChatRoomsListeners.filter(
        l => l !== listener
      );
    };
  },
  
  // 새 채팅방 추가 리스너 배열
  addChatRoomListeners: [] as Array<(chatRoom: any) => void>,
  
  // 새 채팅방 추가 이벤트 발행
  emitAddChatRoom: (chatRoom: any) => {
    chatEventBus.addChatRoomListeners.forEach(listener => listener(chatRoom));
  },
  
  // 새 채팅방 추가 이벤트 구독
  onAddChatRoom: (listener: (chatRoom: any) => void) => {
    chatEventBus.addChatRoomListeners.push(listener);
    return () => {
      chatEventBus.addChatRoomListeners = chatEventBus.addChatRoomListeners.filter(
        l => l !== listener
      );
    };
  }
};

interface ChatContextType {
  openChatRooms: Set<number>;
  addChatRoom: (roomId: number) => boolean;
  removeChatRoom: (roomId: number) => void;
  isRoomOpen: (roomId: number) => boolean;
  refreshChatRooms: () => void; // 채팅방 목록 갱신 함수 추가
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [openChatRooms, setOpenChatRooms] = useState<Set<number>>(new Set());

  const addChatRoom = (roomId: number): boolean => {
    if (openChatRooms.has(roomId)) {
      return false; // 이미 열려있는 채팅방
    }
    setOpenChatRooms(prev => new Set([...prev, roomId]));
    return true; // 새로 열린 채팅방
  };

  const removeChatRoom = (roomId: number) => {
    setOpenChatRooms(prev => {
      const newSet = new Set(prev);
      newSet.delete(roomId);
      return newSet;
    });
  };

  const isRoomOpen = (roomId: number): boolean => {
    return openChatRooms.has(roomId);
  };

  // 채팅방 목록 갱신 함수 (이벤트 버스 이용)
  const refreshChatRooms = () => {
    chatEventBus.emitRefreshChatRooms();
  };

  return (
    <ChatContext.Provider value={{ openChatRooms, addChatRoom, removeChatRoom, isRoomOpen, refreshChatRooms }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 