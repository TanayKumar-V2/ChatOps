import { Hash, Key, MagnifyingGlass, PencilSimple, Plus, SignOut } from "@phosphor-icons/react";
import { Avatar } from "../ui/Avatar";
import type { Room } from "../../types/chat";

export const demoRooms: Room[] = [
  { id: "general", name: "general", description: null, online: 8 },
  { id: "engineering", name: "engineering", description: null, online: 4, unread: 3 },
  { id: "design", name: "design", description: null, online: 2 },
  { id: "random", name: "random", description: null, online: 5 },
];

export function Sidebar({ activeRoom, onRoomChange, rooms = demoRooms, userName = "Your account", avatarUrl, onCreateRoom, onJoinRoom, onEditProfile, onLogout }: { activeRoom: string | null; onRoomChange: (id: string) => void; rooms?: Room[]; userName?: string; avatarUrl?: string | null; onCreateRoom?: () => void; onJoinRoom?: () => void; onEditProfile?: () => void; onLogout?: () => void }) {
  return <aside className="sidebar">
    <div className="brand-row"><div className="brand-mark">C</div><span className="brand-name">ChatOps</span><span className="brand-status"><i /> live</span></div>
    <label className="search-field"><MagnifyingGlass size={16} /><input aria-label="Search rooms" placeholder="Search rooms" /></label>
    <div className="section-label"><span>Rooms</span><span className="room-actions"><button className="icon-button" aria-label="Join private room" onClick={onJoinRoom}><Key size={15} /></button><button className="icon-button" aria-label="Create room" onClick={onCreateRoom}><Plus size={16} /></button></span></div>
    <nav className="room-list" aria-label="Chat rooms">{rooms.map((room) => <button key={room.id} className={`room-item ${room.id === activeRoom ? "active" : ""}`} onClick={() => onRoomChange(room.id)}><Hash size={16} weight={room.id === activeRoom ? "bold" : "regular"} /><span>{room.name}</span>{room.unread && <b>{room.unread}</b>}<small>{room.online ?? room.onlineCount ?? 0}</small></button>)}</nav>
    <div className="sidebar-footer"><button className="profile-trigger" onClick={onEditProfile} aria-label="Edit profile"><Avatar name={userName} color="#e5a35c" size="sm" avatarUrl={avatarUrl} /><span><strong>{userName}</strong><small><i className="online-dot" /> Available</small></span></button><div className="profile-actions"><button className="icon-button" aria-label="Edit profile" onClick={onEditProfile}><PencilSimple size={16} /></button><button className="icon-button" aria-label="Log out" onClick={onLogout}><SignOut size={17} /></button></div></div>
  </aside>;
}
