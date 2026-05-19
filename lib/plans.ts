export const PLAN_IDS = ["free", "pro"] as const
export const FREE_TRIAL_DAYS = 14

export type PlanId = (typeof PLAN_IDS)[number]

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
  }
> = {
  free: {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Explore the copy trading workflow before funding a live plan.",
    monthlyAmount: 0,
    features: [
      "Dashboard preview",
      "One OKX setup checklist",
      "Risk controls preview",
      "Manual activation flow",
      "Community support",
    ],
    ctaLabel: "Start Free",
    paymongoAmountEnv: "PAYMONGO_FREE_AMOUNT_CENTAVOS",
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
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && PLAN_IDS.includes(value as PlanId)
}

export function getPlanDetails(plan: string | null | undefined) {
  return isPlanId(plan) ? PLAN_DETAILS[plan] : PLAN_DETAILS.pro
}
