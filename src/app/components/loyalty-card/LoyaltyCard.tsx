/* eslint-disable react/no-array-index-key */
"use client";

import React, { useMemo } from "react";

type TemplateId = "minimal" | "split" | "corner" | "lines" | "dots";
type PaletteId =
  | "ink"
  | "sand"
  | "terracotta"
  | "sage"
  | "slate"
  | "chalk"
  | "plum"
  | "navy"
  | "custom";

type StampShapeId = "circle" | "rounded" | "diamond" | "hex";
type StampStyleId = "solid" | "outline" | "soft";

type Palette = {
  bg: string;
  bg2: string;
  text: string;
  subOpacity: number;
};

const PALETTES: Record<Exclude<PaletteId, "custom">, Palette> = {
  ink: { bg: "#111110", bg2: "#1E1E1C", text: "#FFFFFF", subOpacity: 0.55 },
  sand: { bg: "#F5F0E8", bg2: "#EAE3D5", text: "#111110", subOpacity: 0.45 },
  terracotta: {
    bg: "#C84B2F",
    bg2: "#A33A20",
    text: "#FFFFFF",
    subOpacity: 0.6,
  },
  sage: { bg: "#2E4D3E", bg2: "#1E3329", text: "#FFFFFF", subOpacity: 0.5 },
  slate: { bg: "#1C2B3A", bg2: "#142030", text: "#FFFFFF", subOpacity: 0.5 },
  chalk: { bg: "#FAFAF8", bg2: "#F0EDE6", text: "#111110", subOpacity: 0.4 },
  plum: { bg: "#2D1B3D", bg2: "#200F2E", text: "#FFFFFF", subOpacity: 0.5 },
  navy: { bg: "#0D1F35", bg2: "#081529", text: "#FFFFFF", subOpacity: 0.5 },
};

