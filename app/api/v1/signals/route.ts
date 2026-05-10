import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/auth"
import { getSignalsSince, getLatestSignals } from "@/lib/signals-store"
import type { ApiResponse, Signal } from "@/lib/types"

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

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const since = searchParams.get("since")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  let signals: Signal[]

  if (since) {
    // Get signals since a specific timestamp
    signals = getSignalsSince(since)
  } else {
    // Get latest signals
    signals = getLatestSignals(limit)
  }

  const response: ApiResponse<{ signals: Signal[]; count: number }> = {
    success: true,
    data: {
      signals,
      count: signals.length,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response)
}
