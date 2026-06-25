import type { Metadata } from "next";
import Nav from "@/components/landing/Nav";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "DocDrift privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-text-tertiary">Last updated: June 2026</p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">1. Information We Collect</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              We collect your GitHub email address and repository information
              when you connect your repositories to DocDrift.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">2. How We Use Your Information</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              We use your information solely to provide the DocDrift service:
              monitoring PRs and generating documentation updates.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">3. Data Storage</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Your data is stored securely using Supabase. We do not sell
              your personal information to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">4. GitHub Integration</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              DocDrift accesses your repositories through the GitHub App.
              We only read the files necessary to generate documentation updates.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">5. Cookies</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              We use cookies only for authentication purposes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">6. Data Deletion</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              You can delete your account and all associated data at any time
              from the Settings page.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">7. Contact</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              For privacy questions: privacy@getdocdrift.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
