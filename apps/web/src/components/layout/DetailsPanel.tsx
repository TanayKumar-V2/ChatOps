import { Check, Copy, Info, LinkSimple, PushPin, UsersThree } from "@phosphor-icons/react";
import { Avatar } from "../ui/Avatar";
import type { Room } from "../../types/chat";
import { useState } from "react";

export function DetailsPanel({ room }: { room?: Room }) {
  const createdLabel = room?.createdAt ? new Intl.DateTimeFormat([], { month: "short", day: "numeric", year: "numeric" }).format(new Date(room.createdAt)) : "Date unavailable";
  const creator = room?.creatorName ?? "Unknown member";
  const memberCount = room?.memberCount ?? 0;
  const [copied, setCopied] = useState(false);
  const copyInviteCode = async () => { if (!room?.joinCode) return; try { await navigator.clipboard.writeText(room.joinCode); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } };
  return <aside className="details-panel"><div className="details-heading"><h2>Room details</h2><span aria-hidden="true"><Info size={18} /></span></div><div className="room-summary"><div className="large-room-icon">#</div><h3>{room?.name ?? "No room selected"}</h3>{room?.description && <p>{room.description}</p>}<span className="created-label">Created by {creator} · {createdLabel}</span>{room?.joinCode && <div className="detail-invite"><span>Invite code</span><div><code>{room.joinCode}</code><button className="icon-button" aria-label={copied ? "Invite code copied" : "Copy invite code"} title={copied ? "Copied" : "Copy invite code"} onClick={copyInviteCode}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></div></div>}</div><div className="detail-group"><div className="detail-label"><span><UsersThree size={16} /><span>Members</span></span><b>{memberCount}</b></div><div className="member-stack"><Avatar name={creator} color="#42d9bd" size="sm" /><span className="member-caption">{memberCount === 1 ? "You are the only member" : `${memberCount - 1} other ${memberCount - 1 === 1 ? "member" : "members"}`}</span></div></div><div className="detail-actions"><div className="detail-stat"><span><PushPin size={17} />Pinned messages</span><b>{room?.pinnedCount ?? 0}</b></div><div className="detail-stat"><span><LinkSimple size={17} />Shared links</span><b>{room?.linkCount ?? 0}</b></div><div className="detail-stat"><span>Posts</span><b>{room?.postCount ?? 0}</b></div></div><div className="detail-note"><span className="note-dot" /><div><strong>Keep the signal clear</strong><p>Use threads for decisions and keep this room focused on shipping.</p></div></div></aside>;
}
