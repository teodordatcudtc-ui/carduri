import { createClient } from "@/lib/supabase/server";
import { updateGoogleWalletPass } from "@/lib/wallet/google";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barcode, action, program_id } = body as {
      barcode?: string;
      action?: "stamp" | "redeem";
      program_id?: string;
    };
    if (!barcode || typeof barcode !== "string" || !action || !["stamp", "redeem"].includes(action)) {
      return NextResponse.json(
        { error: "Lipsește barcode sau action (stamp/redeem)." },
        { status: 400 }
      );
    }
    const rawCode = barcode.trim();
    const passIdFromQr = rawCode.startsWith("STAMPIO:PASS:")
      ? rawCode.replace("STAMPIO:PASS:", "").trim()
      : null;

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

    const passQuery = supabase
      .from("wallet_passes")
      .select("id, barcode_value, stamp_count, reward_available, program_id")
      .eq("merchant_id", merchant.id);
    const { data: pass } = await (passIdFromQr
      ? passQuery.eq("id", passIdFromQr).single()
      : passQuery.eq("barcode_value", rawCode).single());

    if (!pass) {
      return NextResponse.json(
        { error: "Card negăsit sau nu aparține acestei locații." },
        { status: 404 }
      );
    }

    if (program_id && pass.program_id !== program_id) {
      return NextResponse.json(
        { error: "Cardul scanat aparține altui program/recompensă." },
        { status: 400 }
      );
    }

    if (action === "stamp") {
      const { data: program } = await supabase
        .from("loyalty_programs")
        .select("stamps_required, reward_description")
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

      await updateGoogleWalletPass(pass.barcode_value, {
        stampCount: newCount,
        stampsRequired: program?.stamps_required ?? 8,
        rewardAvailable: rewardAvailable,
        rewardDescription: program?.reward_description ?? "",
      }).catch(() => {});

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

      const { data: programRedeem } = await supabase
        .from("loyalty_programs")
        .select("stamps_required, reward_description")
        .eq("id", pass.program_id)
        .single();

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

      await updateGoogleWalletPass(pass.barcode_value, {
        stampCount: 0,
        stampsRequired: programRedeem?.stamps_required ?? 8,
        rewardAvailable: false,
        rewardDescription: programRedeem?.reward_description ?? "",
      }).catch(() => {});

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
