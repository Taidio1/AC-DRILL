import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/img/acdrilllogo.png';

const navItems = [
  { label: 'Start',          href: '/#start',   isRoute: false },
  { label: 'Oferta',         href: '/#oferta',  isRoute: false },
  { label: 'Park Maszynowy', href: '/#maszyny', isRoute: false },
  { label: 'Galeria',        href: '/galeria',  isRoute: true  },
  { label: 'Kontakt',        href: '/#kontakt', isRoute: false },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-background/95 backdrop-blur-md shadow-lg'
        : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#start"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#start');
            }}
            className="flex items-center gap-2 group"
          >
            <img
              src={logo}
              alt="AC Drill"
              className="h-12 w-auto object-contain"
            />
            <span className="font-bold pb-2 text-4xl text-foreground leading-none tracking-tight">
              Drill
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('/#')) {
                      e.preventDefault();
                      const id = item.href.slice(2);
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </a>
              )
            )}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button
              onClick={() => scrollToSection('#kontakt')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Darmowa Wycena
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 bg-background/95 backdrop-blur-md' : 'max-h-0'
          }`}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
          {navItems.map((item) =>
            item.isRoute ? (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('/#')) {
                    e.preventDefault();
                    const id = item.href.slice(2);
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              >
                {item.label}
              </a>
            )
          )}
          <Button
            onClick={() => scrollToSection('#kontakt')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2"
          >
            Darmowa Wycena
          </Button>
        </nav>
      </div>
    </header>
  );
}
