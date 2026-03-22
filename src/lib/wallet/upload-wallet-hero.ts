import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "wallet-images";

/**
 * Încarcă PNG-ul hero pe Storage; același path per pass → upsert (înlocuiește versiunea veche).
 * URL public HTTPS — potrivit pentru Google Wallet fetch.
 */
export async function uploadWalletHeroPng(
  supabase: SupabaseClient,
  merchantId: string,
  passId: string,
  buffer: Buffer
): Promise<string> {
  const path = `stamps/${merchantId}/${passId}/hero.png`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("getPublicUrl lipsă");
  return data.publicUrl;
}
