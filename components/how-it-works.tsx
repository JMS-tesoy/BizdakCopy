import { Card, CardContent } from "@/components/ui/card"
import { KeyRound, Settings2, UserPlus, Zap } from "lucide-react"

const steps = [
  {
    step: 1,
    title: "Create Account",
    description: "Sign up, choose your plan, and open a dashboard designed only for OKX copy trading.",
    icon: UserPlus,
  },
  {
    step: 2,
    title: "Connect OKX",
    description: "Add a restricted OKX API key so the platform can route copied trade instructions.",
    icon: KeyRound,
  },
  {
    step: 3,
    title: "Set Risk Rules",
    description: "Configure position sizing, max exposure, and copy limits before live signals run.",
    icon: Settings2,
  },
  {
    step: 4,
    title: "Auto Copy",
    description: "Trades are automatically copied to your account in real-time with minimal latency.",
    icon: Zap,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-fade-divider bg-muted/30 px-6 py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with a simple OKX setup flow. No external trading terminal required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((item) => (
            <Card key={item.step} className="bg-card relative overflow-hidden">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4 text-6xl font-bold text-muted/20">{item.step}</div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
