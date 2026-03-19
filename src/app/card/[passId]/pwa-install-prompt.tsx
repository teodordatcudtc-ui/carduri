"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          // ignore errors – PWA install is optional
        });
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const appInstalledHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  if (installed || !deferredPrompt) return null;

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="fixed inset-x-4 bottom-6 z-50 rounded-xl border px-4 py-3 shadow-lg max-w-sm mx-auto"
      style={{
        background: "rgba(17,17,16,0.95)",
        borderColor: "rgba(224,217,206,0.25)",
        borderWidth: 1.5,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--c-white)" }}>
        Instalează cardul pe telefon
      </p>
      <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
        Adaugă StampIO pe ecranul principal ca să vezi cardul rapid și să nu
        îl pierzi.
      </p>
      <button
        type="button"
        onClick={handleInstallClick}
        className="mt-3 w-full btn btn-md"
        style={{ background: "var(--c-accent)", color: "var(--c-white)", borderRadius: "var(--r-md)" }}
      >
        Instalează aplicația
      </button>
    </div>
  );
}

