import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import { users, rooms, roomMembers } from "./schema/index.js";
import { hashPassword } from "../modules/auth/auth.service.js";

const mayaId = "11111111-1111-4111-8111-111111111111";
const eliId = "22222222-2222-4222-8222-222222222222";

async function seed() {
  const passwordHash = await hashPassword("change-me-please");
  await db.insert(users).values([
    { id: mayaId, name: "Maya Patel", email: "maya@chatops.local", passwordHash, avatarUrl: null },
    { id: eliId, name: "Eli Morgan", email: "eli@chatops.local", passwordHash, avatarUrl: null },
  ]).onConflictDoNothing();

  const [existingRoom] = await db.select().from(rooms).where(eq(rooms.name, "engineering")).limit(1);
  const engineering = existingRoom ?? (await db.insert(rooms).values({ name: "engineering", description: "Build notes and releases", joinCode: "ROOM-ENGINEERING", createdBy: mayaId }).returning())[0];
  if (engineering) await db.insert(roomMembers).values([{ roomId: engineering.id, userId: mayaId }, { roomId: engineering.id, userId: eliId }]).onConflictDoNothing();
  console.log("Seeded ChatOps demo users. Password: change-me-please");
}

seed().catch((error) => { console.error(error); process.exitCode = 1; });
