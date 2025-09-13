// contexts/ChatContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { trpc } from "@/utils/trpc";

const ChatContext = createContext<{
  sendMessage: ReturnType<typeof trpc.chat.sendMessage.useMutation>;
} | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const utils = trpc.useUtils();
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess(_, variable) {
      utils.chat.getSession.invalidate({ id: variable.sessionId });
    },
  });
  const [message, setMessage] = useState("");

  return (
    <ChatContext.Provider value={{ sendMessage, message, setMessage }}>
      {children}
    </ChatContext.Provider>
  );
}
