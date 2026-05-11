"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Activity, CheckCircle2, Clock3, KeyRound, Radio } from "lucide-react"

const signals = [
  {
    symbol: "BTC-USDT",
    side: "BUY",
    entry: "64,250.0",
    stopLoss: "62,900.0",
    takeProfit: "67,800.0",
    latency: "34ms",
  },
  {
    symbol: "ETH-USDT",
    side: "BUY",
    entry: "3,120.4",
    stopLoss: "3,040.0",
    takeProfit: "3,285.0",
    latency: "41ms",
  },
  {
    symbol: "SOL-USDT",
    side: "SELL",
    entry: "147.80",
    stopLoss: "152.40",
    takeProfit: "139.50",
    latency: "29ms",
  },
]

const lifecycle = [
  { label: "Signal received", icon: Radio },
  { label: "OKX key verified", icon: KeyRound },
  { label: "Order sent to OKX", icon: Activity },
  { label: "OKX execution confirmed", icon: CheckCircle2 },
]

export function HeroSignalSimulator() {
  const [signalIndex, setSignalIndex] = React.useState(0)
  const [stepIndex, setStepIndex] = React.useState(0)
  const activeSignal = signals[signalIndex]

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setStepIndex((currentStep) => {
        if (currentStep < lifecycle.length - 1) {
          return currentStep + 1
        }

        setSignalIndex((currentSignal) => (currentSignal + 1) % signals.length)
        return 0
      })
    }, 1400)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <Card className="mx-auto mb-12 max-w-4xl bg-card/95 text-left shadow-sm ring-border/70">
      <CardHeader className="border-b border-border/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radio className="size-4 text-chart-2" aria-hidden="true" />
              Live Signal Simulator
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Watch how a copied trade moves from signal feed to OKX execution.
            </p>
          </div>
          <Badge className="w-fit gap-1.5 bg-chart-2 text-chart-2-foreground">
            <span className="size-1.5 rounded-full bg-current" />
            Streaming
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active signal</p>
                <p className="text-2xl font-semibold">{activeSignal.symbol}</p>
              </div>
              <Badge
                variant={activeSignal.side === "BUY" ? "default" : "secondary"}
                className="font-mono"
              >
                {activeSignal.side}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <SignalValue label="Entry" value={activeSignal.entry} />
              <SignalValue label="Stop" value={activeSignal.stopLoss} />
              <SignalValue label="Target" value={activeSignal.takeProfit} />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="size-4" aria-hidden="true" />
                Latency
              </span>
              <span className="font-mono font-medium">{activeSignal.latency}</span>
            </div>
          </div>

          <div className="grid gap-2">
            {lifecycle.map((item, index) => {
              const Icon = item.icon
              const isComplete = index <= stepIndex
              const isCurrent = index === stepIndex

              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-3 transition-colors",
                    isComplete
                      ? "border-chart-2/40 bg-chart-2/10"
                      : "border-border bg-background/50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg",
                        isComplete
                          ? "bg-chart-2 text-chart-2-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isComplete ? "text-chart-2" : "text-muted-foreground",
                    )}
                  >
                    {isCurrent ? "Processing" : isComplete ? "Done" : "Waiting"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SignalValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-medium">{value}</p>
    </div>
  )
}
