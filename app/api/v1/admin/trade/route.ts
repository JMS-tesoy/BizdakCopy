import { type NextRequest, NextResponse } from "next/server"
import { openTrade, closeTrade, modifyTrade } from "@/lib/signals-store"
import type { ApiResponse, Trade } from "@/lib/types"

const ADMIN_SECRET = process.env.ADMIN_SECRET || ""

export async function POST(request: NextRequest) {
  const adminKey =
    request.headers.get("X-Admin-Secret") ||
    request.headers.get("x-admin-secret") ||
    request.headers.get("Authorization")?.replace("Bearer ", "") ||
    request.headers.get("authorization")?.replace("Bearer ", "")

  console.log("[v0] All headers:", JSON.stringify(Object.fromEntries(request.headers.entries())))
  console.log("[v0] Received admin key:", adminKey ? `"${adminKey}"` : "none")
  console.log("[v0] Expected admin key:", ADMIN_SECRET ? `"${ADMIN_SECRET}"` : "NOT SET IN ENV")
  console.log("[v0] Keys match:", adminKey === ADMIN_SECRET)
  console.log("[v0] Key lengths:", adminKey?.length, "vs", ADMIN_SECRET?.length)

  if (!ADMIN_SECRET) {
    console.log("[v0] ERROR: ADMIN_SECRET environment variable is not set!")
    return NextResponse.json(
      {
        success: false,
        error: "Server configuration error - ADMIN_SECRET not set",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }

  if (!adminKey || adminKey !== ADMIN_SECRET) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Unauthorized",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 401 })
  }

  const body = await request.json()
  console.log("[v0] Received body:", JSON.stringify(body))

  const {
    type, // "OPEN", "CLOSE", "MODIFY" from EA
    ticket, // position ticket number
    symbol,
    action, // "BUY" or "SELL"
    lots,
    price,
    sl,
    tp,
  } = body

  let trade: Trade | null = null

  switch (type?.toUpperCase()) {
    case "OPEN":
      trade = openTrade({
        symbol,
        type: action, // BUY or SELL
        lotSize: lots,
        entryPrice: price,
        stopLoss: sl || null,
        takeProfit: tp || null,
        closeTime: null,
        exitPrice: null,
        profit: null,
        magicNumber: ticket || Math.floor(Math.random() * 1000000),
      })
      console.log("[v0] Trade opened:", trade?.id)
      break

    case "CLOSE":
      trade = closeTrade(String(ticket), price)
      console.log("[v0] Trade closed:", ticket)
      break

    case "MODIFY":
      trade = modifyTrade(String(ticket), sl, tp)
      console.log("[v0] Trade modified:", ticket)
      break

    default:
      console.log("[v0] Invalid type:", type)
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid type. Use: OPEN, CLOSE, or MODIFY",
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(response, { status: 400 })
  }

  if (!trade && type?.toUpperCase() !== "CLOSE") {
    const response: ApiResponse<null> = {
      success: false,
      error: "Trade not found or operation failed",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: 404 })
  }

  const response: ApiResponse<{ trade: Trade | null }> = {
    success: true,
    data: { trade },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response)
}
