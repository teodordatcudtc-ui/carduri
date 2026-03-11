import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CardForm } from "./card-form";

export default async function CardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, slug, brand_color, logo_url")
    .eq("user_id", user.id)
    .single();

  if (!merchant) redirect("/dashboard/onboarding");

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("id, stamps_required, reward_description")
    .eq("merchant_id", merchant.id)
    .single();

  if (!program) redirect("/dashboard/onboarding");

  return (
    <div className="p-6 md:p-10 max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-2">Configurare card</h1>
      <p className="text-stone-400 mb-6">
        Setările se reflectă pe cardurile clienților (Google & Apple Wallet).
      </p>
      <CardForm
        merchantId={merchant.id}
        programId={program.id}
        initial={{
          business_name: merchant.business_name,
          brand_color: merchant.brand_color,
          stamps_required: program.stamps_required,
          reward_description: program.reward_description,
        }}
      />
    </div>
  );
}
