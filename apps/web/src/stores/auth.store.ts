export type AuthUser = { id: string; name: string; email: string; avatarUrl: string | null };

const tokenKey = "chatops_token";
const userKey = "chatops_user";

export function getToken() { return localStorage.getItem(tokenKey); }
export function getStoredUser(): AuthUser | null {
  const value = localStorage.getItem(userKey);
  return value ? JSON.parse(value) as AuthUser : null;
}
export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
}
