"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, MessageSquare, Trash2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { PanelLeft } from "lucide-react";

export default function Layout({ children }) {
  const [newChatTitle, setNewChatTitle] = useState("");
  const utils = trpc.useUtils();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  const { data: sessions, isLoading } = trpc.chat.listSessions.useQuery();
  const createSession = trpc.chat.createSession.useMutation({
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
      utils.chat.listSessions.invalidate();
    },
  });
  const deleteSession = trpc.chat.deleteSession.useMutation({
    onSuccess: () => {
      utils.chat.listSessions.invalidate();
    },
  });

  const handleCreateChat = () => {
    if (newChatTitle.trim()) {
      createSession.mutate({ title: newChatTitle.trim() });
      setNewChatTitle("");
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
          {sessions?.length === 0 ? (
            <p className="text-muted-foreground">
              No chat sessions yet. Start a new one!
            </p>
          ) : (
            <div className="flex flex-col gap-2 overflow-auto h-[calc(100dvh-100px-40px)]">
              {sessions?.map((session) => (
                <div
                  key={session.id}
                  className={`${session.id === sessionId && 'bg-[#333333]'} flex items-center justify-between px-2 pr-0 rounded-lg hover:bg-[#333333]`}
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
                    onClick={() => deleteSession.mutate({ id: session.id })}
                    disabled={deleteSession.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </aside>

        <div className="p-5 grow max-w-[700px] mx-auto self-end">
          <div>{children}</div>
          <div className="flex gap-2">
            <Input
              className="h-[50px] relative"
              placeholder={sessionId ? "Message... " : "Start a new chat"}
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
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
