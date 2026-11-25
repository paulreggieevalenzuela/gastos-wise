import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/services/auth";
import { applyStarterDataSafely } from "@/lib/services/onboarding";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { QueryProvider } from "@/components/providers/query-provider";
import { AddTransactionProvider } from "@/components/transactions/add-transaction-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUserById(session.userId);
  if (!user) redirect("/login");

  // Accounts made before starter data existed get it on their next visit (once).
  if (!user.starterDataAppliedAt) await applyStarterDataSafely(user.id);

  return (
    <QueryProvider>
      <AddTransactionProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar name={user.name} email={user.email} />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 pt-5 md:px-8 md:pb-10 md:pt-8">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
      </AddTransactionProvider>
    </QueryProvider>
  );
}
