import Link from "next/link";
import { Check } from "lucide-react";
import Nav from "@/components/landing/Nav";
import UpgradeButton from "@/components/pricing/UpgradeButton";

/**
 * Pricing page. Lists the three subscription plans plus an FAQ section.
 */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-center text-3xl font-semibold">Pricing</h1>
          <p className="mt-2 text-center text-zinc-400">
            No surprises. Cancel anytime.
          </p>

          {/* Plan cards */}
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {/* Free */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
              <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                Free forever
              </span>
              <p className="mt-4 text-4xl font-bold">
                $0<span className="text-lg font-normal text-zinc-400">/month</span>
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Perfect for trying DocDrift
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { text: "1 repository", ok: true },
                  { text: "10 documentation updates/month", ok: true },
                  { text: "GitHub PR integration", ok: true },
                  { text: "Email notifications", ok: true },
                  { text: "Unlimited updates", ok: false },
                  { text: "Multiple repositories", ok: false },
                  { text: "Priority support", ok: false },
                ].map(({ text, ok }) => (
                  <li key={text} className="flex items-start gap-3 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        ok ? "text-emerald-400" : "text-zinc-700"
                      }`}
                    />
                    <span className={ok ? "text-zinc-300" : "text-zinc-500"}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-8 block rounded-md border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              >
                Get started
              </Link>
            </div>

            {/* Starter (highlighted) */}
            <div className="rounded-xl border border-blue-500/30 bg-zinc-900 p-8 ring-2 ring-blue-500">
              <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400">
                Most popular
              </span>
              <p className="mt-4 text-4xl font-bold">
                $12<span className="text-lg font-normal text-zinc-400">/month</span>
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                For active solo developers
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { text: "3 repositories", ok: true },
                  { text: "Unlimited documentation updates", ok: true },
                  { text: "GitHub PR integration", ok: true },
                  { text: "Email notifications", ok: true },
                  { text: "Multiple repositories", ok: false },
                  { text: "Priority support", ok: false },
                ].map(({ text, ok }) => (
                  <li key={text} className="flex items-start gap-3 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        ok ? "text-emerald-400" : "text-zinc-700"
                      }`}
                    />
                    <span className={ok ? "text-zinc-300" : "text-zinc-500"}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
              <UpgradeButton
                plan="starter"
                label="Start free trial"
                className="mt-8 block w-full rounded-md bg-zinc-100 py-2.5 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-3 text-center text-xs text-zinc-500">
                7-day free trial · Cancel anytime
              </p>
            </div>

            {/* Pro */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
              <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                Pro
              </span>
              <p className="mt-4 text-4xl font-bold">
                $29<span className="text-lg font-normal text-zinc-400">/month</span>
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                For teams and power users
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Unlimited repositories",
                  "Unlimited documentation updates",
                  "GitHub PR integration",
                  "Email notifications",
                  "Priority support",
                  "Early access to new features",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="text-zinc-300">{text}</span>
                  </li>
                ))}
              </ul>
              <UpgradeButton
                plan="pro"
                label="Start free trial"
                className="mt-8 block w-full rounded-md border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-3 text-center text-xs text-zinc-500">
                7-day free trial · Cancel anytime
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-32">
            <h2 className="text-center text-2xl font-semibold">
              Frequently asked questions
            </h2>
            <div className="mx-auto mt-12 max-w-2xl space-y-8">
              {[
                {
                  q: "What counts as a documentation update?",
                  a: "Each time DocDrift opens a PR to update your documentation, that counts as one update. Skipped PRs (where no update was needed) don't count towards your limit.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes. You can cancel your subscription at any time from your settings page. You'll keep access until the end of your billing period.",
                },
                {
                  q: "Which documentation files does DocDrift update?",
                  a: "By default DocDrift monitors your README.md. You can configure additional paths (like docs/ folders) from the Repositories page.",
                },
                {
                  q: "Is my code sent to an AI?",
                  a: "DocDrift sends only the diff (the changed lines) and the relevant documentation sections to the AI — never your full codebase.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <h3 className="text-sm font-medium text-zinc-200">{q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="text-xs text-zinc-500">© 2026 DocDrift</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-500 transition-colors hover:text-zinc-400">
              Privacy
            </a>
            <a href="#" className="text-xs text-zinc-500 transition-colors hover:text-zinc-400">
              Terms
            </a>
            <a href="#" className="text-xs text-zinc-500 transition-colors hover:text-zinc-400">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
