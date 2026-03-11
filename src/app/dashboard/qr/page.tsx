import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QrEnrollBlock } from "./qr-enroll-block";
import { headers } from "next/headers";

export default async function QrPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, slug")
    .eq("user_id", user.id)
    .single();

  if (!merchant) redirect("/dashboard/onboarding");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const inferredBaseUrl = host ? `${proto}://${host}` : null;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || inferredBaseUrl || "http://localhost:3000";
  const enrollUrl = `${baseUrl}/enroll/${merchant.slug}`;

  return (
    <div className="p-6 md:p-10 max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-2">QR înrolare</h1>
      <p className="text-stone-400 mb-6">
        Afișează acest QR la casă sau trimite linkul. Clienții scanează, completează
        datele și adaugă cardul în Wallet.
      </p>
      <QrEnrollBlock enrollUrl={enrollUrl} businessName={merchant.business_name} />
    </div>
  );
}
