import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // Implementarea implicită din @supabase/ssr (cookie.parse / serialize) persistă
  // corect sesiunea pentru SSR; un string manual pe document.cookie o strica.
  return createBrowserClient(url, key);
}
