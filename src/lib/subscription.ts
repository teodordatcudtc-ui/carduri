/** Status sincronizat din Stripe + trial local înainte de primul checkout. */
export type SubscriptionStatus =
  | "none"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type MerchantSubscriptionFields = {
  trial_ends_at?: string | null;
  subscription_status?: SubscriptionStatus | string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_interval?: string | null;
  subscription_current_period_end?: string | null;
};

const PAID_OK: SubscriptionStatus[] = ["active", "trialing"];

export function isPaidSubscriptionStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return PAID_OK.includes(status as SubscriptionStatus);
}

/** Acces la dashboard (în afară de onboarding și billing). */
export function canAccessDashboard(m: MerchantSubscriptionFields | null | undefined): boolean {
  if (!m) return false;
  if (isPaidSubscriptionStatus(m.subscription_status)) return true;
  if (m.subscription_status === "past_due" || m.subscription_status === "unpaid") return false;
  // Fără trial_ends_at (DB vechi sau migrare incompletă) — nu bloca accesul.
  if (!m.trial_ends_at?.trim()) return true;
  const end = new Date(m.trial_ends_at).getTime();
  if (Number.isNaN(end)) return true;
  return end > Date.now();
}

export function trialDaysLeft(m: MerchantSubscriptionFields): number | null {
  if (isPaidSubscriptionStatus(m.subscription_status)) return null;
  if (!m.trial_ends_at?.trim()) return null;
  const end = new Date(m.trial_ends_at).getTime();
  if (Number.isNaN(end)) return null;
  const diff = end - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}
