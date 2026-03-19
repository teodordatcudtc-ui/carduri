"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ScanLine, Gift, Loader2, Camera } from "lucide-react";

const CameraScanner = dynamic(
  () => import("./camera-scanner").then((m) => ({ default: m.CameraScanner })),
  { ssr: false }
);

type Program = {
  id: string;
  card_name: string | null;
  stamps_required: number;
  reward_description: string;
};

export function ScanPageClient({ programs }: { programs: Program[] }) {
  const [barcode, setBarcode] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id ?? "");
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
      if (!selectedProgramId) {
        setResult({ ok: false, message: "Selectează cardul/recompensa." });
        return;
      }

      setResult(null);
      setLoading(action);
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barcode: value, action, program_id: selectedProgramId }),
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
    [barcode, selectedProgramId]
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
    <div className="max-w-3xl mx-auto">
      <CameraScanner
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onScan={handleScanFromCamera}
      />
      <div className="card card-sm">
        <h1 className="text-2xl font-bold mb-2">Scanează card</h1>
        <p className="text-[var(--c-ink-60)] mb-6">
          Alege cardul/recompensa, apoi scanează clientul și acordă ștampila.
        </p>
        <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Card / recompensă
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="w-full field-input"
          >
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.card_name ?? "Card"} — {program.stamps_required} ștampile
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="btn btn-md btn-accent btn-full"
        >
          <Camera className="w-5 h-5" />
          Deschide camera pentru scanare
        </button>
        <div>
          <label className="block text-sm font-medium mb-1">
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
            className="w-full field-input font-mono text-base"
            autoFocus
          />
        </div>
        {result && (
          <div
            className="rounded-lg p-3 text-sm"
            style={{
              background: result.ok ? "rgba(77,124,106,0.12)" : "rgba(200,75,47,0.12)",
              color: result.ok ? "var(--c-sage)" : "var(--c-accent)",
              border: `1px solid ${
                result.ok ? "rgba(77,124,106,0.25)" : "rgba(200,75,47,0.25)"
              }`,
            }}
          >
            {result.message}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => doAction("stamp")}
            disabled={loading !== null}
            className="btn btn-md btn-outline btn-full"
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
            className="btn btn-md btn-accent btn-full"
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
    </div>
  );
}

