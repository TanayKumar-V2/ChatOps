import { Check, PushPin, X } from "@phosphor-icons/react";
import { imageMessagePlaceholder } from "@chatops/contracts";
import { useState } from "react";
import { Avatar } from "../ui/Avatar";
import type { DemoMessage } from "../../types/chat";
import { useDialogFocus } from "../../lib/useDialogFocus";

export function MessageBubble({ message, onTogglePin }: { message: DemoMessage; onTogglePin?: (messageId: string) => void }) {
  const [zoomed, setZoomed] = useState(false);
  const lightboxRef = useDialogFocus<HTMLDivElement>(() => setZoomed(false), zoomed);
  const hasCaption = message.content !== imageMessagePlaceholder;
  return <><article className={`message-row ${message.own ? "own" : ""} ${message.pending ? "pending" : ""}`}><Avatar name={message.senderName} color={message.own ? "#42d9bd" : "#e5a35c"} avatarUrl={message.senderAvatarUrl} /><div className="message-body"><div className="message-meta"><strong>{message.senderName}</strong><time>{message.pending ? "Sending…" : message.failed ? "Failed to send" : message.createdAt}</time>{message.isPinned && <PushPin size={12} className="pinned-indicator" weight="fill" />}</div>{message.imageUrl && <button className="message-image-button" onClick={() => setZoomed(true)} aria-label="Zoom image"><img className="message-image" src={message.imageUrl} alt={hasCaption ? message.content : "Shared image"} /></button>}{hasCaption && <div className="message-content">{message.content}</div>}{message.own && !message.pending && !message.failed && <div className="message-seen"><Check size={13} weight="bold" /> Seen</div>}</div>{!message.pending && !message.failed && <button className={`message-menu ${message.isPinned ? "is-pinned" : ""}`} aria-label={message.isPinned ? "Unpin message" : "Pin message"} title={message.isPinned ? "Unpin message" : "Pin message"} onClick={() => onTogglePin?.(message.id)}><PushPin size={16} weight={message.isPinned ? "fill" : "regular"} /></button>}</article>{zoomed && message.imageUrl && <div className="image-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setZoomed(false); }}><div ref={lightboxRef} className="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image preview"><button className="image-lightbox-close" onClick={() => setZoomed(false)} aria-label="Close image preview"><X size={20} /></button><img src={message.imageUrl} alt={hasCaption ? message.content : "Shared image"} /></div></div>}</>;
}
