"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  ReceiptText,
  ShieldCheck,
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
import { PLAN_DETAILS } from "@/lib/plans"
import { getSubscriptionSummary } from "@/lib/subscription"
import { createClient } from "@/utils/supabase/client"

function formatDate(value?: string) {
  if (!value) return "Not available"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function BillingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const showSuccess = searchParams.get("success") === "true"

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

      const subscription = getSubscriptionSummary(currentUser)

      if (!subscription.isPaid) {
        router.push("/dashboard")
        return
      }

      setUser(currentUser)
      setIsLoadingUser(false)
    }

    loadUser()
  }, [router])

  if (isLoadingUser || !user) {
    return null
  }

  const proPlan = PLAN_DETAILS.pro
  const isEmailConfirmed = Boolean(user.email_confirmed_at)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <DashboardNavbar />

      <section className="bg-page-texture px-6 pb-20 pt-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge>Pro active</Badge>
                <Badge variant="outline">Billing</Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Billing
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                Review your active subscription, payment status, and account
                billing details.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>

              <Button asChild>
                <Link href="/onboarding">
                  <ShieldCheck data-icon="inline-start" />
                  Review Setup
                </Link>
              </Button>
            </div>
          </div>

          {showSuccess ? (
            <Card className="mb-6 border-border bg-card/95">
              <CardContent className="flex items-start gap-3 pt-6">
                <CheckCircle2 className="shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium">Payment confirmed</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your Pro plan is active. Billing details are shown below.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard aria-hidden="true" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    Your active Bizdak Copy subscription.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className="text-2xl font-bold">{proPlan.name}</p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-2xl font-bold">
                        {proPlan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          {proPlan.period}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Status
                      </p>
                      <p className="mt-1 font-medium">Active</p>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Billing Cycle
                      </p>
                      <p className="mt-1 font-medium">Monthly</p>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 p-4 sm:col-span-2">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase text-muted-foreground">
                            Account Email
                          </p>
                          <p className="mt-1 break-all font-medium">
                            {user.email ?? "No email available"}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-4 rounded-lg border border-border bg-background/70 px-3 py-2 sm:min-w-48">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Email status
                            </p>
                            <p className="mt-0.5 text-sm font-medium">
                              {isEmailConfirmed ? "Confirmed" : "Pending confirmation"}
                            </p>
                          </div>
                          <Badge variant={isEmailConfirmed ? "default" : "outline"}>
                            {isEmailConfirmed ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Account Created
                      </p>
                      <p className="mt-1 font-medium">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ReceiptText aria-hidden="true" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Payments are processed securely through PayMongo.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div>
                      <p className="font-medium">PayMongo checkout</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Card or wallet details are managed by the payment
                        provider.
                      </p>
                    </div>

                    <Badge variant="outline">Connected</Badge>
                  </div>

                  <Button variant="outline" asChild>
                    <Link href="/checkout?plan=pro">
                      <CreditCard data-icon="inline-start" />
                      Update Payment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText aria-hidden="true" />
                    Pro Features
                  </CardTitle>
                  <CardDescription>
                    Included with your active subscription.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3">
                  {proPlan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <CheckCircle2
                        className="shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Recent billing activity for this account.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="font-medium">Pro subscription active</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Invoice records will appear here after payment history is
                      stored in the app database.
                    </p>
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

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <Loader2 className="text-muted-foreground" />
        </main>
      }
    >
      <BillingContent />
    </Suspense>
  )
}
