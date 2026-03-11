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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold text-brand-400">
            StampIO
          </Link>
          <p className="mt-2 text-stone-400 text-sm">
            Autentificare comerciant
          </p>
        </div>
        <form
          className="space-y-4 rounded-xl border border-stone-700/50 bg-stone-900/50 p-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="rounded-lg bg-red-500/10 text-red-400 text-sm p-3">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg bg-green-500/10 text-green-400 text-sm p-3">
              {message}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="tu@afacere.ro"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-1">
              Parolă
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
            >
              {loading ? "Se încarcă..." : "Autentificare"}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 border border-stone-600 text-stone-300 hover:border-brand-500 hover:text-brand-400 py-2 rounded-lg font-medium transition"
            >
              Înregistrare
            </button>
          </div>
          <div className="relative">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-600" />
            </span>
            <span className="relative flex justify-center text-xs text-stone-500">
              sau
            </span>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 border border-stone-600 text-stone-300 hover:border-stone-500 hover:text-white py-2 rounded-lg font-medium transition"
          >
            Continuă cu Google
          </button>
        </form>
        <p className="text-center text-stone-500 text-sm">
          <Link href="/" className="hover:text-stone-400">
            ← Înapoi la prima pagină
          </Link>
        </p>
      </div>
    </div>
  );
}
