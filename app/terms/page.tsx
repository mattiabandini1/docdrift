import type { Metadata } from "next";
import Nav from "@/components/landing/Nav";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "DocDrift terms of service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-text-tertiary">Last updated: June 2026</p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">1. Acceptance of Terms</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              By using DocDrift, you agree to these terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">2. Description of Service</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              DocDrift is a documentation automation tool that monitors GitHub
              repositories and generates documentation updates when pull requests
              are merged.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">3. User Accounts</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              You must have a GitHub account to use DocDrift. You are responsible
              for maintaining the security of your account.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">4. Payment Terms</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Paid plans are billed monthly. You can cancel at any time.
              Refunds are not provided for partial months.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">5. Acceptable Use</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              You may not use DocDrift to violate any laws or GitHub&rsquo;s terms of service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">6. Limitation of Liability</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              DocDrift is provided as-is. We are not liable for any damages
              arising from the use of this service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-50">7. Contact</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              For questions: support@getdocdrift.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
