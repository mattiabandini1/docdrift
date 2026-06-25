"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

/**
 * Minimal login page that initiates GitHub OAuth via Supabase Auth.
 */
export default function LoginPage() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("GitHub OAuth sign in failed:", error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.04)_0%,transparent_70%)] bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Image
            src="/images/logo/white_logo2_nobg.png"
            alt="DocDrift"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-lg font-semibold text-zinc-50">DocDrift</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Sign in to DocDrift
        </h1>
        <button
          type="button"
          onClick={handleLogin}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 transition-colors duration-150 hover:bg-zinc-200"
        >
          Continue with GitHub
        </button>
        <p className="text-xs text-zinc-500">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-zinc-300">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-zinc-300">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
