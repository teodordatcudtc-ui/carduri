/**
 * Google încarcă imaginile hero și validează linkurile de pe serverele lor.
 * localhost / http → eșec la „Save to Wallet” (Something went wrong).
 */
export function getWalletPublicBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_WALLET_PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";
  return raw.replace(/\/$/, "");
}

export function isWalletPublicHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    if (
      h === "localhost" ||
      h.endsWith(".local") ||
      h.startsWith("127.") ||
      h === "0.0.0.0"
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Google recomandă max ~9 caractere pentru label la LoyaltyPoints. */
export function truncateLoyaltyLabel(s: string, maxChars = 9): string {
  const t = s.trim();
  if (!t) return "";
  const chars = Array.from(t);
  if (chars.length <= maxChars) return t;
  return chars.slice(0, maxChars).join("");
}
