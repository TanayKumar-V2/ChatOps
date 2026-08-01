import { redis } from "../config/redis.js";

const ttlSeconds = 60;
const key = (roomId: string, userId: string) => `presence:${roomId}:${userId}`;

export async function setPresence(roomId: string, userId: string) {
  await redis.set(key(roomId, userId), "online", { EX: ttlSeconds });
}

export async function clearPresence(roomId: string, userId: string) {
  await redis.del(key(roomId, userId));
}

export async function getRoomPresence(roomId: string) {
  const keys = await redis.keys(`presence:${roomId}:*`);
  return keys.map((presenceKey) => presenceKey.split(":").at(-1)).filter((id): id is string => Boolean(id));
}
