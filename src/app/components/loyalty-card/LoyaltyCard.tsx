/* eslint-disable react/no-array-index-key */
"use client";

import React, { useMemo } from "react";
import {
  Check,
  Coffee,
  CupSoda,
  Gift,
  Scissors,
  Star,
  UtensilsCrossed,
} from "lucide-react";

type TemplateId = "minimal" | "split" | "corner" | "lines" | "dots" | "mesh";
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
type CardLayoutId = "compact" | "hero";
type StampVariantId = "brand" | "contrast";

type Palette = {
  bg: string;
  bg2: string;
  /** A treia culoare: mesh, accente, al treilea strat în gradient */
  bg3: string;
  text: string;
  subOpacity: number;
};

const PALETTES: Record<Exclude<PaletteId, "custom">, Palette> = {
  ink: { bg: "#111110", bg2: "#1E1E1C", bg3: "#2A2A28", text: "#FFFFFF", subOpacity: 0.55 },
  sand: { bg: "#F5F0E8", bg2: "#EAE3D5", bg3: "#DDD5C8", text: "#111110", subOpacity: 0.45 },
  terracotta: {
    bg: "#C84B2F",
    bg2: "#A33A20",
    bg3: "#7E2E18",
    text: "#FFFFFF",
    subOpacity: 0.6,
  },
  sage: { bg: "#2E4D3E", bg2: "#1E3329", bg3: "#15261F", text: "#FFFFFF", subOpacity: 0.5 },
  slate: { bg: "#1C2B3A", bg2: "#142030", bg3: "#0E1824", text: "#FFFFFF", subOpacity: 0.5 },
  chalk: { bg: "#FAFAF8", bg2: "#F0EDE6", bg3: "#E6E0D6", text: "#111110", subOpacity: 0.4 },
  plum: { bg: "#2D1B3D", bg2: "#200F2E", bg3: "#160A22", text: "#FFFFFF", subOpacity: 0.5 },
  navy: { bg: "#0D1F35", bg2: "#081529", bg3: "#050E18", text: "#FFFFFF", subOpacity: 0.5 },
};

const EMPTY_LUCIDE: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  coffee: Coffee,
  burger: UtensilsCrossed,
  scissors: Scissors,
  gift: Gift,
  star: Star,
  cup: CupSoda,
};

function renderEmptyStampGlyph({
  iconKey,
  size,
  color,
  logoUrl,
}: {
  iconKey: string;
  size: number;
  color: string;
  logoUrl: string | null;
}) {
  const k =
    iconKey === "logo" && !logoUrl ? "coffee" : iconKey === "logo" && logoUrl ? "logo" : iconKey || "coffee";
  if (k === "logo" && logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        style={{ width: size * 0.58, height: size * 0.58, objectFit: "contain" }}
      />
    );
  }
  const Icon = EMPTY_LUCIDE[k] ?? Coffee;
  return <Icon size={size * 0.58} color={color} strokeWidth={2} aria-hidden />;
}

function normalizeHex(hex: string) {
  const h = hex.trim();
  if (!h.startsWith("#")) return h;
  if (h.length === 4) {
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
  const srgb = [r, g, b].map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function getTextColorForBg(bgHex: string) {
  const lum = relativeLuminance(hexToRgb(bgHex));
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

function MeshGradientLayer({ bg, bg2, bg3 }: { bg: string; bg2: string; bg3: string }) {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox="0 0 340 210"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="mesh-a" cx="15%" cy="15%" r="65%">
          <stop offset="0%" stopColor={bg2} stopOpacity={0.95} />
          <stop offset="55%" stopColor={bg3} stopOpacity={0.35} />
          <stop offset="100%" stopColor={bg} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="mesh-b" cx="85%" cy="20%" r="55%">
          <stop offset="0%" stopColor={bg3} stopOpacity={0.85} />
          <stop offset="70%" stopColor={bg2} stopOpacity={0.2} />
          <stop offset="100%" stopColor={bg} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="mesh-c" cx="70%" cy="95%" r="60%">
          <stop offset="0%" stopColor={bg2} stopOpacity={0.9} />
          <stop offset="60%" stopColor={bg3} stopOpacity={0.35} />
          <stop offset="100%" stopColor={bg} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width="340" height="210" fill={bg} />
      <ellipse cx="90" cy="50" rx="160" ry="110" fill="url(#mesh-a)" style={{ mixBlendMode: "screen" }} />
      <ellipse cx="280" cy="45" rx="140" ry="100" fill="url(#mesh-b)" style={{ mixBlendMode: "soft-light" }} />
      <ellipse cx="220" cy="200" rx="150" ry="90" fill="url(#mesh-c)" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}

function NoiseOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.09,
        mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px 180px",
      }}
    />
  );
}

