/**
 * Maps the free-text `color` field on a Category to literal Tailwind
 * classes. Written out (not templated) so Tailwind's compiler can see and
 * keep them — a templated `bg-${color}-500` string would be purged.
 */
export const CATEGORY_COLOR_CLASSES: Record<string, { bg: string; text: string; dot: string }> = {
  amber: { bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  sky: { bg: "bg-sky-100 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-400", dot: "bg-sky-500" },
  rose: { bg: "bg-rose-100 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  violet: { bg: "bg-violet-100 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  fuchsia: { bg: "bg-fuchsia-100 dark:bg-fuchsia-950/40", text: "text-fuchsia-700 dark:text-fuchsia-400", dot: "bg-fuchsia-500" },
  teal: { bg: "bg-teal-100 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-500" },
  slate: { bg: "bg-slate-100 dark:bg-slate-800/60", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-500" },
};

const DEFAULT_COLOR_CLASSES = CATEGORY_COLOR_CLASSES.slate!;

export function getCategoryColorClasses(color: string | null | undefined): {
  bg: string;
  text: string;
  dot: string;
} {
  if (!color) return DEFAULT_COLOR_CLASSES;
  return CATEGORY_COLOR_CLASSES[color] ?? DEFAULT_COLOR_CLASSES;
}

export const CATEGORY_COLOR_OPTIONS = Object.keys(CATEGORY_COLOR_CLASSES);
