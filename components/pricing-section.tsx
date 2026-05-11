import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Link from "next/link"
import { ONBOARDING_ROUTE } from "@/lib/routes"

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for solo OKX users",
    features: ["Copy all signals", "1 OKX account", "Email notifications", "Basic support", "API access"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For serious traders",
    features: [
      "Copy all signals",
      "Up to 3 OKX accounts",
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
      "Unlimited OKX accounts",
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
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your OKX trading workflow. All plans include full signal access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "h-full bg-card",
                plan.popular && "border-primary shadow-lg ring-primary/25",
              )}
            >
              <CardHeader className="text-center">
                <div className="mb-2 flex min-h-6 justify-center">
                  {plan.popular ? <Badge>Most Popular</Badge> : null}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 text-chart-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link href={ONBOARDING_ROUTE}>Start Onboarding</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
