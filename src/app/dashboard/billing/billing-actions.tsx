"use client";

import { useState } from "react";

type Props = {
  hasStripe: boolean;
  hasCustomer: boolean;
  /** false când abonamentul Stripe e activ / trialing */
  allowSubscribe: boolean;
};

export function BillingActions({ hasStripe, hasCustomer, allowSubscribe }: Props) {
  const [loading, setLoading] = useState<null | "month" | "year" | "portal">(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(interval: "month" | "year") {
    setError(null);
    setLoading(interval);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = (await res.json()) as { url?: string; message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "Nu am putut deschide plata.");
      }
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setLoading(null);
    }
  }

  async function portal() {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "Portal indisponibil.");
      }
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            background: "rgba(200,75,47,0.08)",
            color: "var(--c-accent)",
            borderColor: "rgba(200,75,47,0.25)",
          }}
        >
          {error}
        </div>
      )}
      {!hasStripe && (
        <p className="text-sm text-[var(--c-ink-60)]">
          Plata nu e încă configurată pe server. Adaugă <code className="text-[11px]">STRIPE_SECRET_KEY</code>{" "}
          și webhook-ul în Stripe (opțional: <code className="text-[11px]">STRIPE_PRICE_MONTHLY_CENTS</code> /{" "}
          <code className="text-[11px]">STRIPE_PRICE_YEARLY_CENTS</code>).
        </p>
      )}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          className="btn btn-md btn-accent"
          disabled={!hasStripe || !allowSubscribe || loading !== null}
          onClick={() => checkout("month")}
        >
          {loading === "month" ? "Se deschide…" : "Abonează-te — Pro Lunar (19€/lună)"}
        </button>
        <button
          type="button"
          className="btn btn-md btn-outline"
          disabled={!hasStripe || !allowSubscribe || loading !== null}
          onClick={() => checkout("year")}
        >
          {loading === "year" ? "Se deschide…" : "Abonează-te — Pro Anual (169€/an)"}
        </button>
        {hasCustomer && (
          <button
            type="button"
            className="btn btn-md btn-outline"
            disabled={!hasStripe || loading !== null}
            onClick={() => portal()}
          >
            {loading === "portal" ? "Se deschide…" : "Portal facturare Stripe"}
          </button>
        )}
      </div>
    </div>
  );
}
