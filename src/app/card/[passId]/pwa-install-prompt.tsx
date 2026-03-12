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
    <div className="fixed inset-x-4 bottom-6 z-50 rounded-xl border border-stone-700 bg-stone-900/95 px-4 py-3 shadow-lg shadow-black/40 max-w-sm mx-auto">
      <p className="text-sm font-medium text-white">
        Instalează cardul pe telefon
      </p>
      <p className="mt-1 text-xs text-stone-400">
        Adaugă StampIO pe ecranul principal ca să vezi cardul rapid și să nu
        îl pierzi.
      </p>
      <button
        type="button"
        onClick={handleInstallClick}
        className="mt-3 w-full rounded-lg bg-brand-500 hover:bg-brand-600 text-sm font-medium text-white py-2 transition"
      >
        Instalează aplicația
      </button>
    </div>
  );
}

