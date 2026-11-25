import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink shadow-glow hover:brightness-110",
  secondary: "border border-border bg-surface text-ink hover:border-border-strong hover:bg-surface-raised",
  soft: "bg-accent-soft text-accent hover:brightness-95",
  ghost: "text-ink-muted hover:bg-surface-raised hover:text-ink",
  danger: "bg-negative text-white hover:brightness-110",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 rounded-lg px-3 text-sm",
  md: "h-11 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-xl px-5 text-base",
  icon: "h-10 w-10 rounded-full",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "gw-press inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,border-color,filter,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
