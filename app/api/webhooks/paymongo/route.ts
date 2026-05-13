import { type NextRequest, NextResponse } from "next/server"

import { verifyPayMongoWebhookSignature } from "@/lib/paymongo"
import { createAdminClient } from "@/utils/supabase/admin"

type PayMongoWebhookEvent = {
  data?: {
    id?: string
    type?: "event"
    attributes?: {
      type?: string
      livemode?: boolean
      data?: {
        id?: string
        type?: string
        attributes?: {
          metadata?: Record<string, string | undefined>
          payments?: Array<{
            id?: string
          }>
        }
      }
    }
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("paymongo-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing PayMongo signature" }, { status: 400 })
  }

  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "PayMongo webhook secret is not configured" }, { status: 500 })
  }

  if (!verifyPayMongoWebhookSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid PayMongo signature" }, { status: 400 })
  }

  const event = JSON.parse(rawBody) as PayMongoWebhookEvent
  const eventType = event.data?.attributes?.type

  if (eventType === "checkout_session.payment.paid") {
    const checkoutSession = event.data?.attributes?.data
    const metadata = checkoutSession?.attributes?.metadata
    const userId = metadata?.userId

    if (userId) {
      const paymentId = checkoutSession?.attributes?.payments?.[0]?.id
      const supabase = createAdminClient()

      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          plan: metadata?.plan,
          paymongo_checkout_session_id: checkoutSession?.id,
          paymongo_payment_id: paymentId,
          subscription_provider: "paymongo",
          subscription_status: "active",
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
