import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient(url, key, {
    // Persistăm sesiunea în cookies, ca serverul (SSR) să o poată citi.
    // Fără asta, serverul vede mereu user-ul ca fiind "log out".
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];
        const parts = document.cookie ? document.cookie.split("; ") : [];
        return parts
          .map((c) => {
            const idx = c.indexOf("=");
            if (idx < 0) return null;
            const name = c.slice(0, idx);
            const value = c.slice(idx + 1);
            return { name, value };
          })
          .filter(Boolean) as { name: string; value: string }[];
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, any>;
        }[]
      ) {
        if (typeof document === "undefined") return;

        cookiesToSet.forEach(({ name, value, options }) => {
          // `options` are aceeași formă ca pentru next/headers cookies,
          // dar în browser nu există `httpOnly` (ignorăm dacă e prezent).
          const opt = (options ?? {}) as Record<string, any>;

          const segments: string[] = [`${name}=${value}`];

          if (opt.path) segments.push(`Path=${opt.path}`);
          if (typeof opt.maxAge === "number") segments.push(`Max-Age=${opt.maxAge}`);
          if (opt.expires instanceof Date) segments.push(`Expires=${opt.expires.toUTCString()}`);
          if (opt.domain) segments.push(`Domain=${opt.domain}`);
          if (opt.secure) segments.push("Secure");
          if (opt.sameSite) segments.push(`SameSite=${opt.sameSite}`);

          document.cookie = segments.join("; ");
        });
      },
    },
  });
}
