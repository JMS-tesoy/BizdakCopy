"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Settings, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/utils/supabase/client"

export function DashboardNavbar() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              BD
            </span>
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold">Bizdak Copy</p>
            <p className="text-xs text-muted-foreground">User Dashboard</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>

          <Link
            href="/onboarding"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Setup
          </Link>

          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Billing
          </Link>

          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Support
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button variant="outline" size="sm" asChild>
            <Link href="/onboarding">
              <Settings className="mr-2 h-4 w-4" />
              Setup
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard" aria-label="Account">
              <UserRound className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </nav>
    </header>
  )
}