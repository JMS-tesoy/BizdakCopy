import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { getSubscriptionSummary } from "@/lib/subscription"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const protectedPathPrefixes = ["/dashboard", "/billing", "/checkout", "/onboarding"]
const paidPathPrefixes = ["/billing", "/onboarding"]
const authPathnames = ["/login", "/register"]

function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export async function updateSession(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isMobileConnectPath = matchesPathPrefix(pathname, "/onboarding/mobile-connect")
  const isProtectedPath =
    !isMobileConnectPath &&
    protectedPathPrefixes.some((prefix) => matchesPathPrefix(pathname, prefix))
  const isPaidPath =
    !isMobileConnectPath &&
    paidPathPrefixes.some((prefix) => matchesPathPrefix(pathname, prefix))
  const isCheckoutPath = matchesPathPrefix(pathname, "/checkout")
  const isAuthPath = authPathnames.includes(pathname)

  if (!user && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = isCheckoutPath ? "/register" : "/login"
    redirectUrl.search = ""

    return NextResponse.redirect(redirectUrl)
  }

  if (user) {
    const subscription = getSubscriptionSummary(user)

    if (isPaidPath && !subscription.canUsePaidFeatures) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      redirectUrl.search = "?access=paid-required"

      return NextResponse.redirect(redirectUrl)
    }

    if (isCheckoutPath && subscription.isPaid) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      redirectUrl.search = ""

      return NextResponse.redirect(redirectUrl)
    }
  }

  if (user && isAuthPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    redirectUrl.search = ""

    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
