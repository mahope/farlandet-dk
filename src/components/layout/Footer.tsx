import { Link } from 'react-router-dom'
import { Heart, Github, Mail, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { label: 'Hjem', href: '/' },
      { label: 'Kategorier', href: '/categories' },
      { label: 'Bidrag', href: '/submit' },
      { label: 'Support', href: '/support' }
    ],
    community: [
      { label: 'Retningslinjer', href: '/guidelines' },
      { label: 'Privatlivspolitik', href: '/privacy' },
      { label: 'Kontakt', href: '/contact' }
    ]
  }

  return (
    <footer className={cn("bg-card border-t border-border/40", className)}>
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Farlandet.dk
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                Danmarks mest hjælpsomme far-fællesskab. Vi forbinder danske fædre og skaber en platform 
                hvor viden og erfaringer deles for at gøre forældreskabet lettere og mere meningsfuldt.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Lavet med</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>til danske fædre</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Fællesskab</h3>
              <ul className="space-y-3">
                {footerLinks.community.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span>© {currentYear} Farlandet.dk</span>
              <span className="hidden md:inline">•</span>
              <span>Alle rettigheder forbeholdes</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-xs">Bygget med</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-primary">React</span>
                  <span className="text-xs">•</span>
                  <span className="text-xs font-medium text-primary">TypeScript</span>
                  <span className="text-xs">•</span>
                  <span className="text-xs font-medium text-primary">Tailwind</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <a
                  href="mailto:kontakt@farlandet.dk"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  title="Send os en email"
                >
                  <Mail className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/mahope/farlandet-dk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  title="Se kildekoden på GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <span className="text-muted-foreground">•</span>
                <Link
                  to="/admin"
                  className="text-xs text-muted-foreground/60 hover:text-primary transition-colors duration-200"
                  title="Admin"
                >
                  ◦
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}