function BackgroundSvg({
  template,
  bg,
  bg2,
  bg3,
}: {
  template: TemplateId;
  bg: string;
  bg2: string;
  bg3: string;
}) {
  if (template === "mesh") {
    return (
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 340 210"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mesh-base" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={bg} />
            <stop offset="50%" stopColor={bg2} />
            <stop offset="100%" stopColor={bg3} />
          </linearGradient>
        </defs>
        <rect width="340" height="210" fill="url(#mesh-base)" />
      </svg>
    );
  }

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
        <circle cx="310" cy="160" r="60" fill={bg3} opacity="0.45" />
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
        <line x1="0" y1="140" x2="340" y2="100" stroke={bg2} strokeWidth="40" opacity="0.5" />
        <line x1="0" y1="180" x2="340" y2="140" stroke={bg2} strokeWidth="20" opacity="0.35" />
      </svg>
    );
  }

  if (template === "dots") {
    const dots: React.ReactNode[] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 9; c++) {
        dots.push(
          <circle key={`${r}-${c}`} cx={c * 40 + 20} cy={r * 38 + 10} r="10" fill={bg2} opacity="0.3" />
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
  emptyIconKey,
  filledIconKey,
  stampShape,
  stampStyle,
  logoUrl,
  accentColor,
  textColor,
  stampVariant,
}: {
  size: number;
  filled: boolean;
  emptyIconKey: string;
  filledIconKey: string;
  stampShape: StampShapeId;
  stampStyle: StampStyleId;
  logoUrl: string | null;
  accentColor: string;
  textColor: string;
  stampVariant: StampVariantId;
}) {
  const contrast = stampVariant === "contrast";
  const emptyBg = withAlpha(textColor, contrast ? 0 : 0.12);
  const emptyIconColor = contrast ? textColor : withAlpha(textColor, 0.22);

  const filledBg = contrast
    ? "#FFFFFF"
    : stampStyle === "solid"
      ? accentColor
      : stampStyle === "soft"
        ? withAlpha(accentColor, 0.2)
        : "transparent";

  const filledBorder =
    !contrast && (stampStyle === "outline" || stampStyle === "soft") ? accentColor : null;

  const checkColor = contrast ? "#0D1F35" : stampStyle === "outline" ? accentColor : stampStyle === "soft" ? accentColor : textColor;

  const iconColor = stampStyle === "outline" ? accentColor : stampStyle === "soft" ? accentColor : textColor;

  const showFilledContent = () => {
    if (contrast) {
      if (filledIconKey === "dot") {
        return (
          <span style={{ fontSize: size * 0.42, color: checkColor, fontWeight: 800, lineHeight: 1 }}>
            •
          </span>
        );
      }
      return (
        <Check size={size * 0.5} color={checkColor} strokeWidth={2.5} aria-hidden />
      );
    }
    if (filled && logoUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" style={{ width: size * 0.6, height: size * 0.6, objectFit: "contain" }} />
      );
    }
    if (filledIconKey === "same") {
      return renderEmptyStampGlyph({
        iconKey: emptyIconKey,
        size,
        color: iconColor,
        logoUrl,
      });
    }
    if (filledIconKey === "dot") {
      return (
        <span style={{ fontSize: size * 0.42, color: iconColor, fontWeight: 700, lineHeight: 1 }}>•</span>
      );
    }
    return <Check size={size * 0.5} color={iconColor} strokeWidth={2.5} aria-hidden />;
  };

  const showEmptyContent = () =>
    renderEmptyStampGlyph({ iconKey: emptyIconKey, size, color: emptyIconColor, logoUrl });

  const common = {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden" as const,
  };

  const contrastEmptyBorder = contrast ? `2px solid ${withAlpha(textColor, 0.85)}` : undefined;
  const contrastFilledBorder = contrast ? "none" : undefined;

  if (stampShape === "circle") {
    return (
      <div
        style={{
          ...common,
          borderRadius: 999,
          background: filled ? filledBg : emptyBg,
          border:
            filled && filledBorder
              ? `1.5px solid ${filledBorder}`
              : contrastEmptyBorder ?? (filled ? contrastFilledBorder : "none"),
        }}
      >
        {filled ? showFilledContent() : showEmptyContent()}
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
          border:
            filled && filledBorder
              ? `1.5px solid ${filledBorder}`
              : contrastEmptyBorder ?? (filled ? contrastFilledBorder : "none"),
        }}
      >
        {filled ? showFilledContent() : showEmptyContent()}
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
          border:
            filled && filledBorder
              ? `1.5px solid ${filledBorder}`
              : contrastEmptyBorder ?? (filled ? contrastFilledBorder : "none"),
        }}
      >
        <div
          style={{
            transform: "rotate(-45deg)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {filled ? showFilledContent() : showEmptyContent()}
        </div>
      </div>
    );
  }

  const clip = "polygon(50% 0%,93.3% 25%,93.3% 75%,50% 100%,6.7% 75%,6.7% 25%)";
  const borderShadow = filled && filledBorder ? `inset 0 0 0 1.5px ${filledBorder}` : "none";
  const background = filled ? filledBg : emptyBg;

  return (
    <div
      style={{
        ...common,
        clipPath: clip,
        background,
        boxShadow: borderShadow === "none" ? undefined : borderShadow,
        border: !filled && contrast ? contrastEmptyBorder : undefined,
      }}
    >
      {filled ? showFilledContent() : showEmptyContent()}
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
  customBg3Color?: string | null;
  rewardAvailable?: boolean;
  layout?: CardLayoutId | null;
  noise?: boolean;
  meshGradient?: boolean;
  footerColor?: string | null;
  badgeColor?: string | null;
  badgeLetter?: string | null;
  stampVariant?: StampVariantId | null;
  emptyStampIcon?: string | null;
  filledStampIcon?: string | null;
  showSubtitle?: boolean;
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
  customBg3Color = null,
  rewardAvailable = false,
  layout = "compact",
  noise = false,
  meshGradient = false,
  footerColor = null,
  badgeColor = null,
  badgeLetter = null,
  stampVariant = "brand",
  emptyStampIcon = "coffee",
  filledStampIcon = "check",
  showSubtitle = true,
}: LoyaltyCardDesignProps) {
  const paletteResolved = useMemo(() => {
    if (palette === "custom") {
      const bg = customBgColor ?? "#F5F0E8";
      const bg2 = customBg2Color ?? "#EAE3D5";
      const bg3 = customBg3Color ?? bg2;
      const text = getTextColorForBg(bg);
      return { bg, bg2, bg3, text, subOpacity: 0.5 } as Palette;
    }
    const p = PALETTES[palette as Exclude<PaletteId, "custom">] ?? PALETTES.ink;
    return p;
  }, [palette, customBgColor, customBg2Color, customBg3Color]);

  const stampSize = computeStampSize(totalStamps);
  const gap = computeGap(stampSize);
  const variant = (stampVariant ?? "brand") as StampVariantId;
  const emptyKey = emptyStampIcon ?? "coffee";
  const filledKey = filledStampIcon ?? "check";

  const rewardBg = withAlpha(accentColor, 0.25);
  const rewardText = paletteResolved.text;
  const subtitleColor = withAlpha(paletteResolved.text, paletteResolved.subOpacity);

  const footerBg = footerColor ?? "#1A1D24";
  const badgeBg = badgeColor ?? accentColor;
  const letter =
    (badgeLetter && badgeLetter.trim().slice(0, 1).toUpperCase()) ||
    (brand.trim().slice(0, 1).toUpperCase() || "S");

  const tpl = (template ?? "minimal") as TemplateId;
  const isHero = layout === "hero";

  const stampsRow = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap,
        alignItems: "center",
        justifyContent: isHero ? "center" : "flex-start",
        flex: isHero ? 1 : undefined,
        alignContent: "center",
        minHeight: isHero ? 0 : undefined,
      }}
    >
      {Array.from({ length: totalStamps }).map((_, idx) => {
        const filled = idx < filledStamps;
        return (
          <Stamp
            key={idx}
            size={stampSize}
            filled={filled}
            emptyIconKey={emptyKey}
            filledIconKey={filledKey === "same" ? "same" : filledKey === "dot" ? "dot" : "check"}
            stampShape={(stampShape ?? "circle") as StampShapeId}
            stampStyle={(stampStyle ?? "solid") as StampStyleId}
            logoUrl={logoUrl}
            accentColor={accentColor}
            textColor={paletteResolved.text}
            stampVariant={variant}
          />
        );
      })}
    </div>
  );

  const headerBlock = (
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
        {showSubtitle && (
          <div style={{ fontSize: 10, color: subtitleColor, opacity: 0.95, marginTop: 2 }}>
            Card de fidelitate digital
          </div>
        )}
      </div>

      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: badgeBg,
          color: getTextColorForBg(badgeBg),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
        aria-hidden="true"
      >
        {letter}
      </div>
    </div>
  );

  const footerHero = (
    <div
      style={{
        flexShrink: 0,
        padding: "14px 18px",
        background: footerBg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 12,
        borderTop: `1px solid ${withAlpha(footerBg, 0.3)}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: withAlpha("#FFFFFF", 0.55), fontWeight: 400 }}>titular</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#FFFFFF",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {holder}
        </div>
      </div>
      <div style={{ textAlign: "right", minWidth: 0 }}>
        <div style={{ fontSize: 10, color: withAlpha("#FFFFFF", 0.55), fontWeight: 400 }}>Recompensa</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#FFFFFF",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 160,
          }}
        >
          {reward}
        </div>
      </div>
    </div>
  );

  const footerCompact = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: withAlpha(paletteResolved.text, 0.45), fontWeight: 400 }}>titular</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: paletteResolved.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
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
  );

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <BackgroundSvg template={tpl} bg={paletteResolved.bg} bg2={paletteResolved.bg2} bg3={paletteResolved.bg3} />
        {meshGradient && (
          <MeshGradientLayer bg={paletteResolved.bg} bg2={paletteResolved.bg2} bg3={paletteResolved.bg3} />
        )}
        {noise && <NoiseOverlay />}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: 22,
            justifyContent: isHero ? "flex-start" : "space-between",
            gap: isHero ? 12 : undefined,
          }}
        >
          {headerBlock}
          {stampsRow}
          {!isHero && footerCompact}
        </div>
      </div>
      {isHero && footerHero}
    </div>
  );
}
