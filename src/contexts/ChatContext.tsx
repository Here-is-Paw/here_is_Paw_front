import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  openChatRooms: Set<number>;
  addChatRoom: (roomId: number) => boolean;
  removeChatRoom: (roomId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [openChatRooms] = useState<Set<number>>(new Set());

  const addChatRoom = (roomId: number): boolean => {
    if (openChatRooms.has(roomId)) {
      return false; // 이미 열려있는 채팅방
    }
    openChatRooms.add(roomId);
    return true; // 새로 열린 채팅방
  };

  const removeChatRoom = (roomId: number) => {
    openChatRooms.delete(roomId);
  };

  return (
    <ChatContext.Provider value={{ openChatRooms, addChatRoom, removeChatRoom }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 