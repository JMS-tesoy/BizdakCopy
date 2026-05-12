export type OnboardingStatus =
  | "registered"
  | "risk_accepted"
  | "risk_configured"
  | "api_submitted"
  | "api_verified"
  | "ready_to_enable"
  | "active"
  | "copy_paused"
  | "api_failed"

export type RiskSettings = {
  copyMode: "Fixed USDT per trade" | "Equity percentage" | "Multiplier"
  maxTrade: number
  dailyLoss: number
  maxOpenTrades: number
  allowedMarket: "Spot only" | "Futures - later"
  slippage: number
  allowedSymbols: string
}

export type BusinessState = {
  accountCreated: boolean
  riskAccepted: boolean
  planActive: boolean
  apiSubmitted: boolean
  apiVerified: boolean
  copyEnabled: boolean
  onboardingStatus: OnboardingStatus
}

export type TimelineEvent = {
  id: string
  title: string
  description: string
  status: "good" | "warn" | "bad"
  createdAt: string
}
