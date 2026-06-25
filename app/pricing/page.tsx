import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Nav from "@/components/landing/Nav";
import UpgradeButton from "@/components/pricing/UpgradeButton";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for DocDrift. Start free, upgrade when ready. Starter at $12/month, Pro at $29/month.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <Nav />

      <section className="py-40">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-blue">
              Pricing
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Simple pricing. No surprises.
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Cancel anytime.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Free */}
            <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-card p-5">
              <span className="inline-flex w-fit items-center rounded-full border border-border-subtle bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                Free forever
              </span>
              <p className="mt-5 text-5xl font-bold tracking-tight">
                $0<span className="ml-1 text-lg font-medium text-text-tertiary">/month</span>
              </p>
              <p className="mt-2 text-sm text-text-secondary">Perfect for trying DocDrift</p>
              <ul className="mt-5 flex-1 space-y-2">
                {[
                  { text: "1 repository", ok: true },
                  { text: "10 documentation updates/month", ok: true },
                  { text: "GitHub PR integration", ok: true },
                  { text: "Email notifications", ok: true },
                  { text: "Unlimited updates", ok: false },
                  { text: "Multiple repositories", ok: false },
                  { text: "Priority support", ok: false },
                ].map(({ text, ok }) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-snug">
                    <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${ok ? "text-accent-green" : "text-text-tertiary"}`} />
                    <span className={ok ? "text-text-primary" : "text-text-tertiary"}>{text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-6 block rounded-md border border-border-strong bg-transparent py-2.5 text-center text-sm font-semibold text-text-primary transition-colors duration-150 hover:border-text-secondary hover:bg-surface-elevated"
              >
                Get started
              </Link>
            </div>

            {/* Starter */}
            <div className="flex flex-col rounded-lg border border-border-strong bg-surface-card p-5">
              <span className="inline-flex w-fit items-center rounded-full border border-accent-blue/20 bg-accent-blue/10 px-2.5 py-0.5 text-xs font-semibold text-accent-blue">
                Most popular
              </span>
              <p className="mt-5 text-5xl font-bold tracking-tight">
                $12<span className="ml-1 text-lg font-medium text-text-tertiary">/month</span>
              </p>
              <p className="mt-2 text-sm text-text-secondary">For active solo developers</p>
              <ul className="mt-5 flex-1 space-y-2">
                {[
                  { text: "3 repositories", ok: true },
                  { text: "Unlimited documentation updates", ok: true },
                  { text: "GitHub PR integration", ok: true },
                  { text: "Email notifications", ok: true },
                  { text: "Multiple repositories", ok: false },
                  { text: "Priority support", ok: false },
                ].map(({ text, ok }) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-snug">
                    <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${ok ? "text-accent-green" : "text-text-tertiary"}`} />
                    <span className={ok ? "text-text-primary" : "text-text-tertiary"}>{text}</span>
                  </li>
                ))}
              </ul>
              <UpgradeButton
                plan="starter"
                label="Start free trial"
                className="mt-6 block w-full rounded-md bg-text-primary py-2.5 text-center text-sm font-semibold text-surface-page transition-colors duration-150 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-3 text-center text-xs text-text-tertiary">7-day free trial · Cancel anytime</p>
            </div>

            {/* Pro */}
            <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-card p-5">
              <span className="inline-flex w-fit items-center rounded-full border border-border-subtle bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-text-secondary">Pro</span>
              <p className="mt-5 text-5xl font-bold tracking-tight">
                $29<span className="ml-1 text-lg font-medium text-text-tertiary">/month</span>
              </p>
              <p className="mt-2 text-sm text-text-secondary">For teams and power users</p>
              <ul className="mt-5 flex-1 space-y-2">
                {[
                  "Unlimited repositories",
                  "Unlimited documentation updates",
                  "GitHub PR integration",
                  "Email notifications",
                  "Priority support",
                  "Early access to new features",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-snug">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-green" />
                    <span className="text-text-primary">{text}</span>
                  </li>
                ))}
              </ul>
              <UpgradeButton
                plan="pro"
                label="Start free trial"
                className="mt-6 block w-full rounded-md border border-border-strong bg-transparent py-2.5 text-center text-sm font-semibold text-text-primary transition-colors duration-150 hover:border-text-secondary hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-3 text-center text-xs text-text-tertiary">7-day free trial · Cancel anytime</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-40">
            <h2 className="text-center text-2xl font-semibold text-text-primary">Frequently asked questions</h2>
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
                  <h3 className="text-sm font-semibold text-text-primary">{q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="text-xs text-text-tertiary">© 2026 DocDrift</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-text-tertiary transition-colors duration-150 hover:text-text-secondary">Privacy</a>
            <a href="#" className="text-xs text-text-tertiary transition-colors duration-150 hover:text-text-secondary">Terms</a>
            <a href="#" className="text-xs text-text-tertiary transition-colors duration-150 hover:text-text-secondary">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
