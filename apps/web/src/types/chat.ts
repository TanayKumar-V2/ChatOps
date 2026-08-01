export type DemoMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  content: string;
  createdAt: string;
  isPinned?: boolean;
  pending?: boolean;
  failed?: boolean;
  own?: boolean;
};

export type Room = {
  id: string;
  name: string;
  description: string | null;
  joinCode?: string;
  createdBy?: string;
  creatorName?: string | null;
  createdAt?: string;
  unread?: number;
  online?: number;
  onlineCount?: number;
  memberCount?: number;
  postCount?: number;
  pinnedCount?: number;
  linkCount?: number;
};
