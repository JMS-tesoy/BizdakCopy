export const PLAN_IDS = ["trial", "pro", "profit-sharing"] as const
export const FREE_TRIAL_DAYS = 14

export type PlanId = (typeof PLAN_IDS)[number]
export type LegacyPlanId = PlanId | "free"

export const PLAN_DETAILS: Record<
  PlanId,
  {
    name: string
    price: string
    period: string
    description: string
    monthlyAmount: number
    features: string[]
    badge?: string
    ctaLabel: string
    paymongoAmountEnv: string
    priceNote?: string
  }
> = {
  trial: {
    name: "Trial",
    price: "$0",
    period: "/14 days",
    description:
      "Preview the follower dashboard, risk setup, and OKX workflow before live activation.",
    monthlyAmount: 0,
    features: [
      "Dashboard preview",
      "Risk setup walkthrough",
      "OKX connection checklist",
      "Manual activation flow",
      "Upgrade before live copying",
    ],
    ctaLabel: "Start Trial",
    paymongoAmountEnv: "PAYMONGO_TRIAL_AMOUNT_CENTAVOS",
  },
  pro: {
    name: "Pro",
    price: "$20",
    period: "/month",
    description: "For followers ready to run the live OKX copy trading workflow.",
    monthlyAmount: 2000,
    features: [
      "Live copy trading access",
      "Up to 3 OKX accounts",
      "Full signal feed",
      "Advanced risk controls",
      "Trade filtering options",
      "Priority setup support",
      "Email trade notifications",
      "Manual pause and emergency stop",
    ],
    badge: "Best value",
    ctaLabel: "Upgrade to Pro",
    paymongoAmountEnv: "PAYMONGO_PRO_AMOUNT_CENTAVOS",
  },
  "profit-sharing": {
    name: "Profit Sharing",
    price: "PHP 500",
    period: " setup",
    description:
      "Lower upfront access with a 20% platform share only when copied trading produces net profit.",
    monthlyAmount: 500,
    features: [
      "PHP 500 setup checkout",
      "80% of net profits kept by follower",
      "20% platform profit share",
      "Live OKX copy trading access",
      "Advanced risk controls",
      "Manual pause and emergency stop",
    ],
    badge: "Performance based",
    ctaLabel: "Start Profit Sharing",
    paymongoAmountEnv: "PAYMONGO_PROFIT_SHARING_AMOUNT_CENTAVOS",
    priceNote: "then 20% platform share of net profits",
  },
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && PLAN_IDS.includes(value as PlanId)
}

export function normalizePlanId(value: unknown): PlanId | undefined {
  if (value === "free") return "trial"
  return isPlanId(value) ? value : undefined
}

export function getPlanDetails(plan: string | null | undefined) {
  const normalizedPlan = normalizePlanId(plan)

  return normalizedPlan ? PLAN_DETAILS[normalizedPlan] : PLAN_DETAILS.pro
}
