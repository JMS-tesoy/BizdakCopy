"use client"

import { useEffect, useState, type ElementType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Copy,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  PauseCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getSubscriptionSummary } from "@/lib/subscription"
import { createClient } from "@/utils/supabase/client"

const panelClass = "rounded-lg border border-border bg-card shadow-sm"
type DashboardTone = "good" | "warn" | "bad"
type DashboardStat = {
  label: string
  value: string
  description: string
  icon: ElementType
  tone: DashboardTone
}

const riskSettings = [
  { label: "Copy mode", value: "Fixed USDT per trade" },
  { label: "Fixed amount", value: "10 USDT" },
  { label: "Max daily loss", value: "50 USDT" },
  { label: "Max open trades", value: "3" },
  { label: "Allowed market", value: "Spot only" },
  { label: "Slippage limit", value: "0.50%" },
]

const activityItems = [
  {
    title: "Account Created",
    description: "Your copy trading account is ready for setup.",
    status: "Done",
    tone: "good" as const,
  },
  {
    title: "Risk Settings Ready",
    description:
      "Review trade size, daily loss limit, allowed market, and slippage before activation.",
    status: "Review",
    tone: "good" as const,
  },
  {
    title: "OKX API Verification",
    description: "Connect and verify your OKX API before copy trading can start.",
    status: "Pending",
    tone: "warn" as const,
  },
]

function getDashboardStats(isSubscriptionActive: boolean): DashboardStat[] {
  return [
    {
      label: "Copy Trading Status",
      value: "Not Active",
      description: isSubscriptionActive
        ? "Waiting for OKX verification and approval"
        : "Activate your plan before setup can continue",
      icon: PauseCircle,
      tone: "warn",
    },
    {
      label: "OKX Connection",
      value: "Not Verified",
      description: isSubscriptionActive
        ? "Connect and verify your OKX API credentials"
        : "Available after plan activation",
      icon: KeyRound,
      tone: isSubscriptionActive ? "warn" : "bad",
    },
    {
      label: "Risk Settings",
      value: "Ready for Review",
      description: "Confirm your limits before activation",
      icon: ShieldCheck,
      tone: "good",
    },
  ]
}

function maskKey(value?: string) {
  if (!value) return "Not available"
  if (value.length <= 10) return value
  return `${value.slice(0, 8)}...${value.slice(-4)}`
}

