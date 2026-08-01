import { useEffect, useState } from "react";
import { Hash, Key, List, Plus, SignOut, UserCircle, X } from "@phosphor-icons/react";
import { Sidebar, demoRooms } from "./components/layout/Sidebar";
import { DetailsPanel } from "./components/layout/DetailsPanel";
import { ChatPanel } from "./components/chat/ChatPanel";
import { apiFetch } from "./lib/apiClient";
import { isDemoMode } from "./lib/socketClient";
import { getStoredUser, getToken, clearSession } from "./stores/auth.store";
import type { AuthUser } from "./stores/auth.store";
import { LoginPage } from "./pages/LoginPage";
import { LandingPage } from "./pages/LandingPage";
import { CreateRoomModal } from "./components/chat/CreateRoomModal";
import { JoinRoomModal } from "./components/chat/JoinRoomModal";
import { ProfileModal } from "./components/profile/ProfileModal";
import { socket } from "./lib/socketClient";
import type { Room } from "./types/chat";
import { Avatar } from "./components/ui/Avatar";
import { useDialogFocus } from "./lib/useDialogFocus";

function cachedRoomsFor(userId?: string) {
  if (!userId) return [];
  try { return JSON.parse(localStorage.getItem(`chatops_rooms_${userId}`) ?? "[]") as Room[]; } catch { return []; }
}

