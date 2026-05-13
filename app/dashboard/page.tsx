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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/utils/supabase/client"

const dashboardStats = [
  {
    label: "Copy trading",
    value: "Off",
    description: "Manual activation required",
    icon: PauseCircle,
    tone: "warn",
  },
  {
    label: "OKX API",
    value: "Not verified",
    description: "Submit and test credentials first",
    icon: KeyRound,
    tone: "warn",
  },
  {
    label: "Risk profile",
    value: "Configured",
    description: "Default limits are ready to review",
    icon: ShieldCheck,
    tone: "good",
  },
]

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
    title: "Account created",
    description: "Follower profile is available for this browser session.",
    status: "Done",
  },
  {
    title: "Risk settings ready",
    description: "Review fixed trade size, daily loss cap, symbols, and slippage before activation.",
    status: "Review",
  },
  {
    title: "OKX API verification",
    description: "Credentials still need to be submitted and tested before trades can execute.",
    status: "Pending",
  },
]

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
  const selectedPlan = typeof user?.user_metadata?.plan === "string" ? user.user_metadata.plan : undefined
  const subscriptionStatus =
    typeof user?.user_metadata?.subscription_status === "string" ? user.user_metadata.subscription_status : "inactive"

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
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="px-6 pb-20 pt-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="outline">Follower dashboard</Badge>
                <Badge className={statusBadgeClass(subscriptionStatus === "active" ? "good" : "warn")}>
                  {subscriptionStatus === "active" ? "Plan active" : "Plan inactive"}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Review your OKX copy trading setup, risk controls, and activation status before allowing automated
                trade execution.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/onboarding">
                  <SlidersHorizontal data-icon="inline-start" />
                  Update setup
                </Link>
              </Button>
              <Button asChild>
                <Link href="/onboarding">
                  <KeyRound data-icon="inline-start" />
                  Verify OKX API
                </Link>
              </Button>
            </div>
          </div>

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
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <span className={`size-2 rounded-full ${item.tone === "good" ? "bg-success" : "bg-muted-foreground"}`} />
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
                    Account overview
                  </CardTitle>
                  <CardDescription>Your current follower account details from the active session.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
                    <p className="mt-1 break-all font-medium">{user.email ?? "No email available"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Plan</p>
                    <p className="mt-1 font-medium">{getPlanLabel(selectedPlan)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Account limit</p>
                    <p className="mt-1 font-medium">Set after plan activation</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Connected accounts</p>
                    <p className="mt-1 font-medium">0</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal aria-hidden="true" />
                    Risk settings
                  </CardTitle>
                  <CardDescription>Default controls used before OKX copy trading can be enabled.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {riskSettings.map((item) => (
                    <div key={item.label} className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
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
                    Supabase account
                  </CardTitle>
                  <CardDescription>Your authenticated Supabase user identity for this account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <code className="min-w-0 flex-1 truncate font-mono text-sm">{maskKey(user.id)}</code>
                    <Button variant="outline" size="icon" onClick={copyAccountId}>
                      <Copy aria-hidden="true" />
                      <span className="sr-only">Copy account ID</span>
                    </Button>
                  </div>
                  {copied && <p className="mt-2 text-sm text-success">Copied to clipboard.</p>}
                  <div className="mt-4 flex gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    <AlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p>OKX Secret Key and Passphrase should never be displayed again after submission.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity aria-hidden="true" />
                    Setup timeline
                  </CardTitle>
                  <CardDescription>Track the steps required before copy trading can go live.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {activityItems.map((item) => (
                    <div key={item.title} className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium">{item.title}</p>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDollarSign aria-hidden="true" />
                    Activation guardrails
                  </CardTitle>
                  <CardDescription>Copy trading stays off until verification and manual activation are complete.</CardDescription>
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
