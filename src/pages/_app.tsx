import "@/styles/globals.css";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { Toaster } from "@/components/ui/sonner";
import { ChatProvider } from "./ChatContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChatProvider>
      <Component {...pageProps} />
      <Toaster />
    </ChatProvider>
  );
};
export default trpc.withTRPC(MyApp);
