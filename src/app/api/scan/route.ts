import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barcode, action } = body as { barcode?: string; action?: "stamp" | "redeem" };
    if (!barcode || typeof barcode !== "string" || !action || !["stamp", "redeem"].includes(action)) {
      return NextResponse.json(
        { error: "Lipsește barcode sau action (stamp/redeem)." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
    }

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!merchant) {
      return NextResponse.json({ error: "Comerciant negăsit." }, { status: 403 });
    }

    const { data: pass } = await supabase
      .from("wallet_passes")
      .select("id, stamp_count, reward_available, program_id")
      .eq("barcode_value", barcode.trim())
      .eq("merchant_id", merchant.id)
      .single();

    if (!pass) {
      return NextResponse.json(
        { error: "Card negăsit sau nu aparține acestei locații." },
        { status: 404 }
      );
    }

    if (action === "stamp") {
      const { data: program } = await supabase
        .from("loyalty_programs")
        .select("stamps_required")
        .eq("id", pass.program_id)
        .single();

      const newCount = pass.stamp_count + 1;
      const rewardAvailable = program ? newCount >= program.stamps_required : false;

      const { error: updateError } = await supabase
        .from("wallet_passes")
        .update({
          stamp_count: newCount,
          reward_available: rewardAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pass.id);

      if (updateError) throw updateError;

      await supabase.from("stamp_events").insert({ pass_id: pass.id });

      // TODO: call Google/Apple Wallet API to update pass visually
      return NextResponse.json({
        message: `Ștampilă adăugată. (${newCount}${program ? `/${program.stamps_required}` : ""})${rewardAvailable ? " — Recompensă câștigată!" : ""}`,
      });
    }

    if (action === "redeem") {
      if (!pass.reward_available) {
        return NextResponse.json(
          { error: "Cardul nu are recompensă disponibilă." },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from("wallet_passes")
        .update({
          stamp_count: 0,
          reward_available: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pass.id);

      if (updateError) throw updateError;

      await supabase.from("redemptions").insert({ pass_id: pass.id });

      // TODO: update Google/Apple pass to reset
      return NextResponse.json({
        message: "Recompensă acordată. Card resetat.",
      });
    }

    return NextResponse.json({ error: "Action invalid." }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare server." },
      { status: 500 }
    );
  }
}
