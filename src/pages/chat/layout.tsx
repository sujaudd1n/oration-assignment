"use client";

import React, { useRef, useState } from "react";
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
import { authClient } from "@/lib/auth-client"; // import the auth client
import { ModeToggle } from "@/components/ModeToggle";

export default function Layout({ children }) {
  const [newChatTitle, setNewChatTitle] = useState("");
  const { sendMessage } = useChat();
  const utils = trpc.useUtils();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;
  const asideRef = useRef(null);

  const {
    data: authSession,
    authIsPending, //loading state
    authError, //error object
    authRefetch, //refetch the session
  } = authClient.useSession();

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
        {/*<aside className="w-[300px] p-5 bg-secondary flex flex-col">*/}
        <Button
          className="fixed top-2 left-2 z-10"
          size="icon"
          onClick={() => {
            asideRef.current.style.width = "300px";
            asideRef.current.style.padding = "20px";
            asideRef.current.style.translate = "0px";
          }}
        >
          <PanelLeft />
        </Button>
        <aside
          ref={asideRef}
          // className="w-[300px] p-5 flex flex-col absolute top-0 bottom-0 left-[-300px] z-10 bg-secondary/30 backdrop-blur-md lg:left-0 transition-all"
          className="absolute top-0 bottom-0 left-0 md:relative w-0 p-0 overflow-hidden flex flex-col translate-x-[-300px] z-10 bg-secondary/30 backdrop-blur-md lg:translate-x-0 lg:w-[300px] lg:p-5 transition-all"
        >
          <div className="h-[100px]">
            <div className="flex justify-between">
              <h1 className="text-xl font-bold">Career Counseling</h1>
              <Button
                size="icon"
                onClick={() => {
                  asideRef.current.style.width = "0px";
                  asideRef.current.style.padding = "0px";
                  asideRef.current.style.translateX = "-300px";
                }}
              >
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
            <div className="flex flex-col gap-2 overflow-auto h-[calc(100dvh-150px-40px)]">
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
          <div className="mt-auto w-full">
            {authIsPending && <p>Loading...</p>}
            {authSession && (
              <>
                <p className="py-2">{authSession.user.name}</p>
                <div className="flex flex-nowrap gap-2">
                  <ModeToggle />
                  <Button
                    className="grow"
                    onClick={async () => await authClient.signOut()}
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
