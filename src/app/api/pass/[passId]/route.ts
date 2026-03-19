import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ passId: string }> }
) {
  const { passId } = await params;
  if (!passId) return NextResponse.json({ error: "pass_id required" }, { status: 400 });

  const supabase = await createServiceClient();
  const { data: pass, error } = await supabase
    .from("wallet_passes")
    .select(
      "id, barcode_value, stamp_count, reward_available, merchant_id, program_id, customers(full_name)"
    )
    .eq("id", passId)
    .single();

  if (error || !pass) {
    return NextResponse.json({ error: "Card negăsit" }, { status: 404 });
  }

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select(
      "card_name, card_color, stamps_required, reward_description, card_template, card_palette, card_stamp_shape, card_stamp_style, card_custom_bg_color, card_custom_bg2_color"
    )
    .eq("id", pass.program_id)
    .single();

  const { data: merchant } = await supabase
    .from("merchants")
    .select("business_name, brand_color, logo_url")
    .eq("id", pass.merchant_id)
    .single();

  return NextResponse.json({
    barcode_value: pass.barcode_value,
    stamp_count: pass.stamp_count,
    reward_available: pass.reward_available,
    stamps_required: program?.stamps_required ?? 0,
    reward_description: program?.reward_description ?? "",
    business_name: program?.card_name ?? merchant?.business_name ?? "",
    brand_color: program?.card_color ?? merchant?.brand_color ?? "#ea751a",
    logo_url: merchant?.logo_url ?? null,
    customer_name: pass.customers?.[0]?.full_name ?? "",
    card_template: program?.card_template ?? null,
    card_palette: program?.card_palette ?? null,
    card_stamp_shape: program?.card_stamp_shape ?? null,
    card_stamp_style: program?.card_stamp_style ?? null,
    card_custom_bg_color: program?.card_custom_bg_color ?? null,
    card_custom_bg2_color: program?.card_custom_bg2_color ?? null,
  });
}
