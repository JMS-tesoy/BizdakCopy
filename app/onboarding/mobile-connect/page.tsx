import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function MobileConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const hasToken = Boolean(token)

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-black tracking-tight">
            {hasToken ? "Mobile device link received" : "Connection link is missing"}
          </CardTitle>
          <CardDescription className="leading-6">
            {hasToken
              ? "Return to the Bizdak mobile app to finish connecting this onboarding setup."
              : "Open onboarding again and scan the latest QR code from your desktop."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
            {hasToken
              ? "For production, this token should be verified against a short-lived server-side record before linking the device."
              : "QR connection links expire quickly for account safety."}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="h-11 w-full">
            <Link href="/onboarding">Back to onboarding</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

