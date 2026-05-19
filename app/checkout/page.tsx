"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, CreditCard, Loader2 } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPlanDetails, normalizePlanId } from "@/lib/plans"
import { createClient } from "@/utils/supabase/client"

type CheckoutIdentity = {
  email: string
  userId: string
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkoutIdentity, setCheckoutIdentity] =
    useState<CheckoutIdentity | null>(null)

  const requestedPlan = searchParams.get("plan")
  const plan = normalizePlanId(requestedPlan) ?? "pro"
  const details = getPlanDetails(plan)

  useEffect(() => {
    async function loadCheckoutIdentity() {
      if (plan === "trial") {
        router.push("/dashboard")
        return
      }

      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user?.email) {
        router.push("/register")
        return
      }

      setCheckoutIdentity({
        email: user.email,
        userId: user.id,
      })
    }

    loadCheckoutIdentity()
  }, [plan, router])

  async function handleCheckout() {
    setLoading(true)
    setError("")

    if (plan === "trial") {
      router.push("/dashboard")
      return
    }

    if (!checkoutIdentity) {
      router.push("/register")
      return
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: checkoutIdentity.email,
          userId: checkoutIdentity.userId,
          plan,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/checkout?plan=${plan}&canceled=true`,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to create checkout session")
        return
      }

      if (!data.data?.url) {
        setError("Checkout session was created, but no payment URL was returned.")
        return
      }

      window.location.assign(data.data.url)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="bg-page-texture px-6 pb-20 pt-32">
        <div className="container mx-auto max-w-md">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Secure PayMongo checkout
            </p>

            <h1 className="mb-2 text-3xl font-semibold tracking-tight">
              Complete Your Order
            </h1>

            <p className="text-muted-foreground">
              Start copying trades with the {details.name} plan.
            </p>
          </div>

          <Card className="border-border bg-card/95 text-card-foreground shadow-2xl shadow-black/10 backdrop-blur dark:shadow-black/30">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-start justify-between gap-4">
                <span>{details.name} Plan</span>

                <span className="text-right text-2xl">
                  {details.price}
                  <span className="block text-sm font-normal text-muted-foreground">
                    {details.period}
                  </span>
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <ul className="space-y-3">
                {details.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-card-foreground"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-4" />
                    </span>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {details.priceNote ? (
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  {details.priceNote}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button
                className="w-full font-semibold"
                size="lg"
                onClick={handleCheckout}
                disabled={loading || !checkoutIdentity}
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 size-4" />
                )}

                {loading ? "Starting checkout..." : "Pay with PayMongo"}
              </Button>

              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Secure payment powered by PayMongo. E-wallet availability depends
                on your PayMongo account.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}