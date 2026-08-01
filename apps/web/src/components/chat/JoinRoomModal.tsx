import { Key, X } from "@phosphor-icons/react";
import { useState } from "react";
import { apiFetch } from "../../lib/apiClient";
import type { Room } from "../../types/chat";
import { useDialogFocus } from "../../lib/useDialogFocus";

export function JoinRoomModal({ onJoined, onClose }: { onJoined: (room: Room) => void; onClose: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useDialogFocus(onClose);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try { const result = await apiFetch<{ room: Room }>("/rooms/join", { method: "POST", body: JSON.stringify({ code }) }); onJoined(result.room); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Invalid invite code"); }
    finally { setLoading(false); }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className="modal-card" role="dialog" aria-modal="true" aria-labelledby="join-room-title"><div className="modal-heading"><div><h2 id="join-room-title">Join a private room</h2><p>Enter the invite code shared by a room member.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><form onSubmit={submit}><label>Invite code<div className="code-input"><Key size={17} /><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ROOM-XXXXXXXX" required autoFocus /></div></label>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="auth-submit" disabled={loading}>{loading ? "Joining…" : "Join room"}</button></div></form></section></div>;
}
