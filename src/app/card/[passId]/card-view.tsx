"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, Loader2 } from "lucide-react";

type Props = { passId: string; wallet: string | null };

export function CardView({ passId, wallet }: Props) {
  const [data, setData] = useState<{
    barcode_value: string;
    stamp_count: number;
    reward_available: boolean;
    stamps_required: number;
    reward_description: string;
    business_name: string;
    brand_color: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pass/${passId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [passId]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const googleUrl = `${baseUrl}/api/wallet/google/add?pass_id=${passId}`;
  const appleUrl = `${baseUrl}/api/wallet/apple/add?pass_id=${passId}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        <div
          className="rounded-xl border-2 p-6 text-white"
          style={{ borderColor: data.brand_color, backgroundColor: `${data.brand_color}20` }}
        >
          <h1 className="text-xl font-bold">{data.business_name}</h1>
          <p className="text-sm opacity-90 mt-1">
            {data.reward_description} — {data.stamp_count}/{data.stamps_required} ștampile
          </p>
          {data.reward_available && (
            <p className="mt-2 text-amber-300 font-medium">Recompensă disponibilă!</p>
          )}
          <div className="mt-4 bg-black/20 rounded-lg p-3 font-mono text-center text-lg tracking-wider break-all">
            {data.barcode_value}
          </div>
        </div>
        {wallet && (
          <p className="text-stone-400 text-sm text-center">
            Adăugarea în {wallet === "google" ? "Google" : "Apple"} Wallet va fi disponibilă
            după ce comerciantul activează integrarea. Poți folosi codul de mai sus la casă.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-stone-600 bg-stone-800 hover:bg-stone-700 text-white py-3 font-medium transition"
          >
            <Smartphone className="w-5 h-5" />
            Add to Google Wallet
          </a>
          <a
            href={appleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-stone-600 bg-stone-800 hover:bg-stone-700 text-white py-3 font-medium transition"
          >
            <Smartphone className="w-5 h-5" />
            Add to Apple Wallet
          </a>
        </div>
        <p className="text-center text-stone-500 text-sm">
          <Link href="/" className="hover:text-stone-400">
            StampIO
          </Link>
        </p>
      </div>
    </div>
  );
}
