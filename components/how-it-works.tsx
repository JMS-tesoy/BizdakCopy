import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, KeyRound, Settings2, ShieldCheck } from "lucide-react"

const steps = [
  {
    step: 1,
    title: "Review risk",
    description: "Review the strategy preview, drawdown, risk rules, and disclosure before starting follower setup.",
    icon: ShieldCheck,
  },
  {
    step: 2,
    title: "Configure limits",
    description: "Create your account, accept risk, then set trade size, daily loss, allowed symbols, and copy mode.",
    icon: Settings2,
  },
  {
    step: 3,
    title: "Connect OKX safely",
    description: "Submit a restricted OKX API Key, Secret Key, and Passphrase with Read and Trade on, Withdraw off.",
    icon: KeyRound,
  },
  {
    step: 4,
    title: "Enable manually",
    description: "The backend verifies access first. Copy trading stays off until you click Enable, and you can pause anytime.",
    icon: CheckCircle2,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-fade-divider bg-muted/30 px-6 py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A controlled OKX-only flow: registered, risk accepted, limits configured, API verified, ready to enable,
            active, or paused.
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
