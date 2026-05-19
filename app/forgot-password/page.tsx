"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, MailCheck } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { emailSchema } from "@/lib/validations/email"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const parsedEmail = emailSchema.safeParse(email)

    if (!parsedEmail.success) {
      setError(parsedEmail.error.issues[0]?.message ?? "Enter a valid email address.")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message || "Password reset could not be started.")
        return
      }

      setIsSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="px-6 pb-20 pt-32">
        <div className="container mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground">
              Enter your email and we&apos;ll send password reset instructions.
            </p>
          </div>

          <Card>
            {isSubmitted ? (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MailCheck aria-hidden="true" />
                  </div>
                  <CardTitle>Check your email</CardTitle>
                  <CardDescription>
                    If an account exists for that email, a secure reset link has been sent.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/login">Back to login</Link>
                  </Button>
                </CardFooter>
              </>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="flex flex-col gap-4 pt-6">
                  {error ? (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2" data-invalid={Boolean(error) || undefined}>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      aria-invalid={Boolean(error)}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        setError("")
                      }}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                    {isSubmitting ? "Sending reset link..." : "Send reset link"}
                  </Button>

                  <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                    Back to login
                  </Link>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
