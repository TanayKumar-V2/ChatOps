import { Hash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { isDemoMode, socket } from "../../lib/socketClient";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import type { DemoMessage } from "../../types/chat";
import type { Room } from "../../types/chat";
import type { AuthUser } from "../../stores/auth.store";
import { apiFetch } from "../../lib/apiClient";

const initialMessages: DemoMessage[] = [
  { id: "1", senderId: "eli", senderName: "Eli Morgan", content: "Morning team. I pushed the new event pipeline to staging last night. The latency is looking much better.", createdAt: "09:42 AM" },
  { id: "2", senderId: "maya", senderName: "Maya Patel", content: "Nice. I’m seeing the same on the dashboard. Did you keep the retry window at 30 seconds?", createdAt: "09:45 AM" },
  { id: "3", senderId: "eli", senderName: "Eli Morgan", content: "Yep, 30 seconds with a max of 3 attempts. I also added a dead-letter stream for the failures we can’t recover.", createdAt: "09:47 AM" },
  { id: "4", senderId: "you", senderName: "Maya Patel", content: "That’s a good call. I’ll add the failure states to the release checklist before the afternoon review.", createdAt: "09:50 AM", own: true },
];

const messageCache = new Map<string, DemoMessage[]>();

export function ChatPanel({ roomId, room, currentUser, onStatsDelta }: { roomId: string; room?: Room; currentUser?: AuthUser | null; onStatsDelta?: (delta: { posts?: number; pinned?: number; links?: number }) => void }) {
  const cachedMessages = messageCache.get(roomId);
  const [messages, setMessages] = useState<DemoMessage[]>(isDemoMode ? initialMessages : cachedMessages ?? []);
  const [loading, setLoading] = useState(!isDemoMode && !cachedMessages);
  const [typing, setTyping] = useState(false);
  const roomName = room?.name ?? roomId;
  const roomMeta = [room?.description?.trim(), room?.memberCount !== undefined ? `${room.memberCount} members` : null].filter(Boolean).join(" · ");

  useEffect(() => {
    if (isDemoMode) return;
    let cancelled = false;
    const cached = messageCache.get(roomId);
    setMessages(cached ?? []);
    setLoading(!cached);
    apiFetch<{ messages: DemoMessage[] }>(`/rooms/${roomId}/messages?limit=40`).then((result) => { if (cancelled) return; const next = result.messages.map((message) => ({ ...message, own: message.senderId === currentUser?.id, createdAt: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })); messageCache.set(roomId, next); setMessages(next); setLoading(false); }).catch(() => { if (!cancelled) { messageCache.set(roomId, []); setMessages([]); setLoading(false); } });
    socket.connect();
    socket.emit("join_room", { roomId });
    const onMessage = (message: DemoMessage) => { const incoming = { ...message, own: message.senderId === currentUser?.id, createdAt: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }; setMessages((current) => { if (current.some((candidate) => candidate.id === incoming.id)) return current; const pending = current.find((candidate) => candidate.pending && candidate.senderId === incoming.senderId && candidate.content === incoming.content); if (pending) return current.map((candidate) => candidate.id === pending.id ? incoming : candidate); onStatsDelta?.({ posts: 1, links: /https?:\/\/\S+/i.test(incoming.content) ? 1 : 0 }); return [...current, incoming]; }); };
    const onTyping = ({ typing: value }: { typing: boolean }) => setTyping(value);
    socket.on("new_message", onMessage);
    socket.on("typing_update", onTyping);
    return () => { cancelled = true; socket.emit("leave_room", { roomId }); socket.off("new_message", onMessage); socket.off("typing_update", onTyping); };
  }, [roomId, currentUser?.id]);

  useEffect(() => { if (!isDemoMode) messageCache.set(roomId, messages); }, [messages]);

  const send = (content: string) => {
    const pendingId = `pending-${crypto.randomUUID()}`;
    const message: DemoMessage = { id: pendingId, senderId: currentUser?.id ?? "you", senderName: currentUser?.name ?? "You", content, createdAt: "Sending…", own: true, pending: true };
    const hasLink = /https?:\/\/\S+/i.test(content);
    setMessages((current) => [...current, message]);
    onStatsDelta?.({ posts: 1, links: hasLink ? 1 : 0 });
    if (isDemoMode) { setMessages((current) => current.map((candidate) => candidate.id === pendingId ? { ...candidate, pending: false, createdAt: "Just now" } : candidate)); return; }
    socket.timeout(10000).emit("send_message", { roomId, content }, (error: Error | null, result: { ok?: boolean; message?: DemoMessage } = {}) => {
      if (error || !result.ok || !result.message) {
        setMessages((current) => current.map((candidate) => candidate.id === pendingId ? { ...candidate, pending: false, failed: true } : candidate));
        onStatsDelta?.({ posts: -1, links: hasLink ? -1 : 0 });
        return;
      }
      const confirmed = { ...result.message, own: true, createdAt: new Date(result.message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages((current) => current.map((candidate) => candidate.id === pendingId ? confirmed : candidate));
    });
  };
  const togglePin = async (messageId: string) => {
    const target = messages.find((message) => message.id === messageId);
    if (!target) return;
    if (isDemoMode) {
      setMessages((current) => current.map((message) => message.id === messageId ? { ...message, isPinned: !message.isPinned } : message));
      onStatsDelta?.({ pinned: target.isPinned ? -1 : 1 });
      return;
    }
    try {
      const result = await apiFetch<{ isPinned: boolean }>(`/rooms/${roomId}/messages/${messageId}/pin`, { method: "POST" });
      setMessages((current) => current.map((message) => message.id === messageId ? { ...message, isPinned: result.isPinned } : message));
      onStatsDelta?.({ pinned: result.isPinned ? 1 : -1 });
    } catch { /* keep the current message state when pinning fails */ }
  };

  return <main className="chat-panel"><header className="chat-header"><div className="room-title"><div className="room-icon"><Hash size={20} weight="bold" /></div><div><h1>{roomName}</h1>{roomMeta && <p>{roomMeta}</p>}</div></div></header><div className="messages"><div className="date-divider"><span>Today</span></div>{messages.length ? messages.map((message) => <MessageBubble message={message} key={message.id} onTogglePin={togglePin} />) : <div className="message-empty"><strong>{loading ? "Loading messages…" : "No messages yet"}</strong><span>{loading ? "Reconnecting to room history." : "Start the conversation in this room."}</span></div>}{typing && <div className="typing-line"><span className="typing-dots"><i /><i /><i /></span> Someone is typing</div>}</div><MessageComposer onSend={send} /></main>;
}
