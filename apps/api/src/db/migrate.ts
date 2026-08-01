import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { env } from "../config/env.js";

const sql = neon(env.DATABASE_URL);
const migrationFiles = ["0001_initial.sql", "0002_add_auth.sql", "0003_private_room_codes.sql", "0004_message_pins.sql", "0005_message_images.sql"];

async function migrate() {
  for (const filename of migrationFiles) {
    const filePath = resolve(process.cwd(), "src/db/migrations", filename);
    const contents = await readFile(filePath, "utf8");
    const statements = contents.split(/;\s*(?:\n|$)/).map((statement) => statement.trim()).filter(Boolean);
    for (const statement of statements) await sql(statement);
    console.log(`Applied ${filename}`);
  }
}

migrate().catch((error) => { console.error(error); process.exitCode = 1; });
