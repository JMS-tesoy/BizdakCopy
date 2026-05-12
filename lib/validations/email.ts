import { z } from "zod"

export const EMAIL_DOMAIN_TYPO_SUGGESTIONS = {
  "yahoomail.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "googlemail.con": "googlemail.com",
} as const

export const RECOGNIZED_YAHOO_DOMAINS = [
  "yahoo.com",
  "yahoo.com.ph",
  "ymail.com",
  "rocketmail.com",
  "myyahoo.com",
  "yahoo.co.uk",
  "yahoo.ca",
  "yahoo.com.au",
  "yahoo.co.jp",
  "yahoo.fr",
  "yahoo.de",
  "yahoo.it",
  "yahoo.es",
  "yahoo.com.sg",
  "yahoo.com.hk",
  "yahoo.co.in",
] as const

export const RECOGNIZED_GOOGLE_DOMAINS = ["gmail.com", "googlemail.com"] as const

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getEmailDomain(email: string) {
  const [, domain] = email.split("@")
  return domain
}

export function getEmailDomainSuggestion(email: string) {
  const domain = getEmailDomain(normalizeEmail(email))

  if (!domain) {
    return null
  }

  return EMAIL_DOMAIN_TYPO_SUGGESTIONS[domain as keyof typeof EMAIL_DOMAIN_TYPO_SUGGESTIONS] ?? null
}

export const emailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(z.string().min(1, "Email is required").email("Enter a valid email address"))
  .superRefine((email, ctx) => {
    const suggestedDomain = getEmailDomainSuggestion(email)

    if (!suggestedDomain) {
      return
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Did you mean @${suggestedDomain}?`,
    })
  })

