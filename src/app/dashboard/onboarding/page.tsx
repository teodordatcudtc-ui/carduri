"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Afacerea ta" },
  { id: 2, title: "Configurare card" },
  { id: 3, title: "Gata" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: "",
    slug: "",
    brand_color: "#ea751a",
    stamps_required: 8,
    reward_description: "Recompensă gratuită",
  });
  const router = useRouter();
  const supabase = createClient();

  function update(f: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...f }));
    if (f.business_name !== undefined)
      setForm((prev) => ({ ...prev, slug: slugify(f.business_name ?? "") }));
  }

  async function handleStep1() {
    if (!form.business_name.trim()) {
      setError("Introdu numele afacerii.");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handleStep2() {
    if (form.stamps_required < 1 || form.stamps_required > 20) {
      setError("Stampile pentru recompensă: între 1 și 20.");
      return;
    }
    setError(null);
    setStep(3);
  }

  async function handleFinish() {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Nu ești autentificat.");

      const { data: merchant, error: merchantError } = await supabase
        .from("merchants")
        .insert({
          user_id: user.id,
          business_name: form.business_name.trim(),
          slug: form.slug || slugify(form.business_name),
          brand_color: form.brand_color,
        })
        .select("id")
        .single();

      if (merchantError) throw merchantError;

      await supabase.from("loyalty_programs").insert({
        merchant_id: merchant.id,
        stamps_required: form.stamps_required,
        reward_description: form.reward_description.trim() || "Recompensă gratuită",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la salvare.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-xl mx-auto">
      <div className="flex gap-2 mb-8">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full ${
              s.id <= step ? "bg-brand-500" : "bg-stone-700"
            }`}
          />
        ))}
      </div>
      <h1 className="text-2xl font-bold text-white mb-6">
        Configurare {STEPS[step - 1].title}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 text-red-400 text-sm p-3">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">
              Nume afacere *
            </label>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => update({ business_name: e.target.value })}
              className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="ex: Cafenea Central"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">
              Slug (URL)
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update({ slug: e.target.value })}
              className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="cafenea-central"
            />
            <p className="text-xs text-stone-500 mt-1">
              Link înrolare: .../enroll/{form.slug || "slug"}
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
                onChange={(e) => update({ brand_color: e.target.value })}
                className="h-10 w-14 rounded border border-stone-600 cursor-pointer"
              />
              <input
                type="text"
                value={form.brand_color}
                onChange={(e) => update({ brand_color: e.target.value })}
                className="flex-1 rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleStep1}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg font-medium transition"
          >
            Continuă
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">
              Număr ștampile pentru recompensă *
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.stamps_required}
              onChange={(e) =>
                update({ stamps_required: parseInt(e.target.value, 10) || 1 })
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
              onChange={(e) => update({ reward_description: e.target.value })}
              className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="ex: Cafea gratuită"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800 transition"
            >
              Înapoi
            </button>
            <button
              onClick={handleStep2}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg font-medium transition"
            >
              Continuă
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-stone-400">
            Ai configurat: <strong className="text-white">{form.business_name}</strong> —{" "}
            {form.stamps_required} ștampile = {form.reward_description}.
          </p>
          <button
            onClick={handleFinish}
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
          >
            {loading ? "Se salvează..." : "Finalizează și intră în dashboard"}
          </button>
        </div>
      )}
    </div>
  );
}
