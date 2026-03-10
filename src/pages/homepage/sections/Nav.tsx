import { Button } from "@/components/ui/button"
import { Link } from "lucide-react"
import Image from "next/image"

export const HomepageNav = () => {
    return (
        <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
                <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
                    <Image src="/logo.svg" alt="BalanceVisor logo" width={30} height={30} />
                    <span>BalanceVisor</span>
                </Link>
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="ghost">
                        <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/auth/sign-up">Get Started</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}