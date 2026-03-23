"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, X } from "lucide-react";

const STORAGE_KEY = "stampy-dash-banner-dismissed";
const LEGACY_STORAGE_KEY = "stampio-dash-banner-dismissed";

export function DashboardOnboardingBanner({ show }: { show: boolean }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const v =
        localStorage.getItem(STORAGE_KEY) === "1" ||
        localStorage.getItem(LEGACY_STORAGE_KEY) === "1";
      setDismissed(v);
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!show || dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[10px] border border-coral bg-coral-light px-4 py-3">
      <AlertCircle className="h-[18px] w-[18px] shrink-0 text-coral" aria-hidden />
      <p className="min-w-0 flex-1 text-[13px] text-coral-dark">
        <strong className="font-bold">Primul pas:</strong> Printează QR-ul și pune-l la
        casă. Primii clienți se înrolează singuri în 10 secunde.
      </p>
      <Link
        href={`/dashboard/qr`}
        className="inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-coral px-3 text-xs font-semibold text-paper no-underline hover:bg-coral-dark"
      >
        Descarcă QR
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 text-lg leading-none text-coral opacity-60 hover:opacity-100"
        aria-label="Închide"
      >
        ×
      </button>
    </div>
  );
}
