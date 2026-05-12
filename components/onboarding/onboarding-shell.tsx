"use client"

import { useEffect, useRef, useState } from "react"
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Database,
  Info,
  KeyRound,
  LayoutDashboard,
  Loader2,
  PauseCircle,
  Power,
  Save,
  Shield,
  SlidersHorizontal,
  UserRound,
  X,
  Zap,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { BusinessState, RiskSettings, TimelineEvent } from "./types"

const initialRiskSettings: RiskSettings = {
  copyMode: "Fixed USDT per trade",
  maxTrade: 10,
  dailyLoss: 50,
  maxOpenTrades: 3,
  allowedMarket: "Spot only",
  slippage: 0.5,
  allowedSymbols: "BTC-USDT, ETH-USDT, SOL-USDT",
}

const initialBusinessState: BusinessState = {
  accountCreated: false,
  riskAccepted: false,
  planActive: true,
  apiSubmitted: false,
  apiVerified: false,
  copyEnabled: false,
  onboardingStatus: "registered",
}

const initialTimelineEvents: TimelineEvent[] = [
  {
    id: "fresh-start",
    title: "Onboarding opened",
    description: "Fresh setup session started. Copy trading is OFF and nothing has been configured yet.",
    status: "warn",
    createdAt: "current session",
  },
]

type ToastState = {
  title: string
  message: string
  tone: "good" | "warn" | "bad"
}

type ProfileState = {
  displayName: string
  email: string
  country: string
}

type RiskAcknowledgements = {
  understandsLosses: boolean
  noWithdrawPermission: boolean
  canStopAnytime: boolean
  responsibleForAccount: boolean
}

type OkxCredentials = {
  apiKey: string
  secretKey: string
  passphrase: string
  environment: "Demo Trading" | "Live Trading"
}

type ValidationErrors<T extends string> = Partial<Record<T, string>>

const panelClass = "rounded-lg border border-border bg-card shadow-sm"
const stepCardClass = "rounded-lg border border-border bg-card p-5 shadow-sm"
const inputClass =
  "h-11 rounded-lg border-border bg-background px-3 font-medium text-foreground shadow-sm placeholder:text-muted-foreground/70 hover:bg-background focus-visible:border-border focus-visible:bg-background focus-visible:ring-0 read-only:cursor-default read-only:bg-muted/40 read-only:text-muted-foreground"
const dropdownTriggerClass =
  "h-11 w-full justify-between rounded-lg border-border/40 bg-card px-3 text-sm font-medium text-foreground shadow-sm hover:border-border/60 hover:bg-card focus-visible:border-border/50 focus-visible:ring-0 aria-invalid:border-destructive/60"
const cardToStepMap = [0, 1, 2, 3, 4, 5, 6, 7]
const stepToCardMap = [0, 1, 2, 3, 4, 5, 6, 7]
const countryGroups = [
  {
    region: "Southeast Asia",
    countries: ["Philippines", "Singapore", "Malaysia", "Thailand", "Vietnam", "Indonesia"],
  },
  {
    region: "East Asia",
    countries: ["Japan", "South Korea", "Hong Kong", "Taiwan"],
  },
  {
    region: "West Asia / GCC",
    countries: ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain"],
  },
]
const copyModeOptions: RiskSettings["copyMode"][] = ["Fixed USDT per trade", "Equity percentage", "Multiplier"]
const allowedMarketOptions: RiskSettings["allowedMarket"][] = ["Spot only", "Futures - later"]
const environmentOptions: OkxCredentials["environment"][] = ["Demo Trading", "Live Trading"]

