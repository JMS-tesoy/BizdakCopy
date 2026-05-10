import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
          <p className="text-muted-foreground mb-8">
            Complete reference for integrating the FINBRO Copy trading signals API with your MT5 Expert Advisor.
          </p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                All API requests require authentication via the{" "}
                <code className="bg-muted px-2 py-1 rounded">X-API-Key</code> header.
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <p className="text-muted-foreground">{"// Example header"}</p>
                <p>X-API-Key: your_api_key_here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                  GET
                </Badge>
                <CardTitle className="font-mono text-lg">/api/v1/heartbeat</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Check connection status and subscription info. Use this to verify your EA is connected.
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{`// Response
{
  "success": true,
  "data": {
    "status": "connected",
    "subscription": "active",
    "tier": "pro",
    "maxAccounts": 5
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}</pre>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                  GET
                </Badge>
                <CardTitle className="font-mono text-lg">/api/v1/signals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Get trading signals. Poll this endpoint regularly to receive new signals.
              </p>

              <div>
                <p className="font-medium mb-2">Query Parameters:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <code className="bg-muted px-1 rounded">since</code> - ISO timestamp to get signals after (optional)
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">limit</code> - Max signals to return, default 10 (optional)
                  </li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{`// Response
{
  "success": true,
  "data": {
    "signals": [
      {
        "id": "sig_123",
        "action": "OPEN",
        "symbol": "EURUSD",
        "type": "BUY",
        "lotSize": 0.1,
        "entryPrice": 1.0842,
        "stopLoss": 1.0792,
        "takeProfit": 1.0942,
        "magicNumber": 123456,
        "timestamp": "2024-01-15T10:30:00Z",
        "tradeId": "trade_001"
      }
    ],
    "count": 1
  },
  "timestamp": "2024-01-15T10:30:05Z"
}`}</pre>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                  GET
                </Badge>
                <CardTitle className="font-mono text-lg">/api/v1/trades</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Get current open trades. Use this on EA startup to sync with master account.
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{`// Response
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "trade_001",
        "symbol": "EURUSD",
        "type": "BUY",
        "lotSize": 0.1,
        "entryPrice": 1.0842,
        "stopLoss": 1.0792,
        "takeProfit": 1.0942,
        "openTime": "2024-01-15T10:30:00Z",
        "status": "OPEN",
        "magicNumber": 123456
      }
    ],
    "count": 1
  },
  "timestamp": "2024-01-15T10:30:05Z"
}`}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signal Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Each signal has an action field indicating what your EA should do:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge>OPEN</Badge>
                  <span className="text-muted-foreground">Open a new trade with the specified parameters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge>CLOSE</Badge>
                  <span className="text-muted-foreground">Close the trade matching the tradeId/magicNumber</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge>MODIFY</Badge>
                  <span className="text-muted-foreground">Update stop loss and/or take profit levels</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
