import { ACCOUNT_TYPE_ICONS } from "@/lib/icons";
import { getInstitution } from "@/lib/institutions";
import type { AccountType } from "@/types/api";

/**
 * Renders a colored initials badge for a known institution preset, or
 * falls back to the generic account-type icon for custom/freeform accounts.
 */
export function InstitutionIcon({
  icon,
  type,
  size = 40,
}: {
  icon?: string | null;
  type: AccountType;
  size?: number;
}) {
  const institution = getInstitution(icon);

  if (institution) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold text-white"
        style={{ width: size, height: size, backgroundColor: institution.color }}
        title={institution.label}
      >
        {institution.badge}
      </div>
    );
  }

  const Icon = ACCOUNT_TYPE_ICONS[type];
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.45} />
    </div>
  );
}
