"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  KeyRound,
  PauseCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

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
  },
  {
    title: "Risk Settings Ready",
    description:
      "Review trade size, daily loss limit, allowed market, and slippage before activation.",
    status: "Review",
  },
  {
    title: "OKX API Verification",
    description: "Connect and verify your OKX API before copy trading can start.",
    status: "Pending",
  },
]

function getDashboardStats(isSubscriptionActive: boolean) {
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
      tone: "warn",
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

function statusBadgeClass(tone: string) {
  if (tone === "good") return "bg-success/10 text-success"
  if (tone === "bad") return "bg-destructive/10 text-destructive"
  return "bg-muted text-foreground"
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

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [copied, setCopied] = useState(false)

  const selectedPlan =
    typeof user?.user_metadata?.plan === "string"
      ? user.user_metadata.plan
      : undefined

  const subscriptionStatus =
    typeof user?.user_metadata?.subscription_status === "string"
      ? user.user_metadata.subscription_status
      : "inactive"

  const isSubscriptionActive = subscriptionStatus === "active"
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

  if (isLoadingUser || !user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <DashboardNavbar />

      <section className="bg-page-texture px-6 pb-20 pt-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">Copy Trading Setup</Badge>
                <Badge
                  className={statusBadgeClass(
                    isSubscriptionActive ? "good" : "warn"
                  )}
                >
                  {isSubscriptionActive ? "Plan active" : "Plan inactive"}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                Complete your OKX setup and review your risk controls before
                copy trading can be activated.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/onboarding">
                  <SlidersHorizontal data-icon="inline-start" />
                  Review setup
                </Link>
              </Button>

              <Button asChild>
                <Link href="/onboarding">
                  <KeyRound data-icon="inline-start" />
                  Connect OKX API
                </Link>
              </Button>
            </div>
          </div>

          <Card className="mb-6 border-border bg-card/95 text-card-foreground shadow-sm">
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

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {dashboardStats.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon aria-hidden="true" />
                      {item.label}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      <span
                        className={`size-2 rounded-full ${
                          item.tone === "good"
                            ? "bg-success"
                            : "bg-muted-foreground"
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <Card>
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

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Plan
                    </p>
                    <p className="mt-1 font-medium">
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

              <Card>
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

            <div className="flex flex-col gap-6">
              <Card>
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

              <Card>
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
                          <Badge variant="outline">{item.status}</Badge>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
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
                    <Badge variant="outline">Always off</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <span>Trade permission</span>
                    <Badge variant="outline">Requires verification</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <span>Copy activation</span>
                    <Badge variant="outline">Manual only</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}