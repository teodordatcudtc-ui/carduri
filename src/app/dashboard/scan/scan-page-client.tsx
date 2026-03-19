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
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id ?? "");
  const [loading, setLoading] = useState<"stamp" | "redeem" | null>(null);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    reward_available?: boolean;
    reward_reached?: boolean;
    stamp_count?: number;
    stamps_required?: number;
  } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [rewardBanner, setRewardBanner] = useState<null | {
    mode: "reached" | "available";
    stamp_count: number;
    stamps_required: number;
  }>(null);
  const [rewardPopup, setRewardPopup] = useState<null | {
    stamp_count: number;
    stamps_required: number;
  }>(null);

  const doAction = useCallback(
    async (action: "stamp" | "redeem", barcodeOverride?: string) => {
      const candidate = barcodeOverride ?? (barcode.trim() ? barcode : lastBarcode ?? "");
      const value = candidate.trim();
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
        setLastBarcode(value);

        if (action === "redeem" && res.ok) {
          setRewardBanner(null);
          setRewardPopup(null);
        }

        if (!res.ok) {
          if (action === "stamp" && data.reward_available) {
            if (data.reward_reached) {
              setRewardPopup({
                stamp_count: data.stamp_count ?? 0,
                stamps_required: data.stamps_required ?? 0,
              });
              setRewardBanner(null);
            } else {
              setRewardBanner({
                mode: "available",
                stamp_count: data.stamp_count ?? 0,
                stamps_required: data.stamps_required ?? 0,
              });
            }
          }
          setResult({
            ok: false,
            message: data.error || data.message || "Eroare",
            reward_available: data.reward_available,
            reward_reached: data.reward_reached,
            stamp_count: data.stamp_count,
            stamps_required: data.stamps_required,
          });
          setBarcode("");
          inputRef.current?.focus();
          return;
        }

        setResult({
          ok: true,
          message: data.message,
          reward_available: data.reward_available,
          reward_reached: data.reward_reached,
          stamp_count: data.stamp_count,
          stamps_required: data.stamps_required,
        });

        if (action === "stamp" && data.reward_available) {
          if (data.reward_reached) {
            setRewardPopup({
              stamp_count: data.stamp_count ?? 0,
              stamps_required: data.stamps_required ?? 0,
            });
            setRewardBanner(null);
          } else {
            setRewardBanner({
              mode: "available",
              stamp_count: data.stamp_count ?? 0,
              stamps_required: data.stamps_required ?? 0,
            });
          }
        }

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
    [barcode, selectedProgramId, lastBarcode]
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

        {rewardPopup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(17,17,16,0.45)", padding: 18 }}
          >
            <div
              className="w-full max-w-md rounded-xl"
              style={{
                background: "var(--c-white)",
                border: "1px solid var(--c-border)",
                padding: 16,
                boxShadow: "0 18px 60px rgba(17,17,16,0.25)",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800 }}>
                Recompensă câștigată!
              </div>
              <div style={{ marginTop: 6, color: "var(--c-ink-60)", fontSize: 14, textAlign: "center" }}>
                Clientul a atins pragul: {rewardPopup.stamp_count}/{rewardPopup.stamps_required} ștampile.
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRewardPopup(null);
                    doAction("redeem");
                  }}
                  disabled={loading !== null}
                  className="btn btn-md btn-accent btn-full"
                >
                  Acordă recompensa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRewardPopup(null);
                    setRewardBanner({
                      mode: "available",
                      stamp_count: rewardPopup.stamp_count,
                      stamps_required: rewardPopup.stamps_required,
                    });
                  }}
                  disabled={loading !== null}
                  className="btn btn-md btn-outline btn-full"
                >
                  Acordă mai târziu
                </button>
              </div>

              <div className="mt-3 text-xs" style={{ color: "var(--c-muted)", textAlign: "center", opacity: 0.95 }}>
                Dacă alegi „Acordă mai târziu”, cardul nu se resetează până când revendici recompensa.
              </div>
            </div>
          </div>
        )}

        {rewardBanner && (
          <div
            className="mb-4 rounded-lg p-4"
            style={{
              background:
                rewardBanner.mode === "reached"
                  ? "rgba(200,75,47,0.10)"
                  : "rgba(224,150,0,0.10)",
              border:
                rewardBanner.mode === "reached"
                  ? "1px solid rgba(200,75,47,0.25)"
                  : "1px solid rgba(224,150,0,0.25)",
              color: rewardBanner.mode === "reached" ? "var(--c-accent)" : "var(--c-amber)",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              {rewardBanner.mode === "reached"
                ? "Recompensă câștigată!"
                : "Recompensă disponibilă"}
            </div>
            <div style={{ fontSize: 14, opacity: 0.95 }}>
              Clientul are {rewardBanner.stamp_count}/{rewardBanner.stamps_required} ștampile.
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => doAction("redeem")}
                disabled={loading !== null}
                className="btn btn-md btn-accent btn-full"
              >
                Acordă recompensa
              </button>
              <button
                type="button"
                onClick={() => setRewardBanner(null)}
                disabled={loading !== null}
                className="btn btn-md btn-outline btn-full"
              >
                Acordă mai târziu
              </button>
            </div>
            <div className="mt-2 text-xs" style={{ opacity: 0.9 }}>
              Dacă alegi „Acordă recompensa”, ștampilele se resetează imediat (card nou). Dacă alegi „Acordă mai târziu”, ștampilele NU se resetează până revendici recompensa.
            </div>
          </div>
        )}

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
          {!rewardBanner && (
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
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

