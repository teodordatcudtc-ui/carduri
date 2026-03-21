import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type Body = {
  card_name?: string;
  card_color?: string;
  stamps_required?: number;
  reward_description?: string;
  card_template?: string | null;
  card_palette?: string | null;
  card_stamp_shape?: string | null;
  card_stamp_style?: string | null;
  card_custom_bg_color?: string | null;
  card_custom_bg2_color?: string | null;
  card_custom_bg3_color?: string | null;
  card_layout?: string | null;
  card_noise?: boolean | null;
  card_mesh_gradient?: boolean | null;
  card_footer_color?: string | null;
  card_badge_color?: string | null;
  card_badge_letter?: string | null;
  card_stamp_variant?: string | null;
  card_stamp_empty_icon?: string | null;
  card_stamp_filled_icon?: string | null;
};

function buildPayloads(body: Body) {
  const primary = body.card_color ?? "#ea751a";
  const secondary = body.card_custom_bg2_color ?? primary;
  const tertiary = body.card_custom_bg3_color ?? secondary;
  const updated_at = new Date().toISOString();

  const minimal = {
    card_name: (body.card_name ?? "").trim(),
    card_color: primary,
    stamps_required: body.stamps_required ?? 8,
    reward_description: (body.reward_description ?? "").trim(),
    updated_at,
  };

  const design006 = {
    ...minimal,
    card_template: body.card_template ?? "minimal",
    card_palette: body.card_palette ?? "custom",
    card_stamp_shape: body.card_stamp_shape ?? "circle",
    card_stamp_style: body.card_stamp_style ?? "solid",
    card_custom_bg_color: primary,
    card_custom_bg2_color: secondary,
  };

  const withBg3 = {
    ...design006,
    card_custom_bg3_color: tertiary,
  };

  const full = {
    ...withBg3,
    card_layout: body.card_layout ?? "compact",
    card_noise: !!body.card_noise,
    card_mesh_gradient: !!body.card_mesh_gradient,
    card_footer_color: body.card_footer_color?.trim() || null,
    card_badge_color: body.card_badge_color?.trim() || null,
    card_badge_letter: body.card_badge_letter?.trim().slice(0, 1) || null,
    card_stamp_variant: body.card_stamp_variant ?? "brand",
    card_stamp_empty_icon: body.card_stamp_empty_icon ?? "coffee",
    card_stamp_filled_icon: body.card_stamp_filled_icon ?? "check",
  };

  /** Ordine: cel mai complet → minim (dacă lipsesc coloane din migrări). */
  return [
    { label: "full" as const, payload: full },
    { label: "with_bg3" as const, payload: withBg3 },
    { label: "design006" as const, payload: design006 },
    { label: "minimal" as const, payload: minimal },
  ];
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: program, error: progErr } = await supabase
    .from("loyalty_programs")
    .select("id, merchant_id")
    .eq("id", programId)
    .single();

  if (progErr || !program) {
    return NextResponse.json({ error: "program_not_found" }, { status: 404 });
  }

  const { data: owned } = await supabase
    .from("merchants")
    .select("id")
    .eq("id", program.merchant_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!owned) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const tiers = buildPayloads(body);
  let lastMessage = "";

  for (const { label, payload } of tiers) {
    const { error } = await supabase.from("loyalty_programs").update(payload).eq("id", programId);
    if (!error) {
      return NextResponse.json({
        ok: true,
        savedLevel: label,
      });
    }
    lastMessage = error.message || JSON.stringify(error);
  }

  return NextResponse.json(
    {
      error: "update_failed",
      message: lastMessage,
      hint: "Rulează migrările SQL din supabase/migrations (006–008) pentru loyalty_programs.",
    },
    { status: 400 }
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: program, error: progErr } = await supabase
    .from("loyalty_programs")
    .select("id, merchant_id")
    .eq("id", programId)
    .single();

  if (progErr || !program) {
    return NextResponse.json({ error: "program_not_found" }, { status: 404 });
  }

  const { data: owned } = await supabase
    .from("merchants")
    .select("id")
    .eq("id", program.merchant_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!owned) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { error: delErr } = await supabase.from("loyalty_programs").delete().eq("id", programId);

  if (delErr) {
    return NextResponse.json(
      { error: "delete_failed", message: delErr.message },
      { status: 500 }
    );
  }

  revalidatePath("/dashboard/card");
  return NextResponse.json({ ok: true });
}