function cacheRoomsFor(userId: string | undefined, rooms: Room[]) {
  if (userId) localStorage.setItem(`chatops_rooms_${userId}`, JSON.stringify(rooms));
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [rooms, setRooms] = useState<Room[]>(isDemoMode ? demoRooms : cachedRoomsFor(getStoredUser()?.id));
  const [activeRoom, setActiveRoom] = useState<string | null>(isDemoMode ? demoRooms[0]?.id ?? null : cachedRoomsFor(getStoredUser()?.id)[0]?.id ?? null);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const mobileMenuRef = useDialogFocus<HTMLElement>(() => setMobileMenuOpen(false), mobileMenuOpen);
  useEffect(() => { if (!isDemoMode && authenticated) { const storedUser = getStoredUser(); setUser(storedUser); const cached = cachedRoomsFor(storedUser?.id); if (cached.length) { setRooms(cached); setActiveRoom((current) => current && cached.some((room) => room.id === current) ? current : cached[0]?.id ?? null); } apiFetch<{ rooms: Room[] }>("/rooms").then((result) => { cacheRoomsFor(storedUser?.id, result.rooms); setRooms(result.rooms); setActiveRoom((current) => current && result.rooms.some((room) => room.id === current) ? current : result.rooms[0]?.id ?? null); }).catch(() => { clearSession(); setAuthenticated(false); setUser(null); }); } }, [authenticated]);
  if (!isDemoMode && !authenticated) return authMode ? <LoginPage initialMode={authMode} onAuthenticated={() => { setAuthMode(null); setAuthenticated(true); }} onBackToLanding={() => setAuthMode(null)} /> : <LandingPage onOpenAuth={setAuthMode} />;
  const activeRoomData = rooms.find((room) => room.id === activeRoom);
  const logout = () => { socket.disconnect(); clearSession(); setAuthMode(null); setAuthenticated(false); };
  const created = (room: Room) => { setRooms((current) => { const next = [...current, room]; cacheRoomsFor(user?.id, next); return next; }); setActiveRoom(room.id); setCreateRoomOpen(false); };
  const joined = (room: Room) => { setRooms((current) => { const next = [...current.filter((candidate) => candidate.id !== room.id), room]; cacheRoomsFor(user?.id, next); return next; }); setActiveRoom(room.id); setJoinRoomOpen(false); };
  const updateRoomStats = (roomId: string, delta: { posts?: number; pinned?: number; links?: number }) => setRooms((current) => { const next = current.map((room) => room.id === roomId ? { ...room, postCount: Math.max(0, (room.postCount ?? 0) + (delta.posts ?? 0)), pinnedCount: Math.max(0, (room.pinnedCount ?? 0) + (delta.pinned ?? 0)), linkCount: Math.max(0, (room.linkCount ?? 0) + (delta.links ?? 0)) } : room); cacheRoomsFor(user?.id, next); return next; });
  const profileSaved = (updatedUser: AuthUser) => { setUser(updatedUser); setProfileOpen(false); };
  const openProfile = () => { setMobileMenuOpen(false); setProfileOpen(true); };
  const selectMobileRoom = (roomId: string) => { setActiveRoom(roomId); setMobileMenuOpen(false); };
  return <><div className="app-shell"><Sidebar activeRoom={activeRoom} rooms={rooms} userName={user?.name ?? "Your account"} avatarUrl={user?.avatarUrl} onRoomChange={setActiveRoom} onCreateRoom={() => setCreateRoomOpen(true)} onJoinRoom={() => setJoinRoomOpen(true)} onEditProfile={openProfile} onLogout={logout} /><div className="mobile-topbar"><div className="mobile-brand"><div className="brand-mark">C</div><div><strong>ChatOps</strong><small>{activeRoomData?.name ?? "Your workspace"}</small></div></div><button className="mobile-menu-trigger" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Avatar name={user?.name ?? "Your account"} avatarUrl={user?.avatarUrl} size="sm" /><List size={19} /></button></div><div className="mobile-room-actions" aria-label="Room actions"><button className="mobile-room-action secondary" onClick={() => setJoinRoomOpen(true)}><Key size={16} /> Join with code</button><button className="mobile-room-action" onClick={() => setCreateRoomOpen(true)}><Plus size={16} /> Create room</button></div>{activeRoomData ? <><ChatPanel roomId={activeRoomData.id} room={activeRoomData} currentUser={user} onStatsDelta={(delta) => updateRoomStats(activeRoomData.id, delta)} /><DetailsPanel room={activeRoomData} /></> : <main className="chat-panel empty-room"><div><div className="room-icon">#</div><h1>No rooms yet</h1><p>Create a private room or join one with an invite code.</p><div className="empty-room-actions"><button className="secondary-button" onClick={() => setJoinRoomOpen(true)}><Key size={16} /> Join with code</button><button className="auth-submit" onClick={() => setCreateRoomOpen(true)}><Plus size={16} /> Create a room</button></div></div></main>}</div>{mobileMenuOpen && <div className="mobile-menu-overlay open" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}><aside ref={mobileMenuRef} className="mobile-menu-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title"><div className="mobile-menu-heading"><div className="mobile-user-summary"><Avatar name={user?.name ?? "Your account"} avatarUrl={user?.avatarUrl} size="md" /><div><strong id="mobile-menu-title">{user?.name ?? "Your account"}</strong><small>{user?.email ?? "Signed in"}</small></div></div><button className="icon-button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation"><X size={19} /></button></div><button className="mobile-profile-action" onClick={openProfile}><UserCircle size={18} /> Edit profile</button><div className="mobile-menu-label">Rooms</div><nav className="mobile-room-list" aria-label="Mobile chat rooms">{rooms.map((room) => <button key={room.id} className={`mobile-room-item ${room.id === activeRoom ? "active" : ""}`} onClick={() => selectMobileRoom(room.id)}><Hash size={16} /><span>{room.name}</span>{room.unread && <b>{room.unread}</b>}</button>)}</nav><div className="mobile-menu-actions"><button onClick={() => { setMobileMenuOpen(false); setJoinRoomOpen(true); }}><Key size={17} /> Join with code</button><button onClick={() => { setMobileMenuOpen(false); setCreateRoomOpen(true); }}><Plus size={17} /> Create room</button></div><button className="mobile-logout-action" onClick={logout}><SignOut size={17} /> Log out</button></aside></div>}{createRoomOpen && <CreateRoomModal onCreated={created} onClose={() => setCreateRoomOpen(false)} />}{joinRoomOpen && <JoinRoomModal onJoined={joined} onClose={() => setJoinRoomOpen(false)} />}{profileOpen && user && <ProfileModal user={user} onSaved={profileSaved} onLogout={logout} onClose={() => setProfileOpen(false)} />}</>;
}
