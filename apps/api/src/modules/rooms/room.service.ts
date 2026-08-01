import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../../config/database.js";
import { messages, roomMembers, rooms, users } from "../../db/schema/index.js";

const urlPattern = "https?://[^[:space:]]+";

async function getRoomStats(roomId: string) {
  const [stats] = await db.select({
    memberCount: sql<number>`count(distinct ${roomMembers.userId})`,
    postCount: sql<number>`count(distinct ${messages.id})`,
    pinnedCount: sql<number>`count(distinct ${messages.id}) filter (where ${messages.isPinned})`,
    linkCount: sql<number>`count(distinct ${messages.id}) filter (where ${messages.content} ~ ${urlPattern})`,
  }).from(roomMembers)
    .leftJoin(messages, eq(messages.roomId, roomMembers.roomId))
    .where(eq(roomMembers.roomId, roomId));

  return {
    memberCount: Number(stats?.memberCount ?? 0),
    postCount: Number(stats?.postCount ?? 0),
    pinnedCount: Number(stats?.pinnedCount ?? 0),
    linkCount: Number(stats?.linkCount ?? 0),
  };
}

async function getRoomStatsForRooms(roomIds: string[]) {
  if (!roomIds.length) return new Map<string, Awaited<ReturnType<typeof getRoomStats>> >();
  const rows = await db.select({
    roomId: roomMembers.roomId,
    memberCount: sql<number>`count(distinct ${roomMembers.userId})`,
    postCount: sql<number>`count(distinct ${messages.id})`,
    pinnedCount: sql<number>`count(distinct ${messages.id}) filter (where ${messages.isPinned})`,
    linkCount: sql<number>`count(distinct ${messages.id}) filter (where ${messages.content} ~ ${urlPattern})`,
  }).from(roomMembers)
    .leftJoin(messages, eq(messages.roomId, roomMembers.roomId))
    .where(inArray(roomMembers.roomId, roomIds))
    .groupBy(roomMembers.roomId);
  return new Map(rows.map((row) => [row.roomId, {
    memberCount: Number(row.memberCount),
    postCount: Number(row.postCount),
    pinnedCount: Number(row.pinnedCount),
    linkCount: Number(row.linkCount),
  }]));
}

async function toRoomView(room: typeof rooms.$inferSelect, creatorName: string | null | undefined) {
  return {
    ...room,
    creatorName: creatorName ?? "Unknown member",
    ...(await getRoomStats(room.id)),
    onlineCount: 0,
  };
}

export async function listRoomsForUser(userId: string) {
  const rows = await db.select({ room: rooms, creatorName: users.name })
    .from(rooms)
    .innerJoin(roomMembers, eq(roomMembers.roomId, rooms.id))
    .leftJoin(users, eq(users.id, rooms.createdBy))
    .where(eq(roomMembers.userId, userId))
    .orderBy(asc(rooms.name));
  const stats = await getRoomStatsForRooms(rows.map(({ room }) => room.id));
  return rows.map(({ room, creatorName }) => ({ ...room, creatorName: creatorName ?? "Unknown member", ...(stats.get(room.id) ?? { memberCount: 0, postCount: 0, pinnedCount: 0, linkCount: 0 }), onlineCount: 0 }));
}

export async function userCanAccessRoom(roomId: string, userId: string) {
  const rows = await db.select({ roomId: roomMembers.roomId }).from(roomMembers).where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId))).limit(1);
  return rows.length > 0;
}

export async function createRoomForUser(name: string, description: string | null, userId: string) {
  const joinCode = `ROOM-${randomBytes(4).toString("hex").toUpperCase()}`;
  const [room] = await db.insert(rooms).values({ name, description, joinCode, createdBy: userId }).returning();
  await db.insert(roomMembers).values({ roomId: room.id, userId });
  const [creator] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
  return toRoomView(room, creator?.name);
}

export async function joinRoomWithCode(code: string, userId: string) {
  const [row] = await db.select({ room: rooms, creatorName: users.name })
    .from(rooms)
    .leftJoin(users, eq(users.id, rooms.createdBy))
    .where(eq(rooms.joinCode, code.trim().toUpperCase()))
    .limit(1);
  if (!row) return null;
  const { room, creatorName } = row;
  await db.insert(roomMembers).values({ roomId: room.id, userId }).onConflictDoNothing();
  return toRoomView(room, creatorName);
}
