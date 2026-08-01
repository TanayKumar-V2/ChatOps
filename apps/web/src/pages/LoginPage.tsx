import { useState } from "react";
import { ArrowRight, LockKey, Sparkle } from "@phosphor-icons/react";
import { apiFetch } from "../lib/apiClient";
import { saveSession } from "../stores/auth.store";
import { configureSocket } from "../lib/socketClient";

type Props = { onAuthenticated: () => void };

export function LoginPage({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const result = await apiFetch<{ token: string; user: { id: string; name: string; email: string; avatarUrl: string | null } }>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(mode === "register" ? { name, email, password } : { email, password }) });
      saveSession(result.token, result.user); configureSocket(result.token); onAuthenticated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to sign in"); }
    finally { setLoading(false); }
  }

  const registering = mode === "register";
  return <main className="auth-page"><div className="auth-card"><div className="auth-brand"><div className="brand-mark">C</div><span>ChatOps</span></div><div className="auth-icon"><Sparkle size={22} weight="fill" /></div><h1>{registering ? "Create your workspace" : "Welcome back"}</h1><p>{registering ? "Start a room and invite your team." : "Sign in to pick up where your team left off."}</p><form onSubmit={submit}>{registering && <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={registering ? "new-password" : "current-password"} minLength={8} required /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="auth-submit" disabled={loading}>{loading ? "Please wait…" : registering ? "Create account" : "Enter workspace"}<ArrowRight size={18} /></button></form><button className="auth-switch" onClick={() => { setMode(registering ? "login" : "register"); setError(""); }}>{registering ? "Already have an account? Sign in" : "New to ChatOps? Create an account"}</button><div className="auth-note"><LockKey size={15} /> JWT-secured workspace access</div></div></main>;
}
