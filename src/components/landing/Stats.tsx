import { Ruler, Route, Cog, Award } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useCountUp } from '@/hooks/useCountUp';

const stats = [
  {
    icon: Ruler,
    value: 700,
    suffix: 'mm',
    prefix: '32-',
    label: 'Zakres średnic',
  },
  {
    icon: Route,
    value: 300,
    suffix: 'm',
    prefix: 'do ',
    label: 'Maksymalny dystans',
  },
  {
    icon: Cog,
    value: 1,
    suffix: '',
    prefix: 'XCMG',
    label: 'Park maszynowy',
    noCount: true,
  },
  {
    icon: Award,
    value: 100,
    suffix: '+',
    prefix: '',
    label: 'Zrealizowanych projektów',
  },
];

function StatCard({
  stat,
  index,
  isVisible,
}: {
  stat: (typeof stats)[0];
  index: number;
  isVisible: boolean;
}) {
  const count = useCountUp({
    end: stat.value,
    duration: 2000,
    enabled: isVisible && !stat.noCount,
  });

  return (
    <div
      className={`group relative bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <stat.icon className="w-7 h-7 text-primary" />
      </div>

      {/* Value */}
      <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        {stat.prefix}
        {stat.noCount ? '' : count}
        {stat.suffix}
      </div>

      {/* Label */}
      <div className="text-sm text-muted-foreground font-medium">
        {stat.label}
      </div>

      {/* Decorative Element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:bg-primary/10 transition-colors" />
    </div>
  );
}

export function Stats() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.2,
  });

  return (
    <section className="py-16 bg-muted/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              index={index}
              isVisible={isIntersecting}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
