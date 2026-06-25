import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-card p-5">
              <span className="inline-flex w-fit items-center rounded-full border border-border-subtle bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                Free forever
              </span>
              <p className="mt-5 text-5xl font-bold tracking-tight">
                $0<span className="ml-1 text-lg font-medium text-text-tertiary">/month</span>
              </p>
              <p className="mt-2 text-sm text-zinc-300">Perfect for trying DocDrift</p>
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
                    <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${ok ? "text-accent-green" : "text-zinc-600"}`} />
                    <span className={ok ? "text-zinc-200" : "text-zinc-500"}>{text}</span>
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
            <div className="flex flex-col rounded-lg border border-accent-blue/25 bg-surface-card p-5 shadow-[0_0_40px_rgba(59,130,246,0.05)]">
              <span className="inline-flex w-fit items-center rounded-full border border-accent-blue/20 bg-accent-blue/10 px-2.5 py-0.5 text-xs font-semibold text-accent-blue">
                Most popular
              </span>
              <p className="mt-5 text-5xl font-bold tracking-tight">
                $12<span className="ml-1 text-lg font-medium text-text-tertiary">/month</span>
              </p>
              <p className="mt-2 text-sm text-zinc-300">For active solo developers</p>
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
                    <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${ok ? "text-accent-green" : "text-zinc-600"}`} />
                    <span className={ok ? "text-zinc-200" : "text-zinc-500"}>{text}</span>
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
              <p className="mt-2 text-sm text-zinc-300">For teams and power users</p>
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
                    <span className="text-zinc-200">{text}</span>
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
          <div className="flex items-center gap-1.5">
            <Image
              src="/images/logo/white_logo2_nobg.png"
              alt=""
              width={16}
              height={16}
              className="object-contain opacity-60"
            />
            <span className="text-xs text-text-tertiary">© 2026 DocDrift</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/privacy" className="text-xs text-text-tertiary transition-colors duration-150 hover:text-text-secondary">Privacy</a>
            <a href="/terms" className="text-xs text-text-tertiary transition-colors duration-150 hover:text-text-secondary">Terms</a>
            <a
              href="https://github.com/mattiabandini1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
