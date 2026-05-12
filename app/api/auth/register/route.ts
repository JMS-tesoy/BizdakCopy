import { type NextRequest, NextResponse } from "next/server"
import { createFollower, getFollowerByEmail } from "@/lib/auth"
import { registrationSchema } from "@/lib/validations/auth"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  const parsedBody = registrationSchema.safeParse(await request.json())

  if (!parsedBody.success) {
    const response: ApiResponse<null> = {
      success: false,
      error: parsedBody.error.issues[0]?.message ?? "Email, password, and plan are required",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 400 })
  }

  const { email, plan } = parsedBody.data

  // Check if user already exists
  const existing = getFollowerByEmail(email)
  if (existing) {
    const response: ApiResponse<null> = {
      success: false,
      error: "An account with this email already exists",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 409 })
  }

  // Create follower (subscription starts as inactive until payment)
  const follower = createFollower(email, plan as "starter" | "pro" | "enterprise")

  // In production: hash password and store in database

  const response: ApiResponse<{ userId: string; email: string }> = {
    success: true,
    data: {
      userId: follower.id,
      email: follower.email,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response)
}
