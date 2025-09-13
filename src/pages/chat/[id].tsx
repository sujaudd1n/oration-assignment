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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!session || !("id" in session)) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Chat session not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">{session.title}</h1>

        <main className="flex-1 p-4 max-w-4xl mx-auto w-full flex flex-col">
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
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={sendMessage.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessage.isPending}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
