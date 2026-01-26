import { Phone, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

const contactInfo = [
  {
    icon: Phone,
    label: 'Telefon',
    value: '+48 604 404 541',
    href: 'tel:+48604404541',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'biuro@acdrill.pl',
    href: 'mailto:biuro@acdrill.pl',
  },
  {
    icon: MapPin,
    label: 'Lokalizacja',
    value: 'Małopolska',
    href: null,
  },
];

export function Contact() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Wiadomość została wysłana pomyślnie!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(data.message || 'Wystąpił problem z wysłaniem wiadomości.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      // In development mode (localhost), we might fail to hit the PHP script if not proxied, 
      // but on production it should work.
      toast.error('Wystąpił błąd połączenia. Spróbuj ponownie później.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="kontakt" className="py-24 bg-muted/30">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-16 ${isIntersecting ? 'animate-fade-in-up' : 'opacity-0'
            }`}
        >
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Kontakt
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Skontaktuj się z <span className="text-primary">Nami</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Otrzymaj bezpłatną wycenę w ciągu 24 godzin
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div
            className={`bg-card rounded-3xl p-8 border border-border shadow-lg ${isIntersecting ? 'animate-fade-in-left' : 'opacity-0'
              }`}
          >
            <h3 className="text-xl font-bold text-foreground mb-6">
              Darmowa Wycena
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Imię i nazwisko
                </label>
                <Input
                  id="name"
                  required
                  placeholder="Jan Kowalski"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="jan@firma.pl"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Telefon
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+48 123 456 789"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Opis projektu
                </label>
                <Textarea
                  id="message"
                  required
                  placeholder="Opisz swój projekt: lokalizacja, długość przewiertu, średnica rury..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="bg-background border-border resize-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all group"
              >
                {isSubmitting ? (
                  <>
                    Wysyłanie...
                    <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                  </>
                ) : (
                  <>
                    Wyślij zapytanie
                    <Send className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div
            className={`${isIntersecting ? 'animate-fade-in-right' : 'opacity-0'
              }`}
            style={{ animationDelay: '150ms' }}
          >
            <div className="space-y-6 mb-8">
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-lg font-semibold text-foreground">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Card */}
            <div className="bg-secondary text-secondary-foreground rounded-3xl p-8">
              <h4 className="text-xl font-bold mb-3">
                Potrzebujesz szybkiej odpowiedzi?
              </h4>
              <p className="text-secondary-foreground/80 mb-6">
                Zadzwoń do nas bezpośrednio – odpowiemy na wszystkie Twoje
                pytania i pomożemy dobrać optymalne rozwiązanie.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full"
              >
                <a href="tel:+48604404541">
                  <Phone className="mr-2 w-5 h-5" />
                  Zadzwoń: +48 604 404 541
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
