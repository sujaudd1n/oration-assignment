"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "./layout";
import { useParams } from "next/navigation";
import { useChat } from "../ChatContext";
import { marked } from "marked";

interface Message {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatSessionPage() {
  const { sendMessage } = useChat();
  const params = useParams();
  const sessionId = params?.id as string;

  const { message, setMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session, isLoading, error } = trpc.chat.getSession.useQuery(
    { id: sessionId },
    { 
      retry: 2, 
      retryDelay: 1000,
      enabled: !!sessionId 
    },
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSendMessage = async () => {
    if (message.trim() && !sendMessage.isPending) {
      try {
        setMessage("");
        await sendMessage.mutateAsync({
          sessionId,
          message: message.trim(),
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80dvh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[80dvh] flex items-center justify-center">
          <p className="text-destructive">Error loading chat session.</p>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="min-h-[80dvh] flex items-center justify-center">
          <p>Chat session not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col relative overflow-auto max-h-[90dvh]">
        <h1 className="bg-background/80 backdrop-blur-sm p-2 text-xl font-semibold sticky top-0 left-0 right-0 text-center">
          {session.title}
        </h1>

        <main className="flex-1 px-3 mx-auto w-full flex flex-col">
          <div className="space-y-4">
            {session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    <div
                      dangerouslySetInnerHTML={{ 
                        __html: marked.parse(msg.content) as string 
                      }}
                    />
                    <p
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} text-xs mt-3`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
      </div>
    </Layout>
  );
}

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 rounded-lg px-3 py-2 max-w-max">
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  );
};

/*
"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "./layout";
import { useParams } from "next/navigation";
import { useChat } from "../ChatContext";
import { marked } from "marked";

interface ChatSessionPageProps {
  sendMessage: ReturnType<typeof trpc.chat.sendMessage.useMutation>;
  children?: React.ReactNode;
}

export default function ChatSessionPage() {
  const { sendMessage } = useChat();
  const params = useParams();
  const sessionId = params?.id as string;

  const { message, setMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session, isLoading } = trpc.chat.getSession.useQuery(
    { id: sessionId },
    { retry: 2, retryDelay: 1000 },
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSendMessage = async () => {
    if (message.trim() && !sendMessage.isPending) {
      setMessage("");
      await sendMessage.mutateAsync({
        sessionId,
        message: message.trim(),
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80dvh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!session || !("id" in session)) {
    return (
      <Layout>
        <div className="min-h-[80dvh] flex items-center justify-center">
          <p>Chat session not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col relative overflow-auto max-h-[90dvh]">
        <h1 className="bg-background/80 backdrop-blur-sm p-2 text-xl font-semibold sticky top-0 left-0 right-0 text-center">
          {session.title}
        </h1>

        <main className="flex-1 px-3 mx-auto w-full flex flex-col">
          <div className="space-y-4">
            {session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    <p
                      dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }}
                    ></p>
                    <p
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} text-xs mt-3`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
      </div>
    </Layout>
  );
}

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 rounded-lg px-3 py-2 max-w-max">
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  );
};

*/