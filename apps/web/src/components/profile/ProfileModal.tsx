import { SignOut, UserCircle, X } from "@phosphor-icons/react";
import { useState } from "react";
import { apiFetch } from "../../lib/apiClient";
import { saveSession, type AuthUser } from "../../stores/auth.store";
import { socket } from "../../lib/socketClient";
import { useDialogFocus } from "../../lib/useDialogFocus";

export function ProfileModal({ user, onSaved, onLogout, onClose }: { user: AuthUser; onSaved: (user: AuthUser) => void; onLogout: () => void; onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useDialogFocus(onClose);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const result = await apiFetch<{ user: AuthUser }>("/auth/me", { method: "PATCH", body: JSON.stringify({ name, avatarUrl: avatarUrl.trim() || null }) });
      const token = localStorage.getItem("chatops_token");
      if (token) saveSession(token, result.user);
      socket.emit("profile_updated");
      onSaved(result.user);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We couldn't save your profile. Check your connection and try again."); }
    finally { setLoading(false); }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className="modal-card profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div className="modal-heading"><div><div className="profile-modal-icon"><UserCircle size={20} /></div><h2 id="profile-title">Your profile</h2><p>Update how your team sees you.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><form onSubmit={submit}><label>Display name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" minLength={2} maxLength={120} required /></label><label>Email<span className="read-only-value">{user.email}</span></label><label>Profile image URL <span className="optional">optional</span><input type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://…" /></label>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions profile-actions-row"><button type="button" className="danger-button" onClick={onLogout}><SignOut size={16} /> Log out</button><span /><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="auth-submit" disabled={loading}>{loading ? "Saving profile…" : "Save changes"}</button></div></form></section></div>;
}
