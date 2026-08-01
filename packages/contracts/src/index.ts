import { z } from "zod";

export const roomIdSchema = z.string().uuid();
export const messageIdSchema = z.string().uuid();
export const imageMessagePlaceholder = "__chatops_image__";

export const messageSchema = z.object({
  id: messageIdSchema,
  roomId: roomIdSchema,
  senderId: z.string().uuid(),
  senderName: z.string(),
  senderAvatarUrl: z.string().url().nullable(),
  content: z.string(),
  imageUrl: z.string().nullable().optional(),
  isPinned: z.boolean(),
  createdAt: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

export const sendMessageSchema = z.object({
  roomId: roomIdSchema,
  content: z.string().trim().max(2000),
  imageUrl: z.string().regex(/^data:image\/(?:png|jpe?g|webp|gif);base64,/i).max(3_000_000).nullable().optional(),
}).refine((value) => value.content.length > 0 || Boolean(value.imageUrl), { message: "Message content or image is required" });

export const roomSchema = z.object({
  id: roomIdSchema,
  name: z.string(),
  description: z.string().nullable(),
  joinCode: z.string().optional(),
  createdBy: z.string().uuid().optional(),
  creatorName: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  memberCount: z.number(),
  onlineCount: z.number(),
  postCount: z.number().optional(),
  pinnedCount: z.number().optional(),
  linkCount: z.number().optional(),
});

export type Room = z.infer<typeof roomSchema>;

export const socketEvents = {
  joinRoom: "join_room",
  leaveRoom: "leave_room",
  sendMessage: "send_message",
  typingStart: "typing_start",
  typingStop: "typing_stop",
  newMessage: "new_message",
  userJoined: "user_joined",
  userLeft: "user_left",
  presenceUpdate: "presence_update",
  typingUpdate: "typing_update",
  profileUpdated: "profile_updated",
} as const;

export type SocketEventName = (typeof socketEvents)[keyof typeof socketEvents];
