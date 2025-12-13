import { useEffect, useState } from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="start"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80"
          alt="Przewierty sterowane HDD"
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8 animate-fade-in-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Technologia HDD
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up [animation-delay:100ms] opacity-0">
            Profesjonalne{' '}
            <span className="text-primary">Przewierty Sterowane</span> HDD i
            Przebicia Pod Drogami
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in-up [animation-delay:200ms] opacity-0">
            Realizujemy zlecenia inżynieryjne w zakresie średnic{' '}
            <strong className="text-foreground">32mm – 700mm</strong> na
            dystansie do <strong className="text-foreground">300m</strong>.
            Bezinwazyjne rozwiązania dla wymagających projektów.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:300ms] opacity-0">
            <Button
              size="lg"
              onClick={() => scrollToSection('#oferta')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
            >
              Zobacz Ofertę
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold transition-all hover:-translate-y-1"
            >
              <a href="tel:+48123456789">
                <Phone className="mr-2 w-5 h-5" />
                Zadzwoń Teraz
              </a>
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 pt-8 border-t border-border/50 animate-fade-in-up [animation-delay:400ms] opacity-0">
            <p className="text-sm text-muted-foreground mb-3">
              Zaufali nam wykonawcy i inwestorzy z całej Polski
            </p>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold text-foreground">100+</span>{' '}
                <span className="text-muted-foreground">
                  zrealizowanych projektów
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
