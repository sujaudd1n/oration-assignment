import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index"; // your drizzle instance
import { schema } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      ...schema
    },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
