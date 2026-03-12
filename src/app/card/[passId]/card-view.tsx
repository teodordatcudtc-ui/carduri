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
    logo_url: string | null;
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
          className="rounded-2xl border-2 p-5 text-white"
          style={{
            borderColor: data.brand_color,
            backgroundColor: `${data.brand_color}20`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden border border-white/40 bg-black/20"
            >
              {data.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.logo_url}
                  alt={data.business_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-1 text-center">
                  {data.business_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-white/70">Card fidelitate</p>
              <h1 className="text-lg font-semibold leading-tight">
                {data.business_name}
              </h1>
            </div>
          </div>

          <p className="text-xs opacity-90 mt-3">
            {data.reward_description} — {data.stamp_count}/{data.stamps_required} ștampile
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: data.stamps_required }).map((_, idx) => {
              const filled = idx < data.stamp_count;
              return (
                // index este ok aici pentru o listă statică
                // eslint-disable-next-line react/no-array-index-key
                <div
                  key={idx}
                  className="h-7 w-7 rounded-full border flex items-center justify-center bg-black/10"
                  style={{
                    borderStyle: filled ? "solid" : "dashed",
                    borderColor: filled ? "white" : "rgba(255,255,255,0.4)",
                    backgroundColor: filled ? "rgba(0,0,0,0.5)" : "transparent",
                  }}
                >
                  {filled && data.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.logo_url}
                      alt="stamp"
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : filled ? (
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: data.brand_color }}
                    />
                  ) : (
                    <span className="text-[10px] text-white/60">
                      {idx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 bg-black/30 rounded-lg p-3 font-mono text-center text-lg tracking-wider break-all">
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
