import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const recentTrades = [
  { id: 1, symbol: "EURUSD", type: "BUY", entry: 1.0842, exit: 1.0891, pips: 49, profit: 245.0, time: "2h ago" },
  { id: 2, symbol: "GBPJPY", type: "SELL", entry: 188.42, exit: 187.89, pips: 53, profit: 318.0, time: "5h ago" },
  { id: 3, symbol: "XAUUSD", type: "BUY", entry: 2024.5, exit: 2031.2, pips: 67, profit: 402.0, time: "8h ago" },
  { id: 4, symbol: "USDJPY", type: "SELL", entry: 149.82, exit: 150.15, pips: -33, profit: -165.0, time: "12h ago" },
  { id: 5, symbol: "EURUSD", type: "BUY", entry: 1.0795, exit: 1.0842, pips: 47, profit: 235.0, time: "1d ago" },
  { id: 6, symbol: "GBPUSD", type: "SELL", entry: 1.2654, exit: 1.2612, pips: 42, profit: 210.0, time: "1d ago" },
]

export function TradingHistory() {
  return (
    <section className="section-fade-divider px-6 py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recent Trades</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparent trading history. Every trade is recorded and available for verification.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Entry</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Exit</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Pips</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Profit</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium">{trade.symbol}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={trade.type === "BUY" ? "default" : "secondary"} className="font-mono">
                          {trade.type === "BUY" ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {trade.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm">{trade.entry}</td>
                      <td className="py-3 px-4 text-right font-mono text-sm">{trade.exit}</td>
                      <td
                        className={`py-3 px-4 text-right font-mono text-sm ${trade.pips >= 0 ? "text-chart-2" : "text-destructive"}`}
                      >
                        {trade.pips >= 0 ? "+" : ""}
                        {trade.pips}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono text-sm font-medium ${trade.profit >= 0 ? "text-chart-2" : "text-destructive"}`}
                      >
                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-muted-foreground">{trade.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
