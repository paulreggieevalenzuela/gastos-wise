/**
 * Quick add: turns a short typed or dictated phrase into a transaction
 * draft, entirely on the device (no network, no AI service).
 *
 *   "245 grab gcash"                  → expense ₱245, Grab, GCash wallet
 *   "jollibee 289 cash kahapon"       → expense ₱289, Restaurants, Cash, yesterday
 *   "sahod 45k bdo"                   → income ₱45,000, Salary, BDO
 *   "transfer 2,000 from bdo to gcash"→ transfer ₱2,000 BDO → GCash
 *
 * It's deliberately rule-based: predictable, instant, works offline, and
 * understands common Taglish words. Anything it can't work out is left
 * empty so the person can fill it in on the full form.
 */

import { guessCategoryIcon } from "@/lib/icons";
import { getInstitution } from "@/lib/institutions";

export type DraftType = "EXPENSE" | "INCOME" | "TRANSFER";

export interface QuickAddAccount {
  id: string;
  name: string;
  icon?: string | null;
}

export interface QuickAddCategory {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string | null;
  parentId?: string | null;
  isArchived?: boolean;
}

export interface QuickAddDraft {
  type: DraftType;
  amount: number | null;
  accountId: string | null;
  transferAccountId: string | null;
  categoryId: string | null;
  merchant: string | null;
  /** Days before today (0 = today, 1 = yesterday). */
  daysAgo: number;
  /** True once the draft has everything needed to save without the full form. */
  complete: boolean;
}

/** Extra names people use for institutions, keyed by the preset key in lib/institutions.ts. */
const INSTITUTION_ALIASES: Record<string, string[]> = {
  cash: ["cash", "pera", "wallet", "cash on hand", "coh"],
  gcash: ["gcash", "g-cash", "g cash", "jeecash"],
  maya: ["maya", "paymaya", "pay maya"],
  grabpay: ["grabpay", "grab pay"],
  shopeepay: ["shopeepay", "shopee pay", "spay"],
  bdo: ["bdo", "banco de oro"],
  bpi: ["bpi"],
  metrobank: ["metrobank", "metro bank"],
  unionbank: ["unionbank", "union bank"],
  landbank: ["landbank", "land bank"],
  securitybank: ["security bank", "securitybank"],
  maribank: ["maribank", "mari bank", "seabank", "sea bank"],
  wise: ["wise"],
  crypto: ["crypto", "binance", "coins.ph", "coins ph"],
};

const INCOME_WORDS = [
  "salary",
  "sahod",
  "sweldo",
  "suweldo",
  "payroll",
  "income",
  "received",
  "receive",
  "natanggap",
  "bonus",
  "13th month",
  "refund",
  "cashback",
  "kita",
  "benta",
  "sold",
  "got paid",
  "freelance",
  "commission",
  "dividend",
  "interest",
];

const TRANSFER_WORDS = ["transfer", "transferred", "lipat", "nilipat", "move", "moved", "send to", "cash in", "cash-in", "top up", "topup", "top-up"];

