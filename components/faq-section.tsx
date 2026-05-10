const faqs = [
  {
    question: "Do I need a VPS?",
    answer:
      "A VPS is recommended if you want the MT5 terminal and copier EA to stay online continuously, especially during active market sessions.",
  },
  {
    question: "Does it work with any broker?",
    answer:
      "It is designed for MT5 accounts. Broker execution, symbol naming, and account permissions can still affect final copying behavior.",
  },
  {
    question: "Can I stop copying?",
    answer:
      "Yes. Remove the EA, disable AutoTrading in MT5, or pause your subscription access from the platform workflow.",
  },
  {
    question: "What happens if MT5 is offline?",
    answer:
      "Signals can still be published by the platform, but your local EA must be running and connected to receive and execute them.",
  },
]

export function FaqSection() {
  return (
    <section className="px-6 py-20">
      <div className="container mx-auto">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Questions before you copy?</h2>
            <p className="text-muted-foreground">
              Clear answers for the operational details traders usually check before connecting an EA.
            </p>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="cursor-pointer list-none font-medium marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
