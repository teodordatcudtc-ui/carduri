import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  ChevronRight,
  Download,
  Scan,
  Plus,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { DashboardOnboardingBanner } from "./dashboard-banner";
import { DashboardProgramThumb } from "./dashboard-program-thumb";
import { programRowToLoyaltyPreview } from "@/lib/card-program-preview";

/** Zi calendaristică în Europe/Bucharest (YYYY-MM-DD) — aliniere corectă cu ștampile locale. */
function bucharestDayKey(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length < 6) return phone;
  return `${phone.slice(0, 8)} xxx xxx`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function greetingLabel(h: number) {
  if (h < 12) return "Bună dimineața";
  if (h < 18) return "Bună ziua";
  return "Bună seara";
}

function rowStatus(
  reward: boolean,
  stamps: number,
  required: number,
  updatedAt: string
): { cls: string; label: string } {
  if (reward) return { cls: "dash-badge dash-badge-green", label: "Recompensă" };
  const days = (Date.now() - new Date(updatedAt).getTime()) / (86400000);
  if (days > 30) return { cls: "dash-badge dash-badge-inactive", label: "Inactiv" };
  if (required > 0 && stamps >= required - 1 && stamps < required) {
    return { cls: "dash-badge dash-badge-coral", label: "Aproape" };
  }
  return { cls: "dash-badge dash-badge-neutral", label: "Activ" };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, slug, logo_url")
    .eq("user_id", user.id)
    .single();

  if (!merchant) redirect("/dashboard/onboarding");

  const now = new Date();
  const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: customersCount },
    { count: passesCount },
    { count: customersAddedMonth },
  ] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id),
    supabase.from("wallet_passes").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", merchant.id)
      .gte("created_at", startOfMonth),
  ]);

  const { data: programs } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: true });

  const { data: stampEvents } = await supabase
    .from("stamp_events")
    .select("created_at, pass_id, wallet_passes!inner(merchant_id)")
    .eq("wallet_passes.merchant_id", merchant.id)
    .gte("created_at", startOfMonth)
    .order("created_at", { ascending: true });

  const { data: allPassesRows } = await supabase
    .from("wallet_passes")
    .select("program_id")
    .eq("merchant_id", merchant.id);

  const { data: recentRows } = await supabase
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
    .order("updated_at", { ascending: false })
    .limit(5);

  const todayKey = bucharestDayKey(now);
  const yesterdayKey = bucharestDayKey(new Date(now.getTime() - 86400000));

  const stampsToday = (stampEvents ?? []).filter(
    (e) => bucharestDayKey(new Date(e.created_at)) === todayKey
  ).length;
  const stampsYesterday = (stampEvents ?? []).filter(
    (e) => bucharestDayKey(new Date(e.created_at)) === yesterdayKey
  ).length;
  const stampsMonth = (stampEvents ?? []).length;

  const countByProgram = new Map<string, number>();
  for (const r of allPassesRows ?? []) {
    countByProgram.set(r.program_id, (countByProgram.get(r.program_id) ?? 0) + 1);
  }

  const chartDayCount = 14;
  const chartDays = Array.from({ length: chartDayCount }).map((_, i) => {
    const d = new Date(now.getTime() - (chartDayCount - 1 - i) * 24 * 60 * 60 * 1000);
    const key = bucharestDayKey(d);
    return { key, count: 0, isToday: key === todayKey };
  });
  const chartMap = new Map(chartDays.map((d) => [d.key, d]));
  (stampEvents ?? []).forEach((e) => {
    const key = bucharestDayKey(new Date(e.created_at));
    const item = chartMap.get(key);
    if (item) item.count += 1;
  });
  const maxChartCount = Math.max(1, ...chartDays.map((d) => d.count));
  const maxBarPx = 36;

  const stamps14dTotal = chartDays.reduce((s, d) => s + d.count, 0);
  const activeDays14 = chartDays.filter((d) => d.count > 0).length;
  const avgStamps14 = stamps14dTotal / 14;
  const bestDayRow = chartDays.reduce(
    (a, b) => (b.count >= a.count ? b : a),
    chartDays[0]!
  );
  const bestDayLabel = new Intl.DateTimeFormat("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${bestDayRow.key}T12:00:00`));

  const cc = customersCount ?? 0;
  const pc = passesCount ?? 0;
  const visitsMetric = cc > 0 ? (stampsMonth / cc).toFixed(1) : "0";
  const visitsDisplay = `${visitsMetric}×`;

  const dateLine = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const showBanner = cc === 0 && stampsMonth === 0;

  const avClasses = ["av-c", "av-b", "av-y", "av-n"];

  return (
    <div>
      <DashboardOnboardingBanner show={showBanner} />

      <div className="mb-6">
        <div className="font-display text-[28px] font-semibold leading-none tracking-tight text-ink">
          {greetingLabel(now.getHours())}, {merchant.business_name} ☀️
        </div>
        <p className="mt-1 text-[13px] text-ink-muted">
          {dateLine.charAt(0).toUpperCase() + dateLine.slice(1)} · Iată ce se întâmplă azi
        </p>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dash-stat-v2">
          <div className="dash-stat-v2-label">
            <Users className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Clienți înrolați
          </div>
          <div className="dash-stat-v2-value">{cc}</div>
          {(customersAddedMonth ?? 0) > 0 && (
            <div className="dash-stat-delta up">↑ +{customersAddedMonth} luna aceasta</div>
          )}
          {(customersAddedMonth ?? 0) === 0 && (
            <div className="dash-stat-delta neutral">—</div>
          )}
        </div>
        <div className="dash-stat-v2">
          <div className="dash-stat-v2-label">
            <CreditCard className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Carduri active
          </div>
          <div className="dash-stat-v2-value">{pc}</div>
          <div className="dash-stat-delta neutral">
            {cc > 0 ? `din ${cc} înrolați` : "—"}
          </div>
        </div>
        <div className="dash-stat-v2">
          <div className="dash-stat-v2-label">
            <Star className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Ștampile azi
          </div>
          <div className="dash-stat-v2-value">{stampsToday}</div>
          {(() => {
            const d = stampsToday - stampsYesterday;
            if (stampsToday === 0 && stampsYesterday === 0) {
              return <div className="dash-stat-delta neutral">—</div>;
            }
            return (
              <div className={`dash-stat-delta ${d > 0 ? "up" : "neutral"}`}>
                {d > 0 ? `↑ +${d} față de ieri` : d === 0 ? "La fel ca ieri" : `${d} față de ieri`}
              </div>
            );
          })()}
        </div>
        <div className="dash-stat-v2 dash-stat-v2-accent">
          <div className="dash-stat-v2-label">
            <span className="inline opacity-90">Vizite recurente</span>
          </div>
          <div className="dash-stat-v2-value dash-stat-v2-value-accent">{visitsDisplay}</div>
          <div className="dash-stat-delta dash-stat-delta-accent">față de medie</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Link
          href="/dashboard/scan"
          className="dash-qa group no-underline"
        >
          <div className="dash-qa-icon">
            <Scan className="h-[18px] w-[18px] text-coral" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-ink">Scanează client</div>
            <div className="text-[11px] text-ink-muted">Adaugă ștampilă rapid</div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-15 group-hover:text-coral" />
        </Link>
        <Link href="/dashboard/qr" className="dash-qa group no-underline">
          <div className="dash-qa-icon">
            <Download className="h-[18px] w-[18px] text-coral" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-ink">Descarcă QR</div>
            <div className="text-[11px] text-ink-muted">PDF A5 gata de printat</div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-15 group-hover:text-coral" />
        </Link>
        <Link href="/dashboard/card" className="dash-qa group no-underline">
          <div className="dash-qa-icon">
            <Plus className="h-[18px] w-[18px] text-coral" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-ink">Card nou</div>
            <div className="text-[11px] text-ink-muted">Creează program loyalty</div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-15 group-hover:text-coral" />
        </Link>
      </div>

      {/* Chart + programs */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="dash-box flex h-full min-h-0 flex-col lg:col-span-2">
          <div className="dash-box-head">
            <div>
              <div className="dash-box-title">Ștampile pe zi</div>
              <div className="dash-box-sub">Ultimele 14 zile · ziua = fusul Europe/Bucharest</div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-display text-[20px] font-semibold leading-none text-ink">{stampsToday}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">azi</span>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-[18px] pb-4 pt-3">
            <div className="flex min-h-[52px] shrink-0 items-end justify-center gap-0.5 sm:gap-1">
              {chartDays.map((day) => {
                const h =
                  day.count === 0
                    ? 3
                    : Math.max(
                        6,
                        Math.round(
                          (Math.sqrt(day.count) / Math.sqrt(maxChartCount)) * maxBarPx
                        )
                      );
                return (
                  <div
                    key={day.key}
                    className="flex min-w-0 max-w-[40px] flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div
                      className={`w-full rounded-t-[4px] transition-[height] ${
                        day.count > 0
                          ? day.isToday
                            ? "bg-coral"
                            : "bg-coral/65"
                          : "bg-ink-6"
                      }`}
                      style={{ height: `${h}px` }}
                      title={`${day.key}: ${day.count} ștampile`}
                    />
                    <div className="flex h-3.5 w-full items-center justify-center">
                      {day.isToday ? (
                        <span className="text-[8px] font-semibold uppercase leading-none text-coral sm:text-[9px]">
                          Azi
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex shrink-0 flex-wrap gap-4 border-t border-ink-6 pt-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span className="h-2 w-2 rounded-full bg-coral" />
                Ștampile acordate
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span className="h-2 w-2 rounded-full bg-ink-15" />
                Fără activitate
              </div>
            </div>
            <div className="mt-4 flex min-h-[168px] flex-1 flex-col border-t border-ink-6 pt-4">
              <div className="grid h-full min-h-[168px] flex-1 auto-rows-[1fr] grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
                <div className="flex h-full min-h-[156px] min-w-0 flex-row items-center gap-4 rounded-xl border border-ink-15 bg-paper px-4 py-6 shadow-[0_1px_0_rgba(30,27,24,0.04)] sm:min-h-[148px]">
                  <div className="dash-av av-c !h-10 !w-10 shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                    <BarChart3 strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold leading-tight text-ink">Total</div>
                    <div className="mt-2 font-display text-[28px] font-semibold leading-none tabular-nums tracking-tight text-ink sm:text-[30px]">
                      {stamps14dTotal}
                    </div>
                    <div className="mt-2 text-[10px] leading-snug text-ink-muted">ștampile în 14 zile</div>
                  </div>
                </div>
                <div className="flex h-full min-h-[156px] min-w-0 flex-row items-center gap-4 rounded-xl border border-ink-15 bg-paper px-4 py-6 shadow-[0_1px_0_rgba(30,27,24,0.04)] sm:min-h-[148px]">
                  <div className="dash-av av-b !h-10 !w-10 shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                    <TrendingUp strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold leading-tight text-ink">Medie zilnică</div>
                    <div className="mt-2 font-display text-[28px] font-semibold leading-none tabular-nums tracking-tight text-ink sm:text-[30px]">
                      {avgStamps14.toFixed(1)}
                    </div>
                    <div className="mt-2 text-[10px] leading-snug text-ink-muted">ștampile / zi</div>
                  </div>
                </div>
                <div className="flex h-full min-h-[156px] min-w-0 flex-row items-center gap-4 rounded-xl border border-ink-15 bg-paper px-4 py-6 shadow-[0_1px_0_rgba(30,27,24,0.04)] sm:min-h-[148px]">
                  <div className="dash-av av-g !h-10 !w-10 shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                    <CalendarCheck strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold leading-tight text-ink">Zile cu activitate</div>
                    <div className="mt-2 font-display text-[28px] font-semibold leading-none tabular-nums tracking-tight text-ink sm:text-[30px]">
                      {activeDays14}
                    </div>
                    <div className="mt-2 text-[10px] leading-snug text-ink-muted">din 14 zile</div>
                  </div>
                </div>
                <div className="flex h-full min-h-[156px] min-w-0 flex-row items-center gap-4 rounded-xl border border-ink-15 bg-paper px-4 py-6 shadow-[0_1px_0_rgba(30,27,24,0.04)] sm:min-h-[148px]">
                  <div className="dash-av av-y !h-10 !w-10 shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                    <Trophy strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold leading-tight text-ink">Max într-o zi</div>
                    <div className="mt-2 font-display text-[28px] font-semibold leading-none tabular-nums tracking-tight text-coral sm:text-[30px]">
                      {bestDayRow.count}
                    </div>
                    <div
                      className="mt-2 truncate text-[10px] leading-snug text-ink-muted"
                      title={bestDayRow.key}
                    >
                      {bestDayLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-box flex min-h-0 flex-col">
          <div className="dash-box-head">
            <div>
              <div className="dash-box-title">Carduri active</div>
              <div className="dash-box-sub">
                {(programs ?? []).length} program{(programs ?? []).length === 1 ? "" : "e"} configurate
              </div>
            </div>
            <Link
              href="/dashboard/card"
              className="rounded-lg border border-ink-15 bg-paper px-2.5 py-1.5 text-[11px] font-semibold text-ink no-underline hover:bg-ink-6"
            >
              Vezi toate
            </Link>
          </div>
          <div className="min-h-0 flex-1">
            {(programs ?? []).length === 0 ? (
              <div className="dash-empty-inner">
                <p className="text-center text-[13px] text-ink-muted">Niciun program încă.</p>
              </div>
            ) : (
              (programs ?? []).slice(0, 5).map((program) => {
                const cnt = countByProgram.get(program.id) ?? 0;
                const p = program as Record<string, unknown>;
                const thumbProps = programRowToLoyaltyPreview(p, {
                  logo_url: merchant.logo_url ?? null,
                });
                return (
                  <Link
                    key={program.id}
                    href={`/dashboard/card?program=${program.id}`}
                    className="dash-card-row last:border-b-0"
                  >
                    <DashboardProgramThumb props={thumbProps} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-ink">
                        {program.card_name ?? program.reward_description ?? "Card"}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {program.stamps_required} ștampile · {cnt} clienți
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-semibold text-ink">{cnt}</div>
                      <div className="text-[10px] text-ink-muted">clienți</div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent clients */}
      <div className="dash-box overflow-hidden">
        <div className="dash-box-head">
          <div>
            <div className="dash-box-title">Clienți recenți</div>
            <div className="dash-box-sub">Ultimele activități</div>
          </div>
          <span className="rounded-lg border border-ink-15 px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted">
            Ultimele 5
          </span>
        </div>
        <div className="overflow-x-auto">
          {(recentRows ?? []).length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <Users className="h-5 w-5 text-coral" strokeWidth={2} />
              </div>
              <div className="text-[14px] font-bold text-ink">Niciun client încă</div>
              <p className="max-w-[240px] text-center text-[12px] text-ink-muted">
                Printează QR-ul și pune-l la casă. Primii clienți se înrolează în câteva secunde.
              </p>
              <Link
                href="/dashboard/qr"
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-coral px-4 py-2 text-[13px] font-semibold text-paper no-underline hover:bg-coral-dark"
              >
                Descarcă QR
              </Link>
            </div>
          ) : (
            <table className="dash-table w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Card</th>
                  <th>Progres</th>
                  <th>Ultima vizită</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentRows ?? []).map((row, idx) => {
                  const rawCust = row.customers as
                    | { full_name: string; phone: string }
                    | { full_name: string; phone: string }[]
                    | null;
                  const cust = Array.isArray(rawCust) ? rawCust[0] : rawCust;
                  const rawProg = row.loyalty_programs as
                    | { card_name: string | null; stamps_required: number }
                    | { card_name: string | null; stamps_required: number }[]
                    | null;
                  const prog = Array.isArray(rawProg) ? rawProg[0] : rawProg;
                  const name = cust?.full_name ?? "—";
                  const phone = cust?.phone ?? "";
                  const req = prog?.stamps_required ?? 10;
                  const stamps = row.stamp_count ?? 0;
                  const filled = Math.min(stamps, Math.min(req, 10));
                  const status = rowStatus(
                    row.reward_available,
                    stamps,
                    req,
                    row.updated_at
                  );
                  const visit = new Intl.DateTimeFormat("ro-RO", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(row.updated_at));
                  const av = avClasses[idx % avClasses.length];
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`dash-av ${av}`}>{initials(name)}</div>
                          <div>
                            <div className="font-semibold text-ink">{name}</div>
                            <div className="text-[11px] text-ink-muted">{maskPhone(phone)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-[12px] text-ink-muted">
                        {prog?.card_name ?? "—"}
                      </td>
                      <td>
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(req, 10) }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < filled ? "bg-coral" : "bg-ink-15"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="mt-0.5 text-[10px] text-ink-muted">
                          {stamps} / {req}
                        </div>
                      </td>
                      <td className="text-[12px] text-ink-muted">{visit}</td>
                      <td>
                        <span className={status.cls}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
