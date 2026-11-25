import { ACCOUNT_TYPE_ICONS } from "@/lib/icons";
import { getInstitution } from "@/lib/institutions";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/types/api";

/**
 * A bank / e-wallet mark: the official logo if one is configured in
 * lib/institutions.ts, otherwise a colored initials badge, otherwise (for
 * custom accounts) the generic account-type icon tinted with the accent.
 */
export function InstitutionIcon({
  icon,
  type,
  size = 40,
  className,
}: {
  icon?: string | null;
  type: AccountType;
  size?: number;
  className?: string;
}) {
  const institution = getInstitution(icon);

  if (institution?.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={institution.logo}
        alt={institution.label}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full bg-white object-contain", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (institution) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-extrabold tracking-tight text-white",
          className,
        )}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(8, size * (institution.badge.length > 2 ? 0.28 : 0.36)),
          backgroundImage: `linear-gradient(145deg, ${institution.color}, color-mix(in srgb, ${institution.color} 70%, black))`,
          boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.25)",
        }}
        title={institution.label}
      >
        {institution.badge}
      </div>
    );
  }

  const Icon = ACCOUNT_TYPE_ICONS[type];
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent", className)}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.45)} />
    </div>
  );
}
