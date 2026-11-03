import { cn } from "@/lib/utils";

const DEFAULT_CATEGORY_STYLES =
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/60";

const CATEGORY_STYLES = [
  {
    matches: ["tree", "plant", "cleanup", "environment"],
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/60",
  },
  {
    matches: ["winter", "flood", "food", "relief"],
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/60",
  },
  {
    matches: ["blood", "donation"],
    className:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800/60",
  },
  {
    matches: ["education", "learning", "school"],
    className:
      "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800/60",
  },
];

const VARIANT_STYLES = {
  category: DEFAULT_CATEGORY_STYLES,
  status:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800/60",
  neutral:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:border-slate-700",
  hero: "bg-white/15 text-white border-white/35 dark:bg-slate-950/55 dark:text-sky-100 dark:border-sky-300/40",
};

function getCategoryStyles(label) {
  const normalizedLabel = String(label).toLowerCase();
  return (
    CATEGORY_STYLES.find(({ matches }) =>
      matches.some((match) => normalizedLabel.includes(match)),
    )?.className ?? DEFAULT_CATEGORY_STYLES
  );
}

export default function EventBadge({
  label,
  variant = "category",
  className = "",
  icon = null,
  leadingDot = false,
}) {
  const styles =
    variant === "category"
      ? getCategoryStyles(label)
      : VARIANT_STYLES[variant] ?? VARIANT_STYLES.category;

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
