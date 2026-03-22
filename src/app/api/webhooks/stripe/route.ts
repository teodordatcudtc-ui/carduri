import { getStripe } from "@/lib/stripe-server";
import {
  applyStripeSubscriptionToMerchant,
  clearMerchantStripeSubscription,
} from "@/lib/stripe-sync-merchant";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !whSecret) {
    return NextResponse.json({ error: "stripe_webhook_not_configured" }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "no_signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as import("stripe").Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const merchantId = session.metadata?.merchant_id ?? session.client_reference_id;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!merchantId || !customerId || !subId) break;

        const sub = await stripe.subscriptions.retrieve(subId, { expand: ["items.data.price"] });
        await applyStripeSubscriptionToMerchant(merchantId, customerId, sub);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as import("stripe").Stripe.Subscription;
        const merchantId = sub.metadata?.merchant_id;
        if (!merchantId) break;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await applyStripeSubscriptionToMerchant(merchantId, customerId, sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as import("stripe").Stripe.Subscription;
        const merchantId = sub.metadata?.merchant_id;
        if (!merchantId) break;
        await clearMerchantStripeSubscription(merchantId);
        break;
      }
      default:
        break;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "webhook_handler_error";
    console.error("[stripe webhook]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
