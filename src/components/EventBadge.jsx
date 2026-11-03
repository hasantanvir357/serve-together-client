import { cn } from "@/lib/utils";

const CATEGORY_STYLES =
  "bg-sky-500/10 text-sky-600 dark:bg-sky-400/20 dark:text-sky-300 border border-sky-400/30 font-semibold";

const VARIANT_STYLES = {
  category: CATEGORY_STYLES,
  status:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800/60",
  neutral:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:border-slate-700",
  hero: "bg-white/15 text-white border-white/35 dark:bg-slate-950/55 dark:text-sky-100 dark:border-sky-300/40",
};

export default function EventBadge({
  label,
  variant = "category",
  className = "",
  icon = null,
  leadingDot = false,
}) {
  const styles =
    VARIANT_STYLES[variant] ?? VARIANT_STYLES.category;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
        styles,
        className,
      )}
    >
      {icon}
      {leadingDot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {label}
    </span>
  );
}
