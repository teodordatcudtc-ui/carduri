"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  merchantId: string;
  programId: string;
  initial: {
    business_name: string;
    logo_url: string | null;
    brand_color: string;
    stamps_required: number;
    reward_description: string;
  };
};

export function CardForm({ merchantId, programId, initial }: Props) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await Promise.all([
        supabase
          .from("merchants")
          .update({
            business_name: form.business_name.trim(),
            logo_url: form.logo_url?.trim() || null,
            brand_color: form.brand_color,
            updated_at: new Date().toISOString(),
          })
          .eq("id", merchantId),
        supabase
          .from("loyalty_programs")
          .update({
            stamps_required: form.stamps_required,
            reward_description: form.reward_description.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", programId),
      ]);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 text-red-400 text-sm p-3">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">
            Nume afacere
          </label>
          <input
            type="text"
            value={form.business_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, business_name: e.target.value }))
            }
            className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">
            Logo (URL imagine)
          </label>
          <input
            type="url"
            value={form.logo_url ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, logo_url: e.target.value || null }))
            }
            className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="https://exemplu.ro/logo.png"
          />
          <p className="mt-1 text-xs text-stone-500">
            Folosește un logo pătrat (ex. 512×512) găzduit online sau în
            storage‑ul tău.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">
            Culoare brand
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={form.brand_color}
              onChange={(e) =>
                setForm((p) => ({ ...p, brand_color: e.target.value }))
              }
              className="h-10 w-14 rounded border border-stone-600 cursor-pointer"
            />
            <input
              type="text"
              value={form.brand_color}
              onChange={(e) =>
                setForm((p) => ({ ...p, brand_color: e.target.value }))
              }
              className="flex-1 rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white font-mono text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">
            Ștampile pentru recompensă
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.stamps_required}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                stamps_required: parseInt(e.target.value, 10) || 1,
              }))
            }
            className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">
            Descriere recompensă
          </label>
          <input
            type="text"
            value={form.reward_description}
            onChange={(e) =>
              setForm((p) => ({ ...p, reward_description: e.target.value }))
            }
            className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="ex: Cafea gratuită"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
        >
          {loading ? "Se salvează..." : "Salvează"}
        </button>
      </form>

      <div>
        <h2 className="text-sm font-semibold text-stone-200 mb-2">
          Preview card client
        </h2>
        <div className="rounded-2xl border p-4 bg-stone-900/70 border-stone-700 max-w-xs">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden border"
              style={{ borderColor: form.brand_color }}
            >
              {form.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logo_url}
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-1 text-center">
                  {form.business_name?.slice(0, 2).toUpperCase() || "LO"}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-stone-400">Card fidelitate</p>
              <p className="text-sm font-semibold text-white">
                {form.business_name || "Nume afacere"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: form.stamps_required || 1 }).map((_, idx) => (
              <div
                // ok: index pentru preview static
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className="h-7 w-7 rounded-full border border-dashed border-stone-600 flex items-center justify-center bg-stone-900"
              >
                <span className="text-[10px] text-stone-500">{idx + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-stone-400">
            Recompensă: {form.reward_description || "ex: Cafea gratuită"}
          </p>
        </div>
      </div>
    </div>
  );
}
