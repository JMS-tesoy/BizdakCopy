import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  // Get API key from header
  const apiKey = request.headers.get("X-API-Key")

  if (!apiKey) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Missing API key. Include X-API-Key header.",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 401 })
  }

  // Validate API key
  const follower = validateApiKey(apiKey)
  if (!follower) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Invalid or expired API key.",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 403 })
  }

  const response: ApiResponse<{
    status: string
    subscription: string
    tier: string
    maxAccounts: number
  }> = {
    success: true,
    data: {
      status: "connected",
      subscription: follower.subscriptionStatus,
      tier: follower.subscriptionTier,
      maxAccounts: follower.maxAccounts,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response)
}
