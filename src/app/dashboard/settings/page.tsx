import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CompanyForm } from "./company-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select(
      "id, business_name, logo_url, business_type, address, trial_ends_at, subscription_status, subscription_interval, subscription_current_period_end"
    )
    .eq("user_id", user.id)
    .single();

  if (!merchant) redirect("/dashboard/onboarding");

  const userEmail = user.email ?? "";

  return (
    <div className="dash-settings-wrap w-full">
      <CompanyForm
        merchantId={merchant.id}
        userEmail={userEmail}
        initial={{
          business_name: merchant.business_name,
          logo_url: merchant.logo_url,
          business_type: merchant.business_type ?? null,
          address: merchant.address ?? null,
        }}
        subscription={{
          trial_ends_at: merchant.trial_ends_at ?? "",
          subscription_status: merchant.subscription_status ?? "none",
          subscription_interval: merchant.subscription_interval ?? null,
          subscription_current_period_end: merchant.subscription_current_period_end ?? null,
        }}
      />
    </div>
  );
}
