import "@/styles/globals.css";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { Toaster } from "@/components/ui/sonner";
import { ChatProvider } from "./ChatContext";
import { ThemeProvider } from "next-themes";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ChatProvider>
        <Component {...pageProps} />
        <Toaster />
      </ChatProvider>
    </ThemeProvider>
  );
};
export default trpc.withTRPC(MyApp);
