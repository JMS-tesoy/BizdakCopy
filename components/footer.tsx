import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border bg-muted/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">BD</span>
              </div>
              <span className="font-semibold text-lg">Bizdak Copy</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Crypto copy trading workflow built exclusively for OKX users with restricted API permissions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#performance" className="hover:text-foreground transition-colors">
                  Performance
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  OKX Setup
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/risk" className="hover:text-foreground transition-colors">
                  Risk Disclosure
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Copy trading involves risk. Past performance does not guarantee future results. Users are responsible for
            their own OKX account, API permissions, risk settings, and trading capital. Withdraw permission is never
            required.
          </p>
          <p className="mt-2">&copy; 2026 Bizdak Copy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
