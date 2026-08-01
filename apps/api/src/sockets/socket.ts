import type { Server } from "socket.io";
import { socketEvents, sendMessageSchema } from "@chatops/contracts";
import { authenticateSocket, refreshSocketProfile, type AuthenticatedSocket } from "../middleware/socketAuth.js";
import { createMessage, isRoomMember } from "../modules/messages/message.service.js";
import { clearPresence, getRoomPresence, setPresence } from "../redis/presence.service.js";

export function registerSocketHandlers(io: Server) {
  io.use(authenticateSocket);
  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const activeRooms = new Set<string>();

    socket.on("profile_updated", async (acknowledge?: (result: unknown) => void) => {
      try {
        await refreshSocketProfile(socket);
        acknowledge?.({ ok: true });
      } catch {
        acknowledge?.({ ok: false, error: "Unable to refresh profile" });
      }
    });

    socket.on(socketEvents.joinRoom, async ({ roomId }: { roomId: string }) => {
      if (!(await isRoomMember(roomId, socket.userId))) return socket.emit("socket_error", { error: "Room membership required" });
      await socket.join(roomId);
      activeRooms.add(roomId);
      await setPresence(roomId, socket.userId);
      io.to(roomId).emit(socketEvents.userJoined, { userId: socket.userId });
      io.to(roomId).emit(socketEvents.presenceUpdate, { userIds: await getRoomPresence(roomId) });
    });

    socket.on(socketEvents.leaveRoom, async ({ roomId }: { roomId: string }) => {
      await socket.leave(roomId);
      activeRooms.delete(roomId);
      await clearPresence(roomId, socket.userId);
      io.to(roomId).emit(socketEvents.userLeft, { userId: socket.userId });
      io.to(roomId).emit(socketEvents.presenceUpdate, { userIds: await getRoomPresence(roomId) });
    });

    socket.on(socketEvents.sendMessage, async (payload: unknown, acknowledge?: (result: unknown) => void) => {
      const parsed = sendMessageSchema.safeParse(payload);
      if (!parsed.success || !activeRooms.has(parsed.data.roomId)) return acknowledge?.({ ok: false, error: "Invalid message or room access" });
      const message = await createMessage(parsed.data.roomId, socket.userId, parsed.data.content, { name: socket.userName, avatarUrl: socket.userAvatarUrl });
      const wireMessage = { ...message, createdAt: message.createdAt.toISOString() };
      io.to(parsed.data.roomId).emit(socketEvents.newMessage, wireMessage);
      acknowledge?.({ ok: true, message: wireMessage });
    });

    for (const event of [socketEvents.typingStart, socketEvents.typingStop]) {
      socket.on(event, async ({ roomId }: { roomId: string }) => {
        if (await isRoomMember(roomId, socket.userId)) socket.to(roomId).emit(socketEvents.typingUpdate, { userId: socket.userId, typing: event === socketEvents.typingStart });
      });
    }

    socket.on("disconnect", async () => {
      for (const roomId of activeRooms) {
        await clearPresence(roomId, socket.userId);
        io.to(roomId).emit(socketEvents.userLeft, { userId: socket.userId });
        io.to(roomId).emit(socketEvents.presenceUpdate, { userIds: await getRoomPresence(roomId) });
      }
    });
  });
}
