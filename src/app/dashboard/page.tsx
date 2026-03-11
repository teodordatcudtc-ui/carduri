import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, QrCode, Scan, Users } from "lucide-react";

export default async function DashboardPage() {
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

  if (!merchant) redirect("/dashboard/onboarding");

  const [{ count: customersCount }, { count: passesCount }] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id),
    supabase.from("wallet_passes").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id),
  ]);

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-white mb-1">
        Bun venit, {merchant.business_name}
      </h1>
      <p className="text-stone-400 mb-8">
        Gestionează programul tău de fidelitate din acest dashboard.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="rounded-xl border border-stone-700/50 bg-stone-900/30 p-4">
          <Users className="w-8 h-8 text-brand-400 mb-2" />
          <p className="text-2xl font-semibold text-white">{customersCount ?? 0}</p>
          <p className="text-sm text-stone-400">Clienți înrolați</p>
        </div>
        <div className="rounded-xl border border-stone-700/50 bg-stone-900/30 p-4">
          <CreditCard className="w-8 h-8 text-brand-400 mb-2" />
          <p className="text-2xl font-semibold text-white">{passesCount ?? 0}</p>
          <p className="text-sm text-stone-400">Carduri active</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/qr"
          className="flex items-center gap-4 rounded-xl border border-stone-700/50 bg-stone-900/30 p-6 hover:border-brand-500/50 hover:bg-stone-800/50 transition"
        >
          <div className="rounded-lg bg-brand-500/20 p-3">
            <QrCode className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">QR înrolare</h2>
            <p className="text-sm text-stone-400">
              Descarcă sau afișează QR-ul pentru clienți noi.
            </p>
          </div>
        </Link>
        <Link
          href="/dashboard/scan"
          className="flex items-center gap-4 rounded-xl border border-stone-700/50 bg-stone-900/30 p-6 hover:border-brand-500/50 hover:bg-stone-800/50 transition"
        >
          <div className="rounded-lg bg-brand-500/20 p-3">
            <Scan className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Scanează card</h2>
            <p className="text-sm text-stone-400">
              Adaugă ștampile sau acordă recompensa.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
