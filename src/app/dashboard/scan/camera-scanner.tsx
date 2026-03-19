"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

const SCANNER_DIV_ID = "stampio-qr-scanner";

type Props = {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
};

export function CameraScanner({ open, onClose, onScan }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!open) return;

    const el = document.getElementById(SCANNER_DIV_ID);
    if (!el) return;

    setError(null);
    setStarting(true);

    const scanner = new Html5Qrcode(SCANNER_DIV_ID, { verbose: false });
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1,
      videoConstraints: { facingMode: "environment" as const },
    };

    scanner
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (!decodedText?.trim()) return;
          const value = decodedText.trim();
          scannerRef.current = null;
          requestAnimationFrame(() => {
            try {
              onScan(value);
            } catch (e) {
              console.error("Scan callback error", e);
            }
          });
        },
        () => {}
      )
      .then(() => setStarting(false))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Camera indisponibilă.");
        setStarting(false);
      });

    return () => {
      scannerRef.current = null;
      scanner.stop().catch(() => {});
    };
  }, [open, onScan, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="font-medium">Scanează codul de pe card</span>
        <button
          type="button"
          onClick={() => {
            scannerRef.current?.stop().catch(() => {});
            onClose();
          }}
          className="rounded-full p-2 hover:bg-white/10"
          aria-label="Închide"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      {error && (
        <div
          className="mx-4 mb-2 rounded-lg px-3 py-2 text-sm"
          style={{
            background: "rgba(200,75,47,0.20)",
            color: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(200,75,47,0.25)",
          }}
        >
          {error}
        </div>
      )}
      {starting && (
        <div className="flex-1 flex items-center justify-center text-white">
          Pornire cameră...
        </div>
      )}
      <div
        id={SCANNER_DIV_ID}
        className="flex-1 min-h-0 w-full"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      />
    </div>
  );
}
