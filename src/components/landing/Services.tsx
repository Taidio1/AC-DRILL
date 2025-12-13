import { Drill, CircleDot, CheckCircle, ArrowRight } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Drill,
    title: 'Przewierty Sterowane HDD',
    description:
      'Nowoczesna technologia wiercenia kierunkowego idealna dla długich dystansów i wymagających warunków terenowych.',
    features: [
      'Instalacja rur PE, PVC, stalowych',
      'Przejścia pod rzekami i ciekami wodnymi',
      'Prace na terenach zielonych bez niszczenia nawierzchni',
      'Precyzyjna nawigacja GPS',
    ],
    image:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80',
  },
  {
    icon: CircleDot,
    title: 'Przebicia Rurą Stalową',
    description:
      'Sprawdzona metoda wbijania rur stalowych, idealna pod nasypy kolejowe i w trudnych warunkach gruntowych.',
    features: [
      'Prace pod torami kolejowymi',
      'Przejścia przez grunty kamieniste',
      'Wysokie nośności rur osłonowych',
      'Szybka realizacja krótkich odcinków',
    ],
    image:
      'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600&q=80',
  },
];

export function Services() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
  });

  const scrollToContact = () => {
    const element = document.querySelector('#kontakt');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="oferta" className="py-24 bg-background">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-16 ${
            isIntersecting ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Nasza Oferta
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Kompleksowe Usługi <span className="text-primary">Bezwykopowe</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Oferujemy profesjonalne rozwiązania inżynieryjne dopasowane do
            specyfiki Twojego projektu
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`group relative bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-2xl transition-all duration-500 ${
                isIntersecting
                  ? index === 0
                    ? 'animate-fade-in-left'
                    : 'animate-fade-in-right'
                  : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant="outline"
                  onClick={scrollToContact}
                  className="w-full group/btn border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Zapytaj o wycenę
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
