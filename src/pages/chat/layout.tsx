"use client";

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, MessageSquare, Trash2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { toast } from "sonner";
import { useChat } from "../ChatContext";

export default function Layout({ children }) {
  const [newChatTitle, setNewChatTitle] = useState("");
  const {sendMessage} = useChat()
  const utils = trpc.useUtils();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  const { message, setMessage } = useChat();
  console.log(sendMessage);

  const { data: sessions, isLoading } = trpc.chat.listSessions.useQuery();
  const createSession = trpc.chat.createSession.useMutation({
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
      utils.chat.listSessions.invalidate();
    },
    onError: (e) => {
      toast(`Failed to create session`);
    },
  });
  const deleteSession = trpc.chat.deleteSession.useMutation({
    onSuccess: (_, variables) => {
      console.log(variables);
      console.log(sessionId);
      toast(`Session ${variables.title} has been deleted`);
      utils.chat.listSessions.invalidate();
      if (variables.id === sessionId) router.push("/chat");
    },
  });

  const handleCreateChat = async () => {
    console.log(sessionId, typeof sessionId);
    if (!sessionId) {
      if (newChatTitle.trim()) {
        createSession.mutate({ title: newChatTitle.trim() });
        setNewChatTitle("");
      }
    } else {
      if (message.trim() && !sendMessage.isPending) {
        setMessage("");
        await sendMessage.mutateAsync({
          sessionId,
          message: message.trim(),
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] mx-auto">
      <div className="flex h-[100%]">
        <aside className="w-[300px] p-5 bg-secondary">
          <div className="h-[100px]">
            <div className="flex justify-between">
              <h1 className="text-xl font-bold">Career Counseling</h1>
              <Button size="icon">
                <PanelLeft />
              </Button>
            </div>
            <Button className="w-full my-5" onClick={() => router.push("/chat")}>
              New Chat
            </Button>
          </div>
          {!sessions ? (
            <p>Can't load sessions</p>
          ) : sessions?.length === 0 ? (
            <p className="text-muted-foreground">
              No chat sessions yet. Start a new one!
            </p>
          ) : (
            <div className="flex flex-col gap-2 overflow-auto h-[calc(100dvh-100px-40px)]">
              {sessions?.map((session) => (
                <div
                  key={session.id}
                  className={`${session.id === sessionId && "bg-[#333333]"} flex items-center justify-between px-2 pr-0 rounded-lg hover:bg-[#333333]`}
                >
                  <Link
                    href={`/chat/${session.id}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <span className="text-sm font-medium">{session.title}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      deleteSession.mutate({ id: session.id, title: session.title })
                    }
                    disabled={deleteSession.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </aside>

        <div className="p-5 grow max-w-[1000px] mx-auto self-end">
          <div>{children}</div>
          <div className="flex gap-2">
            <Input
              className="h-[50px] relative"
              placeholder={sessionId ? "Message... " : "Start a new chat"}
              value={sessionId ? message : newChatTitle}
              onChange={(e) => {
                if (!sessionId) setNewChatTitle(e.target.value);
                else setMessage(e.target.value);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleCreateChat()}
            />
            <Button
              // size="icon"
              onClick={handleCreateChat}
              disabled={createSession.isPending}
              className="w-[50px] h-[50px]"
            >
              <Send size={64} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
