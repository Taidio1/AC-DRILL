import { Drill, Phone, Mail, MapPin } from 'lucide-react';

const navLinks = [
  { label: 'Start', href: '#start' },
  { label: 'Oferta', href: '#oferta' },
  { label: 'Park Maszynowy', href: '#maszyny' },
  { label: 'Realizacje', href: '#realizacje' },
  { label: 'Kontakt', href: '#kontakt' },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Drill className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">
                  Inżynieria
                </span>
                <span className="text-xs text-primary font-semibold tracking-wider uppercase">
                  Bezwykopowa
                </span>
              </div>
            </div>
            <p className="text-secondary-foreground/70 mb-4 max-w-md">
              ZAKŁAD INSTALACJI WODNO-KANALIZACYJNYCH, GAZU ORAZ CENTRALNEGO
              OGRZEWANIA
            </p>
            <p className="text-secondary-foreground/60 text-sm">
              Profesjonalne usługi przewiertów sterowanych HDD i przecisków.
              Działamy na terenie całej Polski.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-lg mb-4">Nawigacja</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Kontakt</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a
                  href="tel:+48604404541"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors"
                >
                  +48 604 404 541
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a
                  href="mailto:biuro@inzynieria-bezwykopowa.pl"
                  className="text-secondary-foreground/70 hover:text-primary transition-colors text-sm"
                >
                  biuro@inzynieria-bezwykopowa.pl
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-secondary-foreground/70 text-sm">
                  Działamy na terenie całej Polski
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/50 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Inżynieria Bezwykopowa. Wszelkie prawa
            zastrzeżone.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-secondary-foreground/50 hover:text-primary transition-colors"
            >
              Polityka prywatności
            </a>
            <a
              href="#"
              className="text-secondary-foreground/50 hover:text-primary transition-colors"
            >
              Regulamin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
