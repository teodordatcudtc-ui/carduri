"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

const BUSINESS_TYPES = [
  "Cafenea",
  "Restaurant fast-food",
  "Salon înfrumusețare",
  "Patiserie / brutărie",
  "Frizerie",
  "Altele",
] as const;

type Props = {
  merchantId: string;
  userEmail: string;
  initial: {
    business_name: string;
    logo_url: string | null;
    business_type: string | null;
    address: string | null;
  };
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

function normalizeBusinessType(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Cafenea";
  const t = raw.trim();
  const found = BUSINESS_TYPES.find((p) => p.toLowerCase() === t.toLowerCase());
  if (found) return found;
  return "Altele";
}

export function CompanyForm({ merchantId, userEmail, initial }: Props) {
  const [form, setForm] = useState(() => ({
    ...initial,
    business_type: normalizeBusinessType(initial.business_type),
  }));
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setForm({
      ...initial,
      business_type: normalizeBusinessType(initial.business_type),
    });
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const { error: merchantErr } = await supabase
        .from("merchants")
        .update({
          business_name: form.business_name.trim(),
          logo_url: form.logo_url?.trim() || null,
          business_type: form.business_type?.trim() || null,
          address: form.address?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", merchantId);

      if (merchantErr) throw merchantErr;

      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);
    if (newPassword.length < 6) {
      setPwdError("Parola trebuie să aibă minim 6 caractere.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Parolele nu coincid.");
      return;
    }
    setPwdLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setPwdSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : "Nu am putut actualiza parola.");
    } finally {
      setPwdLoading(false);
    }
  }

  const logoUrl = form.logo_url?.trim() ?? "";
  const logoOk = logoUrl && /^https?:\/\//i.test(logoUrl);

  return (
    <div className="space-y-0">
      {error && (
        <div
          className="mb-4 rounded-lg p-3 text-sm"
          style={{
            background: "rgba(200,75,47,0.08)",
            color: "var(--c-accent)",
            border: "1px solid rgba(200,75,47,0.25)",
          }}
        >
          {error}
        </div>
      )}
      {saved && (
        <div
          className="mb-4 rounded-lg p-3 text-sm"
          style={{
            background: "rgba(77,124,106,0.10)",
            color: "var(--c-sage)",
            border: "1px solid rgba(77,124,106,0.25)",
          }}
        >
          Modificările au fost salvate.
        </div>
      )}

      <form id="settings-business" onSubmit={handleSubmit} className="contents">
        <div className="dash-box mb-4">
          <div className="dash-box-head">
            <div>
              <div className="dash-box-title">Informații business</div>
              <div className="dash-box-sub">Apar pe toate cardurile tale digitale</div>
            </div>
          </div>
          <div className="dash-box-body space-y-0">
            <div className="field-group">
              <label className="field-label text-[13px] font-semibold">Nume companie</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => setForm((p) => ({ ...p, business_name: e.target.value }))}
                className="field-input w-full"
              />
            </div>

            <div className="field-group">
              <label className="field-label text-[13px] font-semibold">Tip business</label>
              <select
                value={form.business_type}
                onChange={(e) => setForm((p) => ({ ...p, business_type: e.target.value }))}
                className="field-select w-full"
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label text-[13px] font-semibold">Adresă (opțional)</label>
              <input
                type="text"
                value={form.address ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value || null }))}
                className="field-input w-full"
                placeholder="Strada, nr., oraș"
              />
            </div>

            <div className="field-group mb-0">
              <label className="field-label text-[13px] font-semibold">Logo</label>
              <div className="flex flex-wrap items-start gap-3">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--c-border)] bg-[var(--c-black)] font-display text-xl font-semibold text-[var(--c-white)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {logoOk ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(form.business_name || "B")
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="btn btn-md btn-outline mb-2 gap-2"
                    onClick={() => document.getElementById("settings-logo-url")?.focus()}
                  >
                    <Upload className="h-[13px] w-[13px]" aria-hidden />
                    Încarcă logo
                  </button>
                  <input
                    id="settings-logo-url"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value || null }))}
                    className="field-input w-full font-mono text-sm"
                    placeholder="https://exemplu.ro/logo.png"
                  />
                  <p className="field-hint mt-1.5">
                    PNG sau JPG, max 2MB recomandat. Lipește un URL public către imagine. Dacă lași gol, se
                    folosesc inițialele.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="dash-box mb-4">
        <div className="dash-box-head">
          <div className="dash-box-title">Cont și acces</div>
        </div>
        <div className="dash-box-body space-y-4">
          <div className="field-group mb-0">
            <label className="field-label text-[13px] font-semibold">Email cont</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="field-input w-full cursor-not-allowed opacity-90"
              style={{ background: "var(--c-sand-dark)", color: "var(--c-muted)" }}
            />
            <span className="field-hint">Emailul nu poate fi schimbat. Contactează suportul dacă ai nevoie.</span>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-sand)]/30 p-4">
            <div className="text-[13px] font-semibold text-[var(--c-black)]">Schimbă parola</div>
            <p className="field-hint -mt-0.5">
              Ești autentificat — introdu parola nouă de două ori și apasă Actualizează.
            </p>
            {pwdError && (
              <div
                className="rounded-lg p-2 text-sm"
                style={{
                  background: "rgba(200,75,47,0.08)",
                  color: "var(--c-accent)",
                  border: "1px solid rgba(200,75,47,0.25)",
                }}
              >
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div
                className="rounded-lg p-2 text-sm"
                style={{
                  background: "rgba(77,124,106,0.10)",
                  color: "var(--c-sage)",
                  border: "1px solid rgba(77,124,106,0.25)",
                }}
              >
                Parola a fost actualizată. La următorul login folosește noua parolă.
              </div>
            )}
            <div className="field-group mb-0 max-w-none">
              <label className="field-label">Parolă nouă</label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="field-input w-full"
                placeholder="Minim 6 caractere"
                minLength={6}
              />
            </div>
            <div className="field-group mb-0 max-w-none">
              <label className="field-label">Confirmă parola</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="field-input w-full"
                placeholder="Repetă parola"
                minLength={6}
              />
            </div>
            <button type="submit" disabled={pwdLoading} className="btn btn-md btn-accent">
              {pwdLoading ? "Se salvează…" : "Actualizează parola"}
            </button>
          </form>
        </div>
      </div>

      <div className="dash-box mb-6">
        <div className="dash-box-head">
          <div className="dash-box-title">Plan activ</div>
        </div>
        <div className="dash-box-body">
          <div
            className="mb-3.5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border px-4 py-3.5"
            style={{
              background: "var(--c-accent-lt)",
              borderColor: "var(--c-accent-mid)",
            }}
          >
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--c-accent-dark)" }}>
                Plan Pro · Lunar
              </div>
              <div className="mt-0.5 text-xs opacity-90" style={{ color: "var(--c-accent-dark)" }}>
                19€/lună · facturare automată în curând
              </div>
            </div>
            <span className="badge badge-accent shrink-0">Activ</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" className="btn btn-md btn-outline" disabled title="În curând">
              Upgrade la Anual — 169€/an
            </button>
            <button
              type="button"
              className="btn btn-md btn-outline"
              style={{ color: "var(--c-danger)", borderColor: "#f0c0ba", background: "#fbeae8" }}
              disabled
              title="În curând"
            >
              Anulează abonamentul
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        form="settings-business"
        disabled={loading}
        className="btn btn-lg btn-accent btn-full"
      >
        {loading ? "Se salvează…" : "Salvează modificările"}
      </button>
    </div>
  );
}
