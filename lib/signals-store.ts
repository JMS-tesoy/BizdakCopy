import type { Signal, Trade } from "./types"

// In-memory store for demo - replace with database in production
const signals: Signal[] = []
const openTrades: Trade[] = []

// Demo open trades (as a master trader, you would update these)
const demoOpenTrades: Trade[] = [
  {
    id: "trade_001",
    symbol: "EURUSD",
    type: "BUY",
    lotSize: 0.1,
    entryPrice: 1.0842,
    stopLoss: 1.0792,
    takeProfit: 1.0942,
    openTime: new Date().toISOString(),
    closeTime: null,
    exitPrice: null,
    profit: null,
    status: "OPEN",
    magicNumber: 123456,
  },
  {
    id: "trade_002",
    symbol: "GBPUSD",
    type: "SELL",
    lotSize: 0.05,
    entryPrice: 1.2654,
    stopLoss: 1.2704,
    takeProfit: 1.2554,
    openTime: new Date(Date.now() - 3600000).toISOString(),
    closeTime: null,
    exitPrice: null,
    profit: null,
    status: "OPEN",
    magicNumber: 123457,
  },
]

// Initialize with demo data
openTrades.push(...demoOpenTrades)

export function getOpenTrades(): Trade[] {
  return openTrades.filter((t) => t.status === "OPEN")
}

export function getSignalsSince(since: string): Signal[] {
  const sinceDate = new Date(since)
  return signals.filter((s) => new Date(s.timestamp) > sinceDate)
}

export function getLatestSignals(limit = 10): Signal[] {
  return signals.slice(-limit)
}

export function addSignal(signal: Omit<Signal, "id" | "timestamp">): Signal {
  const newSignal: Signal = {
    ...signal,
    id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }
  signals.push(newSignal)
  return newSignal
}

export function openTrade(trade: Omit<Trade, "id" | "openTime" | "status">): Trade {
  const newTrade: Trade = {
    ...trade,
    id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    openTime: new Date().toISOString(),
    status: "OPEN",
  }
  openTrades.push(newTrade)

  // Create open signal
  addSignal({
    action: "OPEN",
    symbol: trade.symbol,
    type: trade.type,
    lotSize: trade.lotSize,
    entryPrice: trade.entryPrice,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    magicNumber: trade.magicNumber,
    tradeId: newTrade.id,
  })

  return newTrade
}

export function closeTrade(tradeId: string, exitPrice: number): Trade | null {
  const trade = openTrades.find((t) => t.id === tradeId)
  if (!trade) return null

  trade.status = "CLOSED"
  trade.exitPrice = exitPrice
  trade.closeTime = new Date().toISOString()

  // Calculate profit (simplified)
  const pips = trade.type === "BUY" ? (exitPrice - trade.entryPrice) * 10000 : (trade.entryPrice - exitPrice) * 10000
  trade.profit = pips * trade.lotSize * 10 // Simplified calculation

  // Create close signal
  addSignal({
    action: "CLOSE",
    symbol: trade.symbol,
    type: trade.type,
    lotSize: trade.lotSize,
    entryPrice: trade.entryPrice,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    magicNumber: trade.magicNumber,
    tradeId: trade.id,
  })

  return trade
}

export function modifyTrade(tradeId: string, stopLoss: number | null, takeProfit: number | null): Trade | null {
  const trade = openTrades.find((t) => t.id === tradeId)
  if (!trade || trade.status !== "OPEN") return null

  trade.stopLoss = stopLoss ?? trade.stopLoss
  trade.takeProfit = takeProfit ?? trade.takeProfit

  // Create modify signal
  addSignal({
    action: "MODIFY",
    symbol: trade.symbol,
    type: trade.type,
    lotSize: trade.lotSize,
    entryPrice: trade.entryPrice,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    magicNumber: trade.magicNumber,
    tradeId: trade.id,
  })

  return trade
}
