import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { users, chatSessions, messages } from "./schema"; // Adjust the import path as needed

export const db = drizzle(process.env.DATABASE_URL!);