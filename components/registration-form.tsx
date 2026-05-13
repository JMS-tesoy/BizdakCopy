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
import { registrationSchema, type RegistrationFormValues } from "@/lib/validations/auth"
import { PLAN_DETAILS, PLAN_IDS } from "@/lib/plans"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function RegistrationForm() {
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
      plan: "pro",
    },
  })

  const selectedPlan = useWatch({ control, name: "plan" })

  async function onSubmit(values: RegistrationFormValues) {
    setError("")

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            plan: values.plan,
            subscription_status: "inactive",
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

      sessionStorage.setItem(
        "pendingUser",
        JSON.stringify({ email: values.email, plan: values.plan, userId: data.user.id })
      )

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
            <Input
              id="password"
              type="password"
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

                return (
                <label
                  key={planId}
                  htmlFor={planId}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlan === planId ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={planId} id={planId} />
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">{plan.features[0]}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{plan.price}/mo</span>
                </label>
                )
              })}
            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue to Payment
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
