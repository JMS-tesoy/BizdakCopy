"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Clock3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { getSubscriptionSummary } from "@/lib/subscription"
import { createClient } from "@/utils/supabase/client"

export function DashboardNavbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  const subscription = getSubscriptionSummary(user)
  const accountEmail = user?.email ?? "Account"

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setUser(currentUser)
    }

    loadUser()
  }, [])

  async function handleLogout() {
    const supabase = createClient()

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
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

        {subscription.isPaid ? (
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/billing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Billing
            </Link>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {subscription.isFreeTrial || subscription.isTrialExpired ? (
                <>
                  <div className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground md:flex">
                    <Clock3 data-icon="inline-start" />
                    <span>
                      {subscription.trialDaysRemaining === 0
                        ? "Trial ended"
                        : `${subscription.trialDaysRemaining} ${
                            subscription.trialDaysRemaining === 1
                              ? "day"
                              : "days"
                          } left`}
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/checkout?plan=pro">
                      <Sparkles data-icon="inline-start" />
                      Upgrade
                    </Link>
                  </Button>
                </>
              ) : null}

              {subscription.isProPending ? (
                <>
                  <Badge variant="outline">Payment pending</Badge>
                  <Button size="sm" asChild>
                    <Link href="/checkout?plan=pro">
                      <CreditCard data-icon="inline-start" />
                      Complete Payment
                    </Link>
                  </Button>
                </>
              ) : null}

              {subscription.isPaid ? <Badge>Pro active</Badge> : null}
            </>
          ) : null}

          <ThemeToggle />

          {subscription.isPaid ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/onboarding">
                <Settings className="mr-2 h-4 w-4" />
                Setup
              </Link>
            </Button>
          ) : null}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open account menu">
                <UserRound />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <span className="block text-foreground">Account</span>
                <span className="block truncate font-normal text-muted-foreground">
                  {accountEmail}
                </span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                {subscription.isPaid ? (
                  <DropdownMenuItem asChild>
                    <Link href="/billing">
                      <CreditCard />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                ) : null}

                {subscription.isPaid ? (
                  <DropdownMenuItem asChild>
                    <Link href="/onboarding">
                      <Settings />
                      Setup
                    </Link>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </nav>
    </header>
  )
}
