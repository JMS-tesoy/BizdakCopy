"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { PasswordInput } from "@/components/password-input"
import { registrationSchema, type RegistrationFormValues } from "@/lib/validations/auth"
import { PLAN_DETAILS, PLAN_IDS, type PlanId } from "@/lib/plans"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function RegistrationForm({ initialPlan = "pro" }: { initialPlan?: PlanId }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      plan: initialPlan,
    },
  })

  const selectedPlan = useWatch({ control, name: "plan" })

  async function initializeAccess(plan: PlanId) {
    const response = await fetch("/api/access/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Account access could not be initialized")
    }
  }

  async function onSubmit(values: RegistrationFormValues) {
    setError("")

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            selected_plan: values.plan,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message || "Registration failed")
        return
      }

      if (!data.user) {
        setError("Registration could not be completed. Please try again.")
        return
      }

      if (!data.session) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })

        if (loginError) {
          setError(
            "Account created. Please confirm your email, then log in to continue."
          )
          return
        }
      }

      await initializeAccess(values.plan)

      if (values.plan === "free") {
        router.push("/dashboard")
        router.refresh()
        return
      }

      router.push(`/checkout?plan=${values.plan}`)
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="pt-6 space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

          <div className="space-y-2" data-invalid={Boolean(errors.email) || undefined}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2" data-invalid={Boolean(errors.password) || undefined}>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <p className="text-sm text-muted-foreground">
              Use 8+ characters with uppercase, lowercase, number, and special character.
            </p>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Select Plan</Label>
            <RadioGroup
              value={selectedPlan}
              onValueChange={(value) => setValue("plan", value as RegistrationFormValues["plan"])}
            >
              {PLAN_IDS.map((planId) => {
                const plan = PLAN_DETAILS[planId]
                const isSelected = selectedPlan === planId

                return (
                <label
                  key={planId}
                  htmlFor={planId}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 transition-colors",
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={planId} id={planId} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{plan.name}</p>
                        {plan.badge ? <Badge>{plan.badge}</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.features.slice(0, 2).join(" • ")}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-right font-semibold">
                    {plan.price}
                    <span className="block text-xs font-normal text-muted-foreground">{plan.period}</span>
                  </span>
                </label>
                )
              })}
            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {selectedPlan === "free" ? "Create Free Account" : "Continue to Payment"}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
