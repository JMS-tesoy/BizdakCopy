import Stripe from "stripe"

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe API routes")
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-11-17.clover",
  })
}

export const PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || "price_starter",
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise",
}

export const PLAN_PRICES = {
  starter: 4900, // $49 in cents
  pro: 9900, // $99 in cents
  enterprise: 24900, // $249 in cents
}
