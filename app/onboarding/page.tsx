import type { Metadata } from "next"

import { OnboardingShell } from "@/components/onboarding/onboarding-shell"

export const metadata: Metadata = {
  title: "Follower Onboarding | Bizdak Copy",
  description: "Configure risk limits, connect restricted OKX API credentials, and manually enable copy trading.",
}

export default function OnboardingPage() {
  return <OnboardingShell />
}
