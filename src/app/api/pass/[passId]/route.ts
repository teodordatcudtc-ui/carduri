import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ passId: string }> }
) {
  const { passId } = await params;
  if (!passId) return NextResponse.json({ error: "pass_id required" }, { status: 400 });

  const supabase = await createClient();
  const { data: pass, error } = await supabase
    .from("wallet_passes")
    .select("id, barcode_value, stamp_count, reward_available, merchant_id, program_id")
    .eq("id", passId)
    .single();

  if (error || !pass) {
    return NextResponse.json({ error: "Card negăsit" }, { status: 404 });
  }

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("stamps_required, reward_description")
    .eq("id", pass.program_id)
    .single();

  const { data: merchant } = await supabase
    .from("merchants")
    .select("business_name, brand_color")
    .eq("id", pass.merchant_id)
    .single();

  return NextResponse.json({
    barcode_value: pass.barcode_value,
    stamp_count: pass.stamp_count,
    reward_available: pass.reward_available,
    stamps_required: program?.stamps_required ?? 0,
    reward_description: program?.reward_description ?? "",
    business_name: merchant?.business_name ?? "",
    brand_color: merchant?.brand_color ?? "#ea751a",
  });
}
