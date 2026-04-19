import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useCMS } from '@/hooks/use-cms'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Linhas', href: '/linhas' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Contato', href: '/contato' },
]

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { getSetting, getSocialUrl, getPageContent } = useCMS()

  const logoUrl = getSetting('site_logo')
  const instagramUrl =
    getSocialUrl('instagram') || 'https://www.instagram.com/vittoriodesignoficial/'
  const footerAbout = getPageContent(
    'footer',
    'about',
    'Equipamentos Profissionais para Food Service. Excelência e durabilidade em Inox 304.',
  )

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 relative group overflow-hidden rounded-md"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Vittorio Logo"
                className="h-12 max-w-[150px] object-contain"
              />
            ) : (
              <span className="font-serif text-3xl font-bold text-primary tracking-widest px-2 py-1 border-2 border-primary">
                VITTORIO
              </span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary relative py-2',
                  location.pathname === link.href ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in zoom-in" />
                )}
              </Link>
            ))}
            <Button asChild className="font-semibold" variant="default">
              <a href="https://wa.me/5521990451568" target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4 mr-2" />
                (21) 99045-1568
              </a>
            </Button>
            {isAuthenticated && (
              <Button asChild variant="outline" size="sm" className="ml-4">
                <Link to="/dashboard">Painel</Link>
              </Button>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'text-base font-medium p-2 rounded-md',
                  location.pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full mt-2">
              <a href="https://wa.me/5521990451568" target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4 mr-2" />
                Fale Conosco
              </a>
            </Button>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="font-serif text-2xl font-bold text-primary tracking-widest">
              VITTORIO
            </div>
            <p className="text-muted-foreground text-sm">{footerAbout}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Navegação</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Itaboraí - RJ</li>
              <li>(21) 99045-1568</li>
              <li>contato@vittoriodesign.com.br</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Social</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vittorio Design. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
