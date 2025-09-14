"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/router"; // If using Next.js App Router
import Link from "next/link";

export default function SignIn() {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // For navigation

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const { email, password } = userData;

    const { data, error } = await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/chat",
      },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          // Redirect to dashboard or verification page
          router.push("/chat");
        },
        onError: (ctx) => {
          setIsLoading(false);
          alert(ctx.error.message);
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <form onSubmit={handleSignIn} className="space-y-4 w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>

        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
          required
        />

        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={userData.password}
          onChange={handleChange}
          required
          minLength={8}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <p>
        Don't have an account? <Link className="text-sky-400" href="/sign-up">Sign Up</Link>
      </p>
    </div>
  );
}
