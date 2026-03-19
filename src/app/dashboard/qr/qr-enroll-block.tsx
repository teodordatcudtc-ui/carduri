"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

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
    <div className="p-6 flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg mb-4 border border-[var(--c-border)]">
        {dataUrl ? (
          <img src={dataUrl} alt="QR înrolare" className="w-64 h-64" />
        ) : (
          <canvas ref={canvasRef} width={280} height={280} className="w-64 h-64" />
        )}
      </div>
      <p className="text-sm mb-4 text-center">
        Link: <span className="font-mono break-all">{enrollUrl}</span>
      </p>
      {programs.length > 0 && (
        <div className="w-full mb-4">
          <label className="block text-sm font-medium mb-1">
            Card/Recompensă pentru înrolare
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
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="btn btn-md btn-accent"
        >
          Descarcă PNG
        </button>
        <button
          type="button"
          onClick={handleDownloadPdfA5}
          className="btn btn-md btn-outline"
        >
          PDF A5 (print)
        </button>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(enrollUrl)}
          className="btn btn-md btn-outline"
        >
          Copiază link
        </button>
      </div>
    </div>
  );
}
