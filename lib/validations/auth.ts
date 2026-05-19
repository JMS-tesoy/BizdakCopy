import { z } from "zod"
import { emailSchema } from "@/lib/validations/email"

export const authPlanSchema = z.enum(["trial", "pro", "profit-sharing"])

export const registrationPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character")

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export const registrationSchema = loginSchema.extend({
  password: registrationPasswordSchema,
  plan: authPlanSchema,
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegistrationFormValues = z.infer<typeof registrationSchema>
