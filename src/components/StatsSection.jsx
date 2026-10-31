import { CheckCircle2, HeartHandshake, MapPin, Users } from "lucide-react";

const STATS = [
  { value: "5,000+", label: "Active Volunteers", icon: Users },
  { value: "120+", label: "Drives Completed", icon: CheckCircle2 },
  { value: "64", label: "Districts Reached", icon: MapPin },
  { value: "৳50L+", label: "Aid Distributed", icon: HeartHandshake },
];

export default function StatsSection() {
  return (
    <section
      aria-label="Our impact in numbers"
      className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10"
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          const isTeal = index % 2 === 0;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/20"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${
                  isTeal
                    ? "bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-300"
                    : "bg-amber-500/10 text-amber-600 ring-amber-500/25 dark:text-amber-400"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight text-foreground sm:text-xl">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
