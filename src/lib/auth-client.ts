import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: process.env.AUTH_URL ?? "http://localhost:3000"
});
