import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

async function run() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    await client.execute("ALTER TABLE `user` ADD COLUMN `phoneNumber` TEXT;");
    console.log("Column added successfully");
  } catch (e) {
    console.error("Error adding column:", e);
    // If it already exists, that's fine
    if (e.message.includes("duplicate column name")) {
        console.log("Column already exists");
    }
  } finally {
    client.close();
  }
}

run();
