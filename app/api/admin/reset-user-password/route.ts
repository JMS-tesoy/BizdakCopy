import { NextResponse } from "next/server"

import { createAdminClient } from "@/utils/supabase/admin"

export async function POST(request: Request) {
  try {
    const adminSecret = request.headers.get("x-admin-secret")

    if (!process.env.ADMIN_RESET_SECRET || adminSecret !== process.env.ADMIN_RESET_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, password } = await request.json()

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      email: data.user.email,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to reset password",
      },
      { status: 500 }
    )
  }
}