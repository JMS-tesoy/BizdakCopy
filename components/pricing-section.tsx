"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type PlanId } from "@/lib/plans"
import { START_SETUP_ROUTE } from "@/lib/routes"

type MarketKind = "crypto" | "forex"

type PlatformOption = {
  id: string
  label: string
  kind: MarketKind
}

type PlatformPlans = {
  apiLabel: string
  signalLabel: string
  filterLabel: string
  accountLabel: string
  instrumentLabel: string
}

type FollowerPlanCard = {
  id: PlanId
  title: string
  badge: string
  badgeTone: "muted" | "recommended" | "performance"
  price: string
  period: string
  description: (platform: PlatformOption) => string
  priceNote: string
  features: (platform: PlatformOption, copy: PlatformPlans) => string[]
  ctaLabel: string
}

const marketTabs: { id: MarketKind; label: string }[] = [
  { id: "crypto", label: "Crypto" },
  { id: "forex", label: "Forex" },
]

const cryptoPlatforms: PlatformOption[] = [
  { id: "okx", label: "OKX", kind: "crypto" },
  { id: "bitget", label: "Bitget", kind: "crypto" },
  { id: "binance", label: "Binance", kind: "crypto" },
  { id: "kraken", label: "Kraken", kind: "crypto" },
]

const forexPlatforms: PlatformOption[] = [
  { id: "ic-markets", label: "IC Markets", kind: "forex" },
  { id: "exness", label: "Exness", kind: "forex" },
  { id: "fbs", label: "FBS", kind: "forex" },
]

const platformCopy: Record<MarketKind, PlatformPlans> = {
  crypto: {
    apiLabel: "API connection checklist",
    signalLabel: "Real-time full signal feed with no delays",
    filterLabel: "Precision trade filtering by pair, size, and direction",
    accountLabel: "Connect up to 3 accounts simultaneously",
    instrumentLabel: "copy trading",
  },
  forex: {
    apiLabel: "account connection checklist",
    signalLabel: "Real-time signal feed for supported forex instruments",
    filterLabel: "Precision trade filtering by instrument, lot size, and direction",
    accountLabel: "Connect up to 3 broker accounts simultaneously",
    instrumentLabel: "forex copy trading",
  },
}

const followerPlans: FollowerPlanCard[] = [
  {
    id: "trial",
    title: "Trial",
    badge: "No commitment",
    badgeTone: "muted",
    price: "$0",
    period: "/14 days",
    description: (platform) =>
      `Explore the full ${platform.label} copy trading workflow before any capital is deployed, with zero financial exposure and zero obligation.`,
    priceNote: "No payment required. No auto-renewal.",
    features: (platform, copy) => [
      "Full dashboard preview before going live",
      "Guided risk configuration walkthrough",
      `${platform.label} ${copy.apiLabel}`,
      "Step-by-step manual activation flow",
      "Clear upgrade path when ready to go live",
    ],
    ctaLabel: "Begin trial",
  },
  {
    id: "pro",
    title: "Pro",
    badge: "Recommended",
    badgeTone: "recommended",
    price: "$20",
    period: "/month",
    description: (platform) =>
      `Full live access on ${platform.label} for traders ready to execute. Fixed monthly cost, with 100% of profits retained and no performance conditions.`,
    priceNote: "Fixed cost. Retain 100% of your profits.",
    features: (platform, copy) => [
      `Live ${platform.label} ${copy.instrumentLabel}, active from day one`,
      copy.accountLabel,
      copy.signalLabel,
      "Advanced risk controls, drawdown limits, and position sizing",
      copy.filterLabel,
      "Priority onboarding and setup support",
      "Email notifications for every executed trade",
      "Manual pause and emergency stop controls",
    ],
    ctaLabel: "Activate Pro",
  },
  {
    id: "profit-sharing",
    title: "Profit Sharing",
    badge: "Performance-based",
    badgeTone: "performance",
    price: "PHP 500",
    period: " setup",
    description: (platform) =>
      `Lower upfront access on ${platform.label} with a one-time setup checkout, then a platform share only when copied trading generates confirmed net profit.`,
    priceNote: "Then 20% platform share of net profits.",
    features: (platform) => [
      "PHP 500 setup checkout before activation",
      "You retain 80% of all net profits generated",
      "Platform share applies only when net profit is confirmed",
      `Full live ${platform.label} copy trading access`,
      "Advanced risk controls included",
      "Manual pause and emergency stop controls",
    ],
    ctaLabel: "Start Profit Sharing",
  },
]

