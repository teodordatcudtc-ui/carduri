import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", "http://localhost"));

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, brand_color")
    .eq("user_id", user.id)
    .single();
  if (!merchant) {
    return NextResponse.json({ error: "Merchant negăsit." }, { status: 404 });
  }

  const { data: created, error } = await supabase
    .from("loyalty_programs")
    .insert({
      merchant_id: merchant.id,
      stamps_required: 8,
      reward_description: "Recompensă gratuită",
      card_name: "Card fidelitate",
      card_color: merchant.brand_color ?? "#ea751a",
    })
    .select("id")
    .single();

  if (error) {
    const appUrl = new URL(request.url).origin;
    if (error.message.includes("loyalty_programs_merchant_id_key")) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/card?error=multi_program_migration`,
        { status: 303 }
      );
    }
    return NextResponse.redirect(
      `${appUrl}/dashboard/card?error=program_create_failed`,
      { status: 303 }
    );
  }

  const appUrl = new URL(request.url).origin;
  return NextResponse.redirect(
    `${appUrl}/dashboard/card?program=${created.id}`,
    { status: 303 }
  );
}

