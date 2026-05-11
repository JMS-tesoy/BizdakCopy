import { Card, CardContent } from "@/components/ui/card"
import { KeyRound, LockKeyhole, ShieldCheck, SlidersHorizontal } from "lucide-react"

const controls = [
  {
    title: "No fund custody",
    description: "Your funds stay inside OKX while the platform focuses on routing approved copy trade instructions.",
    icon: ShieldCheck,
  },
  {
    title: "Private API keys",
    description: "Each follower uses a unique key for signal access, account limits, and subscription checks.",
    icon: KeyRound,
  },
  {
    title: "OKX risk settings",
    description: "Configure position sizing, copy limits, and account exposure before copying begins.",
    icon: SlidersHorizontal,
  },
  {
    title: "Webhook protection",
    description: "Stripe subscription events are verified server-side before changing account status.",
    icon: LockKeyhole,
  },
]

export function RiskControls() {
  return (
    <section className="section-fade-divider bg-muted/30 px-6 py-20">
      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Built for controlled copy trading</h2>
          <p className="text-muted-foreground">
            The platform focuses on signal delivery, subscription access, and OKX copier configuration without taking
            custody of trader funds.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {controls.map((control) => (
            <Card key={control.title}>
              <CardContent className="p-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <control.icon className="size-5" />
                </div>
                <h3 className="mb-2 font-semibold">{control.title}</h3>
                <p className="text-sm text-muted-foreground">{control.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
