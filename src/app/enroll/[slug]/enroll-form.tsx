"use client";

import { useState } from "react";
import Link from "next/link";
import { Smartphone, Loader2 } from "lucide-react";

type Props = { slug: string; businessName: string; brandColor: string };

export function EnrollForm({ slug, businessName, brandColor }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    barcode_value: string;
    pass_id?: string;
    add_google_wallet_url: string;
    add_apple_wallet_url: string;
    stamps_required: number;
    reward_description: string;
    already_enrolled?: boolean;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          full_name: fullName.trim(),
          phone: phone.replace(/\s+/g, "").trim(),
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setDone(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la înrolare.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-b-xl border border-stone-700/50 bg-stone-900/30 p-6 space-y-4">
        <div className="rounded-lg bg-green-500/10 text-green-400 text-sm p-3 text-center">
          {done.already_enrolled
            ? "Ai deja un card. Poți adăuga din nou în Wallet sau arată codul la casă."
            : "Prima ta ștampilă a fost adăugată. Adaugă cardul în Wallet!"}
        </div>
        <div className="bg-stone-800 rounded-lg p-4 font-mono text-center text-white text-lg tracking-wider break-all">
          {done.barcode_value}
        </div>
        <p className="text-stone-400 text-xs text-center">
          Arată acest cod la casă la fiecare vizită pentru ștampile.
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={done.add_google_wallet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-stone-600 bg-stone-800 hover:bg-stone-700 text-white py-3 font-medium transition"
          >
            <Smartphone className="w-5 h-5" />
            Add to Google Wallet
          </a>
          <a
            href={done.add_apple_wallet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-stone-600 bg-stone-800 hover:bg-stone-700 text-white py-3 font-medium transition"
          >
            <Smartphone className="w-5 h-5" />
            Add to Apple Wallet
          </a>
          {done.pass_id && (
            <Link
              href={`/card/${done.pass_id}`}
              className="mt-2 text-center text-sm text-brand-400 hover:text-brand-300 underline underline-offset-4"
            >
              Vezi cardul tău în StampIO
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-b-xl border border-stone-700/50 bg-stone-900/30 p-6 space-y-4"
    >
      {error && (
        <div className="rounded-lg bg-red-500/10 text-red-400 text-sm p-3">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">
          Nume *
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Numele tău"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">
          Telefon *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="07xx xxx xxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">
          Email (opțional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-white placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="email@exemplu.ro"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg text-white py-3 font-medium transition disabled:opacity-50"
        style={{ backgroundColor: brandColor }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Obține cardul"
        )}
      </button>
    </form>
  );
}
