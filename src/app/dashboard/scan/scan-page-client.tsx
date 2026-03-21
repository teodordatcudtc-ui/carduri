"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ScanLine, Gift, Loader2, Camera, Star } from "lucide-react";

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

export type ScanRecentRow = {
  id: string;
  at: string;
  customerName: string;
  cardName: string;
  action: "stamp" | "reward";
};

function formatActivityTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ScanPageClient({
  programs,
  recentActivity = [],
}: {
  programs: Program[];
  recentActivity?: ScanRecentRow[];
}) {
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
    <div className="dash-scan-wrap w-full">
      <CameraScanner
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onScan={handleScanFromCamera}
      />
      <p className="dash-page-lead mb-6">
        Alege programul, apoi scanează QR-ul clientului sau introdu codul manual.
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
          <div className="dash-reward-banner mb-4">
            <div className="min-w-0 flex-1">
              <div
                className="text-[13px] font-bold"
                style={{
                  color:
                    rewardBanner.mode === "reached" ? "var(--c-accent-dark)" : "var(--c-amber)",
                }}
              >
                {rewardBanner.mode === "reached"
                  ? "Recompensă câștigată!"
                  : "Recompensă disponibilă"}
              </div>
              <div className="text-[12px] opacity-90" style={{ color: "var(--c-ink-60)" }}>
                Clientul are {rewardBanner.stamp_count}/{rewardBanner.stamps_required} ștampile.
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => doAction("redeem")}
                disabled={loading !== null}
                className="btn btn-sm btn-accent shrink-0"
              >
                Acordă recompensa
              </button>
              <button
                type="button"
                onClick={() => setRewardBanner(null)}
                disabled={loading !== null}
                className="btn btn-sm btn-outline shrink-0"
              >
                Acordă mai târziu
              </button>
            </div>
            <p className="w-full text-[11px] opacity-90" style={{ color: "var(--c-muted)" }}>
              Dacă acorzi recompensa acum, ștampilele se resetează. „Mai târziu” păstrează progresul.
            </p>
          </div>
        )}

      <div className="dash-box mb-4">
        <div className="dash-box-head">
          <div>
            <div className="dash-box-title">Scanează client</div>
            <div className="dash-box-sub">Alege programul, apoi scanează QR-ul clientului</div>
          </div>
        </div>
        <div className="dash-box-body space-y-4">
          <div>
            <label className="field-label mb-1.5 block">Card / Recompensă</label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="field-input w-full"
            >
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.card_name ?? "Card"} — {program.stamps_required} ștampile
                </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={() => setCameraOpen(true)} className="dash-scan-big-btn">
            <Camera className="h-5 w-5 shrink-0" aria-hidden />
            Deschide camera pentru scanare
          </button>

          <div className="dash-scan-divider">sau introdu codul manual</div>

          <div>
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") doAction("stamp");
              }}
              placeholder="Ex: SP-abc123..."
              className="field-input w-full font-mono tracking-wide"
              autoFocus
            />
          </div>

          {result && (
            <div
              className={
                result.ok
                  ? "dash-success-banner"
                  : "rounded-[10px] border border-[rgba(200,75,47,0.25)] bg-[rgba(200,75,47,0.08)] px-4 py-3 text-[13px] font-medium text-[var(--c-accent)]"
              }
            >
              {result.ok ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1A7A45"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
              <div className="min-w-0">{result.message}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => doAction("stamp")}
              disabled={loading !== null}
              className="btn btn-lg btn-outline btn-full"
            >
              {loading === "stamp" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Star className="h-4 w-4" />
              )}
              Adaugă ștampilă
            </button>
            {!rewardBanner && (
              <button
                type="button"
                onClick={() => doAction("redeem")}
                disabled={loading !== null}
                className="btn btn-lg btn-accent btn-full"
              >
                {loading === "redeem" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Gift className="h-4 w-4" />
                )}
                Acordă recompensă
              </button>
            )}
          </div>
        </div>
      </div>

      {recentActivity.length > 0 ? (
        <div className="dash-box">
          <div className="dash-box-head">
            <div className="dash-box-title">Activitate recentă azi</div>
          </div>
          <div className="overflow-x-auto">
            <table className="dash-table w-full min-w-[480px] border-collapse">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Card</th>
                  <th>Acțiune</th>
                  <th>Oră</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row, i) => (
                  <tr key={row.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`dash-av ${["av-c", "av-b", "av-y", "av-n", "av-g"][i % 5]}`}>
                          {initials(row.customerName)}
                        </div>
                        <span>{row.customerName}</span>
                      </div>
                    </td>
                    <td className="text-[12px] text-[var(--c-muted)]">{row.cardName}</td>
                    <td>
                      <span
                        className={
                          row.action === "reward" ? "dash-badge dash-badge-green" : "dash-badge dash-badge-neutral"
                        }
                      >
                        {row.action === "reward" ? "Recompensă" : "Ștampilă"}
                      </span>
                    </td>
                    <td className="text-[12px] text-[var(--c-muted)]">{formatActivityTime(row.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

