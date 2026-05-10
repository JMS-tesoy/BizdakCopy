import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Settings, Users } from "lucide-react"

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Download Expert Advisors</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get the MT5 Expert Advisors to start your copy trading journey
            </p>
          </div>

          <div className="mb-12 space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Bizdak_Copier.mq5</CardTitle>
                      <CardDescription>For subscribers - Copy trades automatically</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This EA connects to our API and automatically copies all trades to your MT5 account. Requires an
                    active subscription and API key.
                  </p>
                  <Button className="w-full" asChild>
                    <a href="/ea/Bizdak_Copier.mq5" download>
                      <Download className="mr-2 h-4 w-4" />
                      Download Follower EA
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card id="follower-installation">
                <CardHeader>
                  <CardTitle>Follower EA Installation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</Badge>
                      <div>
                        <p className="font-medium">Download the EA file</p>
                        <p className="text-sm text-muted-foreground">
                          Download Bizdak_Copier.mq5 using the button above
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</Badge>
                      <div>
                        <p className="font-medium">Open MT5 Data Folder</p>
                        <p className="text-sm text-muted-foreground">
                          In MT5, go to File → Open Data Folder → MQL5 → Experts
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</Badge>
                      <div>
                        <p className="font-medium">Copy the file</p>
                        <p className="text-sm text-muted-foreground">Paste Bizdak_Copier.mq5 into the Experts folder</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</Badge>
                      <div>
                        <p className="font-medium">Compile the EA</p>
                        <p className="text-sm text-muted-foreground">
                          Open MetaEditor, find the file and press F7 to compile
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">5</Badge>
                      <div>
                        <p className="font-medium">Enable Web Requests</p>
                        <p className="text-sm text-muted-foreground">
                          {
                            "In MT5, go to Tools → Options → Expert Advisors → Allow WebRequest for listed URL and add your API URL"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">6</Badge>
                      <div>
                        <p className="font-medium">Attach to Chart</p>
                        <p className="text-sm text-muted-foreground">
                          Drag the EA onto any chart, enter your API key from your dashboard, and enable AutoTrading
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ... existing Follower EA Settings card ... */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Follower EA Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Parameter</th>
                          <th className="text-left py-2 font-medium">Description</th>
                          <th className="text-left py-2 font-medium">Default</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b">
                          <td className="py-2 font-mono text-foreground">ApiKey</td>
                          <td className="py-2">Your unique API key from dashboard</td>
                          <td className="py-2">-</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-mono text-foreground">ApiUrl</td>
                          <td className="py-2">API server URL</td>
                          <td className="py-2">https://your-domain.com</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-mono text-foreground">LotMultiplier</td>
                          <td className="py-2">Multiply signal lot size (0.5 = half, 2 = double)</td>
                          <td className="py-2">1.0</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-mono text-foreground">MaxLotSize</td>
                          <td className="py-2">Maximum lot size per trade</td>
                          <td className="py-2">1.0</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-mono text-foreground">Slippage</td>
                          <td className="py-2">Maximum allowed slippage in points</td>
                          <td className="py-2">30</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-foreground">PollInterval</td>
                          <td className="py-2">How often to check for new signals (seconds)</td>
                          <td className="py-2">5</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
