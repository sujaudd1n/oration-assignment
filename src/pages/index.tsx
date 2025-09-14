"use client";
import { useRouter } from "next/router";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    async function f() {
      const { data: session } = await authClient.getSession();
      if (session) router.push("/chat");
      else router.push("/sign-in");
    }
    f();
  });

  return <div>Loading...</div>;
}
