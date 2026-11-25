import { getCategoryColorClasses } from "@/lib/category-colors";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Small rounded tile with a category's icon in its color. */
export function CategoryBadge({
  icon,
  name,
  color,
  size = 28,
  className,
}: {
  icon?: string | null;
  name?: string | null;
  color?: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = getCategoryIcon(icon, name);
  const colors = getCategoryColorClasses(color);
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-lg", colors.bg, colors.text, className)}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.55)} />
    </span>
  );
}
