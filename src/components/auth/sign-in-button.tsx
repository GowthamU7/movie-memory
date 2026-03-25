"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition"
    >
      Sign in with Google
    </button>
  );
}