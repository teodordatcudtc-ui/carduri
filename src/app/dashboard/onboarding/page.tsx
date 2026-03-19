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

      const slug = form.slug || slugify(form.business_name);

      const { data: existingMerchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const merchantId = existingMerchant?.id;

      if (merchantId) {
        const { error: updateErr } = await supabase
          .from("merchants")
          .update({
            business_name: form.business_name.trim(),
            slug,
            brand_color: form.brand_color,
            updated_at: new Date().toISOString(),
          })
          .eq("id", merchantId);
        if (updateErr) throw updateErr;

        const { data: existingProgram } = await supabase
          .from("loyalty_programs")
          .select("id")
          .eq("merchant_id", merchantId)
          .maybeSingle();

        if (existingProgram?.id) {
          const { error: progUpdateErr } = await supabase
            .from("loyalty_programs")
            .update({
              card_name: "Card fidelitate",
              card_color: form.brand_color,
              stamps_required: form.stamps_required,
              reward_description:
                form.reward_description.trim() || "Recompensă gratuită",
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProgram.id);
          if (progUpdateErr) throw progUpdateErr;
        } else {
          const { error: progInsertErr } = await supabase
            .from("loyalty_programs")
            .insert({
              merchant_id: merchantId,
              card_name: "Card fidelitate",
              card_color: form.brand_color,
              stamps_required: form.stamps_required,
              reward_description:
                form.reward_description.trim() || "Recompensă gratuită",
            });
          if (progInsertErr) throw progInsertErr;
        }
      } else {
        const { data: merchant, error: merchantError } = await supabase
          .from("merchants")
          .insert({
            user_id: user.id,
            business_name: form.business_name.trim(),
            slug,
            brand_color: form.brand_color,
          })
          .select("id")
          .single();

        if (merchantError) throw merchantError;

        const { error: programErr } = await supabase
          .from("loyalty_programs")
          .insert({
            merchant_id: merchant.id,
            card_name: "Card fidelitate",
            card_color: form.brand_color,
            stamps_required: form.stamps_required,
            reward_description:
              form.reward_description.trim() || "Recompensă gratuită",
          });
        if (programErr) throw programErr;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la salvare.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card card-sm">
        <div className="flex gap-2 mb-8">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className="h-1 flex-1 rounded-full"
              style={{
                background:
                  s.id <= step ? "var(--c-accent)" : "rgba(17,17,16,0.12)",
              }}
            />
          ))}
        </div>

        <h1 className="type-display-md mb-6">
          Configurare {STEPS[step - 1].title}
        </h1>

        {error && (
          <div
            className="mb-4 rounded-lg text-sm p-3"
            style={{
              background: "rgba(200,75,47,0.08)",
              color: "var(--c-accent)",
              border: "1px solid rgba(200,75,47,0.25)",
            }}
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="field-group" style={{ width: "100%" }}>
              <label className="field-label" style={{ display: "block" }}>
                Nume afacere *
              </label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => update({ business_name: e.target.value })}
                className="field-input"
                placeholder="ex: Cafenea Central"
              />
            </div>

            <div className="field-group" style={{ width: "100%" }}>
              <label className="field-label" style={{ display: "block" }}>
                Slug (URL)
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => update({ slug: e.target.value })}
                className="field-input"
                placeholder="cafenea-central"
              />
              <p className="field-hint" style={{ marginTop: -4 }}>
                Link înrolare: .../enroll/{form.slug || "slug"}
              </p>
            </div>

            <div className="field-group" style={{ width: "100%" }}>
              <label className="field-label" style={{ display: "block" }}>
                Culoare brand
              </label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="color"
                  value={form.brand_color}
                  onChange={(e) => update({ brand_color: e.target.value })}
                  style={{
                    height: 42,
                    width: 56,
                    borderRadius: "var(--r-md)",
                    border: "1.5px solid var(--c-border)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
                <input
                  type="text"
                  value={form.brand_color}
                  onChange={(e) => update({ brand_color: e.target.value })}
                  className="field-input font-mono"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <button onClick={handleStep1} className="btn btn-accent btn-full">
              Continuă
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="field-group" style={{ width: "100%" }}>
              <label className="field-label" style={{ display: "block" }}>
                Număr ștampile pentru recompensă *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.stamps_required}
                onChange={(e) =>
                  update({
                    stamps_required: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="field-input"
              />
            </div>

            <div className="field-group" style={{ width: "100%" }}>
              <label className="field-label" style={{ display: "block" }}>
                Descriere recompensă
              </label>
              <input
                type="text"
                value={form.reward_description}
                onChange={(e) => update({ reward_description: e.target.value })}
                className="field-input"
                placeholder="ex: Cafea gratuită"
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setStep(1)}
                className="btn btn-md btn-outline"
                style={{ flex: 1 }}
              >
                Înapoi
              </button>
              <button
                onClick={handleStep2}
                className="btn btn-md btn-accent"
                style={{ flex: 1 }}
              >
                Continuă
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p style={{ color: "var(--c-ink-60)" }}>
              Ai configurat:{" "}
              <strong style={{ color: "var(--c-black)" }}>
                {form.business_name}
              </strong>{" "}
              — {form.stamps_required} ștampile = {form.reward_description}.
            </p>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn btn-accent btn-full"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? "Se salvează..."
                : "Finalizează și intră în dashboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
