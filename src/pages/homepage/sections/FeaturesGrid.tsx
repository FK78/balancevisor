import { BlurFade } from "@/components/ui/blur-fade"
import { homepageFeatures } from "@/lib/data/homepageFeatures";

export const FeaturesGrid = () => {
    return (
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
            <div className="absolute top-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-100/30 dark:bg-indigo-900/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -z-10 h-80 w-80 rounded-full bg-cyan-100/20 dark:bg-cyan-900/10 blur-3xl" />
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Everything you need to manage your money
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        No bloat, no upsells. Every feature is included from day one.
                    </p>
                </div>
                <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {homepageFeatures.map((f, i) => (
                        <BlurFade key={f.title} delay={0.05 * i} inView>
                            <div
                                className="group rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20"
                            >
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg} transition-transform duration-300 group-hover:scale-110`}>
                                    <f.icon className={`h-6 w-6 ${f.color}`} />
                                </div>
                                <h3 className="mt-5 text-base font-bold">{f.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {f.description}
                                </p>
                            </div>
                        </BlurFade>
                    ))}
                </div>
            </div>
        </section>
    )
}