export function OnboardingShell() {
  const [profile, setProfile] = useState<ProfileState>({
    displayName: "",
    email: "",
    country: "",
  })
  const [riskAcknowledgements, setRiskAcknowledgements] = useState<RiskAcknowledgements>({
    understandsLosses: false,
    noWithdrawPermission: false,
    canStopAnytime: false,
    responsibleForAccount: false,
  })
  const [okxCredentials, setOkxCredentials] = useState<OkxCredentials>({
    apiKey: "",
    secretKey: "",
    passphrase: "",
    environment: "Demo Trading",
  })
  const [profileErrors, setProfileErrors] = useState<ValidationErrors<keyof ProfileState>>({})
  const [credentialErrors, setCredentialErrors] = useState<ValidationErrors<keyof OkxCredentials>>({})
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(initialRiskSettings)
  const [businessState, setBusinessState] = useState<BusinessState>(initialBusinessState)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialTimelineEvents)
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false)
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [toastState, setToastState] = useState<ToastState | null>(null)
  const [activeOnboardingStep, setActiveOnboardingStep] = useState(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const riskAcceptedAt = businessState.riskAccepted ? "saved in current session" : "not accepted yet"
  const apiStorageStatus = businessState.apiSubmitted ? "encrypted payload" : "not submitted"
  const isRiskConfigured = [
    "risk_configured",
    "api_submitted",
    "api_verified",
    "ready_to_enable",
    "active",
    "copy_paused",
  ].includes(businessState.onboardingStatus)

  const apiStatus = businessState.apiVerified ? "Verified" : "Pending"
  const copyStatus = businessState.copyEnabled ? "ON" : "OFF"
  const statusCopy = businessState.copyEnabled
    ? "Status: onboarding completed. Copy trading is active and protected by risk limits."
    : businessState.apiVerified
      ? "Status: API verified. User must manually enable copy trading."
      : businessState.apiSubmitted
        ? "Status: OKX API submitted, waiting for verification and activation confirmation."
        : "Status: complete profile, risk acknowledgement, and OKX API submission before verification."
  const businessBadge = businessState.copyEnabled
    ? { label: "Active follower", tone: "good" as const }
    : businessState.apiVerified
      ? { label: "Ready to activate", tone: "warn" as const }
      : { label: "Pre-activation", tone: "blue" as const }
  const wizardStep = businessState.copyEnabled
    ? { label: "Completed", tone: "good" as const }
    : businessState.apiVerified
      ? { label: "Step 7 of 8", tone: "warn" as const }
      : businessState.apiSubmitted
        ? { label: "Step 6 of 8", tone: "warn" as const }
        : { label: "In progress", tone: "warn" as const }

  useEffect(() => {
    if (!toastState) return

    const timer = window.setTimeout(() => setToastState(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toastState])

  function showToast(message: string, tone: ToastState["tone"] = "good", title = "Onboarding update") {
    setToastState({ title, message, tone })
  }

  function addTimelineEvent(event: Omit<TimelineEvent, "id" | "createdAt">) {
    setTimelineEvents((current) => [
      {
        ...event,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toLocaleString(),
      },
      ...current,
    ])
  }

  function validateProfile(nextProfile: ProfileState) {
    const errors: ValidationErrors<keyof ProfileState> = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!nextProfile.displayName.trim()) {
      errors.displayName = "Display name is required."
    } else if (nextProfile.displayName.trim().length < 2) {
      errors.displayName = "Use at least 2 characters."
    }

    if (!nextProfile.email.trim()) {
      errors.email = "Email is required."
    } else if (!emailPattern.test(nextProfile.email.trim())) {
      errors.email = "Enter a valid email address."
    }

    if (!nextProfile.country.trim()) {
      errors.country = "Country is required."
    }

    return errors
  }

  function validateOkxCredentials(nextCredentials: OkxCredentials) {
    const errors: ValidationErrors<keyof OkxCredentials> = {}

    if (!nextCredentials.apiKey.trim()) {
      errors.apiKey = "API Key is required."
    } else if (nextCredentials.apiKey.trim().length < 8) {
      errors.apiKey = "API Key looks too short."
    }

    if (!nextCredentials.secretKey.trim()) {
      errors.secretKey = "Secret Key is required."
    } else if (nextCredentials.secretKey.trim().length < 8) {
      errors.secretKey = "Secret Key looks too short."
    }

    if (!nextCredentials.passphrase.trim()) {
      errors.passphrase = "Passphrase is required."
    } else if (nextCredentials.passphrase.trim().length < 4) {
      errors.passphrase = "Passphrase looks too short."
    }

    if (!nextCredentials.environment) {
      errors.environment = "Choose an environment."
    }

    return errors
  }

  function updateProfile(field: keyof ProfileState, value: string) {
    setProfile((current) => ({ ...current, [field]: value }))
    setProfileErrors((current) => ({ ...current, [field]: undefined }))
    if (businessState.accountCreated) {
      setBusinessState((current) => ({ ...current, accountCreated: false, onboardingStatus: "registered" }))
    }
  }

  function saveProfile() {
    const errors = validateProfile(profile)

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      showToast("Fix the highlighted profile fields before continuing.", "warn", "Profile incomplete")
      return
    }

    const nextProfile = {
      displayName: profile.displayName.trim(),
      email: profile.email.trim(),
      country: profile.country.trim(),
    }

    setProfile(nextProfile)
    setProfileErrors({})
    setBusinessState((current) => ({ ...current, accountCreated: true, onboardingStatus: "registered" }))
    addTimelineEvent({
      title: "Profile confirmed",
      description: `${nextProfile.displayName} confirmed account details for onboarding.`,
      status: "good",
    })
    showToast("Profile details confirmed.")
  }

  function toggleRiskAcknowledgement(field: keyof RiskAcknowledgements) {
    const next = { ...riskAcknowledgements, [field]: !riskAcknowledgements[field] }

    setRiskAcknowledgements(next)
    if (businessState.riskAccepted && !next[field]) {
      setBusinessState((business) => ({
        ...business,
        riskAccepted: false,
        apiSubmitted: false,
        apiVerified: false,
        copyEnabled: false,
        onboardingStatus: "registered",
      }))
      showToast("Risk acknowledgement was changed. Accept it again before continuing.", "warn", "Risk reset")
    }
  }

  function acceptRiskAcknowledgement() {
    const accepted = Object.values(riskAcknowledgements).every(Boolean)

    if (!accepted) {
      showToast("Check every risk acknowledgement before accepting.", "warn", "Risk acknowledgement required")
      return
    }

    setBusinessState((business) => ({
      ...business,
      riskAccepted: true,
      onboardingStatus: "risk_accepted",
    }))
    addTimelineEvent({
      title: "Risk acknowledgement accepted",
      description: "All user risk acknowledgements are checked. Withdrawal permission remains off.",
      status: "good",
    })
    showToast("Risk acknowledgement accepted.")
  }

  function updateOkxCredential(field: keyof OkxCredentials, value: string) {
    setOkxCredentials((current) => ({ ...current, [field]: value }))
    setCredentialErrors((current) => ({ ...current, [field]: undefined }))
    if (businessState.apiSubmitted || businessState.apiVerified) {
      setBusinessState((current) => ({
        ...current,
        apiSubmitted: false,
        apiVerified: false,
        copyEnabled: false,
        onboardingStatus: "risk_configured",
      }))
    }
  }

  function submitApiCredentials() {
    if (!businessState.accountCreated) {
      showToast("Confirm your profile before submitting OKX credentials.", "warn", "Profile required")
      return
    }

    if (!businessState.riskAccepted) {
      showToast("Accept the risk acknowledgement before submitting OKX credentials.", "warn", "Risk required")
      return
    }

    const errors = validateOkxCredentials(okxCredentials)

    if (Object.keys(errors).length > 0) {
      setCredentialErrors(errors)
      showToast("Fix the highlighted OKX credential fields before continuing.", "warn", "Credentials incomplete")
      return
    }

    setOkxCredentials((current) => ({
      ...current,
      apiKey: current.apiKey.trim(),
      secretKey: current.secretKey.trim(),
      passphrase: current.passphrase.trim(),
    }))
    setCredentialErrors({})
    setBusinessState((current) => ({
      ...current,
      apiSubmitted: true,
      apiVerified: false,
      copyEnabled: false,
      onboardingStatus: "api_submitted",
    }))
    addTimelineEvent({
      title: "OKX API credentials submitted",
      description: "API Key received. Secret Key and Passphrase are treated as encrypted write-only values.",
      status: "warn",
    })
    showToast("OKX credentials submitted for verification.")
  }

  function updateRiskSettings(nextSettings: RiskSettings) {
    setRiskSettings(nextSettings)
    setBusinessState((current) => ({
      ...current,
      onboardingStatus: current.apiSubmitted ? current.onboardingStatus : "risk_configured",
    }))
    addTimelineEvent({
      title: "Risk settings updated",
      description: `Max per trade: ${nextSettings.maxTrade} USDT. Daily loss: ${nextSettings.dailyLoss} USDT. Symbols: ${nextSettings.allowedSymbols}.`,
      status: "good",
    })
    showToast(`Saved: ${nextSettings.maxTrade} USDT max per trade, ${nextSettings.dailyLoss} USDT daily loss.`)
  }

  function testApiKey() {
    if (isTestingApi) return

    if (!businessState.accountCreated) {
      showToast("Confirm your profile before testing the OKX API key.", "warn", "Profile required")
      return
    }

    if (!businessState.riskAccepted) {
      showToast("Accept the risk acknowledgement before testing the OKX API key.", "warn", "Risk required")
      return
    }

    if (!businessState.apiSubmitted) {
      addTimelineEvent({
        title: "API test blocked",
        description: "User tried to test the OKX API before submitting API Key, Secret Key, and Passphrase.",
        status: "warn",
      })
      showToast("Submit OKX API credentials before testing the key.", "warn", "Credentials required")
      return
    }

    setIsTestingApi(true)
    showToast(
      "Simulating OKX API authentication, balance read, trade permission, and IP whitelist check.",
      "warn",
      "Testing API"
    )

    window.setTimeout(() => {
      setBusinessState((current) => ({
        ...current,
        apiVerified: true,
        copyEnabled: false,
        onboardingStatus: "api_verified",
      }))
      setIsTestingApi(false)
      addTimelineEvent({
        title: "API verification completed",
        description: "Authentication, balance read, trade permission, and server IP whitelist checks passed.",
        status: "good",
      })
      showToast("OKX API verified. User may now manually enable copy trading.")
    }, 900)
  }

  function enableCopyTrading() {
    if (!businessState.accountCreated || !businessState.riskAccepted || !businessState.planActive) {
      addTimelineEvent({
        title: "Activation blocked",
        description: "Profile confirmation, risk acknowledgement, and active plan are required before activation.",
        status: "warn",
      })
      showToast("Activation blocked: complete profile, risk, and plan requirements first.", "warn", "Activation blocked")
      return
    }

    if (!businessState.apiVerified) {
      addTimelineEvent({
        title: "Activation blocked",
        description: "User tried to enable copy trading before OKX API verification was completed.",
        status: "warn",
      })
      showToast("Activation blocked: test and verify the OKX API key first.", "warn", "Activation blocked")
      return
    }

    setBusinessState((current) => ({
      ...current,
      copyEnabled: true,
      onboardingStatus: "active",
    }))
    addTimelineEvent({
      title: "Copy trading activated",
      description: `Follower is now active with ${riskSettings.maxTrade} USDT max per trade and ${riskSettings.dailyLoss} USDT daily loss limit.`,
      status: "good",
    })
    showToast("Copy trading is now active. Risk limits and emergency stop remain available.")
  }

  function stopCopyTrading() {
    if (!businessState.copyEnabled) {
      showToast("Copy trading is already OFF.", "warn", "No change")
      return
    }

    setBusinessState((current) => ({
      ...current,
      copyEnabled: false,
      onboardingStatus: "copy_paused",
    }))
    addTimelineEvent({
      title: "Emergency stop triggered",
      description: "Copy trading was paused immediately. No new copied trades will be placed.",
      status: "bad",
    })
    showToast("Copy trading stopped. No new copied trades will be placed.", "warn", "Copy trading paused")
  }

  function saveDraft() {
    const payload = {
      businessState,
      profile,
      riskAcknowledgements,
      riskSettings,
      okxCredentials: {
        apiKey: okxCredentials.apiKey,
        secretKey: okxCredentials.secretKey ? "[sensitive]" : "",
        passphrase: okxCredentials.passphrase ? "[sensitive]" : "",
        environment: okxCredentials.environment,
      },
      savedAt: new Date().toISOString(),
    }
    window.localStorage.setItem("copytrade_onboarding_draft", JSON.stringify(payload))
    addTimelineEvent({
      title: "Onboarding draft saved",
      description: "Current onboarding state was saved to browser local storage.",
      status: "good",
    })
    showToast("Draft saved in this browser.")
  }

  function goBack() {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    setActiveOnboardingStep(0)
    showToast("Returned to the top of the onboarding workspace.", "warn", "Back")
  }

  function handleCenterScroll() {
    const container = scrollRef.current
    if (!container) return

    const containerTop = container.getBoundingClientRect().top
    let closestCardIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY

    cardRefs.current.forEach((card, index) => {
      if (!card) return

      const distance = Math.abs(card.getBoundingClientRect().top - containerTop - 8)
      if (distance < closestDistance) {
        closestDistance = distance
        closestCardIndex = index
      }
    })

    const nextStep = cardToStepMap[closestCardIndex] ?? 0
    setActiveOnboardingStep((current) => (current === nextStep ? current : nextStep))
  }

  function scrollToOnboardingStep(stepIndex: number) {
    const container = scrollRef.current
    const card = cardRefs.current[stepToCardMap[stepIndex]]
    if (!container || !card) return

    setActiveOnboardingStep(stepIndex)
    container.scrollTo({
      top: Math.max(card.offsetTop - 8, 0),
      behavior: "smooth",
    })
  }

  return (
    <div className="h-screen overflow-hidden bg-background bg-page-texture text-foreground">
      {isRiskModalOpen ? (
        <RiskSettingsModal
          riskSettings={riskSettings}
          onClose={() => setIsRiskModalOpen(false)}
          onSave={updateRiskSettings}
        />
      ) : null}
      <OnboardingToast toast={toastState} />

      <div className="grid h-screen overflow-hidden bg-background/80 xl:grid-cols-[280px_minmax(0,1fr)_360px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <OnboardingSidebar />

        <main className="grid h-screen min-h-0 min-w-0 grid-rows-[76px_minmax(0,1fr)_auto] overflow-hidden border-r border-border max-lg:border-r-0">
          <OnboardingTopbar statusCopy={statusCopy} step={wizardStep} />

          <section className="min-h-0 overflow-hidden p-5 md:p-6">
            <div className="mx-auto grid h-full max-w-[1120px] grid-rows-[auto_minmax(0,1fr)] gap-5">
              <OnboardingStatusPanel
                apiStatus={apiStatus}
                copyStatus={copyStatus}
                businessBadge={businessBadge}
                businessState={businessState}
              />

              <section className="grid h-full min-h-0 overflow-hidden gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                <OnboardingStepper
                  businessState={businessState}
                  activeStep={activeOnboardingStep}
                  onStepSelect={scrollToOnboardingStep}
                />

                <div
                  ref={scrollRef}
                  className="grid h-full min-h-0 content-start gap-5 overflow-y-auto overflow-x-hidden overscroll-contain pr-2"
                  onScroll={handleCenterScroll}
                >
                  <div ref={(node) => { cardRefs.current[0] = node }}>
                    <AccountProfileCard
                      profile={profile}
                      isSaved={businessState.accountCreated}
                      errors={profileErrors}
                      onChange={updateProfile}
                      onSave={saveProfile}
                    />
                  </div>
                  <div ref={(node) => { cardRefs.current[1] = node }}>
                    <RiskDisclosureCard
                      acknowledgements={riskAcknowledgements}
                      isAccepted={businessState.riskAccepted}
                      onToggle={toggleRiskAcknowledgement}
                      onAccept={acceptRiskAcknowledgement}
                    />
                  </div>
                  <div ref={(node) => { cardRefs.current[2] = node }}>
                  <RiskSettingsCard
                    riskSettings={riskSettings}
                    isConfigured={isRiskConfigured}
                    onOpenRiskSettings={() => setIsRiskModalOpen(true)}
                  />
                  </div>
                  <div ref={(node) => { cardRefs.current[3] = node }}>
                    <OkxApiGuideCard />
                  </div>
                  <div ref={(node) => { cardRefs.current[4] = node }}>
                    <OkxApiCredentialsCard
                      credentials={okxCredentials}
                      isSubmitted={businessState.apiSubmitted}
                      errors={credentialErrors}
                      onChange={updateOkxCredential}
                      onSubmit={submitApiCredentials}
                    />
                  </div>
                  <div ref={(node) => { cardRefs.current[5] = node }}>
                    <VerificationResultCard businessState={businessState} />
                  </div>
                  <div ref={(node) => { cardRefs.current[6] = node }}>
                    <ActivationCard businessState={businessState} apiStatus={apiStatus} copyStatus={copyStatus} />
                  </div>
                  <div ref={(node) => { cardRefs.current[7] = node }}>
                    <PostOnboardingDashboardCard
                      apiStatus={apiStatus}
                      copyStatus={copyStatus}
                      riskSettings={riskSettings}
                      onStopCopyTrading={stopCopyTrading}
                      onOpenRiskSettings={() => setIsRiskModalOpen(true)}
                    />
                  </div>
                </div>
              </section>
            </div>
          </section>

          <OnboardingBottomActions
            isTestingApi={isTestingApi}
            isApiVerified={businessState.apiVerified}
            onBack={goBack}
            onSaveDraft={saveDraft}
            onTestApiKey={testApiKey}
            onEnableCopyTrading={enableCopyTrading}
          />
        </main>

        <aside className="hidden h-screen content-start gap-4 overflow-auto border-l border-border bg-muted/30 p-5 xl:grid">
          <ConfigurationDatabasePanel
            businessState={businessState}
            riskSettings={riskSettings}
            isRiskConfigured={isRiskConfigured}
            riskAcceptedAt={riskAcceptedAt}
            apiStorageStatus={apiStorageStatus}
          />
          <OnboardingTimelinePanel timelineEvents={timelineEvents} />
          <MobileDeviceConnectCard onAcknowledge={() => showToast("Mobile setup reminder acknowledged.")} />
        </aside>
      </div>
    </div>
  )
}