function normalizeHex(hex: string) {
  const h = hex.trim();
  if (!h.startsWith("#")) return h;
  if (h.length === 4) {
    // #RGB -> #RRGGBB
    return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`.toUpperCase();
  }
  return h.toUpperCase();
}

function hexToRgb(hex: string) {
  const h = normalizeHex(hex).replace("#", "");
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  // WCAG relative luminance
  const srgb = [r, g, b].map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function getTextColorForBg(bgHex: string) {
  const lum = relativeLuminance(hexToRgb(bgHex));
  // simple threshold: choose white for dark backgrounds
  return lum < 0.35 ? "#FFFFFF" : "#111110";
}

function computeStampSize(total: number) {
  if (total <= 6) return 28;
  if (total <= 10) return 22;
  if (total <= 15) return 18;
  return 15;
}

function computeGap(stampSize: number) {
  return stampSize <= 18 ? 5 : 6;
}

function BackgroundSvg({
  template,
  bg,
  bg2,
}: {
  template: TemplateId;
  bg: string;
  bg2: string;
}) {
  // viewBox: 340x210 (same as snippet)
  if (template === "split") {
    return (
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 340 210"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="340" height="210" fill={bg} />
        <polygon points="0,0 180,0 100,210 0,210" fill={bg2} opacity="0.7" />
      </svg>
    );
  }

  if (template === "corner") {
    return (
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 340 210"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="340" height="210" fill={bg} />
        <circle cx="300" cy="170" r="110" fill={bg2} opacity="0.5" />
        <circle cx="310" cy="160" r="60" fill={bg2} opacity="0.4" />
      </svg>
    );
  }

  if (template === "lines") {
    return (
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 340 210"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="340" height="210" fill={bg} />
        <line
          x1="0"
          y1="140"
          x2="340"
          y2="100"
          stroke={bg2}
          strokeWidth="40"
          opacity="0.5"
        />
        <line
          x1="0"
          y1="180"
          x2="340"
          y2="140"
          stroke={bg2}
          strokeWidth="20"
          opacity="0.35"
        />
      </svg>
    );
  }

  if (template === "dots") {
    const dots: React.ReactNode[] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 9; c++) {
        dots.push(
          <circle
            // eslint-disable-next-line react/no-array-index-key
            key={`${r}-${c}`}
            cx={c * 40 + 20}
            cy={r * 38 + 10}
            r="10"
            fill={bg2}
            opacity="0.3"
          />
        );
      }
    }
    return (
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 340 210"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="340" height="210" fill={bg} />
        {dots}
      </svg>
    );
  }

  // minimal / default
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 340 210"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="340" height="210" fill={bg} />
    </svg>
  );
}

function Stamp({
  size,
  filled,
  icon,
  stampShape,
  stampStyle,
  logoUrl,
  accentColor,
  textColor,
}: {
  size: number;
  filled: boolean;
  icon: string;
  stampShape: StampShapeId;
  stampStyle: StampStyleId;
  logoUrl: string | null;
  accentColor: string;
  textColor: string;
}) {
  const emptyBg = withAlpha(textColor, 0.12);
  const emptyIconColor = withAlpha(textColor, 0.22);

  const filledBg =
    stampStyle === "solid"
      ? accentColor
      : stampStyle === "soft"
        ? withAlpha(accentColor, 0.2)
        : "transparent";

  const filledBorder =
    stampStyle === "outline" || stampStyle === "soft"
      ? accentColor
      : null;

  const iconColor =
    stampStyle === "outline"
      ? accentColor
      : stampStyle === "soft"
        ? accentColor
        : textColor;

  const common = {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden" as const,
  };

  if (stampShape === "circle") {
    return (
      <div
        style={{
          ...common,
          borderRadius: 999,
          background: filled ? filledBg : emptyBg,
          border: filled && filledBorder ? `1.5px solid ${filledBorder}` : "none",
        }}
      >
        {filled ? (
          logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              style={{ width: size * 0.6, height: size * 0.6, objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: size * 0.38, color: iconColor }}>{icon}</span>
          )
        ) : (
          <span style={{ fontSize: size * 0.38, color: emptyIconColor }}>{icon}</span>
        )}
      </div>
    );
  }

  if (stampShape === "rounded") {
    const r = size * 0.25;
    return (
      <div
        style={{
          ...common,
          borderRadius: r,
          background: filled ? filledBg : emptyBg,
          border: filled && filledBorder ? `1.5px solid ${filledBorder}` : "none",
        }}
      >
        {filled ? (
          logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              style={{ width: size * 0.6, height: size * 0.6, objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: size * 0.38, color: iconColor }}>{icon}</span>
          )
        ) : (
          <span style={{ fontSize: size * 0.38, color: emptyIconColor }}>{icon}</span>
        )}
      </div>
    );
  }

  if (stampShape === "diamond") {
    return (
      <div
        style={{
          ...common,
          transform: "rotate(45deg)",
          borderRadius: 6,
          background: filled ? filledBg : emptyBg,
          border: filled && filledBorder ? `1.5px solid ${filledBorder}` : "none",
        }}
      >
        <div style={{ transform: "rotate(-45deg)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {filled ? (
            logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                style={{ width: size * 0.55, height: size * 0.55, objectFit: "contain" }}
              />
            ) : (
              <span style={{ fontSize: size * 0.38, color: iconColor }}>{icon}</span>
            )
          ) : (
            <span style={{ fontSize: size * 0.38, color: emptyIconColor }}>{icon}</span>
          )}
        </div>
      </div>
    );
  }

  // hex
  const clip = "polygon(50% 0%,93.3% 25%,93.3% 75%,50% 100%,6.7% 75%,6.7% 25%)";
  const borderShadow =
    filled && filledBorder ? `inset 0 0 0 1.5px ${filledBorder}` : "none";
  const background = filled ? filledBg : emptyBg;

  return (
    <div
      style={{
        ...common,
        clipPath: clip,
        background,
        boxShadow: borderShadow === "none" ? undefined : borderShadow,
      }}
    >
      {filled ? (
        logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" style={{ width: size * 0.6, height: size * 0.6, objectFit: "contain" }} />
        ) : (
          <span style={{ fontSize: size * 0.38, color: iconColor }}>{icon}</span>
        )
      ) : (
        <span style={{ fontSize: size * 0.38, color: emptyIconColor }}>{icon}</span>
      )}
    </div>
  );
}

export type LoyaltyCardDesignProps = {
  brand: string;
  holder: string;
  reward: string;
  totalStamps: number;
  filledStamps: number;
  logoUrl?: string | null;
  accentColor: string;
  template?: TemplateId | null;
  palette?: PaletteId | null;
  stampShape?: StampShapeId | null;
  stampStyle?: StampStyleId | null;
  customBgColor?: string | null;
  customBg2Color?: string | null;
  rewardAvailable?: boolean;
};

export default function LoyaltyCard({
  brand,
  holder,
  reward,
  totalStamps,
  filledStamps,
  logoUrl = null,
  accentColor,
  template = "minimal",
  palette = "ink",
  stampShape = "circle",
  stampStyle = "solid",
  customBgColor = null,
  customBg2Color = null,
  rewardAvailable = false,
}: LoyaltyCardDesignProps) {
  const paletteResolved = useMemo(() => {
    if (palette === "custom") {
      const bg = customBgColor ?? "#F5F0E8";
      const bg2 = customBg2Color ?? "#EAE3D5";
      const text = getTextColorForBg(bg);
      return { bg, bg2, text, subOpacity: 0.5 } as Palette;
    }
    const p = PALETTES[palette as Exclude<PaletteId, "custom">] ?? PALETTES.ink;
    return p;
  }, [palette, customBgColor, customBg2Color]);

  const stampSize = computeStampSize(totalStamps);
  const gap = computeGap(stampSize);
  const icon = "☕";

  const rewardBg = withAlpha(accentColor, 0.25);
  const rewardText = paletteResolved.text;
  const subtitleColor = withAlpha(paletteResolved.text, paletteResolved.subOpacity);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 360,
        aspectRatio: "340 / 210",
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
        fontFamily: "DM Sans, system-ui, sans-serif",
        background: paletteResolved.bg,
      }}
    >
      <BackgroundSvg template={(template ?? "minimal") as TemplateId} bg={paletteResolved.bg} bg2={paletteResolved.bg2} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 22,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: -0.01,
                color: paletteResolved.text,
                fontFamily: "ClashDisplay, DM Sans, sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {brand}
            </div>
            <div style={{ fontSize: 10, color: subtitleColor, opacity: 0.95, marginTop: 2 }}>Card de fidelitate digital</div>
          </div>

          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: accentColor,
              color: paletteResolved.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            S
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap,
            alignItems: "center",
          }}
        >
          {Array.from({ length: totalStamps }).map((_, idx) => {
            const filled = idx < filledStamps;
            return (
              <Stamp
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                size={stampSize}
                filled={filled}
                icon={icon}
                stampShape={(stampShape ?? "circle") as StampShapeId}
                stampStyle={(stampStyle ?? "solid") as StampStyleId}
                logoUrl={logoUrl}
                accentColor={accentColor}
                textColor={paletteResolved.text}
              />
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: withAlpha(paletteResolved.text, 0.45), fontWeight: 400 }}>titular</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: paletteResolved.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {holder}
            </div>
          </div>

          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              background: rewardAvailable ? accentColor : rewardBg,
              color: rewardAvailable ? paletteResolved.text : rewardText,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {rewardAvailable ? "Felicitări! " : ""}
            {reward}
          </div>
        </div>
      </div>
    </div>
  );
}

