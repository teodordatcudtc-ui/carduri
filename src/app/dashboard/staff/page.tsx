import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StaffForm } from "./staff-form";

export default async function StaffPage() {
  const supabase = await createServiceClient();
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

  const { data: staffRows } = await supabase
    .from("merchant_staff")
    .select("user_id, role, created_at")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  const staffUsers = await Promise.all(
    (staffRows ?? []).map(async (row) => {
      const res = await supabase.auth.admin.getUserById(row.user_id);
      return {
        email: res.data.user?.email ?? "(fără email)",
        role: row.role,
        created_at: row.created_at,
      };
    })
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card card-sm">
        <h1 className="text-2xl font-bold mb-2">Angajați</h1>
      <p className="text-[var(--c-ink-60)] mb-6">
        Creează conturi de staff pentru scanare rapidă la casă.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <StaffForm />
        <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-white)] p-4">
          <h2 className="font-semibold mb-3">Conturi existente</h2>
          <div className="space-y-2">
            {staffUsers.length === 0 ? (
              <p className="text-sm text-[var(--c-muted)]">Nu există conturi încă.</p>
            ) : (
              staffUsers.map((u) => (
                <div
                  key={`${u.email}-${u.created_at}`}
                  className="rounded-lg border p-3"
                  style={{
                    borderColor: "var(--c-border)",
                    background: "var(--c-white)",
                  }}
                >
                  <p className="text-sm">{u.email}</p>
                  <p className="text-xs text-[var(--c-muted)]">
                    Rol: {u.role} · Creat: {new Date(u.created_at).toLocaleDateString("ro-RO")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

