import { ClipboardList, Navigation, PipetteIcon } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const steps = [
  {
    icon: ClipboardList,
    number: '01',
    title: 'Analiza i Projekt',
    description:
      'Szczegółowa analiza terenu, warunków gruntowych oraz projektu technicznego. Przygotowanie optymalnej trasy przewiertu.',
  },
  {
    icon: Navigation,
    number: '02',
    title: 'Wiercenie Pilotowe',
    description:
      'Precyzyjne wiercenie otworu pilotowego z wykorzystaniem zaawansowanej nawigacji GPS i systemu lokalizacji.',
  },
  {
    icon: PipetteIcon,
    number: '03',
    title: 'Instalacja Rury',
    description:
      'Rozwiercanie otworu do docelowej średnicy i wciąganie rury docelowej. Kontrola jakości i odbiór techniczny.',
  },
];

export function Process() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.2,
  });

  return (
    <section className="py-24 bg-background">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-16 ${
            isIntersecting ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Jak Pracujemy
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sprawdzony <span className="text-primary">Proces Realizacji</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Każdy projekt realizujemy według sprawdzonego schematu, który
            gwarantuje najwyższą jakość i terminowość
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative ${
                  isIntersecting ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Card */}
                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group h-full">
                  {/* Number Badge */}
                  <div className="absolute -top-4 left-8 px-4 py-1 bg-primary text-primary-foreground font-bold text-sm rounded-full shadow-lg">
                    Krok {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors mt-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Timeline Dot (Desktop) */}
                <div className="hidden lg:flex absolute -bottom-12 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary rounded-full items-center justify-center shadow-lg animate-pulse-glow">
                  <div className="w-3 h-3 bg-primary-foreground rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
