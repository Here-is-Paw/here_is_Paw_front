export interface ChatMessage {
  id?: number;
  chatMessageId?: number;
  memberNickname?: string;
  memberId?: number;
  content: string;
  createDate?: string;
  createdDate?: string;
  modifiedDate?: string;
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
}

export interface OpenChatRoom extends ChatRoom {
  isOpen: boolean;
} 