import { createClient } from "@/lib/supabase/server";
import {
  canAccessDashboard,
  isPaidSubscriptionStatus,
  trialDaysLeft,
  type MerchantSubscriptionFields,
} from "@/lib/subscription";
import { stripeConfigured } from "@/lib/stripe-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BillingActions } from "./billing-actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const sp = await searchParams;
  const checkoutFlash = sp.checkout;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select(
      "id, business_name, trial_ends_at, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_interval, subscription_current_period_end"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant) redirect("/dashboard/onboarding");

  const m = merchant as MerchantSubscriptionFields;
  const access = canAccessDashboard(m);
  const subscriptionActive = isPaidSubscriptionStatus(m.subscription_status);
  const days = trialDaysLeft(m);
  const hasStripe = stripeConfigured();
  const periodEnd = m.subscription_current_period_end
    ? new Date(m.subscription_current_period_end).toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="type-display-md mb-2">Abonament</h1>
      <p className="mb-6 text-sm text-[var(--c-ink-60)]">
        Planurile Pro includ trial de 30 zile la început; după aceea este necesar un abonament activ.
      </p>

      {checkoutFlash === "success" && (
        <div
          className="mb-6 rounded-[10px] border px-4 py-3 text-sm"
          style={{
            background: "rgba(77,124,106,0.1)",
            borderColor: "rgba(77,124,106,0.35)",
            color: "var(--c-ink)",
          }}
        >
          Plata a fost inițiată. Dacă ai finalizat checkout-ul, statusul se actualizează în câteva
          secunde (confirmare de la Stripe).
        </div>
      )}
      {checkoutFlash === "cancel" && (
        <div
          className="mb-6 rounded-[10px] border px-4 py-3 text-sm"
          style={{
            background: "rgba(17,17,16,0.04)",
            borderColor: "var(--c-border)",
          }}
        >
          Ai anulat checkout-ul. Poți relua oricând de mai jos.
        </div>
      )}

      <div className="dash-box mb-6">
        <div className="dash-box-head">
          <div className="dash-box-title">Status cont</div>
        </div>
        <div className="dash-box-body space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-[var(--c-ink-60)]">Afacere</span>
            <span className="font-semibold">{merchant.business_name}</span>
          </div>
          {subscriptionActive ? (
            <>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-[var(--c-ink-60)]">Abonament</span>
                <span className="font-semibold">
                  Pro · {m.subscription_interval === "year" ? "Anual" : "Lunar"}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-[var(--c-ink-60)]">Status Stripe</span>
                <span className="font-semibold capitalize">{m.subscription_status}</span>
              </div>
              {periodEnd && (
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[var(--c-ink-60)]">Perioadă curentă până la</span>
                  <span>{periodEnd}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-[var(--c-ink-60)]">Trial</span>
                <span className="font-semibold">
                  {days === null
                    ? "—"
                    : days > 0
                      ? `${days} zile rămase`
                      : "Expirat"}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-[var(--c-ink-60)]">Acces dashboard</span>
                <span className="font-semibold">{access ? "Activ" : "Blocat — alege un plan"}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="dash-box mb-6">
        <div className="dash-box-head">
          <div className="dash-box-title">Plată & facturi</div>
        </div>
        <div className="dash-box-body">
          <BillingActions
            hasStripe={hasStripe}
            hasCustomer={Boolean(m.stripe_customer_id)}
            allowSubscribe={!subscriptionActive}
          />
          <p className="mt-4 text-xs text-[var(--c-ink-60)]">
            După configurarea Stripe în Dashboard, setează webhook la{" "}
            <code className="rounded bg-[var(--c-surface-2)] px-1 py-0.5 text-[11px]">
              /api/webhooks/stripe
            </code>{" "}
            și evenimentele: checkout.session.completed, customer.subscription.* .
          </p>
        </div>
      </div>

      {access && (
        <p className="text-center text-sm">
          <Link href="/dashboard" className="font-semibold text-[var(--c-accent)] underline-offset-2 hover:underline">
            Înapoi la dashboard
          </Link>
        </p>
      )}
    </div>
  );
}