function getPlanLabel(plan?: string) {
  if (!plan) return "No plan selected"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function dashboardBadgeClass(tone: DashboardTone) {
  return cn(
    "h-auto rounded-full px-3 py-1.5 text-xs font-black",
    tone === "good" && "border-primary/25 bg-primary/10 text-primary",
    tone === "warn" && "border-border bg-muted/50 text-foreground",
    tone === "bad" && "border-destructive/25 bg-destructive/10 text-destructive"
  )
}

function dashboardStateClass(tone: DashboardTone) {
  return cn(
    "rounded-lg border p-4",
    tone === "good" && "border-primary/25 bg-primary/10",
    tone === "warn" && "border-border bg-background/60",
    tone === "bad" && "border-destructive/25 bg-destructive/10"
  )
}

function dashboardIconClass(tone: DashboardTone) {
  return cn(
    "flex size-7 items-center justify-center rounded-lg ring-1",
    tone === "good" && "bg-success/10 text-success ring-success/25",
    tone === "warn" && "bg-muted text-foreground ring-border",
    tone === "bad" && "bg-destructive/10 text-destructive ring-destructive/25"
  )
}

function StateIcon({ tone }: { tone: DashboardTone }) {
  if (tone === "good") return <CheckCircle2 />
  if (tone === "bad") return <AlertTriangle />
  return <CircleAlert />
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [copied, setCopied] = useState(false)

  const subscription = getSubscriptionSummary(user)
  const selectedPlan = subscription.isPaid ? "pro" : subscription.plan
  const isSubscriptionActive = subscription.isPaid
  const isEmailConfirmed = Boolean(user?.email_confirmed_at)
  const dashboardStats = getDashboardStats(isSubscriptionActive)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/login")
        return
      }

      if (typeof currentUser.app_metadata?.subscription_status !== "string") {
        await fetch("/api/access/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "free" }),
        })

        const {
          data: { user: refreshedUser },
        } = await supabase.auth.getUser()

        setUser(refreshedUser ?? currentUser)
        setIsLoadingUser(false)
        return
      }

      setUser(currentUser)
      setIsLoadingUser(false)
    }

    loadUser()
  }, [router])

  function copyAccountId() {
    if (!user?.id) return

    navigator.clipboard.writeText(user.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLogout() {
    const supabase = createClient()

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (isLoadingUser || !user) {
    return null
  }

  return (
    <main className="h-screen overflow-hidden bg-background bg-page-texture text-foreground">
      <div className="grid h-screen overflow-hidden bg-background/80 xl:grid-cols-[280px_minmax(0,1fr)_360px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="flex h-screen flex-col gap-5 overflow-auto border-r border-border bg-muted/30 p-5 max-lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-3 pb-2 font-black">
            <div className="grid size-11 place-items-center rounded-lg bg-primary font-black text-primary-foreground shadow-sm">
              BD
            </div>
            <div>
              <div className="tracking-tight">Bizdak Copy</div>
              <div className="text-xs font-semibold text-muted-foreground">
                User Dashboard
              </div>
            </div>
          </Link>

          <div>
            <div className="mb-2 mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
              Workspace
            </div>
            <div className="grid gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-sm font-bold text-foreground shadow-sm"
              >
                <span className="grid size-6 place-items-center rounded-lg bg-muted">
                  <LayoutDashboard />
                </span>
                <span>Copy Dashboard</span>
              </Link>

              {subscription.isPaid ? (
                <Link
                  href="/onboarding"
                  className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm font-bold text-muted-foreground"
                >
                  <span className="grid size-6 place-items-center rounded-lg bg-muted">
                    <SlidersHorizontal />
                  </span>
                  <span>Setup Guide</span>
                </Link>
              ) : (
                <Link
                  href="/checkout?plan=pro"
                  className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm font-bold text-muted-foreground"
                >
                  <span className="grid size-6 place-items-center rounded-lg bg-muted">
                    <CreditCard />
                  </span>
                  <span>Upgrade to Setup</span>
                </Link>
              )}

              {subscription.isPaid ? (
                <Link
                  href="/billing"
                  className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm font-bold text-muted-foreground"
                >
                  <span className="grid size-6 place-items-center rounded-lg bg-muted">
                    <CircleDollarSign />
                  </span>
                  <span>Billing</span>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-auto rounded-lg border border-border bg-card p-4 shadow-sm">
            <strong className="mb-2 block text-sm">Signed in</strong>
            <p className="truncate text-xs leading-6 text-muted-foreground">
              {user.email ?? "No email available"}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-10 w-full bg-transparent"
              onClick={handleLogout}
            >
              <LogOut data-icon="inline-start" />
              Log out
            </Button>
          </div>
        </aside>

        <section className="grid h-screen min-h-0 min-w-0 grid-rows-[76px_minmax(0,1fr)] overflow-hidden border-r border-border max-xl:border-r-0">
          <header className="flex items-center justify-between gap-4 border-b border-border bg-background/80 px-5 py-4 backdrop-blur md:px-6 max-md:flex-col max-md:items-stretch">
            <div>
              <h1 className="text-[22px] font-black leading-tight tracking-tight">
                Copy Trading Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review your plan, OKX setup status, and activation readiness.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 max-md:justify-start">
              <Badge
                variant="outline"
                className={dashboardBadgeClass(
                  isSubscriptionActive ? "good" : "bad"
                )}
              >
                {isSubscriptionActive ? "Plan active" : "Plan inactive"}
              </Badge>
              <Badge variant="outline" className={dashboardBadgeClass("warn")}>
                Copy trading off
              </Badge>
            </div>
          </header>

          <div className="min-h-0 overflow-hidden p-5 md:p-6">
            <div className="mx-auto grid h-full max-w-[1120px] grid-rows-[auto_minmax(0,1fr)] gap-5">
              <section className={cn(panelClass, "grid gap-5 p-5 md:p-6")}>
                <div className="flex items-start justify-between gap-5 max-md:flex-col">
                  <div>
                    <h2 className="max-w-3xl text-3xl font-black leading-none tracking-tight md:text-[30px]">
                      Welcome back to your copy trading workspace.
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                      Complete setup, verify OKX credentials, and review your
                      risk controls before copy trading can be manually enabled.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={dashboardBadgeClass(
                      isSubscriptionActive ? "good" : "bad"
                    )}
                  >
                    {isSubscriptionActive ? "Active plan" : "Pre-activation"}
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {dashboardStats.map((item) => {
                    const Icon = item.icon

                    return (
                      <div
                        key={item.label}
                        className={dashboardStateClass(item.tone)}
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={dashboardIconClass(item.tone)}>
                            <Icon />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div>
                            <strong
                              className={cn(
                                "text-lg",
                                item.tone === "good" && "text-success",
                                item.tone === "bad" && "text-destructive"
                              )}
                            >
                              {item.value}
                            </strong>
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">
                            {item.description}
                          </p>
                          </div>
                          <span className={dashboardIconClass(item.tone)}>
                            <StateIcon tone={item.tone} />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <div className="grid min-h-0 gap-5 overflow-y-auto overflow-x-hidden overscroll-contain pr-2">
                <Card className={panelClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 aria-hidden="true" />
                Next Step
              </CardTitle>
              <CardDescription>
                Your account is created. Complete the setup steps below before
                copy trading can start.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">
                  {isSubscriptionActive
                    ? "Connect and verify your OKX API credentials."
                    : "Your selected plan is not active yet."}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {isSubscriptionActive
                    ? "Copy trading remains disabled until your OKX connection is verified and approved."
                    : "Complete payment or wait for payment confirmation before continuing setup."}
                </p>
              </div>

              <Button asChild>
                <Link href={isSubscriptionActive ? "/onboarding" : "/#pricing"}>
                  {isSubscriptionActive
                    ? "Continue Setup"
                    : "Complete Payment"}
                </Link>
              </Button>
            </CardContent>
          </Card>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
            <div className="flex flex-col gap-5">
              <Card className={panelClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound aria-hidden="true" />
                    Account Overview
                  </CardTitle>
                  <CardDescription>
                    Your current copy trading account details.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Email
                    </p>
                    <p className="mt-1 break-all font-medium">
                      {user.email ?? "No email available"}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "rounded-lg border p-4",
                      isSubscriptionActive
                        ? "border-primary/25 bg-primary/10"
                        : "border-destructive/25 bg-destructive/10"
                    )}
                  >
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Plan
                    </p>
                    <p
                      className={cn(
                        "mt-1 font-medium",
                        isSubscriptionActive ? "text-success" : "text-destructive"
                      )}
                    >
                      {getPlanLabel(selectedPlan)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      OKX Account Limit
                    </p>
                    <p className="mt-1 font-medium">
                      Available after activation
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Connected OKX Accounts
                    </p>
                    <p className="mt-1 font-medium">0</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal aria-hidden="true" />
                    Risk Settings
                  </CardTitle>
                  <CardDescription>
                    Default controls prepared for review before copy trading is
                    enabled.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {riskSettings.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 font-medium">{item.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-5">
              <Card className={panelClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound aria-hidden="true" />
                    Support Reference
                  </CardTitle>
                  <CardDescription>
                    Use this account ID when contacting support.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <code className="min-w-0 flex-1 truncate font-mono text-sm">
                      {maskKey(user.id)}
                    </code>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAccountId}
                    >
                      <Copy aria-hidden="true" />
                      <span className="sr-only">Copy account ID</span>
                    </Button>
                  </div>

                  {copied && (
                    <p className="mt-2 text-sm text-success">
                      Copied to clipboard.
                    </p>
                  )}

                  <div className="mt-4 flex gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    <AlertTriangle
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <p>
                      For your security, API secrets are hidden after submission
                      and cannot be viewed again.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity aria-hidden="true" />
                    Setup Timeline
                  </CardTitle>
                  <CardDescription>
                    Track the steps required before copy trading can go live.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3">
                  {activityItems.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium">{item.title}</p>
                          <Badge
                            variant="outline"
                            className={dashboardBadgeClass(item.tone)}
                          >
                            {item.status}
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDollarSign aria-hidden="true" />
                    Trading Safety Checks
                  </CardTitle>
                  <CardDescription>
                    Copy trading stays off until your OKX connection is verified
                    and approved.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <span>Withdraw permission</span>
                    <Badge
                      variant="outline"
                      className={dashboardBadgeClass("good")}
                    >
                      Always off
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <span>Trade permission</span>
                    <Badge
                      variant="outline"
                      className={dashboardBadgeClass("warn")}
                    >
                      Requires verification
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <span>Copy activation</span>
                    <Badge
                      variant="outline"
                      className={dashboardBadgeClass("warn")}
                    >
                      Manual only
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="hidden h-screen content-start gap-4 overflow-auto border-l border-border bg-muted/30 p-5 xl:grid">
          <Card className={panelClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound aria-hidden="true" />
                Account
              </CardTitle>
              <CardDescription>Current session and plan status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="mt-1 truncate font-medium">
                      {user.email ?? "No email available"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={dashboardBadgeClass(
                      isEmailConfirmed ? "good" : "warn"
                    )}
                  >
                    {isEmailConfirmed ? "Confirmed" : "Unconfirmed"}
                  </Badge>
                </div>
              </div>
              <div
                className={cn(
                  "rounded-lg border p-3",
                  isSubscriptionActive
                    ? "border-primary/25 bg-primary/10"
                    : "border-destructive/25 bg-destructive/10"
                )}
              >
                <p className="text-xs text-muted-foreground">Plan</p>
                <p
                  className={cn(
                    "mt-1 font-medium",
                    isSubscriptionActive ? "text-success" : "text-destructive"
                  )}
                >
                  {getPlanLabel(selectedPlan)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity aria-hidden="true" />
                Setup Timeline
              </CardTitle>
              <CardDescription>Activation steps for this account.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {activityItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border bg-background/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{item.title}</p>
                    <Badge
                      variant="outline"
                      className={dashboardBadgeClass(item.tone)}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
