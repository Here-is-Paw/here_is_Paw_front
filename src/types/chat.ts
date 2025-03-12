export interface ChatMessage {
  id?: number;
  chatMessageId?: number;
  memberNickname?: string;
  memberId?: number;
  content: string;
  createDate?: string;
  createdDate?: string;
  modifiedDate?: string;
  chatUserRead?: boolean;   // 채팅 사용자의 읽음 상태
  targetUserRead?: boolean; // 대상 사용자의 읽음 상태
  isRead?: boolean;         // 통합 읽음 상태
}

export interface ChatRoom {
  id: number;
  chatUserNickname: string;
  chatUserImageUrl: string;
  chatUserId: number;
  targetUserNickname: string;
  targetUserId: number;
  targetUserImageUrl: string;
  chatMessages: ChatMessage[];
  modifiedDate: string;
  unreadCount?: number;     // 안 읽은 메시지 수
  lastMessageTime?: string; // 마지막 메시지 시간
}

export interface OpenChatRoom extends ChatRoom {
  isOpen: boolean;
} 