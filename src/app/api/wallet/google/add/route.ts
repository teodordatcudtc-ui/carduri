import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  getAddToGoogleWalletUrl,
  getWalletPayloadForDebug,
} from "@/lib/wallet/google";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const passId = searchParams.get("pass_id");
  const debug = searchParams.get("debug") === "1";
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
        .select(
          "stamps_required, reward_description, card_name, card_custom_bg_color"
        )
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

  const primaryHex =
    program.card_custom_bg_color?.trim() || merchant.brand_color || "#ea751a";
  const programTitle =
    program.card_name?.trim() || merchant.business_name;
  const classSuffix = `${merchant.slug || merchant.id.replace(/-/g, "_")}_${pass.program_id.replace(/-/g, "")}`;

  // URL publică HTTPS pentru JWT (imagini + linkuri). Pe localhost fără asta, Google refuză save-ul.
  const appBase =
    process.env.NEXT_PUBLIC_WALLET_PUBLIC_URL?.replace(/\/$/, "") ||
    baseUrl.replace(/\/$/, "");
  const walletData = {
    issuerId,
    /** O clasă Wallet per program → culoarea = cea a cardului din web (card_custom_bg_color). */
    classSuffix,
    objectSuffix: pass.barcode_value,
    businessName: merchant.business_name,
    programName: programTitle,
    logoUrl: merchant.logo_url,
    hexBackgroundColor: primaryHex,
    rewardDescription: program.reward_description,
    stampsRequired: program.stamps_required,
    stampCount: pass.stamp_count,
    rewardAvailable: pass.reward_available,
    accountName: customer?.full_name || "Client",
    accountId: customer?.phone || pass.barcode_value,
    passPublicUrl: `${appBase}/card/${passId}`,
    passId,
    appBaseUrl: appBase,
  };
  const origins = [
    requestOrigin,
    baseUrl,
    baseUrl.replace("http://", "https://"),
    "https://stampio.ro",
  ].filter((o) => o && (o.startsWith("http://") || o.startsWith("https://")));

  const addUrl = getAddToGoogleWalletUrl(walletData, origins);

  if (debug) {
    const payloadForDebug = getWalletPayloadForDebug(walletData, origins);
    return NextResponse.json({
      message:
        "Open saveUrl in a new tab with DevTools → Network open to see Google's error response.",
      saveUrl: addUrl || null,
      payloadForInspection: payloadForDebug,
      issuerIdUsed: issuerId,
    });
  }

  if (addUrl) {
    return NextResponse.redirect(addUrl);
  }

  return NextResponse.redirect(`${baseUrl}/card/${passId}?wallet=google`);
}
