import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientsPageClient, type ClientRow } from "./clients-page-client";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!merchant) redirect("/dashboard/onboarding");

  const { data: passRows } = await supabase
    .from("wallet_passes")
    .select(
      `
      id,
      stamp_count,
      reward_available,
      updated_at,
      customers ( full_name, phone ),
      loyalty_programs ( card_name, stamps_required )
    `
    )
    .eq("merchant_id", merchant.id)
    .order("updated_at", { ascending: false });

  const passIds = (passRows ?? []).map((p) => p.id);
  const visitsByPass: Record<string, number> = {};
  if (passIds.length > 0) {
    const { data: evs } = await supabase.from("stamp_events").select("pass_id").in("pass_id", passIds);
    for (const e of evs ?? []) {
      const pid = (e as { pass_id: string }).pass_id;
      visitsByPass[pid] = (visitsByPass[pid] ?? 0) + 1;
    }
  }

  const now = Date.now();
  const thirtyDays = 30 * 86400000;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const rows: ClientRow[] = (passRows ?? []).map((p) => {
    const cust = p.customers as
      | { full_name: string; phone: string }
      | { full_name: string; phone: string }[]
      | null;
    const c = Array.isArray(cust) ? cust[0] : cust;
    const prog = p.loyalty_programs as
      | { card_name: string | null; stamps_required: number }
      | { card_name: string | null; stamps_required: number }[]
      | null;
    const lp = Array.isArray(prog) ? prog[0] : prog;
    const required = Number(lp?.stamps_required) || 8;
    return {
      id: p.id,
      fullName: c?.full_name ?? "—",
      phone: c?.phone ?? "",
      cardName: lp?.card_name?.trim() || "Card",
      stamps: Number(p.stamp_count) || 0,
      required,
      rewardAvailable: !!p.reward_available,
      updatedAt: p.updated_at,
      visitCount: visitsByPass[p.id] ?? 0,
    };
  });

  let active = 0;
  let inactive = 0;
  let near = 0;
  let reward = 0;
  for (const r of rows) {
    const days = (now - new Date(r.updatedAt).getTime()) / 86400000;
    if (days > 30) inactive++;
    else active++;
    if (r.rewardAvailable) reward++;
    else if (r.required > 0 && r.stamps >= r.required - 1 && r.stamps < r.required) near++;
  }

  const { data: redemptionRows } = await supabase
    .from("redemptions")
    .select("id, wallet_passes!inner(merchant_id)")
    .eq("wallet_passes.merchant_id", merchant.id)
    .gte("redeemed_at", startOfMonth);
  const redemptionsMonth = redemptionRows?.length ?? 0;

  return (
    <ClientsPageClient
      rows={rows}
      stats={{
        total: rows.length,
        active,
        inactive,
        near,
        reward,
        redemptionsMonth,
      }}
    />
  );
}
