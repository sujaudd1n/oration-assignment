"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Layout from "../layout";

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session, isLoading } = trpc.chat.getSession.useQuery(
    { id: sessionId },
    { refetchInterval: 1000 }
  );
  const sendMessage = trpc.chat.sendMessage.useMutation();

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

  if (!session) {
    return (
      <Layout>

        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <p>Chat session not found.</p>
              <Button asChild className="mt-4">
                <Link href="/chat">Back to Chats</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </Layout>
    );
  }

  return (
    <Layout>

      <div className="min-h-screen flex flex-col">
        <header className="border-b p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/chat">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">{session.title}</h1>
          </div>
        </header>

        <main className="flex-1 p-4 max-w-4xl mx-auto w-full flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Career Counseling Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-4">
                {session.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${msg.role === "user"
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
            </CardContent>
          </Card>

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
