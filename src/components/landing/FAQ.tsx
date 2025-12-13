import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Jak szybko wyceniacie projekt?',
    answer:
      'Wstępną wycenę przygotowujemy w ciągu 24-48 godzin od otrzymania dokumentacji projektowej lub opisu zakresu prac. Do precyzyjnej wyceny potrzebujemy: lokalizacji, długości przewiertu, średnicy rury oraz informacji o warunkach gruntowych. Wycena jest bezpłatna i niezobowiązująca.',
  },
  {
    question: 'Czy metoda HDD niszczy drogę lub teren?',
    answer:
      'Nie. Technologia przewiertów sterowanych HDD jest metodą bezwykopową – wiercenie odbywa się pod powierzchnią gruntu bez konieczności rozkopywania terenu. Jedyne wykopy to niewielkie studnie startowa i docelowa. Dzięki temu zachowujemy istniejącą infrastrukturę, tereny zielone i nawierzchnie drogowe w nienaruszonym stanie.',
  },
  {
    question: 'Jaki jest koszt przewiertu za metr?',
    answer:
      'Cena zależy od wielu czynników: średnicy rury, długości przewiertu, rodzaju gruntu, głębokości, dostępności terenu oraz lokalizacji. Każdy projekt wyceniamy indywidualnie. Skontaktuj się z nami, aby otrzymać szczegółową ofertę dostosowaną do Twojego projektu.',
  },
  {
    question: 'Jakie rury można instalować metodą HDD?',
    answer:
      'Metodą przewiertów sterowanych instalujemy rury PE (polietylenowe), PVC, stalowe oraz inne materiały. Najczęściej wykonujemy instalacje dla: wodociągów, kanalizacji, gazociągów, kabli energetycznych i telekomunikacyjnych. Średnice od 32mm do 700mm.',
  },
  {
    question: 'Czy pracujecie na terenie całej Polski?',
    answer:
      'Tak, realizujemy projekty na terenie całej Polski. Dysponujemy mobilnym sprzętem, który możemy przetransportować w dowolne miejsce. Dla większych projektów oferujemy konkurencyjne stawki niezależnie od lokalizacji.',
  },
];

export function FAQ() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section className="py-24 bg-background">
      <div ref={ref} className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div
            className={`text-center mb-12 ${
              isIntersecting ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Często Zadawane <span className="text-primary">Pytania</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Odpowiedzi na najczęściej zadawane pytania o nasze usługi
            </p>
          </div>

          {/* Accordion */}
          <div
            className={`${
              isIntersecting ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '150ms' }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-lg transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors py-6 [&[data-state=open]]:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
