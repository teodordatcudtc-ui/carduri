import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getAddToGoogleWalletUrl } from "@/lib/wallet/google";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const passId = searchParams.get("pass_id");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const requestOrigin = new URL(request.url).origin;

  if (!passId) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const keyJson = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON;

  if (!issuerId || !keyJson) {
    return NextResponse.redirect(`${baseUrl}/card/${passId}?wallet=google`);
  }

  const supabase = await createServiceClient();
  const { data: pass } = await supabase
    .from("wallet_passes")
    .select(
      "id, barcode_value, stamp_count, reward_available, merchant_id, program_id, customer_id"
    )
    .eq("id", passId)
    .single();

  if (!pass) {
    return NextResponse.redirect(`${baseUrl}/card/${passId}?wallet=google`);
  }

  const [{ data: merchant }, { data: program }, { data: customer }] =
    await Promise.all([
      supabase
        .from("merchants")
        .select("id, business_name, slug, brand_color, logo_url")
        .eq("id", pass.merchant_id)
        .single(),
      supabase
        .from("loyalty_programs")
        .select("stamps_required, reward_description")
        .eq("id", pass.program_id)
        .single(),
      supabase
        .from("customers")
        .select("full_name, phone")
        .eq("id", pass.customer_id)
        .single(),
    ]);

  if (!merchant || !program) {
    return NextResponse.redirect(`${baseUrl}/card/${passId}?wallet=google`);
  }

  const addUrl = getAddToGoogleWalletUrl(
    {
      issuerId,
      classSuffix: merchant.slug || merchant.id.replace(/-/g, "_"),
      objectSuffix: pass.barcode_value,
      businessName: merchant.business_name,
      programName: merchant.business_name,
      logoUrl: merchant.logo_url,
      hexBackgroundColor: merchant.brand_color,
      rewardDescription: program.reward_description,
      stampsRequired: program.stamps_required,
      stampCount: pass.stamp_count,
      rewardAvailable: pass.reward_available,
      accountName: customer?.full_name || "Client",
      accountId: customer?.phone || pass.barcode_value,
    },
    [
      requestOrigin,
      baseUrl,
      baseUrl.replace("http://", "https://"),
      "https://stampio.ro",
    ]
  );

  if (addUrl) {
    return NextResponse.redirect(addUrl);
  }

  return NextResponse.redirect(`${baseUrl}/card/${passId}?wallet=google`);
}
