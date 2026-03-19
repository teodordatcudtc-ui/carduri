import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CardForm } from "./card-form";

export default async function CardPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string; error?: string }>;
}) {
  const { program: programId, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, slug, logo_url")
    .eq("user_id", user.id)
    .single();

  if (!merchant) redirect("/dashboard/onboarding");

  const { data: programs } = await supabase
    .from("loyalty_programs")
    .select(
      "id, card_name, card_color, stamps_required, reward_description, card_template, card_palette, card_stamp_shape, card_stamp_style, card_custom_bg_color, card_custom_bg2_color"
    )
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: true });

  if (!programs || programs.length === 0) redirect("/dashboard/onboarding");
  const selectedProgram =
    programs.find((p) => p.id === programId) ?? programs[0];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card card-sm">
        <h1 className="text-2xl font-bold mb-2">Configurare card</h1>
        <p className="text-[var(--c-ink-60)] mb-6">
          Setările se reflectă pe cardurile clienților (web card).
        </p>
      {error === "multi_program_migration" && (
        <div
          className="mb-4 rounded-lg text-sm p-3"
          style={{
            background: "rgba(224,150,0,0.10)",
            color: "var(--c-amber)",
            border: "1px solid rgba(224,150,0,0.25)",
          }}
        >
          Nu poți crea încă mai multe carduri deoarece schema DB este pe varianta veche.
          Rulează migration-ul <code className="font-mono">004_multi_programs.sql</code>.
        </div>
      )}
      {error === "program_create_failed" && (
        <div
          className="mb-4 rounded-lg text-sm p-3"
          style={{
            background: "rgba(200,75,47,0.08)",
            color: "var(--c-accent)",
            border: "1px solid rgba(200,75,47,0.25)",
          }}
        >
          Nu am putut crea cardul nou. Verifică log-urile serverului și încearcă din nou.
        </div>
      )}
      <div className="mb-4 rounded-xl border border-[var(--c-border)] p-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          {programs.map((p, idx) => (
            <Link
              key={p.id}
              href={`/dashboard/card?program=${p.id}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                p.id === selectedProgram.id ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-sand)] hover:bg-[var(--c-sand-dark)]"
              }`}
            >
              {p.card_name ?? `Card ${idx + 1}`}
            </Link>
          ))}
        </div>
        <form action="/api/dashboard/programs" method="post">
          <button
            type="submit"
            className="text-sm text-[var(--c-accent)] hover:text-[var(--c-accent)] underline underline-offset-4"
          >
            Creează card nou (recompensă nouă)
          </button>
        </form>
      </div>
      <CardForm
        key={selectedProgram.id}
        merchantId={merchant.id}
        programId={selectedProgram.id}
        merchant={{ business_name: merchant.business_name, logo_url: merchant.logo_url }}
        initial={{
          card_name: selectedProgram.card_name ?? "Card fidelitate",
          card_color: selectedProgram.card_color ?? "#ea751a",
          stamps_required: selectedProgram.stamps_required,
          reward_description: selectedProgram.reward_description,
          card_template: selectedProgram.card_template ?? "minimal",
          card_palette: selectedProgram.card_palette ?? "ink",
          card_stamp_shape: selectedProgram.card_stamp_shape ?? "circle",
          card_stamp_style: selectedProgram.card_stamp_style ?? "solid",
          card_custom_bg_color: selectedProgram.card_custom_bg_color ?? null,
          card_custom_bg2_color: selectedProgram.card_custom_bg2_color ?? null,
        }}
      />
      </div>
    </div>
  );
}
