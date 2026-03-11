"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ScanLine, Gift, Loader2, Camera } from "lucide-react";

const CameraScanner = dynamic(() => import("./camera-scanner").then((m) => ({ default: m.CameraScanner })), {
  ssr: false,
});

export default function ScanPage() {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState<"stamp" | "redeem" | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doAction = useCallback(
    async (action: "stamp" | "redeem", barcodeOverride?: string) => {
      const value = (barcodeOverride ?? barcode).trim();
      if (!value) {
        setResult({ ok: false, message: "Introdu sau scanează codul de pe card." });
        return;
      }
      setResult(null);
      setLoading(action);
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barcode: value, action }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Eroare");
        setResult({ ok: true, message: data.message });
        setBarcode("");
        inputRef.current?.focus();
      } catch (err: unknown) {
        setResult({
          ok: false,
          message: err instanceof Error ? err.message : "Eroare la scanare.",
        });
      } finally {
        setLoading(null);
      }
    },
    [barcode]
  );

  const handleScanFromCamera = useCallback(
    (value: string) => {
      setCameraOpen(false);
      setResult(null);
      doAction("stamp", value);
    },
    [doAction]
  );

  return (
    <div className="p-6 md:p-10 max-w-lg mx-auto">
      <CameraScanner
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onScan={handleScanFromCamera}
      />
      <h1 className="text-2xl font-bold text-white mb-2">Scanează card</h1>
      <p className="text-stone-400 mb-6">
        Introdu codul de pe cardul clientului sau scanează cu camera, apoi adaugă
        ștampila sau acordă recompensa.
      </p>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3 font-medium transition"
        >
          <Camera className="w-5 h-5" />
          Deschide camera pentru scanare
        </button>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">
            Sau introdu codul manual
          </label>
          <input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doAction("stamp");
            }}
            placeholder="Ex: SP-abc123..."
            className="w-full rounded-lg border border-stone-600 bg-stone-800 px-4 py-3 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-lg"
            autoFocus
          />
        </div>
        {result && (
          <div
            className={`rounded-lg p-3 text-sm ${
              result.ok
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {result.message}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => doAction("stamp")}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-stone-600 bg-stone-800 hover:border-brand-500 hover:bg-stone-700 disabled:opacity-50 text-white py-3 font-medium transition"
          >
            {loading === "stamp" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ScanLine className="w-5 h-5" />
            )}
            Adaugă ștampilă
          </button>
          <button
            type="button"
            onClick={() => doAction("redeem")}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-stone-600 bg-stone-800 hover:border-amber-500/50 hover:bg-amber-500/10 disabled:opacity-50 text-amber-400 py-3 font-medium transition"
          >
            {loading === "redeem" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Gift className="w-5 h-5" />
            )}
            Acordă recompensa
          </button>
        </div>
      </div>
    </div>
  );
}
