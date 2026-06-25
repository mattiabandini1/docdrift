import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GitBranch, GitMerge, FileCheck, Check, X } from "lucide-react";
import Nav from "@/components/landing/Nav";

export const metadata: Metadata = {
  title: "DocDrift — Documentation that keeps up with your code",
  description:
    "DocDrift watches your GitHub PRs and automatically opens a documentation PR every time your code changes.",
};

export default function Homepage() {
  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 text-center">
        <div
          className="pointer-events-none absolute inset-0 -top-24"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-blue/15 bg-accent-blue/[0.03] backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-blue shadow-[0_0_20px_rgba(59,130,246,0.06)]">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-blue shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
            Now in public beta
          </span>

          {/* Headline */}
          <h1 className="mt-6 font-bold tracking-tight leading-none text-text-primary">
            <span className="text-5xl md:text-7xl">Your docs update<br /></span>
            <span className="bg-gradient-to-r from-accent-blue to-blue-500 bg-clip-text text-5xl md:text-7xl text-transparent">
              themselves.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-zinc-300">
            DocDrift watches your GitHub PRs and automatically opens a
            documentation PR every time your code changes. No more stale
            READMEs.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-text-primary px-6 py-2.5 text-sm font-semibold text-surface-page transition-colors duration-150 hover:bg-zinc-200"
            >
              Get started free
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center rounded-md border border-border-strong bg-transparent px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-150 hover:border-text-secondary hover:bg-surface-elevated"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-text-tertiary">
            Free plan available · No credit card required
          </p>

          {/* Terminal mockup */}
          <div className="mx-auto mt-16 max-w-xl overflow-hidden rounded-lg border border-border-subtle bg-surface-card shadow-[0_0_80px_rgba(59,130,246,0.08)]">
            <div className="flex items-center gap-1.5 border-b border-border-subtle px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-accent-red" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <div className="h-3 w-3 rounded-full bg-accent-green" />
              <span className="ml-2 text-xs text-text-tertiary">
                github.com/yourname/project
              </span>
            </div>
            <div className="space-y-2 p-6 font-mono text-sm">
              <div className="text-text-tertiary">
                {"//"} PR #47 merged: &quot;Add authentication middleware&quot;
              </div>
              <div className="text-text-secondary">
                <span className="text-accent-green">✓</span> DocDrift detected
                changes in{" "}
                <span className="text-accent-blue">src/auth.ts</span>
              </div>
              <div className="text-text-secondary">
                <span className="text-accent-green">✓</span> Matched
                documentation section:{" "}
                <span className="text-accent-blue">
                  README.md#authentication
                </span>
              </div>
              <div className="text-text-secondary">
                <span className="text-accent-green">✓</span> Generated
                documentation update
              </div>
              <div className="mt-3 text-text-secondary">
                <span className="text-purple-400">→</span> Opened PR #48:{" "}
                <span className="text-text-primary">
                  &quot;docs: update authentication section&quot;
                </span>
              </div>
              <div className="mt-1 text-xs text-text-tertiary">
                docdrift/update-47 → main · just now
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-blue">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
            Three steps. Zero effort.
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            <div className="relative flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-card p-6 transition-colors duration-150 hover:border-border-strong">
              <span className="absolute right-4 top-4 font-mono text-xs text-text-tertiary">
                01
              </span>
              <div className="w-fit rounded-md bg-surface-elevated p-2">
                <GitBranch className="h-5 w-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Connect your repo
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Install the DocDrift GitHub App on any repository in under 2
                  minutes.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-card p-6 transition-colors duration-150 hover:border-border-strong">
              <span className="absolute right-4 top-4 font-mono text-xs text-text-tertiary">
                02
              </span>
              <div className="w-fit rounded-md bg-surface-elevated p-2">
                <GitMerge className="h-5 w-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Merge your PR
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  DocDrift watches every merged PR and analyzes what changed in
                  your code.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-card p-6 transition-colors duration-150 hover:border-border-strong">
              <span className="absolute right-4 top-4 font-mono text-xs text-text-tertiary">
                03
              </span>
              <div className="w-fit rounded-md bg-surface-elevated p-2">
                <FileCheck className="h-5 w-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Review the doc PR
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  A documentation PR appears automatically. Review, tweak if
                  needed, merge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-blue">
            Why DocDrift
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
            Stop writing docs. Start shipping.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                Without DocDrift
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  "You write docs once, then your code changes",
                  "Nobody has time to update the README after every PR",
                  "New team members get lost in outdated docs",
                  "Documentation debt compounds silently",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-zinc-300">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-accent-red" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                With DocDrift
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  "Every merged PR triggers a doc review",
                  "AI generates the update in your writing style",
                  "You stay in control — review before merging",
                  "Documentation stays accurate, always",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-blue">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
            Simple pricing. No surprises.
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-card p-5">
              <span className="inline-flex w-fit items-center rounded-full border border-border-subtle bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                Free forever
              </span>
              <p className="mt-5 text-5xl font-bold tracking-tight text-text-primary">
                $0
                <span className="ml-1 text-lg font-medium text-text-tertiary">
                  /month
                </span>
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                Perfect for trying DocDrift
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {[
                  { text: "1 repository", included: true },
                  { text: "10 documentation updates/month", included: true },
                  { text: "GitHub PR integration", included: true },
                  { text: "Email notifications", included: true },
                  { text: "Unlimited updates", included: false },
                  { text: "Multiple repositories", included: false },
                ].map(({ text, included }) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-snug">
                    {included ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-green" />
                    ) : (
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    )}
                    <span className={included ? "text-zinc-200" : "text-zinc-500"}>
                      {text}
                    </span>
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
              <p className="mt-5 text-5xl font-bold tracking-tight text-text-primary">
                $12
                <span className="ml-1 text-lg font-medium text-text-tertiary">
                  /month
                </span>
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                For active solo developers
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {[
                  { text: "3 repositories", included: true },
                  { text: "Unlimited documentation updates", included: true },
                  { text: "GitHub PR integration", included: true },
                  { text: "Email notifications", included: true },
                  { text: "Priority support", included: false },
                ].map(({ text, included }) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-snug">
                    {included ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-green" />
                    ) : (
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    )}
                    <span className={included ? "text-zinc-200" : "text-zinc-500"}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-6 block rounded-md bg-text-primary py-2.5 text-center text-sm font-semibold text-surface-page transition-colors duration-150 hover:bg-zinc-200"
              >
                Start free trial
              </Link>
              <p className="mt-3 text-center text-xs text-text-tertiary">
                7-day free trial · Cancel anytime
              </p>
            </div>

            {/* Pro */}
            <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-card p-5">
              <span className="inline-flex w-fit items-center rounded-full border border-border-subtle bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                Pro
              </span>
              <p className="mt-5 text-5xl font-bold tracking-tight text-text-primary">
                $29
                <span className="ml-1 text-lg font-medium text-text-tertiary">
                  /month
                </span>
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                For teams and power users
              </p>
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
              <Link
                href="/login"
                className="mt-6 block rounded-md border border-border-strong bg-transparent py-2.5 text-center text-sm font-semibold text-text-primary transition-colors duration-150 hover:border-text-secondary hover:bg-surface-elevated"
              >
                Start free trial
              </Link>
              <p className="mt-3 text-center text-xs text-text-tertiary">
                7-day free trial · Cancel anytime
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              Compare all plans →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
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
            <a
              href="/privacy"
              className="text-xs text-text-tertiary transition-colors duration-150 hover:text-text-secondary"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-xs text-text-tertiary transition-colors duration-150 hover:text-text-secondary"
            >
              Terms
            </a>
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
