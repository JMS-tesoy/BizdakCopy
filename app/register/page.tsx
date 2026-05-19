import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RegistrationForm } from "@/components/registration-form"
import { normalizePlanId } from "@/lib/plans"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const initialPlan = normalizePlanId(plan) ?? "pro"

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">Start copying professional trading signals in minutes</p>
          </div>

          <RegistrationForm initialPlan={initialPlan} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