function OnboardingSidebar() {
  const navItems = [
    { icon: Activity, label: "Follower Onboarding", active: true },
    { icon: LayoutDashboard, label: "Copy Dashboard" },
    { icon: Zap, label: "Master Trades" },
    { icon: UserRound, label: "Followers" },
    { icon: Shield, label: "Risk Controls" },
  ]

  return (
    <aside className="flex h-screen flex-col gap-5 overflow-auto border-r border-border bg-muted/30 p-5 max-md:h-auto">
      <div className="flex items-center gap-3 pb-2 font-black">
        <div className="grid size-11 place-items-center rounded-lg bg-primary font-black text-primary-foreground shadow-sm">
          BD
        </div>
        <div>
          <div className="tracking-tight">Bizdak Copy</div>
          <div className="text-xs font-semibold text-muted-foreground">Follower Setup Guide</div>
        </div>
      </div>

      <SidebarSection title="Workspace">
        {navItems.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </SidebarSection>

      <div className="mt-auto rounded-lg border border-border bg-card p-4 shadow-sm">
        <strong className="mb-2 block text-sm">Before activation</strong>
        <p className="text-xs leading-6 text-muted-foreground">
          API connected does not mean copy trading is active. The user must verify the key and manually enable copying.
        </p>
      </div>
    </aside>
  )
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">{title}</div>
      <div className="grid gap-2">{children}</div>
    </div>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm font-bold text-muted-foreground",
        active && "border-border bg-background text-foreground shadow-sm"
      )}
    >
      <span className="grid size-6 place-items-center rounded-lg bg-muted">
        <Icon />
      </span>
      <span>{label}</span>
    </div>
  )
}

