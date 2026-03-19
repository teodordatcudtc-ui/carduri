"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { PwaInstallPrompt } from "./pwa-install-prompt";
import LoyaltyCard from "@/app/components/loyalty-card/LoyaltyCard";

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
    customer_name: string;
    card_template?: string | null;
    card_palette?: string | null;
    card_stamp_shape?: string | null;
    card_stamp_style?: string | null;
    card_custom_bg_color?: string | null;
    card_custom_bg2_color?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const res = await fetch(`/api/pass/${passId}`, { cache: "no-store" });
      if (!res.ok) return;
      const next = (await res.json()) as typeof data;
      if (!mounted || !next) return;
      setData((prev) => {
        if (
          prev &&
          prev.stamp_count === next.stamp_count &&
          prev.reward_available === next.reward_available &&
          prev.stamps_required === next.stamps_required &&
          prev.reward_description === next.reward_description &&
          prev.logo_url === next.logo_url &&
          prev.brand_color === next.brand_color &&
          prev.business_name === next.business_name &&
          prev.barcode_value === next.barcode_value
        ) {
          return prev;
        }
        return next;
      });
    };

    load()
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    const interval = window.setInterval(() => {
      load().catch(() => {});
    }, 2000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [passId]);

  useEffect(() => {
    QRCode.toDataURL(`STAMPIO:PASS:${passId}`, { width: 220, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [passId]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--c-accent)" }} />
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const googleUrl = `${baseUrl}/api/wallet/google/add?pass_id=${passId}`;
  const appleUrl = `${baseUrl}/api/wallet/apple/add?pass_id=${passId}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-sm space-y-4">
        <LoyaltyCard
          brand={data.business_name}
          holder={data.customer_name || "Client"}
          reward={data.reward_description}
          totalStamps={data.stamps_required}
          filledStamps={data.stamp_count}
          logoUrl={data.logo_url}
          accentColor={data.brand_color}
          rewardAvailable={data.reward_available}
          template={(data.card_template as any) ?? "minimal"}
          palette={(data.card_palette as any) ?? "ink"}
          stampShape={(data.card_stamp_shape as any) ?? "circle"}
          stampStyle={(data.card_stamp_style as any) ?? "solid"}
          customBgColor={data.card_custom_bg_color}
          customBg2Color={data.card_custom_bg2_color}
        />

        <div
          className="rounded-lg border p-4 flex justify-center"
          style={{ borderColor: "var(--c-border)", background: "var(--c-white)" }}
        >
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR card" className="h-44 w-44" />
          ) : (
            <div
              className="h-44 w-44 animate-pulse rounded"
              style={{ background: "var(--c-sand-dark)" }}
            />
          )}
        </div>

        <div
          className="mt-2 rounded-lg p-2 font-mono text-center text-[11px] tracking-wide break-all"
          style={{ background: "rgba(17,17,16,0.12)", color: "var(--c-muted)" }}
        >
          {data.barcode_value}
        </div>
        {wallet && (
          <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.55)" }}>
            Adăugarea în {wallet === "google" ? "Google" : "Apple"} Wallet va fi disponibilă
            după ce comerciantul activează integrarea. Poți folosi codul de mai sus la casă.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md"
            style={{
              border: "1.5px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "var(--c-white)",
              width: "100%",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Smartphone className="w-5 h-5" />
            Add to Google Wallet
          </a>
          <a
            href={appleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md"
            style={{
              border: "1.5px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "var(--c-white)",
              width: "100%",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Smartphone className="w-5 h-5" />
            Add to Apple Wallet
          </a>
        </div>
        <p className="text-center text-sm">
          <Link
            href="/"
            style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
          >
            StampIO
          </Link>
        </p>
      </div>
      <PwaInstallPrompt />
    </div>
  );
}
