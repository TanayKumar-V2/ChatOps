import type { Socket } from "socket.io";
import { jwtVerify } from "jose";
import { env } from "../config/env.js";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../db/schema/index.js";

export type AuthenticatedSocket = Socket & { userId: string; userName: string; userAvatarUrl: string | null };

export async function refreshSocketProfile(socket: AuthenticatedSocket) {
  const [user] = await db.select({ name: users.name, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, socket.userId))
    .limit(1);
  if (!user) throw new Error("User not found");
  socket.userName = user.name;
  socket.userAvatarUrl = user.avatarUrl;
  return user;
}

export async function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return next(new Error("Authentication required"));
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    if (typeof payload.sub !== "string") throw new Error("Invalid token subject");
    const authenticatedSocket = socket as AuthenticatedSocket;
    authenticatedSocket.userId = payload.sub;
    await refreshSocketProfile(authenticatedSocket);
    next();
  } catch { next(new Error("Invalid or expired token")); }
}
