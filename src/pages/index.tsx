"use client";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";

export default function IndexPage() {
  const router = useRouter();
  // router.push("/sign-in");

  const hello = trpc.hello.useQuery({ text: "client" });
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>{hello.data.greeting}</p>
    </div>
  );
}
