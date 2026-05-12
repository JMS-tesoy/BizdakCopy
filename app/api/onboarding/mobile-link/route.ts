import { type NextRequest, NextResponse } from "next/server"

import type { ApiResponse } from "@/lib/types"

const MOBILE_LINK_TTL_MS = 5 * 60 * 1000

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + MOBILE_LINK_TTL_MS).toISOString()
  const connectUrl = new URL("/onboarding/mobile-connect", origin)

  connectUrl.searchParams.set("token", token)

  const response: ApiResponse<{ connectUrl: string; expiresAt: string }> = {
    success: true,
    data: {
      connectUrl: connectUrl.toString(),
      expiresAt,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response)
}