const FILLER = new Set(
  [
    "a", "an", "the", "my", "for", "on", "at", "in", "to", "from", "using", "via", "with", "by", "and",
    "spent", "spend", "paid", "pay", "paying", "bought", "buy", "purchase", "purchased", "expense",
    "add", "added", "log", "logged", "record", "recorded", "new", "entry", "please", "pls", "pa", "dagdag",
    "sa", "ng", "nang", "para", "pang", "pambili", "bumili", "binili", "bayad", "nagbayad", "binayad",
    "gastos", "ginastos", "nag", "ako", "ko", "kong", "yung", "ang", "si", "ni", "mga", "po", "lang",
    "pesos", "peso", "php", "piso",
    "today", "ngayon", "kanina", "yesterday", "kahapon", "kagabi", "last", "night",
  ],
);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordRegex(phrase: string) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(phrase)}(?=$|[^a-z0-9])`, "i");
}

/** Finds the amount: "245", "₱1,250.50", "P300", "1.5k", "2 libo", "45k". */
export function parseAmount(text: string): { amount: number | null; match: string | null } {
  const re = /(₱|php\s?|\bp(?=\d))?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?(\s*(?:k|libo|thousand)\b)?/gi;
  const candidates: { amount: number; match: string; strong: boolean }[] = [];
  for (const m of text.matchAll(re)) {
    const whole = m[2];
    if (!whole) continue;
    // Skip ordinals and counts: "13th month", "2 days ago".
    const after = text.slice((m.index ?? 0) + m[0].length);
    if (/^(st|nd|rd|th)\b/i.test(after) || /^\s*(days?|araw|weeks?|months?)\b/i.test(after)) continue;
    let value = Number(whole.replace(/,/g, ""));
    if (m[3]) value += Number(`0.${m[3]}`);
    if (m[4]) value *= 1000;
    if (!Number.isFinite(value) || value <= 0) continue;
    candidates.push({
      amount: Math.round(value * 100) / 100,
      match: m[0],
      strong: Boolean(m[1] || m[3] || m[4]),
    });
  }
  // A number that clearly looks like money (₱, decimals, "k") wins; otherwise the first number.
  const pick = candidates.find((c) => c.strong) ?? candidates[0];
  return pick ? { amount: pick.amount, match: pick.match } : { amount: null, match: null };
}

interface AccountHit {
  id: string;
  index: number;
  phrase: string;
}

function findAccounts(text: string, accounts: QuickAddAccount[]): AccountHit[] {
  const hits: AccountHit[] = [];
  for (const account of accounts) {
    const phrases = new Set<string>([account.name.toLowerCase()]);
    const key = account.icon ?? undefined;
    if (key) {
      phrases.add(key);
      const inst = getInstitution(key);
      if (inst) phrases.add(inst.label.toLowerCase().replace(/\s*\(.*\)/, ""));
      for (const alias of INSTITUTION_ALIASES[key] ?? []) phrases.add(alias);
    }
    let best: AccountHit | null = null;
    for (const phrase of phrases) {
      if (phrase.length < 2) continue;
      const m = wordRegex(phrase).exec(text);
      if (m) {
        const index = m.index + (m[1]?.length ?? 0);
        if (!best || phrase.length > best.phrase.length) best = { id: account.id, index, phrase };
      }
    }
    if (best) hits.push(best);
  }
  // A longer phrase wins when two accounts match the same spot ("grab pay" vs a "Grab" account).
  hits.sort((a, b) => a.index - b.index || b.phrase.length - a.phrase.length);
  return hits.filter((h, i) => i === 0 || h.index !== hits[i - 1]!.index);
}

function findCategory(
  text: string,
  words: string[],
  categories: QuickAddCategory[],
  type: "INCOME" | "EXPENSE",
): { id: string; phrase: string } | null {
  const pool = categories.filter((c) => c.type === type && !c.isArchived);

  // 1) The category's own name appears in the phrase — prefer specific (child, longer) names.
  const byName = pool
    .filter((c) => wordRegex(c.name.toLowerCase()).test(text))
    .sort((a, b) => Number(Boolean(b.parentId)) - Number(Boolean(a.parentId)) || b.name.length - a.name.length);
  if (byName[0]) return { id: byName[0].id, phrase: byName[0].name.toLowerCase() };

  // 2) A word hints at a kind of spending (jollibee → restaurants, meralco → bolt).
  for (const word of words) {
    const hint = guessCategoryIcon(word);
    if (!hint) continue;
    const match = pool
      .filter((c) => (c.icon && c.icon !== "circle" ? c.icon : guessCategoryIcon(c.name)) === hint)
      .sort((a, b) => Number(Boolean(b.parentId)) - Number(Boolean(a.parentId)));
    if (match[0]) return { id: match[0].id, phrase: word };
  }
  return null;
}

function titleCase(s: string) {
  return s.replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

export function parseQuickAdd(
  input: string,
  accounts: QuickAddAccount[],
  categories: QuickAddCategory[],
  options: { defaultAccountId?: string | null } = {},
): QuickAddDraft {
  const text = normalize(input);
  const { amount, match: amountMatch } = parseAmount(text);

  let daysAgo = 0;
  if (/\b(yesterday|kahapon|kagabi|last night)\b/.test(text)) daysAgo = 1;

  const accountHits = findAccounts(text, accounts);
  const isTransfer = TRANSFER_WORDS.some((w) => wordRegex(w).test(text)) && accountHits.length >= 2;
  const isIncome = !isTransfer && INCOME_WORDS.some((w) => wordRegex(w).test(text));
  const type: DraftType = isTransfer ? "TRANSFER" : isIncome ? "INCOME" : "EXPENSE";

  // Remove the amount and wallet names, then what's left is the description.
  let rest = text;
  if (amountMatch) rest = rest.replace(amountMatch, " ");
  for (const hit of accountHits) rest = rest.replace(wordRegex(hit.phrase), " ");
  for (const w of [...TRANSFER_WORDS, ...INCOME_WORDS.filter((w) => w.includes(" "))]) rest = rest.replace(wordRegex(w), " ");
  const words = rest
    .split(/[^a-z0-9ñ&.-]+/i)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((w) => w && !FILLER.has(w) && !/^\d+$/.test(w));

  const category = type === "TRANSFER" ? null : findCategory(text, words, categories, type === "INCOME" ? "INCOME" : "EXPENSE");

  // Merchant: leftover words, minus generic ones — a bare category name
  // ("food 250") or an income word ("sahod") isn't a merchant.
  const categoryNames = new Set(categories.map((c) => c.name.toLowerCase()));
  const merchantWords = words.filter((w) => !categoryNames.has(w) && !INCOME_WORDS.includes(w));
  const merchant = merchantWords.length ? titleCase(merchantWords.join(" ")) : null;

  const accountId = accountHits[0]?.id ?? options.defaultAccountId ?? null;
  const transferAccountId = type === "TRANSFER" ? accountHits[1]?.id ?? null : null;

  const complete =
    amount !== null &&
    accountId !== null &&
    (type === "TRANSFER" ? transferAccountId !== null : category !== null);

  return {
    type,
    amount,
    accountId,
    transferAccountId,
    categoryId: category?.id ?? null,
    merchant,
    daysAgo,
    complete,
  };
}
