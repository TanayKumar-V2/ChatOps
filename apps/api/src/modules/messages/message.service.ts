import { and, desc, eq, lt, or } from "drizzle-orm";
import { db } from "../../config/database.js";
import { messages, roomMembers, users } from "../../db/schema/index.js";
import { decodeCursor, encodeCursor } from "./cursor.js";

export async function isRoomMember(roomId: string, userId: string) {
  const result = await db.select().from(roomMembers).where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId))).limit(1);
  return result.length > 0;
}

export async function listMessages(roomId: string, before?: string, limit = 40) {
  const cursor = decodeCursor(before);
  const cursorFilter = cursor
    ? or(lt(messages.createdAt, new Date(cursor.createdAt)), and(eq(messages.createdAt, new Date(cursor.createdAt)), lt(messages.id, cursor.id)))
    : undefined;
  const rows = await db.select({
    id: messages.id,
    roomId: messages.roomId,
    senderId: messages.senderId,
    senderName: users.name,
    senderAvatarUrl: users.avatarUrl,
    content: messages.content,
    isPinned: messages.isPinned,
    createdAt: messages.createdAt,
  }).from(messages)
    .innerJoin(users, eq(users.id, messages.senderId))
    .where(and(eq(messages.roomId, roomId), cursorFilter))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(Math.min(limit, 100));

  const next = rows.length === limit ? rows[rows.length - 1] : undefined;
  return { messages: rows.reverse(), nextCursor: next ? encodeCursor({ createdAt: next.createdAt.toISOString(), id: next.id }) : null };
}

export async function createMessage(roomId: string, senderId: string, content: string, sender?: { name: string; avatarUrl: string | null }) {
  const [message] = await db.insert(messages).values({ roomId, senderId, content }).returning();
  if (sender) return { ...message, senderName: sender.name, senderAvatarUrl: sender.avatarUrl };
  const [senderRecord] = await db.select({ name: users.name, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, senderId)).limit(1);
  return { ...message, senderName: senderRecord?.name ?? "Unknown user", senderAvatarUrl: senderRecord?.avatarUrl ?? null };
}

export async function togglePinnedMessage(roomId: string, messageId: string, userId: string) {
  if (!(await isRoomMember(roomId, userId))) return null;
  const [message] = await db.select({ isPinned: messages.isPinned })
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.roomId, roomId)))
    .limit(1);
  if (!message) return null;
  const [updated] = await db.update(messages)
    .set({ isPinned: !message.isPinned })
    .where(and(eq(messages.id, messageId), eq(messages.roomId, roomId)))
    .returning({ isPinned: messages.isPinned });
  return updated;
}
