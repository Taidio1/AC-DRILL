import { CheckCircle, Zap, Shield, Leaf, Gauge } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import maszynaImg from '@/img/maszyna.jpg';

const features = [
  {
    icon: Zap,
    title: 'Wysoka Moc',
    description: 'Uciąg do 230kN dla najtrudniejszych warunków',
  },
  {
    icon: Gauge,
    title: 'Precyzja',
    description: 'Zaawansowana nawigacja i sterowanie',
  },
  {
    icon: Shield,
    title: 'Niezawodność',
    description: 'Sprawdzony sprzęt światowej klasy',
  },
  {
    icon: Leaf,
    title: 'Ekologia',
    description: 'Minimalna ingerencja w środowisko',
  },
];

const specs = [
  'Maksymalny uciąg: 230kN',
  'Moment obrotowy: 15 000 Nm',
  'Średnice wierceń: 32-700mm',
  'Zasięg do 300m w jednym ciągu',
];

export function Machinery() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section id="maszyny" className="py-24 bg-muted/30">
      <div ref={ref} className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div
            className={`relative ${isIntersecting ? 'animate-fade-in-left' : 'opacity-0'
              }`}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={maszynaImg}
                alt="Wiertnica XCMG XZ230E"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />

              {/* Badge */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-foreground">
                        XZ
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">XCMG XZ230E</p>
                      <p className="text-sm text-muted-foreground">
                        Wiertnica Pozioma
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div
            className={`${isIntersecting ? 'animate-fade-in-right' : 'opacity-0'
              }`}
            style={{ animationDelay: '150ms' }}
          >
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Park Maszynowy
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nowoczesny Sprzęt{' '}
              <span className="text-primary">Gwarancją Sukcesu</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Dysponujemy profesjonalną wiertnicą XCMG XZ230E, która zapewnia
              najwyższą precyzję i siłę niezbędną do realizacji nawet
              najtrudniejszych projektów.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                  style={{ animationDelay: `${(index + 2) * 100}ms` }}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Specs */}
            <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
              <h4 className="font-semibold text-foreground mb-4">
                Parametry techniczne:
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
