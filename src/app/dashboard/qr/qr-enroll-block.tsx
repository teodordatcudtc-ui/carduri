"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Copy, Download, Printer } from "lucide-react";

type Props = {
  enrollBaseUrl: string;
  businessName: string;
  programs: {
    id: string;
    card_name: string | null;
    reward_description: string;
    stamps_required: number;
  }[];
};

export function QrEnrollBlock({ enrollBaseUrl, businessName, programs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id ?? "");
  const enrollUrl = selectedProgramId
    ? `${enrollBaseUrl}?program=${selectedProgramId}`
    : enrollBaseUrl;

  useEffect(() => {
    if (!canvasRef.current || !enrollUrl) return;
    QRCode.toDataURL(enrollUrl, { width: 280, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [enrollUrl]);

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `stampio-qr-${businessName.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  function handleDownloadPdfA5() {
    if (!dataUrl) return;

    // A5 portrait in mm: 148 x 210
    const doc = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
    const margin = 10;
    const pageW = 148;
    const pageH = 210;
    const contentW = pageW - margin * 2;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(businessName, margin, 18, { maxWidth: contentW });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Card de fidelitate — scanează pentru a-ți crea/vedea cardul", margin, 26, {
      maxWidth: contentW,
    });

    // QR block
    const qrSize = 95; // mm
    const qrX = (pageW - qrSize) / 2;
    const qrY = 38;
    doc.setDrawColor(220);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 3, 3, "FD");
    doc.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Instructions
    const textY = qrY + qrSize + 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Instrucțiuni:", margin, textY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const steps = [
      "1) Scanează QR-ul cu camera telefonului.",
      "2) Completează numele și numărul de telefon.",
      "3) Cardul tău apare instant pe ecran (cu un QR unic).",
      "4) La fiecare vizită, arată QR-ul angajatului pentru o ștampilă.",
    ];
    doc.text(steps.join("\n"), margin, textY + 7, { maxWidth: contentW });

    // Footer: URL
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(`Link: ${enrollUrl}`, margin, pageH - 14, { maxWidth: contentW });
    doc.setTextColor(0);

    doc.save(`stampio-qr-${businessName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }

  return (
    <div className="space-y-4">
      <div className="dash-box">
        <div className="dash-box-head">
          <div>
            <div className="dash-box-title">QR de înrolare</div>
            <div className="dash-box-sub">
              Printează și pune la casă. Clienții scanează, se înrolează în câteva secunde.
            </div>
          </div>
        </div>
        <div className="dash-box-body">
          {programs.length > 0 ? (
            <div>
              <label className="field-label mb-1.5 block">Card / Recompensă pentru înrolare</label>
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
              <span className="field-hint">
                Alege cardul din listă înainte de descărcare — fiecare QR include în link{" "}
                <code className="rounded bg-[var(--c-sand)] px-1">?program=…</code> ca al doilea card
                să nu ducă la același card ca primul.
              </span>
            </div>
          ) : (
            <p className="text-sm text-[var(--c-muted)]">Creează mai întâi un card din secțiunea Carduri.</p>
          )}
        </div>
      </div>

      <div className="dash-qr-preview">
        <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--c-muted)]">
          Preview QR
        </div>
        <div className="dash-qr-box mx-auto">
          {dataUrl ? (
            <img src={dataUrl} alt="QR înrolare" width={160} height={160} className="h-40 w-40 object-contain" />
          ) : (
            <canvas ref={canvasRef} width={280} height={280} className="h-40 w-40 max-w-full" />
          )}
        </div>
        <p className="mb-4 break-all font-mono text-[11px] text-[var(--c-muted)]">{enrollUrl}</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button type="button" onClick={handleDownload} className="btn btn-md btn-accent inline-flex gap-2">
            <Download className="h-3.5 w-3.5" aria-hidden />
            Descarcă PNG
          </button>
          <button type="button" onClick={handleDownloadPdfA5} className="btn btn-md btn-outline inline-flex gap-2">
            <Printer className="h-3.5 w-3.5" aria-hidden />
            PDF A5 (print)
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(enrollUrl)}
            className="btn btn-md btn-ghost inline-flex gap-2 border border-[var(--c-border)]"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Copiază link
          </button>
        </div>
      </div>

      <div className="dash-box">
        <div className="dash-box-head">
          <div className="dash-box-title">Instrucțiuni pentru printare</div>
        </div>
        <div className="dash-box-body flex flex-col gap-3">
          {[
            "Descarcă PDF-ul A5 de mai sus",
            "Printează pe hârtie A5 sau taie dintr-un A4",
            "Pune lângă casă, la vedere. Clienții vor scana curioși.",
          ].map((text, i) => (
            <div key={text} className="flex gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-[var(--c-white)]"
                style={{ background: "var(--c-accent)" }}
              >
                {i + 1}
              </span>
              <p className="text-[13px] leading-relaxed text-[var(--c-ink-60)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
