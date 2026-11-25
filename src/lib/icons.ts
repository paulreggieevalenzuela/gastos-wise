import {
  Baby,
  Banknote,
  Beer,
  Bike,
  Bitcoin,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  CarTaxiFront,
  Circle,
  CirclePlus,
  Clapperboard,
  Coffee,
  CreditCard,
  Droplet,
  Dumbbell,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  Heart,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  Music,
  PawPrint,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  Repeat,
  Scissors,
  Shield,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  SquareParking,
  Store,
  TrainFront,
  TrendingUp,
  Tv,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "@/types/api";

/**
 * Maps the free-text `icon` key stored on a Category row to a component.
 * Order here is the order shown in the category icon picker.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  coffee: Coffee,
  "shopping-cart": ShoppingCart,
  beer: Beer,
  car: Car,
  taxi: CarTaxiFront,
  bus: Bus,
  train: TrainFront,
  bike: Bike,
  fuel: Fuel,
  parking: SquareParking,
  plane: Plane,
  receipt: Receipt,
  house: House,
  zap: Zap,
  droplet: Droplet,
  wifi: Wifi,
  smartphone: Smartphone,
  repeat: Repeat,
  tv: Tv,
  "shopping-bag": ShoppingBag,
  shirt: Shirt,
  store: Store,
  laptop: Laptop,
  "heart-pulse": HeartPulse,
  pill: Pill,
  dumbbell: Dumbbell,
  scissors: Scissors,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
  book: BookOpen,
  baby: Baby,
  "paw-print": PawPrint,
  clapperboard: Clapperboard,
  gamepad: Gamepad2,
  music: Music,
  gift: Gift,
  heart: Heart,
  shield: Shield,
  wrench: Wrench,
  "credit-card": CreditCard,
  landmark: Landmark,
  wallet: Wallet,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "piggy-bank": PiggyBank,
  "hand-coins": HandCoins,
  bitcoin: Bitcoin,
  banknote: Banknote,
  "circle-plus": CirclePlus,
  circle: Circle,
};

/**
 * Best-guess icon from a category's name — used when a category still has
 * the generic "circle" icon or inherited its parent's icon, so lists show
 * something meaningful (Meralco → bolt, Grab → taxi) without manual setup.
 */
const NAME_HINTS: [RegExp, string][] = [
  [/meralco|electric|kuryente|power/i, "zap"],
  [/water|maynilad|manila water|tubig/i, "droplet"],
  [/internet|wifi|pldt|converge|sky ?cable|fiber/i, "wifi"],
  [/mobile|load|globe|smart|dito|phone|data/i, "smartphone"],
  [/coffee|starbucks|cafe|kape/i, "coffee"],
  [/grocer|market|palengke|supermarket|sm |puregold|7-?eleven/i, "shopping-cart"],
  [/restaurant|food|jollibee|mcdo|dining|lunch|dinner|breakfast|eat/i, "utensils"],
  [/drink|beer|bar|alak/i, "beer"],
  [/grab|taxi|angkas|joyride|uber/i, "taxi"],
  [/fuel|gas|petrol|diesel|shell|petron|caltex/i, "fuel"],
  [/parking/i, "parking"],
  [/bus|jeep|tricycle|commute|fare|mrt|lrt|train/i, "bus"],
  [/flight|travel|trip|hotel|airbnb|plane/i, "plane"],
  [/rent|house|home|condo|upa|association/i, "house"],
  [/netflix|spotify|youtube|disney|subscription|streaming/i, "repeat"],
  [/shop|lazada|shopee|mall|clothes|shirt/i, "shopping-bag"],
  [/health|doctor|hospital|clinic|checkup|dental/i, "heart-pulse"],
  [/medicine|pharma|drug|mercury|watsons|gamot/i, "pill"],
  [/gym|fitness|sport/i, "dumbbell"],
  [/salon|haircut|barber|beauty|spa/i, "scissors"],
  [/school|tuition|education|course|class/i, "graduation-cap"],
  [/book/i, "book"],
  [/baby|kid|child|anak/i, "baby"],
  [/pet|dog|cat|vet/i, "paw-print"],
  [/movie|cinema|entertain|concert/i, "clapperboard"],
  [/game|steam|playstation|xbox|nintendo/i, "gamepad"],
  [/gift|regalo|birthday|pasalubong/i, "gift"],
  [/insurance|philhealth|sss|pag-?ibig/i, "shield"],
  [/repair|maintenance|service/i, "wrench"],
  [/credit|loan|utang|debt/i, "credit-card"],
  [/salary|sahod|payroll|wage/i, "wallet"],
  [/freelance|business|client|side/i, "briefcase"],
  [/invest|stock|dividend|mp2|uitf|fund/i, "trending-up"],
  [/saving|ipon/i, "piggy-bank"],
  [/crypto|bitcoin|btc|eth/i, "bitcoin"],
  [/bill/i, "receipt"],
];

export function guessCategoryIcon(name: string | null | undefined): string | null {
  if (!name) return null;
  for (const [pattern, key] of NAME_HINTS) {
    if (pattern.test(name)) return key;
  }
  return null;
}

export function getCategoryIcon(icon: string | null | undefined, name?: string | null): LucideIcon {
  const guessed = !icon || icon === "circle" ? guessCategoryIcon(name) : null;
  const key = guessed ?? icon;
  return (key && CATEGORY_ICONS[key]) || Circle;
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
