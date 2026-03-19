import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScanPageClient } from "./scan-page-client";

export default async function ScanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!merchant) redirect("/dashboard/onboarding");

  const { data: programs } = await supabase
    .from("loyalty_programs")
    .select("id, card_name, stamps_required, reward_description")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: true });

  return <ScanPageClient programs={programs ?? []} />;
}
