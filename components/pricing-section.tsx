import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PLAN_DETAILS, PLAN_IDS } from "@/lib/plans"
import { Check } from "lucide-react"
import Link from "next/link"
import { START_SETUP_ROUTE } from "@/lib/routes"

export function PricingSection() {
  return (
    <section id="pricing" className="section-fade-divider px-6 py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Choose Your Follower Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start free to review the workflow, then upgrade to Pro when you are ready to connect live OKX accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto md:grid-cols-2">
          {PLAN_IDS.map((planId) => {
            const plan = PLAN_DETAILS[planId]
            const isFeatured = planId === "pro"

            return (
            <Card
              key={planId}
              className={cn(
                "h-full bg-card",
                isFeatured && "border-primary shadow-lg ring-primary/25",
              )}
            >
              <CardHeader className="text-center">
                <div className="mb-2 flex min-h-6 justify-center">
                  {plan.badge ? <Badge>{plan.badge}</Badge> : <Badge variant="outline">Preview</Badge>}
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
                <Button className="w-full" variant={isFeatured ? "default" : "outline"} asChild>
                  <Link href={`${START_SETUP_ROUTE}?plan=${planId}`}>{plan.ctaLabel}</Link>
                </Button>
              </CardFooter>
            </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
