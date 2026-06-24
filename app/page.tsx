import type { Metadata } from "next";
import Link from "next/link";
import { GitBranch, GitMerge, FileCheck, Check, X } from "lucide-react";
import Nav from "@/components/landing/Nav";

export const metadata: Metadata = {
  title: "DocDrift — Documentation that keeps up with your code",
  description:
    "DocDrift watches your GitHub PRs and automatically opens a documentation PR every time your code changes.",
};

/**
 * DocDrift public homepage. Static landing page with hero, how-it-works,
 * problem/solution, pricing preview, and footer.
 */
export default function Homepage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />

      {/* Hero */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm text-zinc-400">Stop writing docs. Start shipping.</p>
          <h1 className="mt-4 text-5xl font-bold md:text-6xl">
            Your documentation updates itself.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
            DocDrift watches your GitHub PRs and automatically opens a
            documentation PR every time your code changes. No more stale
            READMEs.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-md bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Get started free
            </Link>
            <a
              href="#how-it-works"
              className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Free plan available · No credit card required for first 10 updates
          </p>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-zinc-800 bg-zinc-900/50 py-6 text-center">
        <p className="text-sm text-zinc-400">
          Join developers who ship code without worrying about docs
        </p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold">How DocDrift works</h2>
          <p className="mt-2 text-center text-zinc-400">
            Three steps. Zero effort.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <GitBranch className="mx-auto h-10 w-10 text-zinc-400" />
              <h3 className="mt-4 text-lg font-medium">Connect your repo</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Install the DocDrift GitHub App on any repository in under 2
                minutes.
              </p>
            </div>
            <div className="text-center">
              <GitMerge className="mx-auto h-10 w-10 text-zinc-400" />
              <h3 className="mt-4 text-lg font-medium">Merge your PR</h3>
              <p className="mt-2 text-sm text-zinc-400">
                DocDrift watches every merged PR and analyzes what changed in
                your code.
              </p>
            </div>
            <div className="text-center">
              <FileCheck className="mx-auto h-10 w-10 text-zinc-400" />
              <h3 className="mt-4 text-lg font-medium">Review the doc PR</h3>
              <p className="mt-2 text-sm text-zinc-400">
                A documentation PR appears automatically. Review, tweak if
                needed, merge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Problem */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8">
              <h3 className="text-lg font-semibold text-red-400">
                The problem with documentation
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  "You write docs once, then your code changes",
                  "Nobody has time to update the README after every PR",
                  "New team members get lost in outdated docs",
                  "Documentation debt compounds silently",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-zinc-300">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8">
              <h3 className="text-lg font-semibold text-emerald-400">
                DocDrift fixes this automatically
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  "Every merged PR triggers a doc review",
                  "AI generates the update in your writing style",
                  "You stay in control — review before merging",
                  "Documentation stays accurate, always",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold">Simple pricing</h2>
          <p className="mt-2 text-center text-zinc-400">
            Start free, upgrade when you&rsquo;re ready
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
              <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                Free forever
              </span>
              <p className="mt-4 text-4xl font-bold">$0<span className="text-lg font-normal text-zinc-400">/month</span></p>
              <p className="mt-2 text-sm text-zinc-400">
                Perfect for trying DocDrift
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { text: "1 repository", included: true },
                  { text: "10 documentation updates/month", included: true },
                  { text: "GitHub PR integration", included: true },
                  { text: "Email notifications", included: true },
                  { text: "Unlimited updates", included: false },
                  { text: "Multiple repositories", included: false },
                  { text: "Priority support", included: false },
                ].map(({ text, included }) => (
                  <li key={text} className="flex items-start gap-3 text-sm">
                    {included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                    )}
                    <span className={included ? "text-zinc-300" : "text-zinc-500"}>
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

            {/* Starter */}
            <div className="rounded-xl border border-blue-500/30 bg-zinc-900 p-8 ring-1 ring-blue-500">
              <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400">
                Most popular
              </span>
              <p className="mt-4 text-4xl font-bold">$12<span className="text-lg font-normal text-zinc-400">/month</span></p>
              <p className="mt-2 text-sm text-zinc-400">
                For active solo developers
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { text: "3 repositories", included: true },
                  { text: "Unlimited documentation updates", included: true },
                  { text: "GitHub PR integration", included: true },
                  { text: "Email notifications", included: true },
                  { text: "Multiple repositories", included: false },
                  { text: "Priority support", included: false },
                ].map(({ text, included }) => (
                  <li key={text} className="flex items-start gap-3 text-sm">
                    {included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                    )}
                    <span className={included ? "text-zinc-300" : "text-zinc-500"}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-8 block rounded-md bg-zinc-100 py-2.5 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                Start free trial
              </Link>
              <p className="mt-3 text-center text-xs text-zinc-500">
                7-day free trial · Cancel anytime
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm text-zinc-400 underline transition-colors hover:text-zinc-300"
            >
              See full pricing →
            </Link>
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
