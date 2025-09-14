"use client";

import React, { useRef, useState } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, MessageSquare, Trash2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { toast } from "sonner";
import { useChat } from "../ChatContext";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/ModeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [newChatTitle, setNewChatTitle] = useState("");
  const { sendMessage } = useChat();
  const utils = trpc.useUtils();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;
  const asideRef = useRef<HTMLElement>(null);

  const {
    data: authSession,
    isPending: authIsPending,
    error: authError,
    refetch: authRefetch, // Use the correct property name 'refetch'
  } = authClient.useSession();

  // const {
  //   data: authSession,
  //   authIsPending,
  //   authError,
  //   authRefetch,
  // } = authClient.useSession();

  const { message, setMessage } = useChat();

  const { data: sessions, isLoading } = trpc.chat.listSessions.useQuery(undefined, {
    enabled: !!authSession?.user?.id,
  });

  const createSession = trpc.chat.createSession.useMutation({
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
      utils.chat.listSessions.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create session: ${error.message}`);
    },
  });

  const deleteSession = trpc.chat.deleteSession.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Session deleted successfully`);
      utils.chat.listSessions.invalidate();
      if (variables.id === sessionId) router.push("/chat");
    },
    onError: (error) => {
      toast.error(`Failed to delete session: ${error.message}`);
    },
  });

  const handleCreateChat = async () => {
    if (!sessionId) {
      if (newChatTitle.trim()) {
        try {
          createSession.mutate({ title: newChatTitle.trim() });
          setNewChatTitle("");
        } catch (error) {
          console.error("Failed to create chat:", error);
        }
      }
    } else {
      if (message.trim() && !sendMessage.isPending) {
        try {
          setMessage("");
          await sendMessage.mutateAsync({
            sessionId,
            message: message.trim(),
          });
        } catch (error) {
          console.error("Failed to send message:", error);
          toast.error("Failed to send message");
        }
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
        <Button
          className="fixed top-2 left-2 z-10"
          size="icon"
          onClick={() => {
            if (asideRef.current) {
              asideRef.current.style.width = "300px";
              asideRef.current.style.padding = "20px";
              asideRef.current.style.translate = "0px";
            }
          }}
        >
          <PanelLeft />
        </Button>

        <aside
          ref={asideRef}
          className="absolute top-0 bottom-0 left-0 md:relative w-0 p-0 overflow-hidden flex flex-col translate-x-[-300px] z-10 bg-secondary/30 backdrop-blur-md lg:translate-x-0 lg:w-[300px] lg:p-5 transition-all"
        >
          <div className="h-[100px]">
            <div className="flex justify-between">
              <h1 className="text-xl font-bold">Career Counseling</h1>
              <Button
                size="icon"
                onClick={() => {
                  if (asideRef.current) {
                    asideRef.current.style.width = "0px";
                    asideRef.current.style.padding = "0px";
                    asideRef.current.style.translate = "-300px";
                  }
                }}
              >
                <PanelLeft />
              </Button>
            </div>
            <Button className="w-full my-5" onClick={() => router.push("/chat")}>
              New Chat
            </Button>
          </div>

          {!sessions || sessions.length === 0 ? (
            <p className="text-muted-foreground">
              No chat sessions yet. Start a new one!
            </p>
          ) : (
            <div className="flex flex-col gap-2 overflow-auto h-[calc(100dvh-150px-40px)]">
              {sessions.map((session) => (
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
                    onClick={() => deleteSession.mutate({ id: session.id })}
                    disabled={deleteSession.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto w-full">
            {authIsPending && <p>Loading...</p>}
            {authSession?.user && (
              <>
                <p className="py-2">{authSession.user.name}</p>
                <div className="flex flex-nowrap gap-2">
                  <ModeToggle />
                  <Button
                    className="grow"
                    onClick={async () => {
                      try {
                        await authClient.signOut();
                      } catch (error) {
                        console.error("Failed to sign out:", error);
                        toast.error("Failed to sign out");
                      }
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}
            {!authSession && (
              <Button className="w-full" onClick={() => router.push("/sign-in")}>
                Sign In
              </Button>
            )}
          </div>
        </aside>

        <div className="p-5 pt-0 grow max-w-[1000px] mx-auto flex flex-col">
          <div>{children}</div>
          <div className="flex gap-2 mt-auto">
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
              onClick={handleCreateChat}
              disabled={
                createSession.isPending || (sessionId ? sendMessage.isPending : false)
              }
              className="w-[50px] h-[50px]"
            >
              <Send size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
