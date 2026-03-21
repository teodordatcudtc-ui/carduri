import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name")
    .eq("user_id", user.id)
    .single();
  if (!merchant) {
    return NextResponse.json({ error: "merchant_not_found" }, { status: 404 });
  }

  const defaultPrimary = "#ea751a";
  const defaultSecondary = "#c84b2f";
  const defaultTertiary = "#3d2a5c";

  const { data: created, error } = await supabase
    .from("loyalty_programs")
    .insert({
      merchant_id: merchant.id,
      stamps_required: 8,
      reward_description: "Recompensă gratuită",
      card_name: "Card fidelitate",
      card_color: defaultPrimary,
      card_custom_bg_color: defaultPrimary,
      card_custom_bg2_color: defaultSecondary,
      card_custom_bg3_color: defaultTertiary,
      card_palette: "custom",
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("loyalty_programs_merchant_id_key")) {
      return NextResponse.json({ error: "multi_program_migration" }, { status: 409 });
    }
    return NextResponse.json({ error: "insert_failed", message: error.message }, { status: 500 });
  }

  revalidatePath("/dashboard/card");

  const origin = new URL(request.url).origin;
  return NextResponse.json({
    ok: true,
    programId: created.id,
    redirectTo: `${origin}/dashboard/card?program=${created.id}`,
  });
}
