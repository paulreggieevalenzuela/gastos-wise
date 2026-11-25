"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PickerOption {
  value: string;
  label: string;
  /** Badge / icon shown before the label (bank badge, category icon, …). */
  icon?: React.ReactNode;
  /** Small secondary text, e.g. a balance or "Expense". */
  hint?: string;
  /** Indent (e.g. a subcategory under its parent). */
  indent?: boolean;
}

const PHONE_QUERY = "(max-width: 639px)";

/**
 * A dropdown that can show icons and badges inside each option — which a
 * native <select> can't. Opens as a bottom sheet on phones and as a
 * popover on larger screens. Keyboard: ↑/↓, Home/End, Enter/Space, Esc.
 */
export function Picker({
  value,
  onChange,
  options,
  placeholder = "Select…",
  title,
  id,
  className,
  disabled = false,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  /** Heading shown on the phone bottom sheet. */
  title?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.max(r.width, 240);
    const left = Math.min(r.left, window.innerWidth - width - 8);
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const openUp = below < 220 && above > below;
    const maxHeight = Math.min(320, openUp ? above : below);
    setPos({ top: openUp ? r.top - 6 - maxHeight : r.bottom + 6, left: Math.max(8, left), width, maxHeight });
  }, []);

  function openPicker() {
    const phone = window.matchMedia(PHONE_QUERY).matches;
    setIsPhone(phone);
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    if (!phone) place();
    setOpen(true);
  }

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    close();
  }

  // Keyboard handling in the capture phase, so Esc closes only this picker
  // and not a sheet/modal it's sitting in.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setActive(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActive(options.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        choose(active);
      } else if (e.key === "Tab") {
        close(false);
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active, options]);

  // Desktop popover: follow the trigger if the page or a sheet scrolls; close on resize.
  useEffect(() => {
    if (!open || isPhone) return;
    const onScroll = () => place();
    const onResize = () => close(false);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, isPhone, place, close]);

  useLayoutEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const list = (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      tabIndex={-1}
      aria-label={ariaLabel ?? title}
      aria-activedescendant={`${listId}-${active}`}
      className="min-h-0 overflow-y-auto overscroll-contain p-1.5 focus:outline-none"
      style={isPhone ? undefined : { maxHeight: pos?.maxHeight }}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <li
            key={option.value || `__empty-${index}`}
            id={`${listId}-${index}`}
            data-index={index}
            role="option"
            aria-selected={isSelected}
            onMouseEnter={() => setActive(index)}
            onClick={() => choose(index)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              option.indent && "pl-8",
              index === active ? "bg-surface-raised" : "",
            )}
          >
            {option.icon && <span className="flex shrink-0 items-center">{option.icon}</span>}
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate", isSelected ? "font-bold text-ink" : "font-semibold text-ink")}>
                {option.label}
              </span>
              {option.hint && <span className="block truncate text-xs font-medium text-ink-faint">{option.hint}</span>}
            </span>
            {isSelected && <Check size={16} className="shrink-0 text-accent" strokeWidth={2.5} />}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (open ? close() : openPicker())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-surface pl-3 pr-10 text-left text-sm text-ink transition-colors hover:border-border-strong focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15",
          open && "border-accent ring-4 ring-accent/15",
          "relative disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        {selected?.icon && <span className="flex shrink-0 items-center">{selected.icon}</span>}
        <span className={cn("min-w-0 flex-1 truncate font-semibold", !selected && "font-medium text-ink-faint")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open &&
        createPortal(
          isPhone ? (
            <div className="fixed inset-0 z-[60] flex items-end">
              <div className="gw-fade absolute inset-0 bg-black/40" onClick={() => close()} aria-hidden />
              <div className="gw-sheet pb-safe relative flex max-h-[72dvh] w-full flex-col rounded-t-3xl border border-border bg-surface shadow-float">
                <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-border-strong" aria-hidden />
                {(title ?? ariaLabel) && (
                  <p className="shrink-0 px-5 pb-1 pt-3 text-base font-bold text-ink">{title ?? ariaLabel}</p>
                )}
                {list}
              </div>
            </div>
          ) : (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => close(false)} aria-hidden />
              <div
                className="gw-pop fixed z-[61] overflow-hidden rounded-2xl border border-border bg-surface shadow-float"
                style={pos ? { top: pos.top, left: pos.left, width: pos.width } : undefined}
              >
                {list}
              </div>
            </>
          ),
          document.body,
        )}
    </>
  );
}
