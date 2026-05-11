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
      "Yes. Copy trading should be paused or stopped from the dashboard at any time, and an emergency stop should remain visible in onboarding and dashboard views.",
  },
  {
    question: "What OKX API permissions are needed?",
    answer:
      "Use Read/View and Trade only. Withdraw permission is never required and must remain off. IP whitelisting is recommended when available.",
  },
  {
    question: "Does connecting my API key start copy trading immediately?",
    answer:
      "No. The backend verifies authentication, balance access, trading permission, and IP whitelist rules first. Copy trading remains off until you manually enable it.",
  },
  {
    question: "What happens to my Secret Key and Passphrase?",
    answer:
      "OKX requires an API Key, Secret Key, and Passphrase to authenticate signed trading requests. The Secret Key and Passphrase should be encrypted and never displayed again after saving.",
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
