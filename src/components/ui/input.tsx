import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// 16px text on phones: iPhone Safari zooms the whole page in when you tap a
// field with smaller text, and doesn't zoom back out. 14px from `sm` up.
export const fieldBase =
  "w-full rounded-xl border border-border bg-surface text-base text-ink sm:text-sm transition-colors placeholder:text-ink-faint hover:border-border-strong focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, "h-11 px-3.5", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, "px-3.5 py-2.5", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

/**
 * Native <select> (best on phones — opens the OS picker) with the browser
 * arrow hidden and our own chevron placed inside the right padding, so the
 * arrow never sits flush against the edge. `className` sizes the wrapper.
 */
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("relative w-full", className)}>
      <select ref={ref} className={cn(fieldBase, "gw-select h-11 cursor-pointer pl-3.5 pr-10")} {...props}>
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
      />
    </div>
  ),
);
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-semibold text-ink-muted", className)} {...props} />;
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="gw-fade mt-1 text-xs font-medium text-negative">{children}</p>;
}
