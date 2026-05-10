import { HeroSection } from "@/components/hero-section"
import { PerformanceStats } from "@/components/performance-stats"
import { SignalPreview } from "@/components/signal-preview"
import { TradingHistory } from "@/components/trading-history"
import { HowItWorks } from "@/components/how-it-works"
import { RiskControls } from "@/components/risk-controls"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SignalPreview />
      <PerformanceStats />
      <TradingHistory />
      <HowItWorks />
      <RiskControls />
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  )
}
