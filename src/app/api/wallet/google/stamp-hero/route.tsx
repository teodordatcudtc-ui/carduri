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
        "stamps_required, reward_description, card_name, card_custom_bg_color, card_custom_bg2_color, card_color"
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

  const n = stampsRequired;
  const circleSize = n <= 6 ? 52 : n <= 10 ? 42 : n <= 14 ? 34 : 28;
  const gap = n <= 10 ? 12 : 8;

  const slots = Array.from({ length: n }, (_, i) => i < stampCount);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)`,
          padding: "20px 28px 22px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.96)",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            {cardTitle}
          </span>
          {pass.reward_available ? (
            <span
              style={{
                background: "rgba(255,255,255,0.22)",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: 999,
              }}
            >
              Recompensă gata
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap,
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            flex: 1,
          }}
        >
          {slots.map((filled, i) => (
            <div
              key={i}
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...(filled
                  ? {
                      background: "rgba(255,255,255,0.95)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }
                  : {
                      border: "3px solid rgba(255,255,255,0.42)",
                      background: "rgba(0,0,0,0.12)",
                    }),
              }}
            >
              {filled ? (
                <span style={{ color: c1, fontSize: circleSize * 0.45, fontWeight: 800 }}>✓</span>
              ) : null}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, fontWeight: 600 }}>
            {stampCount} / {stampsRequired} ștampile
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.94)",
              fontSize: 20,
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.25,
            }}
          >
            {rewardDescription}
          </span>
        </div>
      </div>
    ),
    { width: 1032, height: 336 }
  );
}
