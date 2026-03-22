import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import {
  generateStampImagePng,
  mapDbIconToWalletStampIcon,
} from "@/lib/wallet/generate-stamp-image";
import { uploadWalletHeroPng } from "@/lib/wallet/upload-wallet-hero";
import {
  type UpdateGoogleWalletPassParams,
  updateGoogleWalletPass,
} from "@/lib/wallet/google";

type PassRow = {
  id: string;
  barcode_value: string;
  merchant_id: string;
  program_id: string;
  merchants: { business_name: string; brand_color: string | null } | null;
  loyalty_programs: {
    stamps_required: number;
    reward_description: string;
    card_name: string | null;
    card_custom_bg_color: string | null;
    card_color: string | null;
    card_stamp_empty_icon: string | null;
  } | null;
};

/**
 * Generează PNG (sharp), încarcă în Supabase Storage, PATCH Google Wallet cu URL public.
 * La eroare (bucket lipsă, sharp etc.) face fallback la updateGoogleWalletPass fără override.
 */
export async function syncGoogleWalletHeroWithSupabase(
  passId: string,
  objectSuffix: string,
  updates: Omit<UpdateGoogleWalletPassParams, "heroImageUriOverride">
): Promise<boolean> {
  let heroOverride: string | undefined;

  try {
    const supabase = createServiceRoleSupabase();
    const { data: row, error } = await supabase
      .from("wallet_passes")
      .select(
        `
        id,
        barcode_value,
        merchant_id,
        program_id,
        merchants ( business_name, brand_color ),
        loyalty_programs (
          stamps_required,
          reward_description,
          card_name,
          card_custom_bg_color,
          card_color,
          card_stamp_empty_icon
        )
      `
      )
      .eq("id", passId)
      .single();

    if (error || !row) {
      return updateGoogleWalletPass(passId, objectSuffix, updates);
    }

    const pass = row as unknown as PassRow;
    const merchant = Array.isArray(pass.merchants)
      ? pass.merchants[0]
      : pass.merchants;
    const program = Array.isArray(pass.loyalty_programs)
      ? pass.loyalty_programs[0]
      : pass.loyalty_programs;
    if (!merchant || !program) {
      return updateGoogleWalletPass(passId, objectSuffix, updates);
    }

    const stampsTotal = Math.max(1, Math.min(24, program.stamps_required ?? 8));
    const primary =
      program.card_custom_bg_color?.trim() ||
      program.card_color?.trim() ||
      merchant.brand_color?.trim() ||
      "#ea751a";

    const png = await generateStampImagePng({
      businessName: merchant.business_name,
      cardTitle: program.card_name ?? undefined,
      stampsCurrent: updates.stampCount,
      stampsTotal: stampsTotal,
      rewardText: program.reward_description ?? "",
      primaryColor: primary,
      stampIcon: mapDbIconToWalletStampIcon(program.card_stamp_empty_icon),
    });

    const publicUrl = await uploadWalletHeroPng(
      supabase,
      pass.merchant_id,
      passId,
      png
    );
    heroOverride = `${publicUrl}?v=${Date.now()}`;
  } catch {
    heroOverride = undefined;
  }

  return updateGoogleWalletPass(passId, objectSuffix, {
    ...updates,
    heroImageUriOverride: heroOverride,
  });
}
