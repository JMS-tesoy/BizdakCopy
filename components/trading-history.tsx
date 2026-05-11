import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const recentTrades = [
  { id: 1, symbol: "BTC-USDT", type: "BUY", entry: "64,250.0", exit: "65,180.0", move: 1.45, profit: 245.0, time: "2h ago" },
  { id: 2, symbol: "SOL-USDT", type: "SELL", entry: "147.80", exit: "142.65", move: 3.48, profit: 318.0, time: "5h ago" },
  { id: 3, symbol: "ETH-USDT", type: "BUY", entry: "3,120.4", exit: "3,178.9", move: 1.87, profit: 402.0, time: "8h ago" },
  { id: 4, symbol: "XRP-USDT", type: "SELL", entry: "0.5240", exit: "0.5365", move: -2.39, profit: -165.0, time: "12h ago" },
  { id: 5, symbol: "BTC-USDT", type: "BUY", entry: "63,780.0", exit: "64,240.0", move: 0.72, profit: 235.0, time: "1d ago" },
  { id: 6, symbol: "DOGE-USDT", type: "SELL", entry: "0.1580", exit: "0.1515", move: 4.11, profit: 210.0, time: "1d ago" },
]

export function TradingHistory() {
  return (
    <section className="section-fade-divider px-6 py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Recent Trades</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Demo trading history for platform preview. Replace this sample data with verified OKX account records before
            public launch.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Sample Trade History</CardTitle>
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
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Move</th>
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
                            <ArrowUpRight className="mr-1 size-3" />
                          ) : (
                            <ArrowDownRight className="mr-1 size-3" />
                          )}
                          {trade.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm">{trade.entry}</td>
                      <td className="py-3 px-4 text-right font-mono text-sm">{trade.exit}</td>
                      <td
                        className={`py-3 px-4 text-right font-mono text-sm ${trade.move >= 0 ? "text-chart-2" : "text-destructive"}`}
                      >
                        {trade.move >= 0 ? "+" : ""}
                        {trade.move.toFixed(2)}%
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
