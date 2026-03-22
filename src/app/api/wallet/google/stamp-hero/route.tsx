import { ImageResponse } from "next/og";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

function hex(c: string | null | undefined, fallback: string): string {
  if (!c?.trim()) return fallback;
  const h = c.replace(/^#/, "");
  if (h.length === 6) return `#${h}`;
  if (h.length === 3)
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  return fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, "");
  const full = h.length === 3 ? `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}` : h.slice(0, 6);
  if (full.length !== 6) return { r: 30, g: 27, b: 24 };
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Text deschis pe fundal închis, invers pe fundal deschis (ca pe cardul web). */
function textOnBackground(bgHex: string): { primary: string; muted: string; subtle: string } {
  const { r, g, b } = hexToRgb(bgHex);
  const L = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  const dark = L > 0.62;
  if (dark) {
    return {
      primary: "#141210",
      muted: "rgba(20,18,16,0.72)",
      subtle: "rgba(20,18,16,0.48)",
    };
  }
  return {
    primary: "#ffffff",
    muted: "rgba(255,255,255,0.82)",
    subtle: "rgba(255,255,255,0.55)",
  };
}

function placeholderImage(message: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1b18",
          color: "#f8f7f5",
          fontSize: 28,
          padding: 40,
          textAlign: "center",
        }}
      >
        {message}
      </div>
    ),
    { width: 1032, height: 336 }
  );
}

/** Imagine wide pentru hero Google Wallet — grilă ștampile + recompensă, culori ca pe cardul web. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const passId = searchParams.get("pass_id");
  if (!passId) {
    return placeholderImage("pass_id lipsă");
  }

  let supabase;
  try {
    supabase = createServiceRoleSupabase();
  } catch {
    return placeholderImage("Configurare server incompletă");
  }

  const { data: pass, error: passErr } = await supabase
    .from("wallet_passes")
    .select("stamp_count, reward_available, program_id, merchant_id")
    .eq("id", passId)
    .single();

  if (passErr || !pass) {
    return placeholderImage("Card negăsit");
  }

  const [{ data: program }, { data: merchant }] = await Promise.all([
    supabase
      .from("loyalty_programs")
      .select(
        "stamps_required, reward_description, card_name, card_custom_bg_color, card_custom_bg2_color, card_custom_bg3_color, card_color"
      )
      .eq("id", pass.program_id)
      .single(),
    supabase.from("merchants").select("business_name, brand_color").eq("id", pass.merchant_id).single(),
  ]);

  const stampsRequired = Math.max(1, Math.min(24, program?.stamps_required ?? 8));
  const stampCount = Math.min(pass.stamp_count, stampsRequired);
  const rewardDescription = (program?.reward_description ?? "Recompensă").slice(0, 90);
  const businessName = (merchant?.business_name ?? "StampIO").slice(0, 28);
  const cardTitle = (program?.card_name ?? businessName).slice(0, 32);

  const c1 = hex(
    program?.card_custom_bg_color,
    hex(program?.card_color, merchant?.brand_color ?? "#ea751a")
  );
  const c2 = hex(program?.card_custom_bg2_color, c1);
  const c3 = hex(program?.card_custom_bg3_color, c2);

  const txt = textOnBackground(c1);
  const isLight = txt.primary === "#141210";
  const panelBg = isLight ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.18)";
  const panelBorder = isLight ? "1px solid rgba(20,18,16,0.08)" : "1px solid rgba(255,255,255,0.14)";
  const stampEmptyBorder = isLight ? "3px solid rgba(20,18,16,0.2)" : "3px solid rgba(255,255,255,0.35)";
  const stampEmptyInner = isLight ? "rgba(20,18,16,0.06)" : "rgba(0,0,0,0.15)";

  const n = stampsRequired;
  const circleSize = n <= 6 ? 54 : n <= 10 ? 44 : n <= 14 ? 36 : 30;
  const gap = n <= 10 ? 14 : 9;

  const slots = Array.from({ length: n }, (_, i) => i < stampCount);
  const remaining = Math.max(0, stampsRequired - stampCount);
  const accentStripe = hex(program?.card_color, merchant?.brand_color ?? "#f26545");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(155deg, ${c1} 0%, ${c2} 48%, ${c3} 100%)`,
          position: "relative",
        }}
      >
        {/* Accente subtile + bandă coral */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 70% at 20% 10%, rgba(255,255,255,0.14) 0%, transparent 55%)",
          }}
        />
        <div
          style={{
            height: 5,
            width: "100%",
            background: `linear-gradient(90deg, ${accentStripe} 0%, ${c2} 100%)`,
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "22px 32px 26px",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "72%" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: txt.subtle,
                  fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                }}
              >
                {businessName}
              </span>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: -0.8,
                  lineHeight: 1.15,
                  color: txt.primary,
                  fontFamily: 'Georgia, "Times New Roman", ui-serif, serif',
                }}
              >
                {cardTitle}
              </span>
            </div>
            {pass.reward_available ? (
              <span
                style={{
                  background: isLight ? "rgba(242,101,69,0.15)" : "rgba(255,255,255,0.2)",
                  color: isLight ? "#c03f22" : "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: isLight ? "1px solid rgba(242,101,69,0.35)" : "1px solid rgba(255,255,255,0.25)",
                  fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                }}
              >
                Recompensă gata
              </span>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              flex: 1,
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: txt.primary,
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
              }}
            >
              {stampCount} completate · {remaining} rămase
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: txt.subtle,
                letterSpacing: 0.4,
                textTransform: "uppercase" as const,
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
              }}
            >
              Fiecare cerc = o ștampilă
            </span>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap,
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              width: "100%",
              padding: "18px 20px",
              borderRadius: 20,
              background: panelBg,
              border: panelBorder,
              boxShadow: isLight
                ? "0 8px 28px rgba(20,18,16,0.08)"
                : "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            {slots.map((filled, i) => (
              <div
                key={String(i)}
                style={{
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...(filled
                    ? {
                        background: isLight ? txt.primary : "rgba(255,255,255,0.95)",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                      }
                    : {
                        border: stampEmptyBorder,
                        background: stampEmptyInner,
                      }),
                }}
              >
                {filled ? (
                  <span
                    style={{
                      color: isLight ? "#fff" : c1,
                      fontSize: Math.round(circleSize * 0.42),
                      fontWeight: 900,
                      fontFamily:
                        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                    }}
                  >
                    ✓
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <span
              style={{
                color: txt.muted,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 0.3,
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
              }}
            >
              Total: {stampsRequired} ștampile pentru recompensă
            </span>
            <span
              style={{
                color: txt.primary,
                fontSize: 19,
                fontWeight: 600,
                textAlign: "center",
                lineHeight: 1.35,
                maxWidth: 920,
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
              }}
            >
              {rewardDescription}
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1032, height: 336 }
  );
}
