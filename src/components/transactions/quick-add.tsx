"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Mic, MicOff, Sparkles, Store, Wallet as WalletIcon } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { InstitutionIcon } from "@/components/accounts/institution-icon";
import { Button } from "@/components/ui/button";
import { getCategoryColorClasses } from "@/lib/category-colors";
import { getCategoryIcon } from "@/lib/icons";
import { parseQuickAdd, type QuickAddDraft } from "@/lib/quick-add/parse";
import { cn, formatMoney } from "@/lib/utils";

const EXAMPLES = ["245 grab gcash", "jollibee 289 cash", "meralco 2,340 bdo", "sahod 45k bdo"];

// Minimal typing for the Web Speech API (not in every TS DOM lib version).
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** iPhone/iPad "Add to Home Screen" apps don't get the browser speech API (WebKit limitation). */
function isIosHomeScreenApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export type QuickAddReview = QuickAddDraft;

/**
 * Type — or speak — a short phrase like "245 grab gcash" and save it in
 * one tap. Parsing happens on the device (lib/quick-add/parse.ts).
 */
export function QuickAdd({
  onSaved,
  onReview,
}: {
  onSaved: () => void;
  onReview: (draft: QuickAddReview) => void;
}) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();

  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [micState, setMicState] = useState<"unknown" | "available" | "keyboard">("unknown");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMicState(getSpeechRecognition() && !isIosHomeScreenApp() ? "available" : "keyboard");
    return () => recognitionRef.current?.abort();
  }, []);

  const draft = useMemo(
    () => parseQuickAdd(text, accounts ?? [], categories ?? [], { defaultAccountId: accounts?.[0]?.id ?? null }),
    [text, accounts, categories],
  );

  const account = accounts?.find((a) => a.id === draft.accountId);
  const toAccount = accounts?.find((a) => a.id === draft.transferAccountId);
  const category = categories?.find((c) => c.id === draft.categoryId);
  const CategoryIcon = getCategoryIcon(category?.icon, category?.name);
  const catColors = getCategoryColorClasses(category?.color);
  const hasInput = text.trim().length > 0;
  const noWallets = accounts !== undefined && accounts.length === 0;
  const missing: string[] = [];
  if (draft.amount === null) missing.push("an amount (like \u201c250\u201d)");
  if (!draft.accountId) missing.push("a wallet");
  if (draft.type === "TRANSFER" && draft.accountId && !draft.transferAccountId) missing.push("the wallet to transfer to");
  if (draft.type !== "TRANSFER" && !draft.categoryId) missing.push("a category");

  function startListening() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    setMessage(null);
    const recognition = new Ctor();
    recognition.lang = "en-PH";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i]?.[0]?.transcript ?? "";
      setText(transcript.trim());
    };
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMessage("Microphone access is off. Allow it in your browser settings, or use your keyboard's mic.");
        setMicState("keyboard");
      } else if (e.error === "no-speech") {
        setMessage("Didn't catch that — try again a little closer to the mic.");
      } else if (e.error !== "aborted") {
        setMessage("Voice input stopped. You can type instead.");
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function save() {
    if (!draft.complete || draft.amount === null || !draft.accountId) return;
    setSaving(true);
    setMessage(null);
    try {
      const transactionDate = new Date(Date.now() - draft.daysAgo * 86_400_000).toISOString();
      const base = {
        accountId: draft.accountId,
        amount: draft.amount,
        transactionDate,
        merchant: draft.merchant,
        description: null,
        notes: null,
      };
      await createMutation.mutateAsync(
        draft.type === "TRANSFER"
          ? { type: draft.type, ...base, transferAccountId: draft.transferAccountId! }
          : { type: draft.type, ...base, categoryId: draft.categoryId! },
      );
      setText("");
      onSaved();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Couldn't save that. Try the full form.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border bg-surface p-1.5 pl-4 transition-shadow",
            listening ? "border-accent ring-4 ring-accent/15" : "border-border focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15",
          )}
        >
          <Sparkles size={18} className="shrink-0 text-accent" aria-hidden />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void save();
              }
            }}
            placeholder={listening ? "Listening…" : "e.g. 245 grab gcash"}
            aria-label="Quick add — describe the transaction"
            autoComplete="off"
            autoCapitalize="off"
            enterKeyHint="done"
            autoFocus
            className="h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-ink placeholder:font-medium placeholder:text-ink-faint focus:outline-none"
          />
          {micState === "available" && (
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              aria-label={listening ? "Stop listening" : "Speak instead"}
              aria-pressed={listening}
              className={cn(
                "gw-press relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                listening ? "bg-negative text-white" : "bg-accent text-accent-ink",
              )}
            >
              {listening && <span className="absolute inset-0 animate-ping rounded-xl bg-negative/40 motion-reduce:hidden" aria-hidden />}
              {listening ? <MicOff size={19} className="relative" /> : <Mic size={19} />}
            </button>
          )}
        </div>
        {micState === "keyboard" && (
          <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-medium text-ink-faint">
            <Mic size={13} aria-hidden /> To speak, tap the mic on your keyboard.
          </p>
        )}
        {message && <p className="gw-fade mt-2 px-1 text-xs font-semibold text-negative">{message}</p>}
      </div>

      {!hasInput ? (
        <div>
          <p className="mb-2 px-1 text-xs font-semibold text-ink-faint">Try one of these</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setText(ex);
                  inputRef.current?.focus();
                }}
                className="gw-press rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
              >
                {ex}
              </button>
            ))}
          </div>
          <p className="mt-3 px-1 text-xs leading-relaxed text-ink-faint">
            Say or type the amount, what it was for, and the wallet. Taglish works too — &ldquo;sahod 45k
            bdo&rdquo;, &ldquo;kape 150 kahapon&rdquo;, &ldquo;transfer 2k bdo to gcash&rdquo;.
          </p>
        </div>
      ) : (
        <div className="gw-fade rounded-2xl border border-border bg-surface-raised/60 p-4" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                draft.type === "INCOME"
                  ? "bg-positive-soft text-positive"
                  : draft.type === "TRANSFER"
                    ? "bg-accent-soft text-accent"
                    : "bg-negative-soft text-negative",
              )}
            >
              {draft.type === "INCOME" ? "Income" : draft.type === "TRANSFER" ? "Transfer" : "Expense"}
            </span>
            <p
              className={cn(
                "font-tabular text-3xl font-extrabold tracking-tight",
                draft.amount === null ? "text-ink-faint" : "text-ink",
              )}
            >
              {draft.amount === null ? "₱ —" : formatMoney(draft.amount, account?.currency ?? "PHP")}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            {!account && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-warning shadow-card">
                <WalletIcon size={12} />
                No wallet
              </span>
            )}
            {account && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface py-1 pl-1 pr-2.5 text-ink shadow-card">
                <InstitutionIcon icon={account.icon} type={account.type} size={20} />
                {account.name}
                {draft.type === "TRANSFER" && (
                  <>
                    <ArrowRight size={12} className="text-ink-faint" />
                    {toAccount ? toAccount.name : <span className="text-negative">which wallet?</span>}
                  </>
                )}
              </span>
            )}
            {draft.type !== "TRANSFER" && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 shadow-card",
                  category ? "bg-surface text-ink" : "bg-warning-soft text-warning",
                )}
              >
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", category ? `${catColors.bg} ${catColors.text}` : "")}>
                  <CategoryIcon size={12} />
                </span>
                {category ? category.name : "Pick a category"}
              </span>
            )}
            {draft.merchant && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-ink shadow-card">
                <Store size={12} className="text-ink-faint" />
                {draft.merchant}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-ink shadow-card">
              <CalendarDays size={12} className="text-ink-faint" />
              {draft.daysAgo === 1 ? "Yesterday" : "Today"}
            </span>
          </div>

          {noWallets ? (
            <p className="mt-3 text-xs font-semibold text-warning">
              You don&rsquo;t have a wallet yet, so there&rsquo;s nowhere to record this.{" "}
              <Link href="/accounts" className="underline underline-offset-2">
                Add a wallet
              </Link>{" "}
              (Cash, GCash, BDO…) first.
            </p>
          ) : (
            missing.length > 0 && (
              <p className="mt-3 text-xs font-semibold text-warning">
                To save, add {missing.join(" and ")} — or tap Review details to pick it.
              </p>
            )
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={() => onReview(draft)} disabled={!hasInput && !accounts}>
          {hasInput ? "Review details" : "Use full form"}
        </Button>
        <Button type="button" onClick={save} disabled={!draft.complete || saving}>
          {saving ? (
            "Saving…"
          ) : (
            <>
              <Check size={18} /> Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
