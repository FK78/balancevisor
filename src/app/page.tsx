"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Shield,
} from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { homepageSteps } from "@/lib/data/homepageSteps";
import { HomepageHeader } from "@/pages/homepage/sections/Hero";
import { HomepageNav } from "@/pages/homepage/sections/Nav";
import { FeaturesGrid } from "@/pages/homepage/sections/FeaturesGrid";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <HomepageNav/>

      {/* Hero */}
      <HomepageHeader/>

      {/* Social proof stats */}
      <section className="border-y border-border/40 bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40 px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { value: 14, label: "Feature areas", prefix: "" },
            { value: 5, label: "Account types", prefix: "" },
            { value: 6, label: "Chart views", prefix: "" },
            { value: 0, label: "Forever", prefix: "£" },
          ].map((stat) => (
            <BlurFade key={stat.label} delay={0.1} inView>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold gradient-text">
                  {stat.prefix}
                  <NumberTicker value={stat.value} />
                </p>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <FeaturesGrid />

      {/* How it works */}
      <section className="border-t border-border/40 bg-gradient-to-b from-muted/40 to-muted/20 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No complicated setup. Just start adding your data.
            </p>
          </div>
          <div className="mt-16 grid gap-10 sm:grid-cols-3 relative">
            <div className="hidden sm:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            {homepageSteps.map((s, i) => (
              <BlurFade key={s.step} delay={0.15 * i} inView>
                <div className="flex flex-col items-center text-center relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 text-3xl ring-4 ring-background shadow-lg shadow-primary/5">
                    {s.emoji}
                  </div>
                  <h3 className="mt-5 text-base font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Security callout */}
      <section className="px-6 py-24">
        <BlurFade delay={0.1} inView>
          <div className="relative mx-auto max-w-3xl rounded-3xl border border-primary/10 bg-gradient-to-br from-indigo-500/5 via-card to-cyan-500/5 p-8 sm:p-12 shadow-lg shadow-primary/5 overflow-hidden">
            <BorderBeam size={200} duration={8} colorFrom="#6366f1" colorTo="#06b6d4" />
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Your data stays yours</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  BalanceVisor uses Supabase with row-level security — your financial data is
                  isolated and encrypted. We don&apos;t sell data, serve ads, or share anything
                  with third parties. Ever.
                </p>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-border/40 px-6 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(99,102,241,0.04),transparent)]" />
        <DotPattern className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.04] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
        <BlurFade delay={0.1} inView>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to take control?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join BalanceVisor today — it takes less than a minute and
              it&apos;s completely free. No catches.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up">
                <ShimmerButton
                  shimmerColor="#a78bfa"
                  shimmerSize="0.05em"
                  background="linear-gradient(135deg, #6366f1, #8b5cf6)"
                  className="w-full sm:w-auto text-base px-8 py-3 font-semibold"
                >
                  Create your free account <ArrowRight className="ml-2 h-4 w-4 inline" />
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <Image src="/logo.svg" alt="BalanceVisor" width={22} height={22} />
            BalanceVisor
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-violet-400 fill-violet-400" /> using Next.js &amp; Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
