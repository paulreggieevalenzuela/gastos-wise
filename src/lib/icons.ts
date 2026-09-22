import {
  Banknote,
  Briefcase,
  Car,
  Circle,
  CirclePlus,
  Clapperboard,
  CreditCard,
  HeartPulse,
  Landmark,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Smartphone,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "@/types/api";

/** Maps the free-text `icon` field stored on a Category row to a component. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  receipt: Receipt,
  "shopping-bag": ShoppingBag,
  "heart-pulse": HeartPulse,
  clapperboard: Clapperboard,
  wallet: Wallet,
  briefcase: Briefcase,
  "circle-plus": CirclePlus,
  circle: Circle,
};

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  return (icon && CATEGORY_ICONS[icon]) || Circle;
}

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICONS);

export const ACCOUNT_TYPE_ICONS: Record<AccountType, LucideIcon> = {
  CASH: Banknote,
  BANK: Landmark,
  EWALLET: Smartphone,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  OTHER: Wallet,
};
