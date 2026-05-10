import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Download, Link, Zap } from "lucide-react"

const steps = [
  {
    step: 1,
    title: "Create Account",
    description: "Sign up and choose your subscription plan. Get your unique API key instantly.",
    icon: UserPlus,
  },
  {
    step: 2,
    title: "Download EA",
    description: "Download our MT5 Follower Expert Advisor and install it on your terminal.",
    icon: Download,
  },
  {
    step: 3,
    title: "Connect API",
    description: "Enter your API key in the EA settings. Configure your lot size and risk parameters.",
    icon: Link,
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
    <section id="how-it-works" className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple 4-step process. No coding required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((item) => (
            <Card key={item.step} className="bg-card relative overflow-hidden">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4 text-6xl font-bold text-muted/20">{item.step}</div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
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
