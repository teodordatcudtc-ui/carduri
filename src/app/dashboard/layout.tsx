import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CreditCard, QrCode, Scan, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, slug")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-stone-700/50 flex flex-col">
        <div className="p-4 border-b border-stone-700/50">
          <Link href="/dashboard" className="text-lg font-semibold text-brand-400">
            StampIO
          </Link>
        </div>
        <nav className="p-2 flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-white transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          {merchant && (
            <>
              <Link
                href="/dashboard/card"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-white transition"
              >
                <CreditCard className="w-4 h-4" />
                Card
              </Link>
              <Link
                href="/dashboard/qr"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-white transition"
              >
                <QrCode className="w-4 h-4" />
                QR înrolare
              </Link>
              <Link
                href="/dashboard/scan"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-white transition"
              >
                <Scan className="w-4 h-4" />
                Scanează
              </Link>
            </>
          )}
        </nav>
        <div className="p-2 border-t border-stone-700/50">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white transition"
            >
              <LogOut className="w-4 h-4" />
              Deconectare
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
