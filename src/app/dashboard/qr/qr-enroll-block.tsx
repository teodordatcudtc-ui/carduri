"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type Props = { enrollUrl: string; businessName: string };

export function QrEnrollBlock({ enrollUrl, businessName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

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

  return (
    <div className="rounded-xl border border-stone-700/50 bg-stone-900/30 p-6 flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg mb-4">
        {dataUrl ? (
          <img src={dataUrl} alt="QR înrolare" className="w-64 h-64" />
        ) : (
          <canvas ref={canvasRef} width={280} height={280} className="w-64 h-64" />
        )}
      </div>
      <p className="text-stone-400 text-sm mb-4 text-center">
        Link: <span className="text-white font-mono break-all">{enrollUrl}</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition"
        >
          Descarcă PNG
        </button>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(enrollUrl)}
          className="px-4 py-2 rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800 transition"
        >
          Copiază link
        </button>
      </div>
    </div>
  );
}
