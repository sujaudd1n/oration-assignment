"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [newChatTitle, setNewChatTitle] = useState("");
  const utils = trpc.useUtils();
  const router = useRouter();

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
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Career Counseling Chats</h1>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Start New Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter chat topic..."
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateChat()}
              />
              <Button onClick={handleCreateChat} disabled={createSession.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Chat Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions?.length === 0 ? (
              <p className="text-muted-foreground">No chat sessions yet. Start a new one!</p>
            ) : (
              <div className="grid gap-4">
                {sessions?.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <Link
                      href={`/chat/${session.id}`}
                      className="flex items-center gap-3 flex-1"
                    >
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{session.title}</span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}