export const PLAN_IDS = ["starter", "pro", "enterprise"] as const

export type PlanId = (typeof PLAN_IDS)[number]

export const PLAN_DETAILS: Record<
  PlanId,
  {
    name: string
    price: string
    monthlyAmount: number
    features: string[]
    paymongoAmountEnv: string
  }
> = {
  starter: {
    name: "Starter",
    price: "₱4,900",
    monthlyAmount: 490000,
    features: ["1 OKX account", "Risk controls", "Email support"],
    paymongoAmountEnv: "PAYMONGO_STARTER_AMOUNT_CENTAVOS",
  },
  pro: {
    name: "Pro",
    price: "₱9,900",
    monthlyAmount: 990000,
    features: ["Up to 3 OKX accounts", "Priority support", "Advanced risk controls"],
    paymongoAmountEnv: "PAYMONGO_PRO_AMOUNT_CENTAVOS",
  },
  enterprise: {
    name: "Enterprise",
    price: "₱24,900",
    monthlyAmount: 2490000,
    features: ["Unlimited OKX accounts", "Priority onboarding", "Custom support"],
    paymongoAmountEnv: "PAYMONGO_ENTERPRISE_AMOUNT_CENTAVOS",
  },
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && PLAN_IDS.includes(value as PlanId)
}

export function getPlanDetails(plan: string | null | undefined) {
  return isPlanId(plan) ? PLAN_DETAILS[plan] : PLAN_DETAILS.pro
}
