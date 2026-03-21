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
    .select("id, business_name, logo_url, business_type, address")
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
      />
    </div>
  );
}
