"use client"

import { useEffect, useRef, useState } from "react"
import {
  Activity,
  ArrowLeft,
  Database,
  KeyRound,
  LayoutDashboard,
  Loader2,
  PauseCircle,
  Save,
  Shield,
  SlidersHorizontal,
  UserRound,
  X,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  accountCreated: true,
  riskAccepted: true,
  planActive: true,
  apiSubmitted: true,
  apiVerified: false,
  copyEnabled: false,
  onboardingStatus: "api_submitted",
}

const initialTimelineEvents: TimelineEvent[] = [
  {
    id: "registered",
    title: "User registered",
    description: "Profile row created. Copy trading disabled by default.",
    status: "good",
    createdAt: "2026-05-11 14:18",
  },
  {
    id: "risk-accepted",
    title: "Risk accepted",
    description: "Agreement timestamp saved for audit trail.",
    status: "good",
    createdAt: "2026-05-11 14:25",
  },
  {
    id: "risk-saved",
    title: "Risk settings saved",
    description: "Trade cap, daily loss, symbols, and slippage limits configured.",
    status: "good",
    createdAt: "2026-05-11 14:29",
  },
  {
    id: "api-submitted",
    title: "API submitted",
    description: "Secret Key and Passphrase encrypted. Verification pending.",
    status: "warn",
    createdAt: "2026-05-11 14:34",
  },
  {
    id: "withdraw-disabled",
    title: "Withdraw disabled",
    description: "The system never requests or uses withdrawal access.",
    status: "bad",
    createdAt: "2026-05-11 14:35",
  },
]

type ToastState = {
  title: string
  message: string
  tone: "good" | "warn" | "bad"
}

const panelClass = "rounded-lg border border-border bg-card shadow-sm"
const stepCardClass = "rounded-lg border border-border bg-card p-5 shadow-sm"
const inputClass = "h-11 rounded-lg bg-background/60 px-3 text-foreground placeholder:text-muted-foreground"
const selectClass =
  "h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/50"

