import { type NextRequest, NextResponse } from "next/server"

import { FREE_TRIAL_DAYS, normalizePlanId } from "@/lib/plans"
import { getSubscriptionSummary } from "@/lib/subscription"
import type { ApiResponse } from "@/lib/types"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { plan: requestedPlan } = await request.json()
    const plan = normalizePlanId(requestedPlan)

    if (!plan) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid plan selected",
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json(response, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "You must be logged in before access can be initialized",
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json(response, { status: 401 })
    }

    const subscription = getSubscriptionSummary(user)

    if (subscription.isPaid) {
      const response: ApiResponse<{ accessLevel: "paid" }> = {
        success: true,
        data: { accessLevel: "paid" },
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json(response)
    }

    const now = new Date()
    const trialEndsAt =
      subscription.trialEndsAt ??
      new Date(
        now.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000
      ).toISOString()
    const admin = createAdminClient()

    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        plan,
        subscription_provider: plan === "trial" ? "trial" : "paymongo",
        subscription_status: plan === "trial" ? "trialing" : "pending_payment",
        trial_started_at:
          typeof user.app_metadata?.trial_started_at === "string"
            ? user.app_metadata.trial_started_at
            : now.toISOString(),
        trial_ends_at: trialEndsAt,
      },
    })

    const response: ApiResponse<{ accessLevel: "trial" | "pending_payment" }> =
      {
        success: true,
        data: {
          accessLevel: plan === "trial" ? "trial" : "pending_payment",
        },
        timestamp: new Date().toISOString(),
      }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Access initialization error:", error)
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to initialize account access",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 500 })
  }
}
