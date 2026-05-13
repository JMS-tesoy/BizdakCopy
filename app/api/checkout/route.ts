import { type NextRequest, NextResponse } from "next/server"
import { isPlanId } from "@/lib/plans"
import { createPayMongoCheckoutSession } from "@/lib/paymongo"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { email, userId, plan, successUrl, cancelUrl } = await request.json()

    if (!email || !plan) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Email and plan are required",
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

    const session = await createPayMongoCheckoutSession({
      email,
      userId,
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
