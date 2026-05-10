"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Copy, Key, Download, Activity, Wifi, WifiOff } from "lucide-react"
import type { Follower } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [user] = useState<Partial<Follower> | null>(() => {
    if (typeof window === "undefined") return null

    const stored = sessionStorage.getItem("user")
    if (!stored) return null

    try {
      return JSON.parse(stored) as Partial<Follower>
    } catch {
      return null
    }
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [router, user])

  function copyApiKey() {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Manage your copy trading settings</p>
            </div>
            <Badge
              variant={user.subscriptionStatus === "active" ? "default" : "secondary"}
              className={user.subscriptionStatus === "active" ? "bg-chart-2 text-chart-2-foreground" : ""}
            >
              {user.subscriptionStatus === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold capitalize">{user.subscriptionTier}</p>
                <p className="text-sm text-muted-foreground">
                  {user.maxAccounts === 999 ? "Unlimited" : user.maxAccounts} MT5 accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {user.subscriptionStatus === "active" ? (
                    <Wifi className="h-4 w-4 text-chart-2" />
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{user.subscriptionStatus === "active" ? "Ready" : "Pending"}</p>
                <p className="text-sm text-muted-foreground">{user.connectedAccounts || 0} connected accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  EA Download
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href="/download">Download EA</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Your API Key
              </CardTitle>
              <CardDescription>Use this key in your MT5 Expert Advisor to receive trading signals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto">{user.apiKey}</code>
                <Button variant="outline" size="icon" onClick={copyApiKey}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && <p className="text-sm text-chart-2 mt-2">Copied to clipboard!</p>}
              <p className="text-sm text-muted-foreground mt-4">Keep this key secure. Do not share it with anyone.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium">Download the Follower EA</p>
                  <p className="text-sm text-muted-foreground">Get the MT5 Expert Advisor from the download page</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium">Install in MT5</p>
                  <p className="text-sm text-muted-foreground">Copy the .ex5 file to your MT5 Experts folder</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium">Configure Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Enter your API key and configure lot size/risk settings
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-sm">4</span>
                </div>
                <div>
                  <p className="font-medium">Start Copying</p>
                  <p className="text-sm text-muted-foreground">Attach EA to any chart and enable auto-trading</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
