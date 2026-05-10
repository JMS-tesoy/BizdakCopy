import { Button } from "@/components/ui/button"
import { HeroSignalSimulator } from "@/components/hero-signal-simulator"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/50 px-4 py-2 rounded-full mb-6">
            <div className="size-2 bg-chart-2 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live Trading Performance</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance mb-6">
            Copy Professional Forex
            <span className="block text-primary">Trading Signals</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Connect your MT5 account and automatically mirror our proven trading strategies. Simple REST API integration
            with your Expert Advisor for seamless copy trading.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/register">
                Start Copying Now
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent" asChild>
              <Link href="/download">Download EA</Link>
            </Button>
          </div>

          <HeroSignalSimulator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="size-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-chart-2" />
              </div>
              <div className="text-left">
                <p className="font-semibold">+127.4%</p>
                <p className="text-sm text-muted-foreground">Annual Return</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <div className="size-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <Shield className="size-5 text-chart-1" />
              </div>
              <div className="text-left">
                <p className="font-semibold">12.3%</p>
                <p className="text-sm text-muted-foreground">Max Drawdown</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-end">
              <div className="size-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Zap className="size-5 text-chart-4" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{"< 50ms"}</p>
                <p className="text-sm text-muted-foreground">Signal Latency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
