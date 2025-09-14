import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/routers/_app";
import { createContext } from "@/server/trpc";
// export API handler
// @link https://trpc.io/docs/v11/server/adapters
// import { auth } from "@/lib/auth"; // path to your Better Auth server instance
// import { headers } from "next/headers";

// const session = await auth.api.getSession({
//   headers: await headers(), // you need to pass the headers object.
// });

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});

/*
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: async () => {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    return {
      session,
      user: {
        id: "HTuwzQp1ASDKTGHzXOrpzUxCjGKuuev1",
      },
    };
  },
});
*/
