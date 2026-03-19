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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card card-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Setări companie</h1>
          <p className="text-[var(--c-ink-60)] mb-6">
            Numele și logo-ul sunt folosite pe toate cardurile tale.
          </p>
        </div>
      <CompanyForm
        merchantId={merchant.id}
        initial={{
          business_name: merchant.business_name,
          logo_url: merchant.logo_url,
          business_type: merchant.business_type ?? null,
          address: merchant.address ?? null,
        }}
      />
      </div>
    </div>
  );
}

