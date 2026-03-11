import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EnrollForm } from "./enroll-form";

export default async function EnrollPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServiceClient();

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, slug, brand_color")
    .eq("slug", slug)
    .single();

  if (!merchant) notFound();

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("stamps_required, reward_description")
    .eq("merchant_id", merchant.id)
    .single();

  if (!program) notFound();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div
          className="rounded-t-xl border border-b-0 border-stone-700/50 px-6 py-4 text-center"
          style={{ borderTopColor: merchant.brand_color }}
        >
          <h1 className="text-xl font-bold text-white">{merchant.business_name}</h1>
          <p className="text-stone-400 text-sm mt-1">
            {program.stamps_required} ștampile = {program.reward_description}
          </p>
        </div>
        <EnrollForm
          slug={slug}
          businessName={merchant.business_name}
          brandColor={merchant.brand_color}
        />
      </div>
    </div>
  );
}
