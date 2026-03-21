import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EnrollForm } from "./enroll-form";

export default async function EnrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ program?: string }>;
}) {
  const { slug } = await params;
  const { program: programId } = await searchParams;
  const supabase = await createServiceClient();

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, slug, logo_url")
    .eq("slug", slug)
    .single();

  if (!merchant) notFound();

  const query = supabase
    .from("loyalty_programs")
    .select(
      "id, card_name, card_color, stamps_required, reward_description, card_template, card_palette, card_stamp_shape, card_stamp_style, card_custom_bg_color, card_custom_bg2_color, card_custom_bg3_color, card_layout, card_noise, card_mesh_gradient, card_footer_color, card_badge_color, card_badge_letter, card_stamp_variant, card_stamp_empty_icon, card_stamp_filled_icon"
    )
    .eq("merchant_id", merchant.id);

  const { data: program } = await (programId
    ? query.eq("id", programId).single()
    : query.order("created_at", { ascending: true }).limit(1).single());

  if (!program) notFound();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div
          className="rounded-t-xl border border-b-0 border-[var(--c-border)] px-6 py-4 text-center bg-[var(--c-white)]"
          style={{ borderTopColor: program.card_color }}
        >
          <div className="flex items-center justify-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden border"
              style={{
                borderColor: program.card_color,
                background: "var(--c-sand-dark)",
              }}
            >
              {merchant.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={merchant.logo_url}
                  alt={merchant.business_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {merchant.business_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="type-heading" style={{ fontSize: 18 }}>
              {program.card_name}
            </h1>
          </div>
          <p className="field-hint mt-1" style={{ marginTop: 10 }}>
            {program.stamps_required} ștampile = {program.reward_description}
          </p>
        </div>
        <EnrollForm
          slug={slug}
          programId={program.id}
          cardColor={program.card_color}
          logoUrl={merchant.logo_url}
          cardName={program.card_name ?? "Card fidelitate"}
          stampsRequired={program.stamps_required}
          rewardDescription={program.reward_description}
          template={program.card_template}
          palette={program.card_palette}
          stampShape={program.card_stamp_shape}
          stampStyle={program.card_stamp_style}
          customBgColor={program.card_custom_bg_color}
          customBg2Color={program.card_custom_bg2_color}
          customBg3Color={program.card_custom_bg3_color}
          layout={program.card_layout}
          noise={program.card_noise}
          meshGradient={program.card_mesh_gradient}
          footerColor={program.card_footer_color}
          badgeColor={program.card_badge_color}
          badgeLetter={program.card_badge_letter}
          stampVariant={program.card_stamp_variant}
          emptyStampIcon={program.card_stamp_empty_icon}
          filledStampIcon={program.card_stamp_filled_icon}
        />
      </div>
    </div>
  );
}
