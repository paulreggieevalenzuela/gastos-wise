import { INSTITUTIONS } from "@/lib/institutions";

/** Endlessly scrolling row of the account presets (pauses on hover, static under reduced motion). */
export function InstitutionMarquee() {
  const items = [...INSTITUTIONS, ...INSTITUTIONS];

  return (
    <div className="lp-marquee overflow-hidden">
      <div className="lp-marquee-track flex w-max py-1">
        {items.map((inst, i) => (
          <div key={`${inst.key}-${i}`} className="pr-3" aria-hidden={i >= INSTITUTIONS.length}>
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm text-ink-muted shadow-card">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: inst.color }}
              >
                {inst.badge}
              </span>
              <span className="whitespace-nowrap">{inst.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
