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
    card_name: string;
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
    card_custom_bg3_color?: string | null;
    card_layout?: string | null;
    card_noise?: boolean;
    card_mesh_gradient?: boolean;
    card_footer_color?: string | null;
    card_badge_color?: string | null;
    card_badge_letter?: string | null;
    card_stamp_variant?: string | null;
    card_stamp_empty_icon?: string | null;
    card_stamp_filled_icon?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [rememberedCustomerName, setRememberedCustomerName] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

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
    // Fallback: pe unele telefoane / browsere join-ul customers poate fi temporar gol.
    // De aceea salvăm numele la înrolare și îl re-afișăm aici dacă e necesar.
    try {
      const v = localStorage.getItem(`stampio_pass_customer_${passId}`);
      if (v) setRememberedCustomerName(v);
    } catch {
      // ignore
    }
  }, [passId]);

  useEffect(() => {
    // Când se schimbă cardul, ascundem QR-ul pentru a reveni la "front".
    setShowQr(false);
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="w-full max-w-2xl space-y-4">
        {(() => {
          const frontBg = data.card_custom_bg_color ?? data.brand_color;
          const backBg = data.card_custom_bg2_color ?? frontBg;

          return (
            <div className="flex flex-col items-center gap-4">
              <div
                className="text-sm font-semibold"
                style={{
                  color: "var(--c-black)",
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid var(--c-border)",
                  padding: "8px 14px",
                  borderRadius: 999,
                  backdropFilter: "blur(6px)",
                }}
              >
                {data.business_name}
              </div>
              <div
                className="w-[360px] max-w-full"
                style={{ perspective: 1000 }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Apasă pe card pentru a afișa codul QR"
                  onClick={() => setShowQr((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setShowQr((v) => !v);
                  }}
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "340 / 210",
                    transformStyle: "preserve-3d",
                    transition: "transform 650ms ease",
                    transform: showQr ? "rotateY(180deg)" : "rotateY(0deg)",
                    borderRadius: 16,
                  }}
                >
                  {/* FRONT */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                      borderRadius: 16,
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <LoyaltyCard
                      brand={data.card_name || data.business_name}
                      holder={data.customer_name || rememberedCustomerName || "Client"}
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
                      customBg3Color={data.card_custom_bg3_color}
                      layout={(data.card_layout === "hero" ? "hero" : "compact") as "compact" | "hero"}
                      noise={!!data.card_noise}
                      meshGradient={!!data.card_mesh_gradient}
                      footerColor={data.card_footer_color}
                      badgeColor={data.card_badge_color}
                      badgeLetter={data.card_badge_letter}
                      stampVariant={(data.card_stamp_variant === "contrast" ? "contrast" : "brand") as "brand" | "contrast"}
                      emptyStampIcon={data.card_stamp_empty_icon ?? "coffee"}
                      filledStampIcon={data.card_stamp_filled_icon ?? "check"}
                    />
                  </div>

                  {/* BACK */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                      borderRadius: 16,
                      overflow: "hidden",
                      transform: "rotateY(180deg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 18,
                      background: `linear-gradient(135deg, ${frontBg} 0%, ${backBg} 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-center">
                      {qrDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrDataUrl}
                          alt="QR pentru angajat (ștampilă)"
                          className="h-40 w-40"
                          style={{ background: "transparent" }}
                        />
                      ) : (
                        <div className="h-40 w-40 animate-pulse rounded" style={{ background: "transparent" }} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="text-center text-xs"
                style={{ color: "var(--c-muted)", opacity: 0.9 }}
              >
                Apasă pe card pentru a fi scanat
              </div>

              <div
                className="rounded-lg p-2 font-mono text-center text-[11px] tracking-wide break-all"
                style={{ background: "rgba(17,17,16,0.12)", color: "var(--c-muted)" }}
              >
                {data.barcode_value}
              </div>

              {wallet && (
                <p className="text-center text-sm text-[var(--c-ink-60)]">
                  Adăugarea în {wallet === "google" ? "Google" : "Apple"} Wallet va fi disponibilă
                  după ce comerciantul activează integrarea. Poți folosi codul de mai sus la casă.
                </p>
              )}
            </div>
          );
        })()}
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] p-4 shadow-md">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md btn-accent btn-full"
          >
            <Smartphone className="w-5 h-5" aria-hidden />
            Add to Google Wallet
          </a>
          <a
            href={appleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md btn-outline btn-full"
          >
            <Smartphone className="w-5 h-5" aria-hidden />
            Add to Apple Wallet
          </a>
        </div>
        <p className="text-center text-sm">
          <Link
            href="/"
            className="text-[var(--c-muted)] no-underline transition hover:text-[var(--c-accent)]"
          >
            StampIO
          </Link>
        </p>
      </div>
      <PwaInstallPrompt />
    </div>
  );
}