function OnboardingTopbar({
  statusCopy,
  step,
}: {
  statusCopy: string
  step: { label: string; tone: "good" | "warn" }
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background/80 px-5 py-4 backdrop-blur md:px-6 max-md:flex-col max-md:items-stretch">
      <div>
        <h1 className="text-[22px] font-black leading-tight tracking-tight">Follower Onboarding Guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">{statusCopy}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 max-md:justify-start">
        <StatusPill tone="good">Allow viewing and trading only</StatusPill>
        <StatusPill tone="warn">Never allow withdrawals</StatusPill>
        <StatusBadge tone={step.tone}>{step.label}</StatusBadge>
      </div>
    </header>
  )
}

function OnboardingStatusPanel({
  apiStatus,
  copyStatus,
  businessBadge,
  businessState,
}: {
  apiStatus: string
  copyStatus: string
  businessBadge: { label: string; tone: "good" | "warn" | "blue" }
  businessState: BusinessState
}) {
  return (
    <section className={cn(panelClass, "grid gap-5 p-5 md:p-6")}>
      <div className="flex items-start justify-between gap-5 max-md:flex-col">
        <div>
          <h2 className="max-w-3xl text-3xl font-black leading-none tracking-tight md:text-[30px]">
            Set up your OKX copy trading account safely.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Follow each step to review risk, configure your copy limits, connect a restricted OKX API key, and manually
            enable copy trading only when you are ready.
          </p>
        </div>
        <StatusBadge tone={businessBadge.tone}>{businessBadge.label}</StatusBadge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <DashCard
          icon={UserRound}
          label="Profile"
          value={businessState.accountCreated ? "Confirmed" : "Pending"}
          tone={businessState.accountCreated ? "good" : "warn"}
        />
        <DashCard
          icon={Shield}
          label="Risk Terms"
          value={businessState.riskAccepted ? "Accepted" : "Required"}
          tone={businessState.riskAccepted ? "good" : "warn"}
        />
        <DashCard
          icon={KeyRound}
          label="API Verification"
          value={businessState.apiSubmitted ? apiStatus : "Not submitted"}
          tone={businessState.apiVerified ? "good" : "warn"}
        />
        <DashCard
          icon={Power}
          label="Copy Trading"
          value={copyStatus}
          tone={businessState.copyEnabled ? "good" : "warn"}
        />
      </div>

    </section>
  )
}

function OnboardingStepper({
  businessState,
  activeStep,
  onStepSelect,
}: {
  businessState: BusinessState
  activeStep: number
  onStepSelect: (stepIndex: number) => void
}) {
  const isRiskConfigured = [
    "risk_configured",
    "api_submitted",
    "api_verified",
    "ready_to_enable",
    "active",
    "copy_paused",
  ].includes(businessState.onboardingStatus)
  const items = [
    {
      title: "Profile",
      description: businessState.accountCreated ? "Account confirmed" : "Confirm account",
      tone: businessState.accountCreated ? ("good" as const) : ("warn" as const),
    },
    {
      title: "Risk",
      description: businessState.riskAccepted ? "Terms accepted" : "Accept terms",
      tone: businessState.riskAccepted ? ("good" as const) : ("warn" as const),
    },
    {
      title: "Copy config",
      description: isRiskConfigured ? "Limits configured" : "Review limits",
      tone: isRiskConfigured ? ("good" as const) : ("warn" as const),
    },
    {
      title: "API guide",
      description: businessState.apiSubmitted ? "Guide reviewed" : "Setup instructions",
      tone: businessState.apiSubmitted ? ("good" as const) : ("warn" as const),
    },
    {
      title: "OKX credentials",
      description: businessState.apiSubmitted ? "Credentials submitted" : "Connect credentials",
      tone: businessState.apiSubmitted ? ("good" as const) : ("warn" as const),
    },
    {
      title: "Verification",
      description: businessState.apiVerified ? "Verified" : "Verification pending",
      tone: businessState.apiVerified ? ("good" as const) : ("warn" as const),
    },
    {
      title: "Activation",
      description: businessState.copyEnabled ? "Active" : "Manual enable",
      tone: businessState.copyEnabled ? ("good" as const) : ("warn" as const),
    },
    {
      title: "Dashboard",
      description: businessState.copyEnabled ? "Controls and stop" : "Available after activation",
      tone: businessState.copyEnabled ? ("good" as const) : ("warn" as const),
    },
  ]

  return (
    <aside className="sticky top-0 rounded-lg border border-border bg-card p-3 shadow-sm max-lg:static">
      {items.map((item, index) => (
        <button
          type="button"
          key={item.title}
          onClick={() => onStepSelect(index)}
          className={cn(
            "grid w-full grid-cols-[28px_1fr] gap-3 rounded-lg border border-transparent p-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/40",
            item.tone === "good" && "text-foreground",
            activeStep === index && "border-border bg-muted/50 text-foreground shadow-sm"
          )}
        >
          <Dot tone={item.tone}>{item.tone === "good" ? "OK" : "!"}</Dot>
          <div>
            <strong className="block text-[13px]">{item.title}</strong>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.description}</span>
          </div>
        </button>
      ))}
    </aside>
  )
}

