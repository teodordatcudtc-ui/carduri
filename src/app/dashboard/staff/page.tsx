import { createClient } from "@/lib/supabase/server";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { redirect } from "next/navigation";
import { StaffForm } from "./staff-form";
function initialsFromEmail(email: string) {
  const local = email.split("@")[0] ?? email;
  const parts = local.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export default async function StaffPage() {
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

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [{ data: staffRows }, { data: stampMonthRows }] = await Promise.all([
    supabase
      .from("merchant_staff")
      .select("user_id, role, created_at")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("stamp_events")
      .select("id, wallet_passes!inner(merchant_id)")
      .eq("wallet_passes.merchant_id", merchant.id)
      .gte("created_at", startOfMonth),
  ]);

  let admin: ReturnType<typeof createServiceRoleSupabase> | null = null;
  try {
    admin = createServiceRoleSupabase();
  } catch {
    /* .env fără service role — listăm staff fără email */
  }

  const staffUsers = await Promise.all(
    (staffRows ?? []).map(async (row) => {
      if (!admin) {
        return {
          email: "(email indisponibil — setează SUPABASE_SERVICE_ROLE_KEY)",
          role: row.role,
          created_at: row.created_at,
        };
      }
      const res = await admin.auth.admin.getUserById(row.user_id);
      return {
        email: res.data.user?.email ?? "(fără email)",
        role: row.role,
        created_at: row.created_at,
      };
    })
  );

  const stampsMonth = stampMonthRows?.length ?? 0;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <p className="dash-page-lead mb-6">
        Creează conturi de staff pentru scanare rapidă la casă. Angajații văd doar pagina de scanare.
      </p>

      <div className="dash-stat-chip-row">
        <div className="dash-stat-chip">
          <div className="dash-stat-chip-val">{staffUsers.length}</div>
          <div className="dash-stat-chip-lbl">Angajați activi</div>
        </div>
        <div className="dash-stat-chip hi">
          <div className="dash-stat-chip-val">{stampsMonth}</div>
          <div className="dash-stat-chip-lbl">Ștampile acordate luna aceasta</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="mb-3 text-sm font-bold text-[var(--c-black)]">Angajați activi</div>
          <div className="flex flex-col gap-2.5">
            {staffUsers.length === 0 ? (
              <p className="text-sm text-[var(--c-muted)]">Nu există conturi încă.</p>
            ) : (
              staffUsers.map((u) => (
                <div key={`${u.email}-${u.created_at}`} className="dash-emp-card">
                  <div className="dash-emp-av">{initialsFromEmail(u.email)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[var(--c-black)]">{u.email}</div>
                    <div className="text-[11px] text-[var(--c-muted)]">
                      Rol: {u.role} · Creat: {new Date(u.created_at).toLocaleDateString("ro-RO")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-bold text-[var(--c-black)]">Adaugă angajat nou</div>
          <StaffForm />
          <div className="mt-3 rounded-[10px] border border-[var(--c-border)] bg-[var(--c-sand-dark)] px-3.5 py-3">
            <p className="text-[12px] leading-relaxed text-[var(--c-ink-60)]">
              <strong>Cum funcționează:</strong> Angajatul se loghează pe{" "}
              <span className="font-mono text-[11px]">stampio.ro/scan</span> cu emailul și parola create. Vede doar
              pagina de scanare, nu dashboardul complet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
