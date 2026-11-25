import type { AccountType } from "@/types/api";

export interface Institution {
  key: string;
  label: string;
  type: AccountType;
  /** Short mark shown in the colored badge (see InstitutionIcon). */
  badge: string;
  /** Brand-ish background color for the badge -- not an official brand asset, just a recognizable hint. */
  color: string;
}

/**
 * Common Philippine accounts, for the "Institution" picker on the account
 * form. These are generic colored initials badges, not reproductions of
 * actual bank/e-wallet logos (which are trademarked) -- just enough of a
 * visual hint to tell accounts apart at a glance.
 */
export const INSTITUTIONS: Institution[] = [
  { key: "cash", label: "Cash", type: "CASH", badge: "₱", color: "#4B5A51" },
  { key: "gcash", label: "GCash", type: "EWALLET", badge: "GC", color: "#0072CE" },
  { key: "maya", label: "Maya (PayMaya)", type: "EWALLET", badge: "MY", color: "#00D083" },
  { key: "grabpay", label: "GrabPay", type: "EWALLET", badge: "GP", color: "#00B14F" },
  { key: "shopeepay", label: "ShopeePay", type: "EWALLET", badge: "SP", color: "#EE4D2D" },
  { key: "bdo", label: "BDO", type: "BANK", badge: "BDO", color: "#003DA5" },
  { key: "bpi", label: "BPI", type: "BANK", badge: "BPI", color: "#AB0E2E" },
  { key: "metrobank", label: "Metrobank", type: "BANK", badge: "MB", color: "#002F6C" },
  { key: "unionbank", label: "UnionBank", type: "BANK", badge: "UB", color: "#F57C00" },
  { key: "landbank", label: "Landbank", type: "BANK", badge: "LB", color: "#00703C" },
  { key: "securitybank", label: "Security Bank", type: "BANK", badge: "SB", color: "#C8102E" },
  { key: "maribank", label: "Maribank", type: "BANK", badge: "MB", color: "#6C3FA6" },
  { key: "wise", label: "Wise", type: "EWALLET", badge: "W", color: "#3FA86B" },
  { key: "crypto", label: "Crypto", type: "OTHER", badge: "₿", color: "#C9941F" },
];

export function getInstitution(key: string | null | undefined): Institution | undefined {
  return key ? INSTITUTIONS.find((i) => i.key === key) : undefined;
}
