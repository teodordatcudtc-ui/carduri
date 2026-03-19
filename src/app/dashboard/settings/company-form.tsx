"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  merchantId: string;
  initial: {
    business_name: string;
    logo_url: string | null;
    business_type: string | null;
    address: string | null;
  };
};

export function CompanyForm({ merchantId, initial }: Props) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();
  const router = useRouter();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="rounded-lg text-sm p-3"
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
          className="rounded-lg text-sm p-3"
          style={{
            background: "rgba(77,124,106,0.10)",
            color: "var(--c-sage)",
            border: "1px solid rgba(77,124,106,0.25)",
          }}
        >
          Setările companiei au fost salvate.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Nume companie
        </label>
        <input
          type="text"
          value={form.business_name}
          onChange={(e) =>
            setForm((p) => ({ ...p, business_name: e.target.value }))
          }
          className="w-full field-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Logo (opțional, URL imagine)
        </label>
        <input
          type="url"
          value={form.logo_url ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, logo_url: e.target.value || null }))
          }
          className="w-full field-input"
          placeholder="https://exemplu.ro/logo.png"
        />
        <p className="mt-1 text-xs" style={{ color: "var(--c-muted)" }}>
          Dacă lași gol, se folosesc inițialele.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Tip (ex: cafenea, salon)
        </label>
        <input
          type="text"
          value={form.business_type ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, business_type: e.target.value || null }))}
          className="w-full field-input"
          placeholder="cafenea"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Adresă (opțional)
        </label>
        <input
          type="text"
          value={form.address ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value || null }))}
          className="w-full field-input"
          placeholder="Strada, nr., oraș"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn btn-md btn-accent"
      >
        {loading ? "Se salvează..." : "Salvează"}
      </button>
    </form>
  );
}

