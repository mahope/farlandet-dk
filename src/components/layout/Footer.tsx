import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn(
      "border-t bg-background",
      className
    )}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Om Farlandet.dk</h3>
            <p className="text-sm text-muted-foreground">
              Danmarks førende fællesskab for fædre. Vi deler ressourcer, tips og erfaringer. 
              Sammen skaber vi et stærkt netværk af støttende danske fædre.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hurtige Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/resources" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Alle Ressourcer
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kategorier
                </Link>
              </li>
              <li>
                <Link 
                  to="/random" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tilfældig Ressource
                </Link>
              </li>
              <li>
                <Link 
                  to="/submit" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Bidrag med Indhold
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fællesskab</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/guidelines" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Retningslinjer
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privatlivspolitik
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kontakt
                </Link>
              </li>
              <li>
                <Link 
                  to="/support" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© {currentYear} Farlandet.dk.</span>
              <span>Lavet med</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>af danske fædre.</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}