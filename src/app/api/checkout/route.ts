import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe-server";
import { NextResponse } from "next/server";

/** Sume în cenți (EUR). Fără produse/prețuri create manual în Stripe — folosim `price_data` la checkout. */
function centsFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const monthlyCents = centsFromEnv("STRIPE_PRICE_MONTHLY_CENTS", 1900);
  const yearlyCents = centsFromEnv("STRIPE_PRICE_YEARLY_CENTS", 16900);

  if (!stripe) {
    return NextResponse.json(
      { error: "stripe_not_configured", message: "Configurează STRIPE_SECRET_KEY în .env." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { interval?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const interval = body.interval === "year" ? "year" : "month";
  const unitAmount = interval === "year" ? yearlyCents : monthlyCents;

  const { data: merchant, error: mErr } = await supabase
    .from("merchants")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (mErr || !merchant) {
    return NextResponse.json({ error: "merchant_not_found" }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const successUrl = `${origin}/dashboard/billing?checkout=success`;
  const cancelUrl = `${origin}/dashboard/billing?checkout=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: unitAmount,
          recurring: { interval },
          product_data: {
            name: interval === "year" ? "Stampy Pro Anual" : "Stampy Pro Lunar",
            metadata: { plan: interval === "year" ? "pro_yearly" : "pro_monthly" },
          },
        },
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: merchant.id,
    metadata: { merchant_id: merchant.id },
    subscription_data: {
      metadata: { merchant_id: merchant.id },
    },
    allow_promotion_codes: true,
    ...(merchant.stripe_customer_id
      ? { customer: merchant.stripe_customer_id }
      : { customer_email: user.email }),
  });

  if (!session.url) {
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
