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
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
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
