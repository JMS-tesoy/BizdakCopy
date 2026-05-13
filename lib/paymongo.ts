import { createHmac, timingSafeEqual } from "crypto"

import { PLAN_DETAILS, type PlanId } from "@/lib/plans"

const PAYMONGO_API_BASE_URL = "https://api.paymongo.com/v1"

type PayMongoCheckoutSessionResponse = {
  data?: {
    id: string
    attributes?: {
      checkout_url?: string
    }
  }
  errors?: Array<{
    code?: string
    detail?: string
    source?: {
      pointer?: string
    }
  }>
}

type CreateCheckoutSessionParams = {
  email: string
  userId?: string
  plan: PlanId
  successUrl: string
  cancelUrl: string
}

export function getPayMongoSecretKey() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY

  if (!secretKey) {
    throw new Error("PAYMONGO_SECRET_KEY is required before PayMongo checkout can start")
  }

  return secretKey
}

export function getPayMongoAmount(plan: PlanId) {
  const envName = PLAN_DETAILS[plan].paymongoAmountEnv
  const rawAmount = process.env[envName]
  const amount = rawAmount ? Number(rawAmount) : Number.NaN

  if (!Number.isInteger(amount) || amount < 100) {
    throw new Error(`${envName} must be set to the plan amount in PHP centavos`)
  }

  return amount
}

export function getPayMongoPaymentMethods() {
  const rawMethods = process.env.PAYMONGO_PAYMENT_METHOD_TYPES || "gcash,maya"

  return rawMethods
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean)
}

export async function createPayMongoCheckoutSession({
  email,
  userId,
  plan,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  const secretKey = getPayMongoSecretKey()
  const planDetails = PLAN_DETAILS[plan]
  const amount = getPayMongoAmount(plan)

  const response = await fetch(`${PAYMONGO_API_BASE_URL}/checkout_sessions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: {
            email,
          },
          cancel_url: cancelUrl,
          description: `${planDetails.name} monthly subscription`,
          line_items: [
            {
              amount,
              currency: "PHP",
              description: planDetails.features.join(", "),
              name: `${planDetails.name} Plan`,
              quantity: 1,
            },
          ],
          metadata: {
            email,
            plan,
            userId: userId ?? "",
          },
          payment_method_types: getPayMongoPaymentMethods(),
          send_email_receipt: true,
          success_url: successUrl,
        },
      },
    }),
  })

  const payload = (await response.json()) as PayMongoCheckoutSessionResponse

  if (!response.ok) {
    const message =
      payload.errors?.map((error) => error.detail).filter(Boolean).join(" ") ||
      "Failed to create PayMongo checkout session"
    throw new Error(message)
  }

  const checkoutUrl = payload.data?.attributes?.checkout_url

  if (!payload.data?.id || !checkoutUrl) {
    throw new Error("PayMongo did not return a checkout URL")
  }

  return {
    id: payload.data.id,
    url: checkoutUrl,
  }
}

export function verifyPayMongoWebhookSignature(rawBody: string, signatureHeader: string, webhookSecret: string) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=")
      return [key?.trim(), value?.trim()]
    })
  )
  const timestamp = parts.t
  const expectedSignatures = [parts.te, parts.li].filter(Boolean)

  if (!timestamp || expectedSignatures.length === 0) {
    return false
  }

  const signedPayload = `${timestamp}.${rawBody}`
  const computedSignature = createHmac("sha256", webhookSecret).update(signedPayload).digest("hex")

  return expectedSignatures.some((signature) => {
    if (!signature || signature.length !== computedSignature.length) {
      return false
    }

    return timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))
  })
}
