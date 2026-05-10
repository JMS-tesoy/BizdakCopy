import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { getFollowerByEmail, updateFollowerSubscription } from "@/lib/auth"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret is not configured" }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const email = session.metadata?.email || session.customer_email

      if (email) {
        const follower = getFollowerByEmail(email)
        if (follower) {
          updateFollowerSubscription(follower.apiKey, "active")
        }
      }
      break
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(subscription.customer as string)

      if ("email" in customer && customer.email) {
        const follower = getFollowerByEmail(customer.email)
        if (follower) {
          const status = subscription.status === "active" ? "active" : "expired"
          updateFollowerSubscription(follower.apiKey, status)
        }
      }
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      const customerEmail = invoice.customer_email

      if (customerEmail) {
        const follower = getFollowerByEmail(customerEmail)
        if (follower) {
          updateFollowerSubscription(follower.apiKey, "inactive")
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
