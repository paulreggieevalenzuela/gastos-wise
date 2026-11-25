import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Landmark,
  Palette,
  PenLine,
  PiggyBank,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { ACCENT_QUICK_PICKS } from "@/lib/color";
import { AuthFooterLinks } from "@/components/auth/auth-footer-links";
import { PhoneMockup } from "@/components/landing/phone-mockup";
import { InstitutionMarquee } from "@/components/landing/institution-marquee";
import { Reveal } from "@/components/landing/reveal";

const STEPS = [
  {
    icon: Landmark,
    title: "Add your accounts",
    body: "GCash, BDO, the cash in your wallet — set each one up with its starting balance.",
  },
  {
    icon: PenLine,
    title: "Log as you spend",
    body: "Record an expense in a few taps, right from your phone, before you forget it.",
  },
  {
    icon: PiggyBank,
    title: "Stay on budget",
    body: "Set a monthly limit per category and see exactly how much room is left.",
  },
] as const;

export default async function RootPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-bg">
      {/* No-JS fallback: scroll-reveal content should never stay hidden. */}
      <noscript>
        <style>{".lp-reveal{opacity:1!important;transform:none!important}"}</style>
      </noscript>

      {/* Background: faded grid + soft accent glow */}
      <div aria-hidden className="lp-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 h-[32rem] w-[48rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgb(var(--color-accent)), transparent)" }}
      />

      {/* Nav */}
      <header className="lp-fade-up mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-accent-ink">
            GW
          </span>
          <span className="font-display text-lg italic text-ink">GastosWise</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/register"
            className="hidden rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-8 md:grid-cols-[1.1fr_1fr] md:px-8 md:pb-24 md:pt-14">
        <div className="text-center md:text-left">
          <div
            className="lp-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-ink-muted shadow-card backdrop-blur"
            style={{ animationDelay: "100ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Made for everyday Filipino spending
          </div>

          <h1
            className="lp-fade-up mt-6 font-display text-[2.75rem] leading-[1.05] text-ink sm:text-6xl md:text-7xl"
            style={{ animationDelay: "200ms" }}
          >
            Your money,{" "}
            <span className="relative inline-block italic text-accent">
              mapped.
              <span
                aria-hidden
                className="lp-grow-x absolute -bottom-1 left-0 h-[0.12em] w-full rounded-full bg-accent/40"
                style={{ animationDelay: "900ms" }}
              />
            </span>
          </h1>

          <p
            className="lp-fade-up mx-auto mt-6 max-w-md text-base text-ink-muted sm:text-lg md:mx-0"
            style={{ animationDelay: "300ms" }}
          >
            Track every peso across GCash, your bank, and your wallet. Set budgets, log
            spending in seconds, and always know where your money went.
          </p>

          <div
            className="lp-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start"
            style={{ animationDelay: "400ms" }}
          >
            <Link
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-ink shadow-lg transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              Get started free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-ink hover:bg-surface-raised sm:w-auto"
            >
              Sign in
            </Link>
          </div>

          <p className="lp-fade-up mt-5 text-xs text-ink-faint" style={{ animationDelay: "500ms" }}>
            Free · No bank linking · Add it to your home screen
          </p>
        </div>

        <PhoneMockup />
      </section>

      {/* Accounts marquee */}
      <section className="border-y border-border bg-surface/60 py-8">
        <p className="mb-5 px-4 text-center text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
          Works with the accounts you actually use
        </p>
        <InstitutionMarquee />
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-24">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Three steps. No spreadsheets.</h2>
          <p className="mt-3 text-ink-muted">
            GastosWise keeps it simple, so you actually keep doing it.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 120}>
              <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon size={18} />
                  </span>
                  <span className="font-display text-2xl text-ink-faint/60">0{i + 1}</span>
                </div>
                <p className="mt-5 font-display text-lg text-ink">{title}</p>
                <p className="mt-1.5 text-sm text-ink-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8 md:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-card">
              <Smartphone size={20} className="text-accent" />
              <p className="mt-4 font-display text-lg text-ink">Install it like an app</p>
              <p className="mt-1.5 text-sm text-ink-muted">
                On iPhone, tap Share, then Add to Home Screen. It opens full-screen, ready
                whenever you pay for something.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-card">
              <Palette size={20} className="text-accent" />
              <p className="mt-4 font-display text-lg text-ink">Make it yours</p>
              <p className="mt-1.5 text-sm text-ink-muted">
                Light or dark, and any accent color you like. We generate the shades for you.
              </p>
              <div className="mt-4 flex gap-1.5">
                {ACCENT_QUICK_PICKS.map((pick) => (
                  <span
                    key={pick.hex}
                    title={pick.label}
                    className="h-5 w-5 rounded-full ring-2 ring-surface"
                    style={{ backgroundColor: pick.hex }}
                  />
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-card">
              <ShieldCheck size={20} className="text-accent" />
              <p className="mt-4 font-display text-lg text-ink">Private by default</p>
              <p className="mt-1.5 text-sm text-ink-muted">
                You enter everything yourself, with no bank connection, no ads, and no selling your
                data.{" "}
                <Link href="/privacy" className="font-medium text-accent hover:underline">
                  Read our policy
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-accent px-6 py-12 text-center text-accent-ink sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-ink/10 blur-2xl"
            />
            <h2 className="relative font-display text-3xl sm:text-4xl">Know where every peso goes.</h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm opacity-80 sm:text-base">
              Set up your first account in under a minute. It&rsquo;s free.
            </p>
            <Link
              href="/register"
              className="relative mt-8 inline-flex items-center gap-1.5 rounded-lg bg-accent-ink px-6 py-3 text-sm font-medium text-accent transition-transform hover:-translate-y-0.5"
            >
              Create your account
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-10 md:px-8">
        <AuthFooterLinks />
        <p className="mt-2 text-center text-xs text-ink-faint">© 2026 GastosWise</p>
      </footer>
    </main>
  );
}
