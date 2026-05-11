import { Card, CardContent } from "@/components/ui/card"
import { KeyRound, LockKeyhole, PauseCircle, ShieldCheck, SlidersHorizontal, ToggleLeft } from "lucide-react"

const controls = [
  {
    title: "No fund custody",
    description: "Your funds stay inside OKX while the platform focuses on routing approved copy trade instructions.",
    icon: ShieldCheck,
  },
  {
    title: "Restricted OKX API",
    description: "Followers connect their own OKX API Key, Secret Key, and Passphrase for signed requests.",
    icon: KeyRound,
  },
  {
    title: "Withdraw always off",
    description: "Read/View and Trade permissions are used for copying. Withdrawal permission is never required.",
    icon: LockKeyhole,
  },
  {
    title: "Risk limits first",
    description: "Configure max trade amount, max daily loss, allowed symbols, copy mode, and open-trade limits first.",
    icon: SlidersHorizontal,
  },
  {
    title: "Off by default",
    description: "Connecting an API key does not start copying. The account stays ready to enable after verification.",
    icon: ToggleLeft,
  },
  {
    title: "Pause anytime",
    description: "Users should always be able to pause or stop copying from dashboard controls, including emergency stop.",
    icon: PauseCircle,
  },
]

export function RiskControls() {
  return (
    <section id="risk-controls" className="section-fade-divider bg-muted/30 px-6 py-20">
      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Risk and follower protection</h2>
          <p className="text-muted-foreground">
            The platform focuses on signal delivery and OKX copier configuration without taking custody of trader funds.
            Copy trading starts only after risk setup, API verification, and manual activation.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
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
