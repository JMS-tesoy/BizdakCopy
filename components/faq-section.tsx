const faqs = [
  {
    question: "Do I need another trading platform?",
    answer:
      "No. This setup flow is designed for OKX users only, with connection handled through your OKX API access.",
  },
  {
    question: "Does it work with any exchange?",
    answer:
      "No. The product is positioned exclusively for OKX users. Other exchanges are outside this flow.",
  },
  {
    question: "Can I stop copying?",
    answer:
      "Yes. Disable copying from your dashboard, revoke the OKX API key, or pause subscription access from the platform workflow.",
  },
  {
    question: "What OKX API permissions are needed?",
    answer:
      "Use the least permissions required for your copying workflow and keep withdrawal permissions disabled.",
  },
]

export function FaqSection() {
  return (
    <section className="section-fade-divider px-6 py-20">
      <div className="container mx-auto">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Questions before you copy?</h2>
            <p className="text-muted-foreground">
              Clear answers for the operational details traders usually check before connecting OKX.
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
