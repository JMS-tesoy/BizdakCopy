import { type NextRequest, NextResponse } from "next/server"
import { getFollowerByEmail } from "@/lib/auth"
import { loginSchema } from "@/lib/validations/auth"
import type { ApiResponse, Follower } from "@/lib/types"

export async function POST(request: NextRequest) {
  const parsedBody = loginSchema.safeParse(await request.json())

  if (!parsedBody.success) {
    const response: ApiResponse<null> = {
      success: false,
      error: parsedBody.error.issues[0]?.message ?? "Email and password are required",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 400 })
  }

  const { email } = parsedBody.data

  // Find user
  const follower = getFollowerByEmail(email)

  // In production: verify password hash
  if (!follower) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Invalid email or password",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 401 })
  }

  // Return user data (exclude sensitive fields)
  const userData: Partial<Follower> = {
    id: follower.id,
    email: follower.email,
    apiKey: follower.apiKey,
    subscriptionTier: follower.subscriptionTier,
    subscriptionStatus: follower.subscriptionStatus,
    maxAccounts: follower.maxAccounts,
    connectedAccounts: follower.connectedAccounts,
  }

  const response: ApiResponse<{ user: Partial<Follower> }> = {
    success: true,
    data: { user: userData },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response)
}
