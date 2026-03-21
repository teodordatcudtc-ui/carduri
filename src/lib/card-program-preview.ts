import type { LoyaltyCardDesignProps } from "@/app/components/loyalty-card/LoyaltyCard";

/** Rând din `loyalty_programs` (select *) → props pentru preview pe dashboard. */
export function programRowToLoyaltyPreview(
  program: Record<string, unknown>,
  merchant: { logo_url: string | null }
): LoyaltyCardDesignProps {
  const cardColor = (program.card_color as string) ?? "#ea751a";
  const stamps = Number(program.stamps_required) || 8;
  const filled = Math.min(3, stamps);

  return {
    brand: (program.card_name as string)?.trim() || "Card",
    holder: "Maria Popescu",
    reward: (program.reward_description as string) || "Recompensa ta",
    totalStamps: stamps,
    filledStamps: filled,
    logoUrl: merchant.logo_url,
    accentColor: cardColor,
    template: ((program.card_template as string) ?? "minimal") as LoyaltyCardDesignProps["template"],
    palette: "custom",
    stampShape: ((program.card_stamp_shape as string) ?? "circle") as LoyaltyCardDesignProps["stampShape"],
    stampStyle: ((program.card_stamp_style as string) ?? "solid") as LoyaltyCardDesignProps["stampStyle"],
    customBgColor: (program.card_custom_bg_color as string) ?? cardColor,
    customBg2Color: (program.card_custom_bg2_color as string) ?? cardColor,
    customBg3Color: (program.card_custom_bg3_color as string) ?? undefined,
    layout: program.card_layout === "hero" ? "hero" : "compact",
    noise: !!program.card_noise,
    meshGradient: !!program.card_mesh_gradient,
    footerColor: (program.card_footer_color as string) ?? null,
    badgeColor: (program.card_badge_color as string) ?? null,
    badgeLetter: (program.card_badge_letter as string) ?? null,
    stampVariant: program.card_stamp_variant === "contrast" ? "contrast" : "brand",
    emptyStampIcon: (program.card_stamp_empty_icon as string) ?? "coffee",
    filledStampIcon: (program.card_stamp_filled_icon as string) ?? "check",
    showSubtitle: true,
  };
}
