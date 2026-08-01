type AvatarProps = { name: string; color?: string; size?: "sm" | "md" | "lg"; avatarUrl?: string | null };

export function Avatar({ name, color = "#42d9bd", size = "md", avatarUrl }: AvatarProps) {
  return <span className={`avatar avatar-${size} ${avatarUrl ? "avatar-image" : ""}`} style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : { background: `${color}20`, color }} aria-label={`${name} avatar`}>{!avatarUrl && name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>;
}
