"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) throw signError;
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la autentificare");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (signError) throw signError;
      setMessage("Verifică email-ul pentru linkul de confirmare.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la înregistrare");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex justify-center no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-stampy.svg"
              alt="Stampy"
              width={160}
              height={34}
              className="mx-auto h-9 w-auto"
            />
          </Link>
          <p className="mt-2 text-[var(--c-muted)] text-sm">Autentificare comerciant</p>
        </div>

        <form className="space-y-4 card card-sm" onSubmit={handleSubmit}>
          {error && (
            <div
              className="rounded-lg text-sm p-3"
              style={{
                background: "rgba(242,101,69,0.08)",
                color: "var(--c-accent-dark)",
                border: "1px solid rgba(242,101,69,0.25)",
              }}
            >
              {error}
            </div>
          )}
          {message && (
            <div
              className="rounded-lg text-sm p-3"
              style={{
                background: "rgba(77,124,106,0.10)",
                color: "var(--c-sage)",
                border: "1px solid rgba(77,124,106,0.25)",
              }}
            >
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="field-label" style={{ display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="field-input"
              placeholder="tu@afacere.ro"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label" style={{ display: "block", marginBottom: 6 }}>
              Parolă
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="field-input"
              placeholder="parola"
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={loading} className="btn btn-md btn-accent" style={{ flex: 1 }}>
              {loading ? "Se încarcă..." : "Autentificare"}
            </button>
            <button type="button" onClick={handleSignUp} disabled={loading} className="btn btn-md btn-outline" style={{ flex: 1 }}>
              Înregistrare
            </button>
          </div>

          <div className="flex items-center gap-3" style={{ marginTop: 6 }}>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: 11, color: "var(--c-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>sau</span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-md btn-outline btn-full"
          >
            Continuă cu Google
          </button>
        </form>

        <p className="text-center text-sm">
          <Link href="/" className="text-[var(--c-muted)] hover:text-[var(--c-black)] transition">
            ← Înapoi la prima pagină
          </Link>
        </p>
      </div>
    </div>
  );
}