function MarketSwitch({
  value,
  onChange,
}: {
  value: MarketKind
  onChange: (market: MarketKind) => void
}) {
  return (
    <div className="flex justify-center">
      <div className="relative grid grid-cols-2 rounded-lg border border-border bg-muted p-1">
        <span
          className={cn(
            "absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-md bg-background transition-transform duration-300 ease-out will-change-transform",
            value === "forex" && "translate-x-full"
          )}
          aria-hidden="true"
        />

        {marketTabs.map((market) => {
          const isActive = value === market.id

          return (
            <Button
              key={market.id}
              type="button"
              variant="ghost"
              className={cn(
                "relative z-10 h-10 rounded-md bg-transparent px-6 font-semibold transition-colors duration-200 hover:bg-transparent",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={isActive}
              onClick={() => onChange(market.id)}
            >
              {market.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function MarketSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: PlatformOption[]
  value: PlatformOption
  onChange: (option: PlatformOption) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {options.map((option) => {
          const isActive = option.id === value.id

          return (
            <Button
              key={option.id}
              type="button"
              variant="outline"
              className={cn(
                "h-10 min-w-24 justify-center gap-2 bg-transparent font-semibold text-muted-foreground transition-all duration-200",
                "hover:border-primary/50 hover:bg-muted/60 hover:text-foreground",
                isActive &&
  "border-primary bg-background text-green-500! ring-1 ring-primary/25 hover:bg-background hover:text-green-500!"
              )}
              aria-pressed={isActive}
              onClick={() => onChange(option)}
            >
              <span
                className={cn(
                  "size-2 rounded-full bg-muted-foreground/40 transition-colors",
                  isActive && "bg-primary"
                )}
                aria-hidden="true"
              />

              {option.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function PlanGrid({ platform }: { platform: PlatformOption }) {
  const copy = platformCopy[platform.kind]

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
      {followerPlans.map((plan) => {
        const isFeatured = plan.id === "pro"

        return (
          <Card
            key={`${platform.id}-${plan.id}`}
            className={cn(
              "flex h-full min-w-0 flex-col bg-card",
              isFeatured && "border-primary shadow-lg ring-1 ring-primary/30"
            )}
          >
            <CardHeader className="items-center text-center">
              <div className="mb-3 flex w-full flex-col items-center gap-2">
                <Badge variant="outline" className="w-fit">
                  {platform.label}
                </Badge>

                <Badge
                  variant="secondary"
                  className={cn(
                    "w-full justify-center rounded-md uppercase",
                    plan.badgeTone === "recommended" &&
                      "bg-primary/15 text-primary",
                    plan.badgeTone === "performance" &&
                      "bg-success/15 text-success"
                  )}
                >
                  {plan.badge}
                </Badge>
              </div>

              <CardTitle className="text-2xl">{plan.title}</CardTitle>

              <CardDescription className="min-h-24 text-sm leading-6 md:min-h-36 lg:min-h-32 xl:min-h-28">
                {plan.description(platform)}
              </CardDescription>

              <div className="min-h-24 pt-4">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>

                <span className="ml-1 text-sm font-semibold text-muted-foreground">
                  {plan.period}
                </span>

                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {plan.priceNote}
                </p>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="border-t border-border pt-6">
                <ul className="flex flex-col gap-4">
                  {plan.features(platform, copy).map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 shrink-0 text-success"
                        aria-hidden="true"
                      />

                      <span className="text-sm font-medium leading-5 text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                variant={isFeatured ? "default" : "outline"}
                asChild
              >
                <Link href={`${START_SETUP_ROUTE}?plan=${plan.id}`}>
                  {plan.ctaLabel}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export function PricingSection() {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoPlatforms[0])
  const [selectedForex, setSelectedForex] = useState(forexPlatforms[0])
  const [activeMarket, setActiveMarket] = useState<MarketKind>("crypto")
  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<number | null>(null)

  function showMarket(market: MarketKind) {
    const container = carouselRef.current

    setActiveMarket(market)

    if (!container) return

    container.scrollTo({
      left: market === "crypto" ? 0 : container.clientWidth,
      behavior: "smooth",
    })
  }

  function handleMarketScroll() {
    const container = carouselRef.current
    if (!container) return

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      const settledIndex = Math.round(container.scrollLeft / container.clientWidth)
      setActiveMarket(settledIndex === 0 ? "crypto" : "forex")
    }, 80)
  }

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <section id="pricing" className="section-fade-divider px-6 py-20">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
            Choose Your Copy Trading Plan
          </h2>

          <p className="mx-auto max-w-2xl text-muted-foreground">
            Three distinct access tiers for serious copy traders. Select your
            exchange or broker below to see the relevant plan details.
          </p>
        </div>

        <MarketSwitch value={activeMarket} onChange={showMarket} />

        <div
          ref={carouselRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={handleMarketScroll}
        >
          <div className="min-w-full snap-start pr-0 md:pr-3">
            <div className="flex flex-col gap-8">
              <MarketSelector
                label="Crypto exchanges"
                options={cryptoPlatforms}
                value={selectedCrypto}
                onChange={setSelectedCrypto}
              />

              <PlanGrid platform={selectedCrypto} />
            </div>
          </div>

          <div className="min-w-full snap-start pl-0 md:pl-3">
            <div className="flex flex-col gap-8">
              <MarketSelector
                label="Forex brokers"
                options={forexPlatforms}
                value={selectedForex}
                onChange={setSelectedForex}
              />

              <PlanGrid platform={selectedForex} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}