import { type NextRequest, NextResponse } from "next/server"

import { normalizePlanId } from "@/lib/plans"
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

  let event: PayMongoWebhookEvent

  try {
    event = JSON.parse(rawBody) as PayMongoWebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
  }

  if (
    !verifyPayMongoWebhookSignature({
      rawBody,
      signatureHeader: signature,
      webhookSecret,
      livemode: Boolean(event.data?.attributes?.livemode),
    })
  ) {
    return NextResponse.json({ error: "Invalid PayMongo signature" }, { status: 400 })
  }

  const eventType = event.data?.attributes?.type

  if (eventType === "checkout_session.payment.paid") {
    const checkoutSession = event.data?.attributes?.data
    const metadata = checkoutSession?.attributes?.metadata
    const userId = metadata?.userId
    const plan = normalizePlanId(metadata?.plan)

    if (userId && plan) {
      const paymentId = checkoutSession?.attributes?.payments?.[0]?.id
      const supabase = createAdminClient()
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(userId)

      await supabase.auth.admin.updateUserById(userId, {
        app_metadata: {
          ...user?.app_metadata,
          plan,
          subscription_provider: "paymongo",
          subscription_status: "active",
          paymongo_checkout_session_id: checkoutSession?.id,
          paymongo_payment_id: paymentId,
          subscription_activated_at: new Date().toISOString(),
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
