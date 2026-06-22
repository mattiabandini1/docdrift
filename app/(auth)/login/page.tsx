"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Minimal login page that initiates GitHub OAuth via Supabase Auth.
 */
export default function LoginPage() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("GitHub OAuth sign in failed:", error.message);
    }
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Sign in to DocDrift
        </h1>
        <button
          type="button"
          onClick={handleLogin}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