export function OnboardingShell() {
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(initialRiskSettings)
  const [businessState, setBusinessState] = useState<BusinessState>(initialBusinessState)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialTimelineEvents)
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false)
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [toastState, setToastState] = useState<ToastState | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const apiStatus = businessState.apiVerified ? "Verified" : "Pending"
  const copyStatus = businessState.copyEnabled ? "ON" : "OFF"
  const statusCopy = businessState.copyEnabled
    ? "Status: onboarding completed. Copy trading is active and protected by risk limits."
    : businessState.apiVerified
      ? "Status: API verified. User must manually enable copy trading."
      : "Status: API submitted, waiting for verification and activation confirmation."
  const businessBadge = businessState.copyEnabled
    ? { label: "Active follower", tone: "good" as const }
    : businessState.apiVerified
      ? { label: "Ready to activate", tone: "warn" as const }
      : { label: "Pre-activation", tone: "blue" as const }
  const wizardStep = businessState.copyEnabled
    ? { label: "Completed", tone: "good" as const }
    : businessState.apiVerified
      ? { label: "Step 7 of 8", tone: "warn" as const }
      : { label: "Step 5 of 8", tone: "warn" as const }

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

  function updateRiskSettings(nextSettings: RiskSettings) {
    setRiskSettings(nextSettings)
    setBusinessState((current) => ({
      ...current,
      onboardingStatus: current.apiVerified ? current.onboardingStatus : "risk_configured",
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

    setIsTestingApi(true)
    setBusinessState((current) => ({
      ...current,
      apiSubmitted: true,
      onboardingStatus: "api_submitted",
    }))
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
    if (!businessState.apiVerified) {
      addTimelineEvent({
        title: "Activation blocked",
        description: "User tried to enable copy trading before OKX API verification was completed.",
        status: "warn",
      })
      showToast("Activation blocked: test and verify the OKX API key first.", "warn", "Activation blocked")
      return
    }

    if (!businessState.planActive || !businessState.riskAccepted) {
      addTimelineEvent({
        title: "Activation blocked",
        description: "Business requirements are incomplete: plan or risk agreement is missing.",
        status: "warn",
      })
      showToast("Activation blocked: complete all business requirements first.", "warn", "Activation blocked")
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
    const payload = { businessState, riskSettings, savedAt: new Date().toISOString() }
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
    showToast("Returned to the top of the onboarding workspace.", "warn", "Back")
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
                <OnboardingStepper businessState={businessState} />

                <div
                  ref={scrollRef}
                  className="grid h-full min-h-0 content-start gap-5 overflow-y-auto overflow-x-hidden overscroll-contain pr-2"
                >
                  <BusinessReadinessCard businessState={businessState} />
                  <AccountProfileCard />
                  <RiskDisclosureCard />
                  <RiskSettingsCard riskSettings={riskSettings} />
                  <OkxApiGuideCard />
                  <OkxApiCredentialsCard />
                  <VerificationResultCard businessState={businessState} />
                  <ActivationCard businessState={businessState} apiStatus={apiStatus} copyStatus={copyStatus} />
                  <PostOnboardingDashboardCard
                    apiStatus={apiStatus}
                    copyStatus={copyStatus}
                    riskSettings={riskSettings}
                    onStopCopyTrading={stopCopyTrading}
                    onOpenRiskSettings={() => setIsRiskModalOpen(true)}
                  />
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
          <ConfigurationDatabasePanel businessState={businessState} riskSettings={riskSettings} />
          <OnboardingTimelinePanel timelineEvents={timelineEvents} />
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
  const steps = [
    { step: "5", label: "API Verification", active: true },
    { step: "6", label: "Permission Check" },
    { step: "7", label: "Activation" },
    { step: "8", label: "Follower Dashboard" },
  ]

  return (
    <aside className="flex h-screen flex-col gap-5 overflow-auto border-r border-border bg-muted/30 p-5 max-md:h-auto">
      <div className="flex items-center gap-3 pb-2 font-black">
        <div className="grid size-11 place-items-center rounded-lg bg-primary font-black text-primary-foreground shadow-sm">
          BD
        </div>
        <div>
          <div className="tracking-tight">Bizdak Copy</div>
          <div className="text-xs font-semibold text-muted-foreground">Operator Desktop</div>
        </div>
      </div>

      <SidebarSection title="Workspace">
        {navItems.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </SidebarSection>

      <SidebarSection title="Onboarding Steps">
        {steps.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm font-bold text-muted-foreground",
              item.active && "border-border bg-background text-foreground shadow-sm"
            )}
          >
            <span className="grid size-6 place-items-center rounded-lg bg-muted text-xs">{item.step}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </SidebarSection>

      <div className="mt-auto rounded-lg border border-border bg-card p-4 shadow-sm">
        <strong className="mb-2 block text-sm">Business rule</strong>
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
        <h1 className="text-[22px] font-black leading-tight tracking-tight">Follower Onboarding Wizard</h1>
        <p className="mt-1 text-sm text-muted-foreground">{statusCopy}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 max-md:justify-start">
        <StatusPill>Demo UI Preview</StatusPill>
        <StatusPill tone="good">Read + Trade Only</StatusPill>
        <StatusPill tone="warn">Withdraw Always Off</StatusPill>
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
  const activeIndex = businessState.copyEnabled ? 7 : businessState.apiVerified ? 6 : 4

  return (
    <section className={cn(panelClass, "grid gap-5 p-5 md:p-6")}>
      <div className="flex items-start justify-between gap-5 max-md:flex-col">
        <div>
          <h2 className="max-w-3xl text-3xl font-black leading-none tracking-tight md:text-[30px]">
            Safe setup before users follow your OKX trades.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            This desktop app layout gives your operator/admin a clear workspace: navigation on the left, onboarding
            logic in the center, and database/audit monitoring on the right.
          </p>
        </div>
        <StatusBadge tone={businessBadge.tone}>{businessBadge.label}</StatusBadge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <DashCard label="Plan Status" value="Trial Active" tone="good" />
        <DashCard label="Terms" value="Accepted" tone="good" />
        <DashCard label="API Verification" value={apiStatus} tone={businessState.apiVerified ? "good" : "warn"} />
        <DashCard label="Copy Trading" value={copyStatus} tone={businessState.copyEnabled ? "good" : "warn"} />
      </div>

      <div className="grid gap-3">
        <div className="flex justify-between gap-3 text-xs font-bold text-muted-foreground">
          <span>Account</span>
          <span>Risk</span>
          <span>API</span>
          <span>Activate</span>
          <span>Dashboard</span>
        </div>
        <div className="grid grid-cols-8 gap-2 max-sm:grid-cols-4" aria-label="onboarding progress">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={cn("h-[7px] rounded-full bg-muted", index <= activeIndex && "bg-primary")}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function OnboardingStepper({ businessState }: { businessState: BusinessState }) {
  const items = [
    { title: "Profile", description: "Account created", state: "done" },
    { title: "Risk Terms", description: "Accepted", state: "done" },
    { title: "Risk Settings", description: "Configured", state: "done" },
    {
      title: "OKX API",
      description: businessState.apiVerified ? "Verified" : "Verification pending",
      state: businessState.apiVerified ? "done" : "active",
    },
    {
      title: "Activation",
      description: businessState.copyEnabled ? "Active" : "Manual enable",
      state: businessState.copyEnabled ? "done" : "active",
    },
    { title: "Emergency Stop", description: "Available", state: "done" },
  ]

  return (
    <aside className="sticky top-0 rounded-lg border border-border bg-card p-3 shadow-sm max-lg:static">
      {items.map((item) => (
        <div
          key={item.title}
          className={cn(
            "grid grid-cols-[28px_1fr] gap-3 rounded-lg border border-transparent p-3 text-sm text-muted-foreground",
            item.state === "active" && "border-border bg-muted/50 text-foreground",
            item.state === "done" && "text-foreground"
          )}
        >
          <Dot tone={item.state === "done" ? "good" : "warn"}>{item.state === "done" ? "OK" : "!"}</Dot>
          <div>
            <strong className="block text-[13px]">{item.title}</strong>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.description}</span>
          </div>
        </div>
      ))}
    </aside>
  )
}

function BusinessReadinessCard({ businessState }: { businessState: BusinessState }) {
  return (
    <StepCard highlight title="Business readiness checklist" badge={<StatusBadge tone="blue">Control Center</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        Standard operating checks before a user is allowed to follow live trades.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <CheckItem tone="good">User account created</CheckItem>
        <CheckItem tone="good">Risk agreement accepted</CheckItem>
        <CheckItem tone="good">Subscription/trial allowed</CheckItem>
        <CheckItem tone={businessState.apiVerified ? "good" : "warn"}>
          {businessState.apiVerified ? "OKX API verified" : "OKX API still needs verification"}
        </CheckItem>
        <CheckItem tone={businessState.copyEnabled ? "good" : "warn"}>
          {businessState.copyEnabled ? "Manual activation completed" : "Manual activation still required"}
        </CheckItem>
        <CheckItem tone="good">Emergency stop available</CheckItem>
      </div>
    </StepCard>
  )
}

function AccountProfileCard() {
  return (
    <StepCard title="1. Account profile" badge={<StatusBadge tone="good">Completed</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        Collect basic identity and create a follower profile. This is not KYC, just your app-level account setup.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Display name">
          <Input className={inputClass} defaultValue="Juan Follower" />
        </Field>
        <Field label="Email">
          <Input className={inputClass} defaultValue="juan@example.com" />
        </Field>
        <Field label="Country">
          <select className={selectClass} defaultValue="Philippines">
            <option>Philippines</option>
            <option>Singapore</option>
            <option>UAE</option>
          </select>
        </Field>
      </div>
    </StepCard>
  )
}

function RiskDisclosureCard() {
  return (
    <StepCard danger title="2. Risk acknowledgement" badge={<StatusBadge tone="good">Accepted</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        User must explicitly accept that copy trading can lose money and API keys can execute real trades.
      </p>
      <Callout tone="bad">
        Copy trading involves financial risk. You are responsible for your OKX account, API permissions, leverage,
        balances, losses, and trading decisions. Never enable withdrawal permission.
      </Callout>
      <div className="grid gap-3 sm:grid-cols-2">
        <CheckItem tone="good">I understand trades may lose money.</CheckItem>
        <CheckItem tone="good">I will not enable withdrawal permission.</CheckItem>
        <CheckItem tone="good">I can stop copy trading anytime.</CheckItem>
        <CheckItem tone="good">I am responsible for my OKX account.</CheckItem>
      </div>
    </StepCard>
  )
}

function RiskSettingsCard({ riskSettings }: { riskSettings: RiskSettings }) {
  return (
    <StepCard title="3. Copy trading configuration" badge={<StatusBadge tone="good">Configured</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        These limits protect the follower before their OKX API key is allowed to execute trades.
      </p>
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Copy mode">
          <select className={selectClass} value={riskSettings.copyMode} aria-readonly onChange={() => undefined}>
            <option>Fixed USDT per trade</option>
            <option>Equity percentage</option>
            <option>Multiplier</option>
          </select>
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
          <select className={selectClass} value={riskSettings.allowedMarket} aria-readonly onChange={() => undefined}>
            <option>Spot only</option>
            <option>Futures - later</option>
          </select>
        </Field>
        <Field label="Allowed symbols">
          <Input className={inputClass} value={riskSettings.allowedSymbols} readOnly />
        </Field>
        <Field label="Slippage limit">
          <Input className={inputClass} value={`${riskSettings.slippage.toFixed(2)}%`} readOnly />
        </Field>
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

function OkxApiCredentialsCard() {
  return (
    <StepCard title="5. Connect OKX API credentials" badge={<StatusBadge tone="warn">Needs verification</StatusBadge>}>
      <p className="-mt-3 text-sm leading-6 text-muted-foreground">
        OKX requires API Key, Secret Key, and Passphrase to authenticate and sign trading requests. The frontend sends
        these once through HTTPS.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="API Key">
          <Input className={inputClass} placeholder="OKX API Key" defaultValue="abcd-****-****-9821" />
        </Field>
        <Field label="Passphrase">
          <Input className={inputClass} type="password" placeholder="Passphrase" defaultValue="hidden-passphrase" />
        </Field>
        <Field label="Secret Key">
          <Input className={inputClass} type="password" placeholder="Secret Key" defaultValue="hidden-secret-key" />
        </Field>
        <Field label="Environment">
          <select className={selectClass} defaultValue="Demo Trading">
            <option>Demo Trading</option>
            <option>Live Trading</option>
          </select>
        </Field>
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
      <Callout tone={businessState.apiVerified ? "good" : "warn"}>
        {businessState.apiVerified
          ? "OKX API verified. Risk limits are configured. Copy trading is ready, but still OFF until the user clicks Enable Copy Trading."
          : "Verify the OKX API before activation. API connected does not mean copy trading is active."}
      </Callout>
      <div className="grid gap-3 md:grid-cols-3">
        <DashCard label="API Status" value={apiStatus} tone={businessState.apiVerified ? "good" : "warn"} />
        <DashCard label="Copy Trading" value={copyStatus} tone={businessState.copyEnabled ? "good" : "warn"} />
        <DashCard label="Mode" value="Demo Trading" />
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
      <div className="grid gap-3 md:grid-cols-4">
        <DashCard label="API Status" value={apiStatus === "Verified" ? "Connected" : "Pending"} tone={apiStatus === "Verified" ? "good" : "warn"} />
        <DashCard label="Copy Trading" value={copyStatus} tone={copyStatus === "ON" ? "good" : "warn"} />
        <DashCard label="Max Per Trade" value={`${riskSettings.maxTrade} USDT`} />
        <DashCard label="Emergency Stop" value="Available" tone="bad" />
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
}: {
  businessState: BusinessState
  riskSettings: RiskSettings
}) {
  const rows = [
    ["onboarding_status", businessState.onboardingStatus],
    ["risk_accepted_at", "2026-05-11 14:25"],
    ["copy_enabled", businessState.copyEnabled ? "true - active" : "false before activation"],
    ["max_trade_usdt", riskSettings.maxTrade.toString()],
    ["max_daily_loss_usdt", riskSettings.dailyLoss.toString()],
    ["secret_key_encrypted", "encrypted payload"],
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  function setField<K extends keyof RiskSettings>(field: K, value: RiskSettings[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
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

    if (!nextSettings.allowedSymbols) {
      setError("Allowed symbols cannot be empty. Add at least one OKX symbol, for example BTC-USDT.")
      return
    }

    if (
      nextSettings.maxTrade <= 0 ||
      nextSettings.dailyLoss <= 0 ||
      nextSettings.maxOpenTrades <= 0 ||
      nextSettings.slippage <= 0
    ) {
      setError("All numeric risk limits must be greater than zero.")
      return
    }

    if (nextSettings.dailyLoss < nextSettings.maxTrade) {
      setError("Max daily loss must be greater than or equal to max per trade.")
      return
    }

    onSave(nextSettings)
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
              <Field label="Copy mode">
                <select
                  className={selectClass}
                  value={draft.copyMode}
                  onChange={(event) => setField("copyMode", event.target.value as RiskSettings["copyMode"])}
                  required
                >
                  <option>Fixed USDT per trade</option>
                  <option>Equity percentage</option>
                  <option>Multiplier</option>
                </select>
              </Field>
              <Field label="Max per trade, USDT">
                <Input
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
              <Field label="Max daily loss, USDT">
                <Input
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
              <Field label="Max open trades">
                <Input
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
              <Field label="Allowed market">
                <select
                  className={selectClass}
                  value={draft.allowedMarket}
                  onChange={(event) => setField("allowedMarket", event.target.value as RiskSettings["allowedMarket"])}
                  required
                >
                  <option>Spot only</option>
                  <option>Futures - later</option>
                </select>
              </Field>
              <Field label="Slippage limit, %">
                <Input
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

            <Field label="Allowed symbols">
              <Input
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[13px] font-black text-foreground">{label}</span>
      {children}
    </label>
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
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "good" | "warn" | "bad"
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <strong
        className={cn(
          "mt-2 block text-lg",
          tone === "good" && "text-primary",
          tone === "warn" && "text-foreground",
          tone === "bad" && "text-destructive"
        )}
      >
        {value}
      </strong>
    </div>
  )
}

function Dot({ tone, children }: { tone: "good" | "warn" | "bad"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "grid size-[26px] shrink-0 place-items-center rounded-full text-[10px] font-black",
        tone === "good" && "bg-primary/10 text-primary",
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
