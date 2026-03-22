import sharp from "sharp";

export type WalletStampIcon = "coffee" | "scissors" | "star" | "heart" | "default";

export interface StampImageParams {
  businessName: string;
  /** Titlu card (ex. nume program); default „Card fidelitate”. */
  cardTitle?: string;
  stampsCurrent: number;
  stampsTotal: number;
  rewardText: string;
  primaryColor: string;
  stampIcon: WalletStampIcon;
}

const W = 1032;
const H = 336;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeHex(c: string, fallback: string): string {
  const t = c?.trim() || fallback;
  if (!t.startsWith("#")) return fallback;
  const h = t.slice(1);
  if (h.length === 6) return `#${h}`;
  if (h.length === 3)
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  return fallback;
}

/** Text alb pe fundal închis, altfel negru pe fundal deschis */
function textColors(bgHex: string): { main: string; muted: string } {
  const h = bgHex.replace(/^#/, "");
  const full =
    h.length === 3 ? `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}` : h.slice(0, 6);
  if (full.length !== 6) return { main: "#ffffff", muted: "rgba(255,255,255,0.82)" };
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const L = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  if (L > 0.62) {
    return { main: "#141210", muted: "rgba(20,18,16,0.72)" };
  }
  return { main: "#ffffff", muted: "rgba(255,255,255,0.85)" };
}

function iconInnerSvg(icon: WalletStampIcon, color: string): string {
  switch (icon) {
    case "coffee":
      return `<path d="M7 18 L9 10 M15 10 L17 18" stroke="${color}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
              <path d="M6 8 Q12 4 18 8" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    case "scissors":
      return `<path d="M6 6 L18 18 M18 6 L6 18" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
    case "star":
      return `<path fill="${color}" d="M12 2.5l2.8 6.1 6.7.8-5 4.7 1.3 6.6L12 17.8l-5.8 2.9 1.3-6.6-5-4.7 6.7-.8z"/>`;
    case "heart":
      return `<path fill="${color}" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>`;
    default:
      return `<path d="M8 12.5 L11 15.5 L16 9.5" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
}

export function mapDbIconToWalletStampIcon(raw: string | null | undefined): WalletStampIcon {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("coffee") || s.includes("cup")) return "coffee";
  if (s.includes("scissor") || s === "cut") return "scissors";
  if (s.includes("star")) return "star";
  if (s.includes("heart")) return "heart";
  return "default";
}

/**
 * PNG 1032×336 (raport hero Google Wallet) — sharp + SVG, compatibil Vercel (fără canvas nativ).
 */
export async function generateStampImagePng(params: StampImageParams): Promise<Buffer> {
  const bg = normalizeHex(params.primaryColor, "#ea751a");
  const { main: txtMain, muted: txtMuted } = textColors(bg);
  const n = Math.max(1, Math.min(24, params.stampsTotal));
  const current = Math.max(0, Math.min(n, params.stampsCurrent));
  const stampSize = n <= 6 ? 52 : n <= 10 ? 42 : n <= 14 ? 34 : 28;
  const gap = n <= 10 ? 14 : 9;
  const totalW = n * stampSize + (n - 1) * gap;
  const startX = (W - totalW) / 2 + stampSize / 2;
  const centerY = H / 2 - 8;
  const R = stampSize / 2;

  const business = escapeXml(params.businessName.slice(0, 42).toUpperCase());
  const cardTitle = escapeXml((params.cardTitle ?? "Card fidelitate").slice(0, 36));
  const reward = escapeXml(params.rewardText.slice(0, 72));
  const icon = params.stampIcon;

  const circles: string[] = [];
  for (let i = 0; i < n; i++) {
    const cx = startX + i * (stampSize + gap);
    const filled = i < current;
    if (filled) {
      circles.push(
        `<circle cx="${cx}" cy="${centerY}" r="${R}" fill="rgba(255,255,255,0.95)"/>`,
        `<g transform="translate(${cx - 12},${centerY - 12})">${iconInnerSvg(icon, bg)}</g>`
      );
    } else {
      circles.push(
        `<circle cx="${cx}" cy="${centerY}" r="${R}" fill="none" stroke="rgba(255,255,255,0.32)" stroke-width="2.5"/>`
      );
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}" rx="14"/>
  <text x="28" y="40" fill="${txtMuted}" font-family="system-ui,Segoe UI,sans-serif" font-size="11" font-weight="700" letter-spacing="0.12em">${business}</text>
  <text x="28" y="58" fill="${txtMain}" font-family="Georgia,serif" font-size="22" font-weight="700">${cardTitle}</text>
  ${circles.join("\n")}
  <text x="${W / 2}" y="${centerY + R + 42}" text-anchor="middle" fill="${txtMain}" font-family="system-ui,Segoe UI,sans-serif" font-size="20" font-weight="600">${current} / ${n}</text>
  <text x="${W - 28}" y="${H - 28}" text-anchor="end" fill="${txtMain}" font-family="system-ui,Segoe UI,sans-serif" font-size="14" font-weight="700">${reward}</text>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
