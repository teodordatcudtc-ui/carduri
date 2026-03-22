import type Stripe from "stripe";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

export async function applyStripeSubscriptionToMerchant(
  merchantId: string,
  stripeCustomerId: string,
  sub: Stripe.Subscription
) {
  const admin = createServiceRoleSupabase();
  const price = sub.items.data[0]?.price;
  const interval =
    price?.recurring?.interval === "year"
      ? "year"
      : price?.recurring?.interval === "month"
        ? "month"
        : null;

  const { error } = await admin
    .from("merchants")
    .update({
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      subscription_interval: interval,
      subscription_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", merchantId);

  if (error) throw new Error(error.message);
}

export async function clearMerchantStripeSubscription(merchantId: string) {
  const admin = createServiceRoleSupabase();
  const { error } = await admin
    .from("merchants")
    .update({
      stripe_subscription_id: null,
      subscription_status: "canceled",
      subscription_interval: null,
      subscription_current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", merchantId);
  if (error) throw new Error(error.message);
}
