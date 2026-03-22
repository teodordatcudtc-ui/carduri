/** URL imagine hero pentru Google Wallet — `v` schimbă la fiecare ștampilă ca să refetch-uiască Google. */
export function buildStampHeroImageUrl(
  baseUrl: string,
  passId: string,
  stampCount: number
): string {
  const b = baseUrl.replace(/\/$/, "");
  return `${b}/api/wallet/google/stamp-hero?pass_id=${encodeURIComponent(passId)}&v=${stampCount}`;
}
