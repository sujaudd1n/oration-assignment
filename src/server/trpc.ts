import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance

export const createContext = async (opts: CreateNextContextOptions) => {
  // export const createContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.req.headers, // you need to pass the headers object.
  });
  console.log("session = ", session);
  // const session = "hello";
  return {
    session,
    user: {
      id: session?.user?.id,
    },
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

t.procedure.use((opts) => {
  opts.ctx;
  return opts.next();
});

export const router = t.router;
export const publicProcedure = t.procedure;
