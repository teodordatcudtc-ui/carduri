"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Smartphone, Loader2 } from "lucide-react";
import LoyaltyCard from "@/app/components/loyalty-card/LoyaltyCard";

type Props = {
  slug: string;
  cardColor: string;
  logoUrl: string | null;
  cardName: string;
  stampsRequired: number;
  rewardDescription: string;
  template?: string | null;
  palette?: string | null;
  stampShape?: string | null;
  stampStyle?: string | null;
  customBgColor?: string | null;
  customBg2Color?: string | null;
  customBg3Color?: string | null;
  layout?: string | null;
  noise?: boolean | null;
  meshGradient?: boolean | null;
  footerColor?: string | null;
  badgeColor?: string | null;
  badgeLetter?: string | null;
  stampVariant?: string | null;
  emptyStampIcon?: string | null;
  filledStampIcon?: string | null;
};

export function EnrollForm({
  slug,
  programId,
  cardColor,
  logoUrl,
  cardName,
  stampsRequired,
  rewardDescription,
  template,
  palette,
  stampShape,
  stampStyle,
  customBgColor,
  customBg2Color,
  customBg3Color,
  layout,
  noise,
  meshGradient,
  footerColor,
  badgeColor,
  badgeLetter,
  stampVariant,
  emptyStampIcon,
  filledStampIcon,
}: Props & { programId: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    barcode_value: string;
    pass_id?: string;
    add_google_wallet_url: string;
    add_apple_wallet_url: string;
    stamps_required: number;
    reward_description: string;
    already_enrolled?: boolean;
  } | null>(null);
  const [rememberChecking, setRememberChecking] = useState(true);

  const rememberKey = useMemo(
    () => `stampio_pass_${slug}_${programId}`,
    [slug, programId]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const storedPassId = localStorage.getItem(rememberKey);
        if (!storedPassId) return;

        // Validăm că pass-ul încă există, ca să nu rămână blocat loading.
        const res = await fetch(`/api/pass/${storedPassId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          localStorage.removeItem(rememberKey);
          return;
        }

        if (!cancelled) router.replace(`/card/${storedPassId}`);
      } catch {
        // Dacă localStorage e indisponibil sau fetch-ul eșuează, ignorăm.
      } finally {
        if (!cancelled) setRememberChecking(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [rememberKey, router]);

  useEffect(() => {
    if (!done?.pass_id) return;
    try {
      localStorage.setItem(rememberKey, done.pass_id);
      // Salvăm și numele ca să afișăm titularul corect la următoarea vizită
      // (chiar dacă join-ul din DB e temporar incomplet pe unele browsere).
      localStorage.setItem(
        `stampio_pass_customer_${done.pass_id}`,
        fullName.trim() || "Client"
      );
    } catch {
      // ignore
    }
    router.replace(`/card/${done.pass_id}`);
  }, [done, rememberKey, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          program_id: programId,
          full_name: fullName.trim(),
          phone: phone.replace(/\s+/g, "").trim(),
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setDone(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la înrolare.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-b-xl border border-[var(--c-border)] bg-[var(--c-white)] p-6 space-y-4">
        <div
          className="rounded-lg text-sm p-3 text-center"
          style={{
            background: "rgba(77,124,106,0.10)",
            color: "var(--c-sage)",
            border: "1px solid rgba(77,124,106,0.25)",
          }}
        >
          {done.already_enrolled
            ? "Ai deja un card. Poți adăuga din nou în Wallet sau arată codul la casă."
            : "Cardul tău a fost creat. Arată codul la casă pentru ștampile."}
        </div>

        <div
          className="rounded-lg p-4 font-mono text-center text-lg tracking-wider break-all"
          style={{ background: "var(--c-sand)", color: "var(--c-black)" }}
        >
          {done.barcode_value}
        </div>

        <p className="field-hint text-xs text-center">
          Arată acest cod la casă la fiecare vizită pentru ștampile.
        </p>

        <div className="flex flex-col gap-2">
          <a
            href={done.add_google_wallet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md btn-outline btn-full"
          >
            <Smartphone className="w-5 h-5" />
            Add to Google Wallet
          </a>
          <a
            href={done.add_apple_wallet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md btn-outline btn-full"
          >
            <Smartphone className="w-5 h-5" />
            Add to Apple Wallet
          </a>
          {done.pass_id && (
            <Link
              href={`/card/${done.pass_id}`}
              className="mt-2 text-center text-sm"
              style={{
                color: "var(--c-accent)",
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              Vezi cardul tău în StampIO
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (rememberChecking) {
    return (
      <div className="rounded-b-xl border border-[var(--c-border)] bg-[var(--c-white)] p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--c-accent)" }} />
      </div>
    );
  }

  const cardTemplate = (template ?? "minimal") as any;
  const cardPalette = (palette ?? "ink") as any;
  const cardStampShape = (stampShape ?? "circle") as any;
  const cardStampStyle = (stampStyle ?? "solid") as any;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="w-[360px] max-w-full">
          <LoyaltyCard
            brand={cardName}
            holder={"Client"}
            reward={rewardDescription}
            totalStamps={stampsRequired}
            filledStamps={0}
            logoUrl={logoUrl}
            accentColor={cardColor}
            template={cardTemplate}
            palette={cardPalette}
            stampShape={cardStampShape}
            stampStyle={cardStampStyle}
            customBgColor={customBgColor ?? cardColor}
            customBg2Color={customBg2Color ?? (customBgColor ?? cardColor)}
            customBg3Color={customBg3Color ?? customBg2Color ?? (customBgColor ?? cardColor)}
            layout={(layout === "hero" ? "hero" : "compact") as "compact" | "hero"}
            noise={!!noise}
            meshGradient={!!meshGradient}
            footerColor={footerColor}
            badgeColor={badgeColor}
            badgeLetter={badgeLetter}
            stampVariant={(stampVariant === "contrast" ? "contrast" : "brand") as "brand" | "contrast"}
            emptyStampIcon={emptyStampIcon ?? "coffee"}
            filledStampIcon={filledStampIcon ?? "check"}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-b-xl border border-[var(--c-border)] bg-[var(--c-white)] p-6 space-y-4"
      >
        {error && (
          <div
            className="rounded-lg text-sm p-3"
            style={{
              background: "rgba(200,75,47,0.08)",
              color: "var(--c-accent)",
              border: "1px solid rgba(200,75,47,0.25)",
            }}
          >
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Nume *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="field-input"
            placeholder="Numele tău"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefon *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="field-input"
            placeholder="07xx xxx xxx"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email (opțional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            placeholder="email@exemplu.ro"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-md btn-full"
          style={{
            backgroundColor: cardColor,
            color: "var(--c-white)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Obține cardul"}
        </button>
      </form>
    </div>
  );
}
