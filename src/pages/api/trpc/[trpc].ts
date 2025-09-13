import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/routers/_app";
// export API handler
// @link https://trpc.io/docs/v11/server/adapters
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

// const session = await auth.api.getSession({
//   headers: await headers(), // you need to pass the headers object.
// });

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({
    // user: session,
    user: {
      id: "HTuwzQp1ASDKTGHzXOrpzUxCjGKuuev1"
    },
  }),
});
