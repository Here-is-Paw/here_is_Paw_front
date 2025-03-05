export interface ChatMessage {
  chatMessageId: number;
  memberNickname: string;
  content: string;
  createdDate: string;
}

export interface ChatRoom {
  id: number;
  chatUserNickname: string;
  targetUserNickname: string;
  targetUserId: number;
  targetUserImageUrl: string;
  chatMessages: ChatMessage[];
  modifiedDate: string;
} 