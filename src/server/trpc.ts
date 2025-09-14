import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { auth } from "@/lib/auth";

export const createContext = async (opts: CreateNextContextOptions) => {
  const headers = new Headers();
  Object.entries(opts.req.headers).forEach(([key, value]) => {
    if (value) {
      const headerValue = Array.isArray(value) ? value.join(', ') : value;
      headers.set(key, headerValue);
    }
  });

  const session = await auth.api.getSession({
    headers,
  });

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