function AccountProfileCard({
  profile,
  isSaved,
  errors,
  onChange,
  onSave,
}: {
  profile: ProfileState
  isSaved: boolean
  errors: ValidationErrors<keyof ProfileState>
  onChange: (field: keyof ProfileState, value: string) => void
  onSave: () => void
}) {
  return (
    <StepCard title="1. Account profile" badge={<StatusBadge tone={isSaved ? "good" : "warn"}>{isSaved ? "Confirmed" : "Action needed"}</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        Collect basic identity and create a follower profile. This is not KYC, just your app-level account setup.
      </p>
      <CardHint>Confirm your follower account details before continuing.</CardHint>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Display name" error={errors.displayName}>
          <Input
            aria-invalid={Boolean(errors.displayName)}
            className={inputClass}
            value={profile.displayName}
            onChange={(event) => onChange("displayName", event.target.value)}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            aria-invalid={Boolean(errors.email)}
            className={inputClass}
            type="email"
            value={profile.email}
            onChange={(event) => onChange("email", event.target.value)}
          />
        </Field>
        <Field label="Country" error={errors.country}>
          <CountryDropdown
            ariaInvalid={Boolean(errors.country)}
            value={profile.country}
            onChange={(country) => onChange("country", country)}
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="button" className="h-11" onClick={onSave}>
          {isSaved ? "Profile Confirmed" : "Confirm Profile"}
        </Button>
      </div>
    </StepCard>
  )
}

function RiskDisclosureCard({
  acknowledgements,
  isAccepted,
  onToggle,
  onAccept,
}: {
  acknowledgements: RiskAcknowledgements
  isAccepted: boolean
  onToggle: (field: keyof RiskAcknowledgements) => void
  onAccept: () => void
}) {
  const allChecked = Object.values(acknowledgements).every(Boolean)

  return (
    <StepCard danger title="2. Risk acknowledgement" badge={<StatusBadge tone={isAccepted ? "good" : "warn"}>{isAccepted ? "Accepted" : "Required"}</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        User must explicitly accept that copy trading can lose money and API keys can execute real trades.
      </p>
      <CardHint>Read this carefully before connecting an API key or enabling copied trades.</CardHint>
      <Callout tone="bad">
        Copy trading involves financial risk. You are responsible for your OKX account, API permissions, leverage,
        balances, losses, and trading decisions. Never enable withdrawal permission.
      </Callout>
      <div className="text-sm font-semibold">Required acknowledgements</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <RiskToggle
          checked={acknowledgements.understandsLosses}
          onClick={() => onToggle("understandsLosses")}
        >
          I understand trades may lose money.
        </RiskToggle>
        <RiskToggle
          checked={acknowledgements.noWithdrawPermission}
          onClick={() => onToggle("noWithdrawPermission")}
        >
          I will not enable withdrawal permission.
        </RiskToggle>
        <RiskToggle checked={acknowledgements.canStopAnytime} onClick={() => onToggle("canStopAnytime")}>
          I can stop copy trading anytime.
        </RiskToggle>
        <RiskToggle
          checked={acknowledgements.responsibleForAccount}
          onClick={() => onToggle("responsibleForAccount")}
        >
          I am responsible for my OKX account.
        </RiskToggle>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/60 p-3">
        <span className="text-sm text-muted-foreground">
          {isAccepted
            ? "Risk acknowledgement is saved for this session."
            : allChecked
              ? "All items are checked. Confirm your acknowledgement to continue."
              : "Check all items to enable acceptance."}
        </span>
        <Button type="button" className="h-11" disabled={!allChecked || isAccepted} onClick={onAccept}>
          {isAccepted ? "Risk Accepted" : "Accept Risk Acknowledgement"}
        </Button>
      </div>
    </StepCard>
  )
}

function RiskSettingsCard({
  riskSettings,
  isConfigured,
  onOpenRiskSettings,
}: {
  riskSettings: RiskSettings
  isConfigured: boolean
  onOpenRiskSettings: () => void
}) {
  return (
    <StepCard
      title="3. Copy trading configuration"
      badge={<StatusBadge tone={isConfigured ? "good" : "warn"}>{isConfigured ? "Configured" : "Needs review"}</StatusBadge>}
    >
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        These limits protect the follower before their OKX API key is allowed to execute trades.
      </p>
      <CardHint>Review your max trade size, daily loss cap, allowed symbols, and slippage limit.</CardHint>
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Copy mode">
          <OnboardingDropdown
            value={riskSettings.copyMode}
            options={copyModeOptions}
            onChange={() => undefined}
            readOnly
          />
        </Field>
        <Field label="Fixed amount">
          <Input className={inputClass} value={`${riskSettings.maxTrade} USDT`} readOnly />
        </Field>
        <Field label="Max daily loss">
          <Input className={inputClass} value={`${riskSettings.dailyLoss} USDT`} readOnly />
        </Field>
        <Field label="Max open trades">
          <Input className={inputClass} value={riskSettings.maxOpenTrades} readOnly />
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Allowed market">
          <OnboardingDropdown
            value={riskSettings.allowedMarket}
            options={allowedMarketOptions}
            onChange={() => undefined}
            readOnly
          />
        </Field>
        <Field label="Allowed symbols">
          <Input className={inputClass} value={riskSettings.allowedSymbols} readOnly />
        </Field>
        <Field label="Slippage limit">
          <Input className={inputClass} value={`${riskSettings.slippage.toFixed(2)}%`} readOnly />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" className="h-11 bg-transparent" onClick={onOpenRiskSettings}>
          <SlidersHorizontal data-icon="inline-start" />
          Update Risk Settings
        </Button>
      </div>
    </StepCard>
  )
}

function OkxApiGuideCard() {
  return (
    <StepCard highlight title="4. OKX API setup instructions" badge={<StatusBadge tone="blue">Guide</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        Show this before the API form so users create the key correctly inside OKX.
      </p>
      <CardHint>Create a restricted OKX API key with Read/View and Trade only.</CardHint>
      <Callout tone="blue">
        Create a restricted OKX API key with Read/View ON and Trade ON. Keep Withdraw OFF. Add our backend server IP to
        your OKX IP whitelist if available.
      </Callout>
      <div className="grid gap-3 md:grid-cols-3">
        <PermissionCard tone="good" title="Read / View: ON">
          Required to check balance, orders, positions, and account status.
        </PermissionCard>
        <PermissionCard tone="good" title="Trade: ON">
          Required to copy trades to the follower account.
        </PermissionCard>
        <PermissionCard tone="bad" title="Withdraw: OFF">
          Must never be enabled. Your app should reject this setup.
        </PermissionCard>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-border bg-muted/50 p-3 text-sm text-foreground max-sm:flex-col max-sm:items-start">
        <span>Whitelist this backend server IP in OKX API settings:</span>
        <code className="font-black text-foreground">123.45.67.89</code>
      </div>
      <Callout tone="blue">
        Recommended: create a separate OKX sub-account for copy trading, fund it with a small test balance, then create
        the API key from that sub-account.
      </Callout>
    </StepCard>
  )
}

function OkxApiCredentialsCard({
  credentials,
  isSubmitted,
  errors,
  onChange,
  onSubmit,
}: {
  credentials: OkxCredentials
  isSubmitted: boolean
  errors: ValidationErrors<keyof OkxCredentials>
  onChange: (field: keyof OkxCredentials, value: string) => void
  onSubmit: () => void
}) {
  return (
    <StepCard title="5. Connect OKX API credentials" badge={<StatusBadge tone={isSubmitted ? "good" : "warn"}>{isSubmitted ? "Submitted" : "Needs submission"}</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        OKX requires API Key, Secret Key, and Passphrase to authenticate and sign trading requests. The frontend sends
        these once through HTTPS.
      </p>
      <CardHint>Enter API Key, Secret Key, and Passphrase. Never enable Withdraw.</CardHint>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="API Key" error={errors.apiKey}>
          <Input
            aria-invalid={Boolean(errors.apiKey)}
            className={inputClass}
            placeholder="OKX API Key"
            value={credentials.apiKey}
            onChange={(event) => onChange("apiKey", event.target.value)}
          />
        </Field>
        <Field label="Passphrase" error={errors.passphrase}>
          <Input
            aria-invalid={Boolean(errors.passphrase)}
            className={inputClass}
            type="password"
            placeholder="Passphrase"
            value={credentials.passphrase}
            onChange={(event) => onChange("passphrase", event.target.value)}
          />
        </Field>
        <Field label="Secret Key" error={errors.secretKey}>
          <Input
            aria-invalid={Boolean(errors.secretKey)}
            className={inputClass}
            type="password"
            placeholder="Secret Key"
            value={credentials.secretKey}
            onChange={(event) => onChange("secretKey", event.target.value)}
          />
        </Field>
        <Field label="Environment" error={errors.environment}>
          <OnboardingDropdown
            ariaInvalid={Boolean(errors.environment)}
            value={credentials.environment}
            options={environmentOptions}
            onChange={(environment) => onChange("environment", environment)}
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="button" className="h-11" onClick={onSubmit}>
          {isSubmitted ? "Credentials Submitted" : "Submit Credentials"}
        </Button>
      </div>
      <Callout tone="warn">
        Secret Key and Passphrase should be encrypted and never displayed again after saving. Only allow the user to
        replace or delete the connection.
      </Callout>
    </StepCard>
  )
}

function VerificationResultCard({ businessState }: { businessState: BusinessState }) {
  return (
    <StepCard title="6. Backend verification result" badge={<StatusBadge tone="blue">Auto-check</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        Your backend should run these checks before copy trading can be enabled.
      </p>
      <CardHint>Test the key first. Verification does not activate copy trading.</CardHint>
      <div className="grid gap-3 sm:grid-cols-2">
        <CheckItem tone={businessState.apiVerified ? "good" : "warn"}>API authentication works</CheckItem>
        <CheckItem tone={businessState.apiVerified ? "good" : "warn"}>Account balance can be read</CheckItem>
        <CheckItem tone={businessState.apiVerified ? "good" : "warn"}>Trade permission detected</CheckItem>
        <CheckItem tone={businessState.apiVerified ? "good" : "warn"}>Server IP whitelist works</CheckItem>
        <CheckItem tone="warn">Copy trading still OFF by default</CheckItem>
        <CheckItem tone="bad">Withdraw permission not requested</CheckItem>
      </div>
    </StepCard>
  )
}

function ActivationCard({
  businessState,
  apiStatus,
  copyStatus,
}: {
  businessState: BusinessState
  apiStatus: string
  copyStatus: string
}) {
  return (
    <StepCard highlight title="7. Final activation confirmation" badge={<StatusBadge tone="warn">Manual action</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        This is the final guardrail before the follower account can execute copied trades.
      </p>
      <CardHint>Copy trading starts only after you manually enable it.</CardHint>
      <Callout tone={businessState.apiVerified ? "good" : "warn"}>
        {businessState.apiVerified
          ? "OKX API verified. Risk limits are configured. Copy trading is ready, but still OFF until the user clicks Enable Copy Trading."
          : "Verify the OKX API before activation. API connected does not mean copy trading is active."}
      </Callout>
      <div className="grid gap-3 md:grid-cols-3">
        <DashCard icon={KeyRound} label="API Status" value={apiStatus} tone={businessState.apiVerified ? "good" : "warn"} />
        <DashCard icon={Power} label="Copy Trading" value={copyStatus} tone={businessState.copyEnabled ? "good" : "warn"} />
        <DashCard icon={BadgeCheck} label="Mode" value="Demo Trading" />
      </div>
    </StepCard>
  )
}

function PostOnboardingDashboardCard({
  apiStatus,
  copyStatus,
  riskSettings,
  onStopCopyTrading,
  onOpenRiskSettings,
}: {
  apiStatus: string
  copyStatus: string
  riskSettings: RiskSettings
  onStopCopyTrading: () => void
  onOpenRiskSettings: () => void
}) {
  return (
    <StepCard title="8. Post-onboarding dashboard" badge={<StatusBadge tone="good">Ready</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        After activation, this becomes the main follower control center.
      </p>
      <CardHint>Monitor status, update risk limits, or stop copying anytime.</CardHint>
      <div className="grid gap-3 md:grid-cols-4">
        <DashCard icon={KeyRound} label="API Status" value={apiStatus === "Verified" ? "Connected" : "Pending"} tone={apiStatus === "Verified" ? "good" : "warn"} />
        <DashCard icon={Power} label="Copy Trading" value={copyStatus} tone={copyStatus === "ON" ? "good" : "warn"} />
        <DashCard icon={Shield} label="Max Per Trade" value={`${riskSettings.maxTrade} USDT`} />
        <DashCard icon={PauseCircle} label="Emergency Stop" value="Available" tone="bad" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="destructive" className="h-11 justify-center" onClick={onStopCopyTrading}>
          <PauseCircle data-icon="inline-start" />
          Stop Copy Trading
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 justify-center bg-transparent"
          onClick={onOpenRiskSettings}
        >
          <SlidersHorizontal data-icon="inline-start" />
          Update Risk Settings
        </Button>
      </div>
    </StepCard>
  )
}

function ConfigurationDatabasePanel({
  businessState,
  riskSettings,
  isRiskConfigured,
  riskAcceptedAt,
  apiStorageStatus,
}: {
  businessState: BusinessState
  riskSettings: RiskSettings
  isRiskConfigured: boolean
  riskAcceptedAt: string
  apiStorageStatus: string
}) {
  const rows = [
    ["onboarding_status", businessState.onboardingStatus],
    ["risk_accepted_at", riskAcceptedAt],
    ["copy_enabled", businessState.copyEnabled ? "true - active" : "false before activation"],
    ["risk_settings_status", isRiskConfigured ? "configured" : "not configured"],
    ["max_trade_usdt", isRiskConfigured ? riskSettings.maxTrade.toString() : "not saved"],
    ["max_daily_loss_usdt", isRiskConfigured ? riskSettings.dailyLoss.toString() : "not saved"],
    ["secret_key_encrypted", apiStorageStatus],
    ["api_status", businessState.apiVerified ? "verified" : "pending_verification"],
    ["plan_status", "trial_active"],
  ]

  return (
    <section className={cn(panelClass, "p-5")}>
      <div className="mb-4 flex items-start gap-3">
        <Database className="mt-0.5 text-primary" />
        <div>
          <h2 className="text-lg font-black tracking-tight">Configuration Database</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Suggested fields to track onboarding state and follower risk controls.
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1.05fr_0.95fr] gap-3 bg-muted/50 p-3 text-xs font-black text-muted-foreground">
          <div>Field</div>
          <div>Value</div>
        </div>
        {rows.map(([field, value]) => (
          <div key={field} className="grid grid-cols-[1.05fr_0.95fr] gap-3 border-t border-border p-3 text-xs">
            <div className="text-muted-foreground">{field}</div>
            <div className="break-words text-foreground">{value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function OnboardingTimelinePanel({ timelineEvents }: { timelineEvents: TimelineEvent[] }) {
  return (
    <section className={cn(panelClass, "p-5")}>
      <div className="mb-4 flex items-start gap-3">
        <Activity className="mt-0.5 text-primary" />
        <div>
          <h2 className="text-lg font-black tracking-tight">System Event Timeline</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Backend-style audit log for onboarding activity.</p>
        </div>
      </div>
      <div className="grid max-h-[460px] gap-3 overflow-auto pr-1">
        {timelineEvents.map((event) => (
          <div key={event.id} className="grid grid-cols-[30px_1fr] gap-2">
            <Dot tone={event.status}>{event.status === "good" ? "OK" : event.status === "warn" ? "!" : "X"}</Dot>
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <strong className="mb-1 block text-[13px]">{event.title}</strong>
              <span className="block text-xs leading-5 text-muted-foreground">{event.description}</span>
              <span className="mt-2 block text-[11px] text-muted-foreground/70">{event.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MobileDeviceConnectCard({ onAcknowledge }: { onAcknowledge: () => void }) {
  const [connectUrl, setConnectUrl] = useState("")
  const [qrError, setQrError] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadMobileLink() {
      try {
        const response = await fetch("/api/onboarding/mobile-link", { method: "POST" })
        const data = await response.json()

        if (!isMounted) return

        if (!data.success || !data.data?.connectUrl) {
          setQrError("QR code is temporarily unavailable.")
          return
        }

        setConnectUrl(data.data.connectUrl)
      } catch {
        if (isMounted) {
          setQrError("QR code is temporarily unavailable.")
        }
      }
    }

    loadMobileLink()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Card className="gap-4 rounded-lg border border-border bg-card py-5 shadow-sm ring-0">
      <CardContent className="flex justify-center px-5 pt-1">
        <div className="rounded-xl border border-border/70 bg-white p-4 shadow-sm">
          {connectUrl ? (
            <QRCodeSVG
              value={connectUrl}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
              marginSize={1}
              title="Mobile device connection QR code"
            />
          ) : (
            <div className="size-40 rounded-lg bg-muted" aria-hidden="true" />
          )}
        </div>
      </CardContent>
      <CardHeader className="px-5 text-center">
        <CardTitle className="text-base font-black tracking-tight">Scan to connect your mobile device</CardTitle>
        <CardDescription className="text-sm leading-6">
          Open the Bizdak mobile app and scan this code to link this onboarding setup. This code expires quickly for
          account safety.
        </CardDescription>
        {qrError ? <p className="text-sm text-destructive">{qrError}</p> : null}
      </CardHeader>
      <CardFooter className="border-0 bg-transparent px-5 pb-0 pt-0">
        <Button type="button" variant="secondary" className="h-11 w-full" onClick={onAcknowledge}>
          Got it
        </Button>
      </CardFooter>
    </Card>
  )
}

function RiskSettingsModal({
  riskSettings,
  onClose,
  onSave,
}: {
  riskSettings: RiskSettings
  onClose: () => void
  onSave: (settings: RiskSettings) => void
}) {
  const [draft, setDraft] = useState<RiskSettings>(riskSettings)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors<keyof RiskSettings>>({})

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  function setField<K extends keyof RiskSettings>(field: K, value: RiskSettings[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextSettings = {
      ...draft,
      allowedSymbols: draft.allowedSymbols.trim(),
      maxTrade: Number(draft.maxTrade),
      dailyLoss: Number(draft.dailyLoss),
      maxOpenTrades: Number(draft.maxOpenTrades),
      slippage: Number(draft.slippage),
    }
    const errors: ValidationErrors<keyof RiskSettings> = {}
    const okxSymbolPattern = /^[A-Z0-9]+-[A-Z0-9]+$/
    const allowedSymbols = nextSettings.allowedSymbols
      .split(",")
      .map((symbol) => symbol.trim())
      .filter(Boolean)

    if (!nextSettings.allowedSymbols) {
      errors.allowedSymbols = "Allowed symbols cannot be empty."
    } else if (allowedSymbols.length === 0 || allowedSymbols.some((symbol) => !okxSymbolPattern.test(symbol))) {
      errors.allowedSymbols = "Use comma-separated OKX symbols like BTC-USDT, ETH-USDT."
    }

    if (!Number.isFinite(nextSettings.maxTrade) || nextSettings.maxTrade <= 0) {
      errors.maxTrade = "Max per trade must be greater than zero."
    } else if (nextSettings.maxTrade > 100000) {
      errors.maxTrade = "Max per trade cannot exceed 100,000 USDT."
    }

    if (!Number.isFinite(nextSettings.dailyLoss) || nextSettings.dailyLoss <= 0) {
      errors.dailyLoss = "Max daily loss must be greater than zero."
    } else if (nextSettings.dailyLoss > 100000) {
      errors.dailyLoss = "Max daily loss cannot exceed 100,000 USDT."
    } else if (nextSettings.dailyLoss < nextSettings.maxTrade) {
      errors.dailyLoss = "Max daily loss must be greater than or equal to max per trade."
    }

    if (
      !Number.isFinite(nextSettings.maxOpenTrades) ||
      nextSettings.maxOpenTrades <= 0 ||
      !Number.isInteger(nextSettings.maxOpenTrades)
    ) {
      errors.maxOpenTrades = "Max open trades must be a whole number greater than zero."
    } else if (nextSettings.maxOpenTrades > 50) {
      errors.maxOpenTrades = "Max open trades cannot exceed 50."
    }

    if (!Number.isFinite(nextSettings.slippage) || nextSettings.slippage <= 0) {
      errors.slippage = "Slippage limit must be greater than zero."
    } else if (nextSettings.slippage > 20) {
      errors.slippage = "Slippage limit cannot exceed 20%."
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError("Fix the highlighted risk settings before saving.")
      return
    }

    setFieldErrors({})
    setError("")
    onSave({
      ...nextSettings,
      allowedSymbols: allowedSymbols.join(", "),
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-5 backdrop-blur"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="risk-settings-title"
        aria-modal="true"
        className="w-full max-w-[720px] overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5 md:p-6">
          <div>
            <h2 id="risk-settings-title" className="text-[22px] font-black tracking-tight">
              Update Risk Settings
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Change the follower&apos;s copy limits. Saving updates the dashboard preview, database preview, and event
              timeline.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X />
            <span className="sr-only">Close modal</span>
          </Button>
        </div>

        <form onSubmit={submit}>
          <div className="grid gap-4 p-5 md:p-6">
            {error ? (
              <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm leading-6 text-destructive">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Copy mode" error={fieldErrors.copyMode}>
                <OnboardingDropdown
                  ariaInvalid={Boolean(fieldErrors.copyMode)}
                  value={draft.copyMode}
                  options={copyModeOptions}
                  onChange={(copyMode) => setField("copyMode", copyMode)}
                />
              </Field>
              <Field label="Max per trade, USDT" error={fieldErrors.maxTrade}>
                <Input
                  aria-invalid={Boolean(fieldErrors.maxTrade)}
                  className={inputClass}
                  min={1}
                  max={100000}
                  step={1}
                  type="number"
                  value={draft.maxTrade}
                  onChange={(event) => setField("maxTrade", Number(event.target.value))}
                  required
                />
              </Field>
              <Field label="Max daily loss, USDT" error={fieldErrors.dailyLoss}>
                <Input
                  aria-invalid={Boolean(fieldErrors.dailyLoss)}
                  className={inputClass}
                  min={1}
                  max={100000}
                  step={1}
                  type="number"
                  value={draft.dailyLoss}
                  onChange={(event) => setField("dailyLoss", Number(event.target.value))}
                  required
                />
              </Field>
              <Field label="Max open trades" error={fieldErrors.maxOpenTrades}>
                <Input
                  aria-invalid={Boolean(fieldErrors.maxOpenTrades)}
                  className={inputClass}
                  min={1}
                  max={50}
                  step={1}
                  type="number"
                  value={draft.maxOpenTrades}
                  onChange={(event) => setField("maxOpenTrades", Number(event.target.value))}
                  required
                />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Allowed market" error={fieldErrors.allowedMarket}>
                <OnboardingDropdown
                  ariaInvalid={Boolean(fieldErrors.allowedMarket)}
                  value={draft.allowedMarket}
                  options={allowedMarketOptions}
                  onChange={(allowedMarket) => setField("allowedMarket", allowedMarket)}
                />
              </Field>
              <Field label="Slippage limit, %" error={fieldErrors.slippage}>
                <Input
                  aria-invalid={Boolean(fieldErrors.slippage)}
                  className={inputClass}
                  min={0.01}
                  max={20}
                  step={0.01}
                  type="number"
                  value={draft.slippage}
                  onChange={(event) => setField("slippage", Number(event.target.value))}
                  required
                />
              </Field>
            </div>

            <Field label="Allowed symbols" error={fieldErrors.allowedSymbols}>
              <Input
                aria-invalid={Boolean(fieldErrors.allowedSymbols)}
                className={inputClass}
                value={draft.allowedSymbols}
                onChange={(event) => setField("allowedSymbols", event.target.value)}
                required
              />
            </Field>
            <Callout tone="warn">
              Validation rule in this preview: daily loss must be greater than or equal to max per trade, and all numeric
              limits must be positive.
            </Callout>
          </div>
          <div className="flex flex-wrap justify-end gap-3 px-5 pb-5 md:px-6 md:pb-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 bg-transparent"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 font-black"
            >
              Save Risk Settings
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function OnboardingBottomActions({
  isTestingApi,
  isApiVerified,
  onBack,
  onSaveDraft,
  onTestApiKey,
  onEnableCopyTrading,
}: {
  isTestingApi: boolean
  isApiVerified: boolean
  onBack: () => void
  onSaveDraft: () => void
  onTestApiKey: () => void
  onEnableCopyTrading: () => void
}) {
  return (
    <footer className="flex items-center justify-between gap-3 border-t border-border bg-background/80 px-5 py-4 backdrop-blur md:px-6 max-md:flex-col max-md:items-stretch">
      <div className="flex flex-wrap items-center gap-3 max-md:[&>button]:flex-1">
        <Button
          type="button"
          variant="outline"
          className="h-11 bg-transparent"
          onClick={onBack}
        >
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 bg-transparent"
          onClick={onSaveDraft}
        >
          <Save data-icon="inline-start" />
          Save Draft
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 max-md:[&>button]:flex-1">
        <Button
          type="button"
          variant="outline"
          className="h-11 bg-transparent"
          disabled={isTestingApi}
          onClick={onTestApiKey}
        >
          {isTestingApi ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <KeyRound data-icon="inline-start" />}
          {isTestingApi ? "Testing API..." : isApiVerified ? "API Verified" : "Test API Key"}
        </Button>
        <Button
          type="button"
          className="h-11 font-black"
          onClick={onEnableCopyTrading}
        >
          <Zap data-icon="inline-start" />
          Enable Copy Trading
        </Button>
      </div>
    </footer>
  )
}

function OnboardingToast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null

  return (
    <div
      className={cn(
        "fixed bottom-[88px] right-5 z-[60] w-[min(380px,calc(100%-40px))] rounded-lg border bg-card p-4 text-sm leading-6 text-card-foreground shadow-xl",
        toast.tone === "good" && "border-primary/25",
        toast.tone === "warn" && "border-border",
        toast.tone === "bad" && "border-destructive/40"
      )}
      role="status"
    >
      <strong
        className={cn(
          "mb-1 block",
          toast.tone === "good" && "text-primary",
          toast.tone === "warn" && "text-foreground",
          toast.tone === "bad" && "text-destructive"
        )}
      >
        {toast.title}
      </strong>
      <span>{toast.message}</span>
    </div>
  )
}

function StepCard({
  title,
  badge,
  children,
  highlight,
  danger,
}: {
  title: string
  badge: React.ReactNode
  children: React.ReactNode
  highlight?: boolean
  danger?: boolean
}) {
  return (
    <article
      className={cn(
        stepCardClass,
        "grid gap-4",
        highlight && "bg-muted/30",
        danger && "border-destructive/25 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-black tracking-tight">{title}</h3>
        {badge}
      </div>
      {children}
    </article>
  )
}

function OnboardingDropdown<T extends string>({
  value,
  options,
  placeholder = "Select an option",
  ariaInvalid,
  readOnly,
  onChange,
}: {
  value: T | ""
  options: readonly T[]
  placeholder?: string
  ariaInvalid?: boolean
  readOnly?: boolean
  onChange: (value: T) => void
}) {
  const selectedLabel = value || placeholder

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(dropdownTriggerClass, !value && "text-muted-foreground", readOnly && "bg-muted/40 text-muted-foreground")}
          aria-invalid={ariaInvalid}
          aria-readonly={readOnly || undefined}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown data-icon="inline-end" className="ml-auto opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuGroup>
          {options.map((option) => {
            const isSelected = option === value

            return (
              <DropdownMenuItem
                key={option}
                onSelect={(event) => {
                  if (readOnly) {
                    event.preventDefault()
                    return
                  }

                  onChange(option)
                }}
              >
                <span className="flex size-4 items-center justify-center">
                  {isSelected ? <Check /> : null}
                </span>
                <span className="truncate">{option}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CountryDropdown({
  value,
  ariaInvalid,
  onChange,
}: {
  value: string
  ariaInvalid?: boolean
  onChange: (value: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(dropdownTriggerClass, !value && "text-muted-foreground")}
          aria-invalid={ariaInvalid}
        >
          <span className="truncate">{value || "Select your country"}</span>
          <ChevronDown data-icon="inline-end" className="ml-auto opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuGroup>
          {countryGroups.map((group) => (
            <DropdownMenuSub key={group.region}>
              <DropdownMenuSubTrigger>{group.region}</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="min-w-[220px]">
                  {group.countries.map((country) => {
                    const isSelected = country === value

                    return (
                      <DropdownMenuItem key={country} onSelect={() => onChange(country)}>
                        <span className="flex size-4 items-center justify-center">
                          {isSelected ? <Check /> : null}
                        </span>
                        <span>{country}</span>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2" data-invalid={Boolean(error) || undefined}>
      <span className="text-[13px] font-black text-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs leading-5 text-destructive">{error}</span> : null}
    </label>
  )
}

function CardHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-5 text-muted-foreground">
      <Info className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function RiskToggle({
  checked,
  onClick,
  children,
}: {
  checked: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3 text-left text-sm leading-5 text-foreground transition-colors hover:bg-muted/40",
        checked && "border-primary/25 bg-primary/10"
      )}
      onClick={onClick}
    >
      <Dot tone={checked ? "good" : "warn"}>{checked ? "OK" : "!"}</Dot>
      <span>{children}</span>
    </button>
  )
}

function CheckItem({ tone, children }: { tone: "good" | "warn" | "bad"; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3 text-sm leading-5 text-foreground">
      <Dot tone={tone}>{tone === "good" ? "OK" : tone === "warn" ? "!" : "X"}</Dot>
      <span>{children}</span>
    </div>
  )
}

function PermissionCard({
  tone,
  title,
  children,
}: {
  tone: "good" | "bad"
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4 text-sm leading-6 text-muted-foreground">
      <strong className={cn("mb-1 block", tone === "good" ? "text-primary" : "text-destructive")}>{title}</strong>
      {children}
    </div>
  )
}

function DashCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon?: React.ElementType
  label: string
  value: string
  tone?: "good" | "warn" | "bad"
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {Icon ? (
          <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-3.5" />
          </span>
        ) : null}
        <span>{label}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <strong
          className={cn(
            "text-lg",
            tone === "good" && "text-primary",
            tone === "warn" && "text-foreground",
            tone === "bad" && "text-destructive"
          )}
        >
          {value}
        </strong>
        <StatusValueIcon value={value} tone={tone} />
      </div>
    </div>
  )
}

function StatusValueIcon({ value, tone }: { value: string; tone?: "good" | "warn" | "bad" }) {
  const isAttentionState = ["OFF", "Not submitted", "Pending", "Required"].includes(value)

  return (
        <span
          className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border",
        tone === "good" && "bg-emerald-500/10 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
        tone === "bad" && "bg-destructive/10 text-destructive"
          )}
      aria-hidden="true"
    >
      {tone === "good" ? (
        <CheckCircle2 className="size-4" />
      ) : tone === "bad" || isAttentionState ? (
        <CircleAlert className="size-4" />
      ) : (
        <BadgeCheck className="size-4" />
      )}
    </span>
  )
}

function Dot({ tone, children }: { tone: "good" | "warn" | "bad"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "grid size-[26px] shrink-0 place-items-center rounded-full text-[10px] font-black",
        tone === "good" && "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400",
        tone === "warn" && "bg-muted text-foreground",
        tone === "bad" && "bg-destructive/10 text-destructive"
      )}
    >
      {children}
    </span>
  )
}

function Callout({ tone, children }: { tone: "good" | "warn" | "bad" | "blue"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm leading-6",
        tone === "good" && "border-primary/25 bg-primary/10 text-foreground",
        tone === "warn" && "border-border bg-muted/50 text-foreground",
        tone === "bad" && "border-destructive/25 bg-destructive/10 text-destructive",
        tone === "blue" && "border-border bg-muted/50 text-foreground"
      )}
    >
      {children}
    </div>
  )
}

function StatusPill({ tone, children }: { tone?: "good" | "warn"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-2 text-xs font-black text-muted-foreground",
        tone === "good" && "border-primary/25 bg-primary/10 text-primary",
        tone === "warn" && "text-foreground"
      )}
    >
      {children}
    </span>
  )
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "good" | "warn" | "bad" | "blue"
  children: React.ReactNode
}) {
  const variant = tone === "bad" ? "destructive" : "outline"

  return (
    <Badge
      variant={variant}
      className={cn(
        "h-auto rounded-full px-3 py-1.5 text-xs font-black",
        tone === "good" && "border-primary/25 bg-primary/10 text-primary",
        tone === "warn" && "border-border bg-muted/50 text-foreground",
        tone === "blue" && "border-border bg-muted/50 text-foreground",
        tone === "bad" && "border-destructive/25 bg-destructive/10 text-destructive"
      )}
    >
      {children}
    </Badge>
  )
}
