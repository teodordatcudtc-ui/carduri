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
    .select("id, card_name, card_color, stamps_required, reward_description")
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
        />
      </div>
    </div>
  );
}
