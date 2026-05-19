import type { User } from "@supabase/supabase-js"

import { FREE_TRIAL_DAYS, normalizePlanId, type PlanId } from "@/lib/plans"

export type SubscriptionSummary = {
  plan: PlanId
  status?: string
  trialEndsAt?: string
  trialDaysRemaining: number
  isFreeTrial: boolean
  isTrialExpired: boolean
  isPaid: boolean
  isProPending: boolean
  isPaymentPending: boolean
  canUsePaidFeatures: boolean
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

function readAppMetadataString(user: User | null | undefined, key: string) {
  const appValue = user?.app_metadata?.[key]

  if (typeof appValue === "string" && appValue.length > 0) {
    return appValue.toLowerCase()
  }

  return undefined
}

function getTrialEndsAt(user: User | null | undefined) {
  const explicitTrialEnd = readAppMetadataString(user, "trial_ends_at")

  if (explicitTrialEnd) {
    return explicitTrialEnd
  }

  if (!user?.created_at) {
    return undefined
  }

  return new Date(
    new Date(user.created_at).getTime() + FREE_TRIAL_DAYS * DAY_IN_MS
  ).toISOString()
}

function getTrialDaysRemaining(trialEndsAt?: string) {
  if (!trialEndsAt) {
    return 0
  }

  return Math.max(
    0,
    Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / DAY_IN_MS)
  )
}

export function getSubscriptionSummary(
  user: User | null | undefined
): SubscriptionSummary {
  const rawPlan = readAppMetadataString(user, "plan")
  const plan = normalizePlanId(rawPlan) ?? "trial"
  const status = readAppMetadataString(user, "subscription_status")
  const trialEndsAt = getTrialEndsAt(user)
  const trialDaysRemaining = getTrialDaysRemaining(trialEndsAt)

  const isPaid = plan !== "trial" && status === "active"
  const isProPending = plan === "pro" && !isPaid
  const isPaymentPending = plan !== "trial" && !isPaid
  const isFreeTrial = plan === "trial" && trialDaysRemaining > 0
  const isTrialExpired = plan === "trial" && trialDaysRemaining === 0

  return {
    plan,
    status,
    trialEndsAt,
    trialDaysRemaining,
    isFreeTrial,
    isTrialExpired,
    isPaid,
    isProPending,
    isPaymentPending,
    canUsePaidFeatures: isPaid,
  }
}
