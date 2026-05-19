export interface Trade {
  id: string
  symbol: string
  type: "BUY" | "SELL"
  lotSize: number
  entryPrice: number
  stopLoss: number | null
  takeProfit: number | null
  openTime: string
  closeTime: string | null
  exitPrice: number | null
  profit: number | null
  status: "OPEN" | "CLOSED"
  magicNumber: number
}

export interface Signal {
  id: string
  action: "OPEN" | "CLOSE" | "MODIFY"
  symbol: string
  type: "BUY" | "SELL"
  lotSize: number
  entryPrice: number
  stopLoss: number | null
  takeProfit: number | null
  magicNumber: number
  timestamp: string
  tradeId: string
}

export interface Follower {
  id: string
  email: string
  apiKey: string
  subscriptionTier: "free" | "pro"
  subscriptionStatus: "active" | "inactive" | "expired"
  maxAccounts: number
  connectedAccounts: number
  createdAt: string
  lastActive: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}
