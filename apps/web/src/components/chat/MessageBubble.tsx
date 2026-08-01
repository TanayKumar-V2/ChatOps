import { Check, PushPin } from "@phosphor-icons/react";
import { imageMessagePlaceholder } from "@chatops/contracts";
import { useEffect, useState } from "react";
import { Avatar } from "../ui/Avatar";
import type { DemoMessage } from "../../types/chat";

export function MessageBubble({ message, onTogglePin }: { message: DemoMessage; onTogglePin?: (messageId: string) => void }) {
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    if (!zoomed) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setZoomed(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [zoomed]);
  const hasCaption = message.content !== imageMessagePlaceholder;
  return <><article className={`message-row ${message.own ? "own" : ""} ${message.pending ? "pending" : ""}`}><Avatar name={message.senderName} color={message.own ? "#42d9bd" : "#e5a35c"} avatarUrl={message.senderAvatarUrl} /><div className="message-body"><div className="message-meta"><strong>{message.senderName}</strong><time>{message.pending ? "Sending…" : message.failed ? "Failed to send" : message.createdAt}</time>{message.isPinned && <PushPin size={12} className="pinned-indicator" weight="fill" />}</div>{message.imageUrl && <button className="message-image-button" onClick={() => setZoomed(true)} aria-label="Zoom image"><img className="message-image" src={message.imageUrl} alt={hasCaption ? message.content : "Shared image"} /></button>}{hasCaption && <div className="message-content">{message.content}</div>}{message.own && !message.pending && !message.failed && <div className="message-seen"><Check size={13} weight="bold" /> Seen</div>}</div>{!message.pending && !message.failed && <button className={`message-menu ${message.isPinned ? "is-pinned" : ""}`} aria-label={message.isPinned ? "Unpin message" : "Pin message"} title={message.isPinned ? "Unpin message" : "Pin message"} onClick={() => onTogglePin?.(message.id)}><PushPin size={16} weight={message.isPinned ? "fill" : "regular"} /></button>}</article>{zoomed && message.imageUrl && <div className="image-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setZoomed(false); }}><img src={message.imageUrl} alt={hasCaption ? message.content : "Shared image"} /></div>}</>;
}
