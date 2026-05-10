import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  KeyRound,
  ServerCog,
} from "lucide-react"
import Link from "next/link"

const signals = [
  {
    symbol: "EURUSD",
    side: "BUY",
    entry: "1.08420",
    stopLoss: "1.07920",
    takeProfit: "1.09420",
    status: "Copied",
    age: "18s",
  },
  {
    symbol: "GBPJPY",
    side: "SELL",
    entry: "188.420",
    stopLoss: "189.050",
    takeProfit: "187.250",
    status: "Queued",
    age: "42s",
  },
  {
    symbol: "XAUUSD",
    side: "BUY",
    entry: "2031.20",
    stopLoss: "2024.80",
    takeProfit: "2044.00",
    status: "Copied",
    age: "1m",
  },
]

const dashboardStats = [
  { label: "API status", value: "Connected", icon: CheckCircle2 },
  { label: "Polling interval", value: "Realtime", icon: Activity },
  { label: "Auth method", value: "API key", icon: KeyRound },
]

export function SignalPreview() {
  return (
    <section className="section-fade-divider px-6 py-20">
      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Platform Preview
          </Badge>
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
            See how trades move from signal to MT5
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            A focused look at the live feed, account status, and API details traders use after signup.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="font-semibold">Live Signal Feed</h3>
                <p className="text-sm text-muted-foreground">Latest instructions ready for copier EAs</p>
              </div>
              <Badge className="gap-1.5 bg-chart-2 text-chart-2-foreground">
                <span className="size-1.5 rounded-full bg-current" />
                Online
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Pair</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Side</th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Entry</th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">SL</th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">TP</th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((signal) => (
                    <tr key={`${signal.symbol}-${signal.age}`} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-4 font-medium">{signal.symbol}</td>
                      <td className="px-5 py-4">
                        <Badge variant={signal.side === "BUY" ? "default" : "secondary"} className="font-mono">
                          {signal.side === "BUY" ? (
                            <ArrowUpRight className="mr-1 size-3" />
                          ) : (
                            <ArrowDownRight className="mr-1 size-3" />
                          )}
                          {signal.side}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm">{signal.entry}</td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-muted-foreground">
                        {signal.stopLoss}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-muted-foreground">
                        {signal.takeProfit}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock3 className="size-3.5" />
                          {signal.status} {signal.age} ago
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ServerCog className="size-5" />
                  Dashboard Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardStats.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="size-4" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Follower API key</span>
                    <Badge variant="outline">Protected</Badge>
                  </div>
                  <code className="block truncate rounded-md bg-background px-3 py-2 text-sm">
                    fbc_live_••••••••••••9k2a
                  </code>
                </div>

                <Button className="w-full" asChild>
                  <Link href="/register">Create Your Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
