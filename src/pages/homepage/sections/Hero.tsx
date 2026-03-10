import Link from "next/link";
import {
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { DotPattern } from "@/components/ui/dot-pattern";

export const HomepageHeader = () => {
    return (
        <header className="relative overflow-hidden px-6 py-28 sm:py-36 lg:py-44">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.10),transparent)]" />
            <DotPattern className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            <div className="absolute top-20 left-1/4 -z-10 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-10 right-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-violet-200/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />

            <div className="mx-auto max-w-3xl text-center">
                <BlurFade delay={0} inView>
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary shadow-sm shadow-primary/5">
                        <AnimatedShinyText className="inline-flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            100% free — no ads, no premium tier
                        </AnimatedShinyText>
                    </div>
                </BlurFade>
                <BlurFade delay={0.1} inView>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                        Your money, finally{" "}
                        <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
                            under control
                        </span>
                    </h1>
                </BlurFade>
                <BlurFade delay={0.2} inView>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                        BalanceVisor helps you track spending, set budgets, manage investments,
                        crush savings goals, and see your full financial picture in one beautifully simple dashboard.
                    </p>
                </BlurFade>
                <BlurFade delay={0.3} inView>
                    <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Link href="/auth/sign-up">
                            <ShimmerButton
                                shimmerColor="#a78bfa"
                                shimmerSize="0.05em"
                                background="linear-gradient(135deg, #6366f1, #8b5cf6)"
                                className="w-full sm:w-auto text-base px-8 py-3 font-semibold"
                            >
                                Start tracking for free <ArrowRight className="ml-2 h-4 w-4 inline" />
                            </ShimmerButton>
                        </Link>
                        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                            <Link href="/auth/login">I already have an account</Link>
                        </Button>
                    </div>
                </BlurFade>
            </div>
        </header>
    )
}