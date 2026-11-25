"use client";

import { Suspense, createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { AddTransactionPanel } from "@/components/transactions/add-transaction-panel";

const AddTransactionContext = createContext<{ openAddTransaction: () => void } | null>(null);

/**
 * One "Add transaction" sheet for the whole app. The sidebar button, the
 * phone "+" button, and every "Add transaction" button open it right where
 * you are — no page change needed. Links to `?new=1` (e.g. from an empty
 * state) still work: the sheet opens and the param is tidied away.
 */
export function AddTransactionProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const openAddTransaction = useCallback(() => setOpen(true), []);

  const close = useCallback(() => {
    setOpen(false);
    // Server-rendered pages (the dashboard) re-fetch so new totals show up;
    // client pages already update through their React Query caches.
    router.refresh();
  }, [router]);

  return (
    <AddTransactionContext.Provider value={{ openAddTransaction }}>
      {children}
      <Suspense fallback={null}>
        <OpenFromUrl onOpen={openAddTransaction} />
      </Suspense>
      <Modal open={open} onClose={close} title="Add transaction">
        {open && <AddTransactionPanel onDone={close} />}
      </Modal>
    </AddTransactionContext.Provider>
  );
}

function OpenFromUrl({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    onOpen();
    const rest = new URLSearchParams(searchParams.toString());
    rest.delete("new");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, pathname, router, onOpen]);

  return null;
}

export function useAddTransaction() {
  const ctx = useContext(AddTransactionContext);
  if (!ctx) throw new Error("useAddTransaction must be used inside AddTransactionProvider");
  return ctx.openAddTransaction;
}
