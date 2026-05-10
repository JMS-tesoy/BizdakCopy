import { type NextRequest, NextResponse } from "next/server"
import { getStripe, PLAN_PRICES } from "@/lib/stripe"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { email, plan, successUrl, cancelUrl } = await request.json()

    if (!email || !plan) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Email and plan are required",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    const priceAmount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
    if (!priceAmount) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid plan selected",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
    }

    const stripe = getStripe()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `FINBRO Copy - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `Copy trading subscription - ${plan} tier`,
            },
            unit_amount: priceAmount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan,
        email,
      },
      success_url: successUrl || `${request.headers.get("origin")}/dashboard?success=true`,
      cancel_url: cancelUrl || `${request.headers.get("origin")}/register?canceled=true`,
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
    console.error("Stripe checkout error:", error)
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create checkout session",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
