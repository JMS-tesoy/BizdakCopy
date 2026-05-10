"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Loader2, CreditCard, Check } from "lucide-react"

const planDetails = {
  starter: { name: "Starter", price: "$49", features: ["2 MT5 accounts", "All signals", "Email support"] },
  pro: { name: "Pro", price: "$99", features: ["5 MT5 accounts", "All signals", "Priority support", "Risk tools"] },
  enterprise: {
    name: "Enterprise",
    price: "$249",
    features: ["Unlimited accounts", "All signals", "24/7 support", "Custom features"],
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const plan = searchParams.get("plan") || "pro"
  const details = planDetails[plan as keyof typeof planDetails] || planDetails.pro

  useEffect(() => {
    const pendingUser = sessionStorage.getItem("pendingUser")
    if (!pendingUser) {
      router.push("/register")
    }
  }, [router])

  async function handleCheckout() {
    setLoading(true)
    setError("")

    const pendingUser = sessionStorage.getItem("pendingUser")
    if (!pendingUser) {
      router.push("/register")
      return
    }

    const { email } = JSON.parse(pendingUser)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          plan,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/checkout?plan=${plan}&canceled=true`,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to create checkout session")
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.data.url
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Order</h1>
            <p className="text-muted-foreground">Start copying trades with the {details.name} plan</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{details.name} Plan</span>
                <span className="text-2xl">
                  {details.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-2">
                {details.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-chart-2" />
                    {feature}
                  </li>
                ))}
              </ul>

              {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Pay with Stripe
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Secure payment powered by Stripe. Cancel anytime.
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
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
