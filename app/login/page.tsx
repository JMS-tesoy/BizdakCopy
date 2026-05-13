import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Log in to your account</h1>
            <p className="text-muted-foreground">Log in to access your dashboard</p>
          </div>

          <LoginForm />
        </div>
      </section>

      <Footer />
    </main>
  )
}
