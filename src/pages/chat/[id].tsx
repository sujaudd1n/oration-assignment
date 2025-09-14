"use client";

import { useRef, useEffect, useMemo } from "react";
import { trpc } from "@/utils/trpc";
import Layout from "./layout";
import { useParams } from "next/navigation";
import { useChat } from "../ChatContext";
import { marked } from "marked";
import { Message, TypingIndicator } from "../../components/ChatComponents";

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params?.id as string;
  const { sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: session,
    isLoading,
    error,
  } = trpc.chat.getSession.useQuery(
    { id: sessionId as string },
    {
      retry: 2,
      retryDelay: 1000,
      enabled: !!sessionId,
    },
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-[80dvh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[80dvh] flex items-center justify-center">
          <p className="text-destructive">Error loading chat session.</p>
        </div>
      );
    }

    if (!session) {
      return (
        <div className="min-h-[80dvh] flex items-center justify-center">
          <p>Chat session not found.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col relative overflow-auto max-h-[90dvh]">
        <ChatHeader title={session.title} />
        <ChatMessages
          messages={session.messages}
          showTypingIndicator={sendMessage.isPending}
        />
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return <Layout>{renderContent()}</Layout>;
}

interface ChatHeaderProps {
  title: string;
}

const ChatHeader = ({ title }: ChatHeaderProps) => (
  <h1 className="bg-background/80 backdrop-blur-sm p-2 text-xl font-semibold sticky top-0 left-0 right-0 text-center">
    {title}
  </h1>
);

interface ChatMessagesProps {
  messages: Array<{
    id: string;
    createdAt: string;
    sessionId: string;
    content: string;
    role: string;
  }>;
  showTypingIndicator: boolean;
}

const ChatMessages = ({ messages, showTypingIndicator }: ChatMessagesProps) => {
  const parsedMessages = useMemo(
    () =>
      messages.map((msg) => ({
        ...msg,
        parsedContent: marked.parse(msg.content) as string,
      })),
    [messages],
  );

  return (
    <main className="flex-1 px-3 mx-auto w-full flex flex-col">
      <div className="space-y-4">
        {parsedMessages.map((msg) => (
          <Message
            key={msg.id}
            role={msg.role}
            content={msg.parsedContent}
            timestamp={msg.createdAt}
          />
        ))}
        {showTypingIndicator && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
      </div>
    </main>
  );
};

export { TypingIndicator };
