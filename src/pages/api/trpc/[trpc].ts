import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/routers/_app";
// export API handler
// @link https://trpc.io/docs/v11/server/adapters
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({
    user: {
      id: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),
});
