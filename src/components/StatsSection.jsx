import { CheckCircle2, HeartHandshake, MapPin, Sparkles, Users } from "lucide-react";

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
      className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-secondary uppercase ring-1 ring-secondary/20 dark:border-sky-400/40 dark:bg-sky-950/40 dark:text-sky-300">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Our Impact at a Glance
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Our Collective Impact{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Across Bangladesh
          </span>
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground dark:text-slate-300 sm:text-base">
          Quantifying hope, support, and community action in every corner of
          the nation.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          const isPrimary = index % 2 === 0;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/20"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${isPrimary
                    ? "bg-primary/10 text-primary ring-primary/20"
                    : "bg-secondary/10 text-secondary ring-secondary/20"
                  }`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight text-foreground sm:text-xl">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-300">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
