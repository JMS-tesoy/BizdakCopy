import { NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/types"

export async function GET() {
  const response: ApiResponse<null> = {
    success: false,
    error: "Legacy signal API is disabled. Use the authenticated OKX dashboard flow.",
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: 410 })
}
