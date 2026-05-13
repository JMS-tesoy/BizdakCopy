import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ONBOARDING_ROUTE } from "@/lib/routes"

export function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              BD
            </span>
          </div>

          <span className="text-lg font-semibold">Bizdak Copy</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#performance"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Performance
          </Link>

          <Link
            href="/#how-it-works"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </Link>

          <Link
            href="/#pricing"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>

          <Button asChild>
            <Link href={ONBOARDING_ROUTE}>Start Setup</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}