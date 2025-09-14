"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/router"; // If using Next.js App Router

export default function SignUp() {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    name: "",
    image: "",
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

    const { email, password, name, image } = userData;

    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
        image,
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
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSignIn} className="space-y-4 w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>

        <Input
          name="name"
          placeholder="Name"
          value={userData.name}
          onChange={handleChange}
          required
        />

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

        <Input
          name="image"
          type="url"
          placeholder="Profile Image URL (optional)"
          value={userData.image}
          onChange={handleChange}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}
