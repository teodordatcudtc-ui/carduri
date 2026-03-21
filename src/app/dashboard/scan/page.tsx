import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScanPageClient } from "./scan-page-client";

export default async function ScanPage() {
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

  const { data: programs } = await supabase
    .from("loyalty_programs")
    .select("id, card_name, stamps_required, reward_description")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: true });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startOfToday = start.toISOString();

  const [{ data: stampToday }, { data: redeemToday }] = await Promise.all([
    supabase
      .from("stamp_events")
      .select(
        `
        id,
        created_at,
        wallet_passes!inner (
          merchant_id,
          customers ( full_name ),
          loyalty_programs ( card_name )
        )
      `
      )
      .eq("wallet_passes.merchant_id", merchant.id)
      .gte("created_at", startOfToday)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("redemptions")
      .select(
        `
        id,
        redeemed_at,
        wallet_passes!inner (
          merchant_id,
          customers ( full_name ),
          loyalty_programs ( card_name )
        )
      `
      )
      .eq("wallet_passes.merchant_id", merchant.id)
      .gte("redeemed_at", startOfToday)
      .order("redeemed_at", { ascending: false })
      .limit(25),
  ]);

  function pickCustomerName(wp: unknown): string {
    const w = wp as Record<string, unknown>;
    const raw = w?.customers;
    const c = Array.isArray(raw) ? raw[0] : raw;
    const name = (c as { full_name?: string } | null)?.full_name;
    return name?.trim() || "—";
  }

  function pickCardName(wp: unknown): string {
    const w = wp as Record<string, unknown>;
    const raw = w?.loyalty_programs;
    const p = Array.isArray(raw) ? raw[0] : raw;
    const name = (p as { card_name?: string | null } | null)?.card_name;
    return name?.trim() || "Card";
  }

  const recentActivity: {
    id: string;
    at: string;
    customerName: string;
    cardName: string;
    action: "stamp" | "reward";
  }[] = [];

  for (const s of stampToday ?? []) {
    const wp = s.wallet_passes;
    recentActivity.push({
      id: `se-${s.id}`,
      at: s.created_at,
      customerName: pickCustomerName(wp),
      cardName: pickCardName(wp),
      action: "stamp",
    });
  }
  for (const r of redeemToday ?? []) {
    const wp = r.wallet_passes;
    recentActivity.push({
      id: `re-${r.id}`,
      at: r.redeemed_at,
      customerName: pickCustomerName(wp),
      cardName: pickCardName(wp),
      action: "reward",
    });
  }

  recentActivity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const recentSlice = recentActivity.slice(0, 15);

  return <ScanPageClient programs={programs ?? []} recentActivity={recentSlice} />;
}
