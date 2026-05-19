import { type NextRequest, NextResponse } from "next/server"
import { isPlanId } from "@/lib/plans"
import { createPayMongoCheckoutSession } from "@/lib/paymongo"
import { getSubscriptionSummary } from "@/lib/subscription"
import type { ApiResponse } from "@/lib/types"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, userId, plan, successUrl, cancelUrl } = await request.json()

    if (!plan) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Plan is required",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (!isPlanId(plan)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid plan selected",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (plan === "free") {
      const response: ApiResponse<null> = {
        success: false,
        error: "The Free plan does not require checkout",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      const response: ApiResponse<null> = {
        success: false,
        error: "You must be logged in before checkout can start",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 401 })
    }

    if ((userId && userId !== user.id) || (email && email !== user.email)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Checkout identity does not match the current session",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 403 })
    }

    const subscription = getSubscriptionSummary(user)

    if (subscription.isPaid) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Your Pro access is already active",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 409 })
    }

    const admin = createAdminClient()

    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        plan,
        subscription_provider: "paymongo",
        subscription_status: "pending_payment",
      },
    })

    const session = await createPayMongoCheckoutSession({
      email: user.email,
      userId: user.id,
      plan,
      successUrl: successUrl || `${request.headers.get("origin")}/dashboard?success=true`,
      cancelUrl: cancelUrl || `${request.headers.get("origin")}/register?canceled=true`,
    })

    const response: ApiResponse<{ sessionId: string; url: string }> = {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url!,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("PayMongo checkout error:", error)
    const message = error instanceof Error ? error.message : "Failed to create checkout session"
    const response: ApiResponse<null> = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
