import { io, type Socket } from "socket.io-client";
import { getToken } from "../stores/auth.store";

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";
export const token = getToken();
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
export const socket: Socket = io(socketUrl, { autoConnect: false, auth: { token } });

export function configureSocket(nextToken: string) {
  socket.auth = { token: nextToken };
}
