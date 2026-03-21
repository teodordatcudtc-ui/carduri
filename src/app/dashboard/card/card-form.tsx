"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoyaltyCard from "@/app/components/loyalty-card/LoyaltyCard";
import { LayoutDashboard, Palette, Layers, Stamp, Sparkles } from "lucide-react";

type FormState = {
  card_name: string;
  card_color: string;
  /** Gol în timp ce editezi; la salvare trebuie 1–20. */
  stamps_required: number | "";
  reward_description: string;
  card_template?: string | null;
  card_palette?: string | null;
  card_stamp_shape?: string | null;
  card_stamp_style?: string | null;
  card_custom_bg_color?: string | null;
  card_custom_bg2_color?: string | null;
  card_custom_bg3_color?: string | null;
  card_layout?: string | null;
  card_noise?: boolean | null;
  card_mesh_gradient?: boolean | null;
  card_footer_color?: string | null;
  card_badge_color?: string | null;
  card_badge_letter?: string | null;
  card_stamp_variant?: string | null;
  card_stamp_empty_icon?: string | null;
  card_stamp_filled_icon?: string | null;
};

type Props = {
  merchant: { business_name: string; logo_url: string | null };
  programId: string;
  initial: FormState;
};

export function CardForm({ merchant, programId, initial }: Props) {
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaveNote(null);
    setSaved(false);
    if (form.stamps_required === "" || typeof form.stamps_required !== "number") {
      setError("Introdu numărul de ștampile (1–20).");
      return;
    }
    const stamps = form.stamps_required;
    if (stamps < 1 || stamps > 20) {
      setError("Numărul de ștampile trebuie să fie între 1 și 20.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/program/${programId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          card_name: form.card_name.trim(),
          card_color: form.card_color,
          stamps_required: stamps,
          reward_description: form.reward_description.trim(),
          card_template: form.card_template ?? "minimal",
          card_palette: "custom",
          card_stamp_shape: form.card_stamp_shape ?? "circle",
          card_stamp_style: form.card_stamp_style ?? "solid",
          card_custom_bg_color: form.card_color,
          card_custom_bg2_color: form.card_custom_bg2_color ?? form.card_color,
          card_custom_bg3_color: form.card_custom_bg3_color ?? null,
          card_layout: form.card_layout ?? "compact",
          card_noise: !!form.card_noise,
          card_mesh_gradient: !!form.card_mesh_gradient,
          card_footer_color: form.card_footer_color?.trim() || null,
          card_badge_color: form.card_badge_color?.trim() || null,
          card_badge_letter: form.card_badge_letter?.trim().slice(0, 1) || null,
          card_stamp_variant: form.card_stamp_variant ?? "brand",
          card_stamp_empty_icon:
            form.card_stamp_empty_icon === "logo" && !merchant.logo_url
              ? "coffee"
              : (form.card_stamp_empty_icon ?? "coffee"),
          card_stamp_filled_icon: form.card_stamp_filled_icon ?? "check",
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        savedLevel?: string;
        message?: string;
        hint?: string;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        const msg = [data.message, data.hint].filter(Boolean).join(" ");
        throw new Error(msg || data.error || "Eroare la salvare");
      }

      if (data.savedLevel && data.savedLevel !== "full") {
        setSaveNote(
          "Unele câmpuri nu s-au putut salva în baza ta de date (migrări incomplete). Rulează migrările 006–008 în Supabase, apoi salvează din nou."
        );
      }
      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setLoading(false);
    }
  }

  const previewStamps =
    typeof form.stamps_required === "number" ? form.stamps_required : 8;

  const preview = (
    <LoyaltyCard
      brand={form.card_name || "Card"}
      holder="Maria Popescu"
      reward={form.reward_description || "Recompensa ta"}
      totalStamps={previewStamps}
      filledStamps={3}
      logoUrl={merchant.logo_url}
      accentColor={form.card_color}
      template={(form.card_template ?? "minimal") as any}
      palette={"custom" as const}
      stampShape={(form.card_stamp_shape ?? "circle") as "circle"}
      stampStyle={(form.card_stamp_style ?? "solid") as "solid"}
      customBgColor={form.card_custom_bg_color ?? form.card_color}
      customBg2Color={
        form.card_custom_bg2_color ?? (form.card_custom_bg_color ?? form.card_color)
      }
      customBg3Color={
        form.card_custom_bg3_color ??
        form.card_custom_bg2_color ??
        (form.card_custom_bg_color ?? form.card_color)
      }
      layout={(form.card_layout === "hero" ? "hero" : "compact") as "compact" | "hero"}
      noise={!!form.card_noise}
      meshGradient={!!form.card_mesh_gradient}
      footerColor={form.card_footer_color}
      badgeColor={form.card_badge_color}
      badgeLetter={form.card_badge_letter}
      stampVariant={(form.card_stamp_variant === "contrast" ? "contrast" : "brand") as "brand" | "contrast"}
      emptyStampIcon={form.card_stamp_empty_icon ?? "coffee"}
      filledStampIcon={form.card_stamp_filled_icon ?? "check"}
      showSubtitle
    />
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8 xl:gap-10 items-start w-full xl:min-h-0 xl:h-full xl:grid-rows-1 xl:items-stretch">
      <div className="space-y-6 min-w-0 xl:min-h-0 xl:max-h-full xl:overflow-y-auto xl:overscroll-contain xl:pr-1 xl:pb-2 xl:scroll-smooth">
        <form onSubmit={handleSubmit} className="space-y-6">
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
          {saveNote && (
            <div
              className="rounded-lg text-sm p-3"
              style={{
                background: "rgba(224,150,0,0.10)",
                color: "var(--c-amber)",
                border: "1px solid rgba(224,150,0,0.25)",
              }}
            >
              {saveNote}
            </div>
          )}

          <div className="dash-box mb-4">
            <div className="dash-box-body space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-4 h-4 text-[var(--c-accent)]" />
              <h2 className="font-semibold text-[var(--c-black)]">Conținut card</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="field-label block mb-1.5">Titlu pe card (sus, stânga)</label>
                <input
                  type="text"
                  value={form.card_name}
                  onChange={(e) => setForm((p) => ({ ...p, card_name: e.target.value }))}
                  className="w-full field-input"
                  placeholder="ex: Reducere 50%"
                />
              </div>
              <div>
                <label className="field-label block mb-1.5">Ștampile până la recompensă</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.stamps_required === "" ? "" : form.stamps_required}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setForm((p) => ({ ...p, stamps_required: "" }));
                      return;
                    }
                    const n = parseInt(raw, 10);
                    if (Number.isNaN(n)) return;
                    setForm((p) => ({
                      ...p,
                      stamps_required: Math.min(20, Math.max(1, n)),
                    }));
                  }}
                  className="w-full field-input"
                />
              </div>
              <div>
                <label className="field-label block mb-1.5">Text recompensă</label>
                <input
                  type="text"
                  value={form.reward_description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reward_description: e.target.value }))
                  }
                  className="w-full field-input"
                  placeholder="ex: 1+1 GRATIS"
                />
              </div>
            </div>
          </div>
          </div>

          <div className="dash-box mb-4">
            <div className="dash-box-body space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-[var(--c-accent)]" />
              <h2 className="font-semibold text-[var(--c-black)]">Culori card</h2>
            </div>
            <p className="text-sm text-[var(--c-ink-60)] mb-2">
              Trei culori pentru acest card (independente de culoarea din Setări companie). Principală = fundal de bază
              și accent ștampile; secundară și terțiară = gradient, pattern și straturi mesh.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="field-label block mb-1.5">1 — Principală</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.card_color}
                    onChange={(e) => {
                      const next = e.target.value;
                      setForm((p) => ({
                        ...p,
                        card_color: next,
                        card_custom_bg_color: next,
                        card_palette: "custom",
                      }));
                    }}
                    className="h-10 w-14 rounded-md border border-[var(--c-border)] cursor-pointer p-0 shrink-0"
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
                        card_palette: "custom",
                      }));
                    }}
                    className="flex-1 field-input font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="field-label block mb-1.5">2 — Secundară</label>
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
                    className="h-10 w-14 rounded-md border border-[var(--c-border)] cursor-pointer p-0 shrink-0"
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
              <div className="sm:col-span-1">
                <label className="field-label block mb-1.5">3 — Terțiară</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={
                      form.card_custom_bg3_color ??
                      form.card_custom_bg2_color ??
                      form.card_color
                    }
                    onChange={(e) => {
                      const next = e.target.value;
                      setForm((p) => ({
                        ...p,
                        card_custom_bg3_color: next,
                        card_palette: "custom",
                      }));
                    }}
                    className="h-10 w-14 rounded-md border border-[var(--c-border)] cursor-pointer p-0 shrink-0"
                  />
                  <input
                    type="text"
                    value={
                      form.card_custom_bg3_color ??
                      form.card_custom_bg2_color ??
                      form.card_color
                    }
                    onChange={(e) => {
                      const next = e.target.value;
                      setForm((p) => ({
                        ...p,
                        card_custom_bg3_color: next,
                        card_palette: "custom",
                      }));
                    }}
                    className="flex-1 field-input font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="dash-box mb-4">
            <div className="dash-box-body space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-[var(--c-accent)]" />
              <h2 className="font-semibold text-[var(--c-black)]">Fundal & efecte</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="field-label block mb-1.5">Stil fundal</label>
                <select
                  value={form.card_template ?? "minimal"}
                  onChange={(e) => setForm((p) => ({ ...p, card_template: e.target.value }))}
                  className="w-full field-select"
                >
                  <option value="minimal">Simplu (uniform)</option>
                  <option value="mesh">Gradient mesh</option>
                  <option value="split">Split diagonal</option>
                  <option value="corner">Colț circular</option>
                  <option value="lines">Linii</option>
                  <option value="dots">Puncte</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-[var(--c-border)] p-3 bg-[var(--c-sand)]/40">
                <input
                  type="checkbox"
                  checked={!!form.card_mesh_gradient}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, card_mesh_gradient: e.target.checked }))
                  }
                  className="rounded border-[var(--c-border)]"
                />
                <span className="text-sm">Strat gradient extra (blobs colorate)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-[var(--c-border)] p-3 bg-[var(--c-sand)]/40">
                <input
                  type="checkbox"
                  checked={!!form.card_noise}
                  onChange={(e) => setForm((p) => ({ ...p, card_noise: e.target.checked }))}
                  className="rounded border-[var(--c-border)]"
                />
                <span className="text-sm">Textură grain (noise)</span>
              </label>
            </div>
          </div>
          </div>

          <div className="dash-box mb-4">
            <div className="dash-box-body space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[var(--c-accent)]" />
              <h2 className="font-semibold text-[var(--c-black)]">Layout & insignă</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label block mb-1.5">Aranjament card</label>
                <select
                  value={form.card_layout ?? "compact"}
                  onChange={(e) => setForm((p) => ({ ...p, card_layout: e.target.value }))}
                  className="w-full field-select"
                >
                  <option value="compact">Clasic (recompensa în „pastilă”)</option>
                  <option value="hero">Hero (footer întunecat ca în exemple)</option>
                </select>
              </div>
              {(form.card_layout ?? "compact") === "hero" && (
                <div>
                  <label className="field-label block mb-1.5">Culoare bară jos (footer)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.card_footer_color ?? "#1a1d24"}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, card_footer_color: e.target.value }))
                      }
                      className="h-10 w-14 rounded-md border border-[var(--c-border)] cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={form.card_footer_color ?? "#1a1d24"}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, card_footer_color: e.target.value }))
                      }
                      className="flex-1 field-input font-mono text-sm"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="field-label block mb-1.5">Culoare cerc logo (dreapta sus)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.card_badge_color ?? form.card_color}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, card_badge_color: e.target.value }))
                    }
                    className="h-10 w-14 rounded-md border border-[var(--c-border)] cursor-pointer p-0 shrink-0"
                  />
                  <input
                    type="text"
                    value={form.card_badge_color ?? form.card_color}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, card_badge_color: e.target.value }))
                    }
                    className="flex-1 field-input font-mono text-sm"
                    placeholder="lasă gol = culoare principală"
                  />
                </div>
              </div>
              <div>
                <label className="field-label block mb-1.5">Literă în cerc (opțional)</label>
                <input
                  type="text"
                  maxLength={1}
                  value={form.card_badge_letter ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      card_badge_letter: e.target.value.toUpperCase().slice(0, 1),
                    }))
                  }
                  className="w-full field-input max-w-[120px]"
                  placeholder="auto din titlu"
                />
              </div>
            </div>
          </div>
          </div>

          <div className="dash-box mb-4">
            <div className="dash-box-body space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Stamp className="w-4 h-4 text-[var(--c-accent)]" />
              <h2 className="font-semibold text-[var(--c-black)]">Ștampile</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label block mb-1.5">Formă</label>
                <select
                  value={form.card_stamp_shape ?? "circle"}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, card_stamp_shape: e.target.value }))
                  }
                  className="w-full field-select"
                >
                  <option value="circle">Cerc</option>
                  <option value="rounded">Pătrat rotunjit</option>
                  <option value="diamond">Romb</option>
                  <option value="hex">Hexagon</option>
                </select>
              </div>
              <div>
                <label className="field-label block mb-1.5">Stil umplere</label>
                <select
                  value={form.card_stamp_style ?? "solid"}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, card_stamp_style: e.target.value }))
                  }
                  className="w-full field-select"
                >
                  <option value="solid">Solid (culoare principală)</option>
                  <option value="outline">Contur</option>
                  <option value="soft">Soft</option>
                </select>
              </div>
              <div>
                <label className="field-label block mb-1.5">Variantă vizuală</label>
                <select
                  value={form.card_stamp_variant ?? "brand"}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, card_stamp_variant: e.target.value }))
                  }
                  className="w-full field-select"
                >
                  <option value="brand">Brand (culoare accent)</option>
                  <option value="contrast">Contrast (alb + ✓ / contur)</option>
                </select>
              </div>
              <div>
                <label className="field-label block mb-1.5">Iconiță slot gol</label>
                <select
                  value={
                    form.card_stamp_empty_icon === "logo" && !merchant.logo_url
                      ? "coffee"
                      : (form.card_stamp_empty_icon ?? "coffee")
                  }
                  onChange={(e) =>
                    setForm((p) => ({ ...p, card_stamp_empty_icon: e.target.value }))
                  }
                  className="w-full field-select"
                >
                  <option value="coffee">Cafea</option>
                  <option value="burger">Mâncare</option>
                  <option value="scissors">Foarfece</option>
                  <option value="gift">Cadou</option>
                  <option value="star">Stea</option>
                  <option value="cup">Pahar</option>
                  {merchant.logo_url ? (
                    <option value="logo">Logo (din Setări companie)</option>
                  ) : null}
                </select>
                {!merchant.logo_url && (
                  <p className="text-xs text-[var(--c-muted)] mt-1.5">
                    Încarcă un logo în Setări ca să poți folosi opțiunea „Logo” pe sloturile goale.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="field-label block mb-1.5">Iconiță slot completat</label>
                <select
                  value={form.card_stamp_filled_icon ?? "check"}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, card_stamp_filled_icon: e.target.value }))
                  }
                  className="w-full field-select"
                >
                  <option value="check">Bifă ✓</option>
                  <option value="dot">Punct</option>
                  <option value="same">La fel ca slotul gol</option>
                </select>
              </div>
            </div>
          </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-md btn-accent btn-full">
            {loading ? "Se salvează..." : "Salvează modificările"}
          </button>
        </form>
      </div>

      <aside className="xl:sticky xl:top-20 xl:min-h-0 xl:h-fit xl:flex xl:flex-col xl:justify-start space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--c-muted)] shrink-0">
          Preview card client
        </p>
        <div className="dash-box overflow-hidden shrink-0">
          <div className="dash-box-body flex justify-center bg-[var(--c-sand)]/50 p-6">
            <div className="w-full max-w-[360px]">{preview}</div>
          </div>
        </div>
        <p className="text-xs text-[var(--c-muted)] leading-relaxed shrink-0">
          Preview-ul folosește date fictive pentru titular. Pe cardul real apare numele clientului și progresul
          lui.
        </p>
      </aside>
    </div>
  );
}
