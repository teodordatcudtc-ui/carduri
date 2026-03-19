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

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: passes } = await supabase
    .from("wallet_passes")
    .select(
      "id, barcode_value, stamp_count, reward_available, updated_at, program:loyalty_programs(stamps_required, card_color, card_name), customers(full_name, phone)"
    )
    .eq("merchant_id", merchant.id)
    .order("updated_at", { ascending: false })
    .limit(50);
  const { data: programs } = await supabase
    .from("loyalty_programs")
    .select("id, card_name, stamps_required, reward_description, updated_at")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: true });

  const { data: stampEvents } = await supabase
    .from("stamp_events")
    .select("created_at, pass_id, wallet_passes!inner(merchant_id)")
    .eq("wallet_passes.merchant_id", merchant.id)
    .gte("created_at", startOfMonth)
    .order("created_at", { ascending: true });

  const { data: redemptions } = await supabase
    .from("redemptions")
    .select("redeemed_at, wallet_passes!inner(merchant_id)")
    .eq("wallet_passes.merchant_id", merchant.id)
    .gte("redeemed_at", startOfMonth);

  const stampsToday = (stampEvents ?? []).filter((e) => e.created_at >= startOfToday).length;
  const stampsWeek = (stampEvents ?? []).filter((e) => e.created_at >= startOfWeek).length;
  const stampsMonth = (stampEvents ?? []).length;
  const redemptionsMonth = (redemptions ?? []).length;

  const chartDays = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return { key, label: `${d.getDate()}/${d.getMonth() + 1}`, count: 0 };
  });
  const chartMap = new Map(chartDays.map((d) => [d.key, d]));
  (stampEvents ?? []).forEach((e) => {
    const key = e.created_at.slice(0, 10);
    const item = chartMap.get(key);
    if (item) item.count += 1;
  });
  const maxChartCount = Math.max(1, ...chartDays.map((d) => d.count));
  const lastVisitByPassId = new Map<string, string>();
  (stampEvents ?? []).forEach((e) => {
    const previous = lastVisitByPassId.get(e.pass_id);
    if (!previous || previous < e.created_at) {
      lastVisitByPassId.set(e.pass_id, e.created_at);
    }
  });

  return (
    <div>
      <div className="dash-topbar">
        <div className="dash-page-title">Bun venit, {merchant.business_name}</div>
        <span className="badge badge-default">{merchant.business_name}</span>
        <Link href="/dashboard/scan" className="btn btn-md btn-accent">
          <Scan className="w-4 h-4" />
          Scanează
        </Link>
      </div>

      <div className="dash-stats-row">
        <div className="dash-stat">
          <div className="dash-stat-label">
            Clienți înrolați <Users className="inline-block w-4 h-4" />
          </div>
          <div className="dash-stat-num">{customersCount ?? 0}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">
            Carduri active <CreditCard className="inline-block w-4 h-4" />
          </div>
          <div className="dash-stat-num">{passesCount ?? 0}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Ștampile azi</div>
          <div className="dash-stat-num">{stampsToday}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Recompense (30 zile)</div>
          <div className="dash-stat-num">{redemptionsMonth}</div>
        </div>
      </div>

      <div className="card card-sm mb-8">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Vizite ultimele 30 zile</div>
            <div style={{ fontSize: 12, color: "var(--c-muted)" }}>
              Săptămână: {stampsWeek} · Lună: {stampsMonth}
            </div>
          </div>
          <Link href="/dashboard/qr" className="btn btn-sm btn-outline">
            <QrCode className="w-4 h-4" />
            QR
          </Link>
        </div>
        <div className="h-40 flex items-end gap-1 mt-4">
          {chartDays.map((day) => (
            <div key={day.key} className="flex-1 flex flex-col items-center justify-end">
              <div
                style={{
                  height: `${(day.count / maxChartCount) * 100}%`,
                  minHeight: day.count ? 4 : 1,
                  width: "100%",
                  borderRadius: 4,
                  background: "var(--c-accent-lt)",
                  border: "1px solid rgba(200,75,47,0.2)",
                }}
                title={`${day.label}: ${day.count} ștampile`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card card-sm mb-8">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>Carduri configurate</div>
            <div style={{ fontSize: 12, color: "var(--c-muted)", marginTop: 4 }}>
              Alege cardul/recompensa din QR și scan.
            </div>
          </div>
          <Link href="/dashboard/card" className="btn btn-sm btn-outline">
            Configurează
          </Link>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          {(programs ?? []).map((program, idx) => (
            <div
              key={program.id}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 80px 120px",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700 }}>Card {idx + 1}</div>
              <div style={{ color: "var(--c-ink-60)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {program.card_name ?? program.reward_description}
              </div>
              <div style={{ fontWeight: 700 }}>{program.stamps_required}</div>
              <div style={{ textAlign: "right" }}>
                <Link href={`/dashboard/card?program=${program.id}`} className="btn btn-sm btn-ghost">
                  Editează
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-sm">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>Carduri existente</div>
            <div style={{ fontSize: 12, color: "var(--c-muted)", marginTop: 4 }}>
              Ultimele 50 de carduri actualizate
            </div>
          </div>
          <Link href="/dashboard/scan" className="btn btn-sm btn-accent">
            Scanează client
          </Link>
        </div>

        {(passes ?? []).length === 0 ? (
          <div style={{ color: "var(--c-muted)", padding: 12 }}>
            Nu există încă carduri. Scanează QR-ul de înrolare la casă pentru primul client.
          </div>
        ) : (
          <div className="customers-grid">
            {(passes ?? []).map((p) => {
              const fullName = p.customers?.[0]?.full_name ?? "Client";
              const phone = p.customers?.[0]?.phone ?? "-";
              const programRow = Array.isArray(p.program)
                ? p.program?.[0] ?? null
                : (p.program as unknown as { stamps_required: number; card_color: string; card_name: string } | null);
              const stampsRequired = programRow?.stamps_required ?? 0;
              const cardColor = programRow?.card_color ?? "var(--c-accent)";
              return (
                <div key={p.id} className="customer-card" style={{ borderColor: p.reward_available ? "rgba(224,150,0,0.35)" : "var(--c-border)" }}>
                  <div className="customer-card-header">
                    <div className="avatar avatar-lg">
                      {fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="customer-card-info" style={{ flex: 1 }}>
                      <div className="customer-name">{fullName}</div>
                      <div className="customer-order">Tel: {phone}</div>
                    </div>
                    {p.reward_available ? (
                      <span className="badge badge-amber badge-dot">{p.stamp_count}/{stampsRequired}</span>
                    ) : (
                      <span className="badge badge-default badge-dot">{p.stamp_count}/{stampsRequired}</span>
                    )}
                  </div>
                  <div
                    className="customer-stamps"
                    style={{
                      gridTemplateColumns: "repeat(5, 1fr)",
                    }}
                  >
                    {Array.from({ length: stampsRequired }).map((_, idx) => {
                      const filled = idx < p.stamp_count;
                      return (
                        <div
                          key={idx}
                          className="cs-dot"
                          style={
                            filled
                              ? {
                                  background: cardColor,
                                  borderColor: cardColor,
                                  color: "white",
                                }
                              : {
                                  background: "transparent",
                                }
                          }
                        >
                          {filled ? "☕" : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="customer-card-footer">
                    <span className="visit-count">
                      Ultima:{" "}
                      {new Date(lastVisitByPassId.get(p.id) ?? p.updated_at).toLocaleDateString("ro-RO")}
                    </span>
                    <Link href={`/card/${p.id}`} className="btn btn-sm btn-outline">
                      Vezi
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
