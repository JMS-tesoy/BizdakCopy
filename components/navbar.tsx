import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ONBOARDING_ROUTE } from "@/lib/routes"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">BD</span>
          </div>
          <span className="font-semibold text-lg">Bizdak Copy</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#performance" className="text-muted-foreground hover:text-foreground transition-colors">
            Performance
          </Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href={ONBOARDING_ROUTE}>Start Onboarding</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
