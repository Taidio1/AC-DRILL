import { CheckCircle, MapPin, Ruler, Calendar } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import zdjeciaZPracImg from '@/img/zdjeciaZPrac.jpg';

export function Projects() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section id="realizacje" className="py-24 bg-muted/30">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-16 ${isIntersecting ? 'animate-fade-in-up' : 'opacity-0'
            }`}
        >
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Realizacje
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nasze <span className="text-primary">Projekty</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Przykłady zrealizowanych inwestycji potwierdzające nasze
            kompetencje
          </p>
        </div>

        {/* Featured Project */}
        <div
          className={`bg-card rounded-3xl overflow-hidden border border-border shadow-lg ${isIntersecting ? 'animate-scale-in' : 'opacity-0'
            }`}
          style={{ animationDelay: '150ms' }}
        >
          <div className="grid lg:grid-cols-2">
            {/* Image */}
            <div className="relative h-64 lg:h-auto">
              <img
                src={zdjeciaZPracImg}
                alt="Realizacja przewiertu 170m"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/50 lg:bg-gradient-to-l" />

              {/* Badge */}
              <div className="absolute top-4 left-4 px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-full shadow-lg">
                Wyróżniony Projekt
              </div>
            </div>

            {/* Content */}
            <div className="p-8 lg:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Instalacja 170m rury fi 160mm w jednym ciągu
              </h3>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-muted rounded-xl">
                  <Ruler className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">170m</p>
                  <p className="text-xs text-muted-foreground">Długość</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">fi160</p>
                  <p className="text-xs text-muted-foreground">Średnica</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">6 dni</p>
                  <p className="text-xs text-muted-foreground">Realizacja</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Wyzwanie:
                  </h4>
                  <p className="text-muted-foreground">
                    Przejście pod lasem wojewódzkim bez możliwości
                    wycinki. Skomplikowana struktura gruntu z warstwami
                    kamienistymi.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Rozwiązanie:
                  </h4>
                  <p className="text-muted-foreground">
                    Zastosowanie technologii HDD z precyzyjną nawigacją
                    pozwoliło na bezbłędne wykonanie przewiertu w jednym ciągu,
                    bez wycinki.
                  </p>
                </div>
              </div>

              {/* Success Points */}
              <div className="flex flex-wrap gap-3">
                {['Bez wycinki drzew', 'Terminowa realizacja', 'Pełna kontrola trasy'].map(
                  (point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full"
                    >
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {point}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
