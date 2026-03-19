"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoyaltyCard from "@/app/components/loyalty-card/LoyaltyCard";

type Props = {
  merchantId: string;
  programId: string;
  merchant: { business_name: string; logo_url: string | null };
  initial: {
    card_name: string;
    card_color: string;
    stamps_required: number;
    reward_description: string;
    card_template?: string | null;
    card_palette?: string | null;
    card_stamp_shape?: string | null;
    card_stamp_style?: string | null;
    card_custom_bg_color?: string | null;
    card_custom_bg2_color?: string | null;
  };
};

export function CardForm({ merchantId: _merchantId, programId, merchant, initial }: Props) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const templateUsesTwoColors = ["split", "corner", "lines", "dots"].includes(form.card_template ?? "minimal");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const primary = form.card_color;
      const secondary =
        form.card_template && ["split", "corner", "lines", "dots"].includes(form.card_template)
          ? form.card_custom_bg2_color ?? primary
          : primary;

      const { error: programErr } = await supabase
        .from("loyalty_programs")
        .update({
          card_name: form.card_name.trim(),
          card_color: primary,
          stamps_required: form.stamps_required,
          reward_description: form.reward_description.trim(),
          card_template: (form.card_template ?? "minimal") as any,
          card_palette: "custom",
          card_stamp_shape: (form.card_stamp_shape ?? "circle") as any,
          card_stamp_style: (form.card_stamp_style ?? "solid") as any,
          card_custom_bg_color: primary,
          card_custom_bg2_color: secondary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", programId);

      if (programErr) throw programErr;
      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="flex-1 min-w-0">
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
                Cardul a fost salvat cu succes.
              </div>
            )}

            <div>
              <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
                Nume card
              </label>
              <input
                type="text"
                value={form.card_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, card_name: e.target.value }))
                }
                className="w-full field-input"
              />
            </div>
            <div>
              <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
                Culoare principală
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.card_color}
                  onChange={(e) => {
                    const next = e.target.value;
                    setForm((p) => ({
                      ...p,
                      card_color: next,
                      card_custom_bg_color: next, // primary background
                      card_custom_bg2_color: p.card_custom_bg2_color ?? next, // secondary background (default to primary)
                      card_palette: "custom",
                    }));
                  }}
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
                  value={form.card_color}
                  onChange={(e) => {
                    const next = e.target.value;
                    setForm((p) => ({
                      ...p,
                      card_color: next,
                      card_custom_bg_color: next,
                      card_custom_bg2_color: p.card_custom_bg2_color ?? next,
                      card_palette: "custom",
                    }));
                  }}
                  className="flex-1 field-input font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
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
                className="w-full field-input"
              />
            </div>
            <div>
              <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
                Descriere recompensă
              </label>
              <input
                type="text"
                value={form.reward_description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reward_description: e.target.value }))
                }
                className="w-full field-input"
                placeholder="ex: Cafea gratuită"
              />
            </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
              Template card
            </label>
            <select
              value={form.card_template ?? "minimal"}
              onChange={(e) =>
                setForm((p) => ({ ...p, card_template: e.target.value }))
              }
              className="w-full field-select"
            >
              <option value="minimal">minimal</option>
              <option value="split">split</option>
              <option value="corner">corner</option>
              <option value="lines">lines</option>
              <option value="dots">dots</option>
            </select>
          </div>

          {templateUsesTwoColors && (
            <div className="md:col-span-2">
              <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
                Culoare secundară
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.card_custom_bg2_color ?? form.card_color}
                  onChange={(e) => {
                    const next = e.target.value;
                    setForm((p) => ({
                      ...p,
                      card_custom_bg2_color: next,
                      card_palette: "custom",
                    }));
                  }}
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
                  value={form.card_custom_bg2_color ?? form.card_color}
                  onChange={(e) => {
                    const next = e.target.value;
                    setForm((p) => ({
                      ...p,
                      card_custom_bg2_color: next,
                      card_palette: "custom",
                    }));
                  }}
                  className="flex-1 field-input font-mono text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
              Forma stampilei
            </label>
            <select
              value={form.card_stamp_shape ?? "circle"}
              onChange={(e) =>
                setForm((p) => ({ ...p, card_stamp_shape: e.target.value }))
              }
              className="w-full field-select"
            >
              <option value="circle">circle</option>
              <option value="rounded">rounded</option>
              <option value="diamond">diamond</option>
              <option value="hex">hex</option>
            </select>
          </div>

          <div>
            <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
              Stil stampilă
            </label>
            <select
              value={form.card_stamp_style ?? "solid"}
              onChange={(e) =>
                setForm((p) => ({ ...p, card_stamp_style: e.target.value }))
              }
              className="w-full field-select"
            >
              <option value="solid">solid</option>
              <option value="outline">outline</option>
              <option value="soft">soft</option>
            </select>
          </div>
        </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-md btn-accent btn-full"
            >
              {loading ? "Se salvează..." : "Salvează"}
            </button>
          </form>
        </div>

        <div className="md:w-[390px] w-full">
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--c-black)" }}>
            Preview card client
          </h2>
          <div className="max-w-[360px]">
            <LoyaltyCard
              brand={form.card_name || "Card"}
              holder={"Maria Popescu"}
              reward={form.reward_description || "Cafea gratuită"}
              totalStamps={form.stamps_required || 1}
              filledStamps={0}
              logoUrl={merchant.logo_url}
              accentColor={form.card_color}
              template={(form.card_template ?? "minimal") as any}
              palette={"custom" as any}
              stampShape={(form.card_stamp_shape ?? "circle") as any}
              stampStyle={(form.card_stamp_style ?? "solid") as any}
              customBgColor={form.card_custom_bg_color ?? form.card_color}
              customBg2Color={form.card_custom_bg2_color ?? (form.card_custom_bg_color ?? form.card_color)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
