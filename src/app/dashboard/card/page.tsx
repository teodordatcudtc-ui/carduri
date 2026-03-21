import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CreditCard } from "lucide-react";
import { CardForm } from "./card-form";
import { CardStaleRefresh } from "./card-stale-refresh";
import { CreateCardButton } from "./create-card-button";
import { CardShowcase } from "./card-showcase";

export const dynamic = "force-dynamic";

export default async function CardPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string; error?: string }>;
}) {
  noStore();
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

  const { data: programs, error: programsError } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: true });

  const hasPrograms = programs && programs.length > 0;

  if (!hasPrograms) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Suspense fallback={null}>
          <CardStaleRefresh />
        </Suspense>
        {programsError && (
          <div
            className="mb-6 rounded-lg text-sm p-3"
            style={{
              background: "rgba(200,75,47,0.08)",
              color: "var(--c-accent)",
              border: "1px solid rgba(200,75,47,0.25)",
            }}
          >
            Nu am putut încărca cardurile: {programsError.message}. Verifică migrările SQL în Supabase.
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Configurare card</h1>
          <p className="text-[var(--c-ink-60)] max-w-2xl">
            Aici personalizezi doar cardul digital (culori, ștampile, layout) — nu datele afacerii. Datele companiei sunt
            în Setări.
          </p>
        </div>

        {error === "multi_program_migration" && (
          <div
            className="mb-6 rounded-lg text-sm p-3"
            style={{
              background: "rgba(224,150,0,0.10)",
              color: "var(--c-amber)",
              border: "1px solid rgba(224,150,0,0.25)",
            }}
          >
            Nu poți crea încă carduri deoarece schema DB este pe varianta veche. Rulează migration-ul{" "}
            <code className="font-mono">004_multi_programs.sql</code>.
          </div>
        )}
        {error === "program_create_failed" && (
          <div
            className="mb-6 rounded-lg text-sm p-3"
            style={{
              background: "rgba(200,75,47,0.08)",
              color: "var(--c-accent)",
              border: "1px solid rgba(200,75,47,0.25)",
            }}
          >
            Nu am putut crea cardul. Verifică log-urile serverului și încearcă din nou.
          </div>
        )}

        <div
          className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-white)] p-10 md:p-14 text-center"
          style={{ boxShadow: "0 1px 3px rgba(17,17,16,0.06)" }}
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
            style={{ background: "var(--c-sand)", color: "var(--c-accent)" }}
          >
            <CreditCard className="w-8 h-8" aria-hidden />
          </div>
          <h2 className="text-xl font-semibold text-[var(--c-black)] mb-2">Încă nu ai niciun card</h2>
          <p className="text-[var(--c-ink-60)] max-w-md mx-auto mb-8 leading-relaxed">
            Creează primul card de fidelitate; apoi vei putea seta culorile, ștampile și previzualizarea. Nu te trimitem
            la onboarding — asta e pagina potrivită pentru asta.
          </p>
          <CreateCardButton variant="primary">Creează un card</CreateCardButton>
          <p className="mt-8 text-sm text-[var(--c-muted)]">
            <Link href="/dashboard" className="text-[var(--c-accent)] underline underline-offset-4">
              Înapoi la dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const programRows = programs as Record<string, unknown>[];

  const { data: passRows } = await supabase
    .from("wallet_passes")
    .select("program_id")
    .eq("merchant_id", merchant.id);

  const passCountByProgram: Record<string, number> = {};
  for (const row of passRows ?? []) {
    const pid = String((row as { program_id: string }).program_id);
    passCountByProgram[pid] = (passCountByProgram[pid] ?? 0) + 1;
  }

  /* Showcase: listă vizuală de carduri; fără ?program= */
  if (!programId) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Cardurile tale</h1>
            <p className="text-[var(--c-ink-60)] max-w-2xl">
              Alege un card ca să îl editezi. Fiecare card este un program de recompense (design separat).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <CreateCardButton variant="outline">+ Card nou</CreateCardButton>
            <Link
              href="/dashboard"
              className="text-sm text-[var(--c-accent)] underline underline-offset-4"
            >
              Înapoi la dashboard
            </Link>
          </div>
        </div>

        {error === "multi_program_migration" && (
          <div
            className="mb-6 rounded-lg text-sm p-3"
            style={{
              background: "rgba(224,150,0,0.10)",
              color: "var(--c-amber)",
              border: "1px solid rgba(224,150,0,0.25)",
            }}
          >
            Nu poți crea încă mai multe carduri deoarece schema DB este pe varianta veche. Rulează migration-ul{" "}
            <code className="font-mono">004_multi_programs.sql</code>.
          </div>
        )}
        {error === "program_create_failed" && (
          <div
            className="mb-6 rounded-lg text-sm p-3"
            style={{
              background: "rgba(200,75,47,0.08)",
              color: "var(--c-accent)",
              border: "1px solid rgba(200,75,47,0.25)",
            }}
          >
            Nu am putut crea cardul nou. Verifică log-urile serverului și încearcă din nou.
          </div>
        )}

        <CardShowcase
          programs={programRows}
          merchant={merchant}
          passCountByProgram={passCountByProgram}
        />
      </div>
    );
  }

  const selectedProgram = programRows.find((p) => String(p.id) === programId);
  if (!selectedProgram) {
    redirect("/dashboard/card");
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col xl:min-h-0 xl:h-[calc(100dvh-3rem)]">
      <div className="shrink-0 mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/card"
          className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-white)] hover:bg-[var(--c-sand)] transition-colors"
        >
          ← Înapoi la carduri
        </Link>
        <CreateCardButton variant="outline">+ Card nou</CreateCardButton>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--c-accent)] underline underline-offset-4"
        >
          Dashboard
        </Link>
      </div>

      <div className="shrink-0 mb-8">
        <h1 className="text-2xl font-bold mb-2">Editează cardul</h1>
        <p className="text-[var(--c-ink-60)] max-w-2xl">
          Personalizează aspectul cardului digital pe care îl văd clienții după înrolare.
        </p>
      </div>

      {error === "multi_program_migration" && (
        <div
          className="shrink-0 mb-6 rounded-lg text-sm p-3"
          style={{
            background: "rgba(224,150,0,0.10)",
            color: "var(--c-amber)",
            border: "1px solid rgba(224,150,0,0.25)",
          }}
        >
          Nu poți crea încă mai multe carduri deoarece schema DB este pe varianta veche. Rulează migration-ul{" "}
          <code className="font-mono">004_multi_programs.sql</code>.
        </div>
      )}
      {error === "program_create_failed" && (
        <div
          className="shrink-0 mb-6 rounded-lg text-sm p-3"
          style={{
            background: "rgba(200,75,47,0.08)",
            color: "var(--c-accent)",
            border: "1px solid rgba(200,75,47,0.25)",
          }}
        >
          Nu am putut crea cardul nou. Verifică log-urile serverului și încearcă din nou.
        </div>
      )}

      <div className="min-h-0 flex-1 flex flex-col xl:overflow-hidden">
        <CardForm
        key={String(selectedProgram.id)}
        merchant={{ business_name: merchant.business_name, logo_url: merchant.logo_url }}
        programId={String(selectedProgram.id)}
        initial={{
          card_name: (selectedProgram.card_name as string) ?? "Card fidelitate",
          card_color: (selectedProgram.card_color as string) ?? "#ea751a",
          stamps_required: Number(selectedProgram.stamps_required) || 8,
          reward_description: (selectedProgram.reward_description as string) ?? "",
          card_template: (selectedProgram.card_template as string) ?? "minimal",
          card_palette: (selectedProgram.card_palette as string) ?? "ink",
          card_stamp_shape: (selectedProgram.card_stamp_shape as string) ?? "circle",
          card_stamp_style: (selectedProgram.card_stamp_style as string) ?? "solid",
          card_custom_bg_color: (selectedProgram.card_custom_bg_color as string) ?? null,
          card_custom_bg2_color: (selectedProgram.card_custom_bg2_color as string) ?? null,
          card_custom_bg3_color: (selectedProgram.card_custom_bg3_color as string) ?? null,
          card_layout: (selectedProgram.card_layout as string) ?? "compact",
          card_noise: Boolean(selectedProgram.card_noise),
          card_mesh_gradient: Boolean(selectedProgram.card_mesh_gradient),
          card_footer_color: (selectedProgram.card_footer_color as string) ?? null,
          card_badge_color: (selectedProgram.card_badge_color as string) ?? null,
          card_badge_letter: (selectedProgram.card_badge_letter as string) ?? null,
          card_stamp_variant: (selectedProgram.card_stamp_variant as string) ?? "brand",
          card_stamp_empty_icon: (selectedProgram.card_stamp_empty_icon as string) ?? "coffee",
          card_stamp_filled_icon: (selectedProgram.card_stamp_filled_icon as string) ?? "check",
        }}
        />
      </div>
    </div>
  );
}
