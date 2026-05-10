import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for beginners",
    features: ["Copy all signals", "Up to 2 MT5 accounts", "Email notifications", "Basic support", "API access"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For serious traders",
    features: [
      "Copy all signals",
      "Up to 5 MT5 accounts",
      "Email & SMS notifications",
      "Priority support",
      "API access",
      "Trade filtering options",
      "Risk management tools",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$249",
    period: "/month",
    description: "For institutions",
    features: [
      "Copy all signals",
      "Unlimited MT5 accounts",
      "All notification channels",
      "24/7 dedicated support",
      "API access",
      "Advanced filtering",
      "Custom risk profiles",
      "White-label options",
    ],
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="section-fade-divider px-6 py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your trading needs. All plans include full signal access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`bg-card relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-chart-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
