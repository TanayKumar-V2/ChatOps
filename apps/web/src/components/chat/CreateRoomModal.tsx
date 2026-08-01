import { Check, Copy, X } from "@phosphor-icons/react";
import { useState } from "react";
import { apiFetch } from "../../lib/apiClient";
import type { Room } from "../../types/chat";

export function CreateRoomModal({ onCreated, onClose }: { onCreated: (room: Room) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try { const result = await apiFetch<{ room: Room }>("/rooms", { method: "POST", body: JSON.stringify({ name, description: description || null }) }); setCreatedRoom(result.room); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create room"); }
    finally { setLoading(false); }
  }
  if (createdRoom) return <div className="modal-backdrop"><section className="modal-card" role="dialog" aria-modal="true"><div className="success-icon"><Check size={22} weight="bold" /></div><h2>Room created</h2><p className="modal-copy">Share this private code with the people you want to invite.</p><div className="join-code-box"><code>{createdRoom.joinCode}</code><button className="icon-button" aria-label="Copy room code" onClick={() => navigator.clipboard.writeText(createdRoom.joinCode ?? "")}><Copy size={18} /></button></div><button className="auth-submit" onClick={() => onCreated(createdRoom)}>Open room</button></section></div>;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-room-title"><div className="modal-heading"><div><h2 id="create-room-title">Create a private room</h2><p>Only people with the invite code can join.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><form onSubmit={submit}><label>Room name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. product-launch" required minLength={2} maxLength={80} autoFocus /></label><label>Description <span className="optional">optional</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What belongs in this room?" maxLength={240} /></label>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="auth-submit" disabled={loading}>{loading ? "Creating…" : "Create room"}</button></div></form></section></div>;
}
