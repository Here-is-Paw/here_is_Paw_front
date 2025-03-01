import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  openChatRooms: Set<number>;
  addChatRoom: (roomId: number) => boolean;
  removeChatRoom: (roomId: number) => void;
  isRoomOpen: (roomId: number) => boolean;
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

  return (
    <ChatContext.Provider value={{ openChatRooms, addChatRoom, removeChatRoom, isRoomOpen }}>
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