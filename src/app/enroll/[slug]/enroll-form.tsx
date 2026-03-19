"use client";

import { useState } from "react";
import Link from "next/link";
import { Smartphone, Loader2 } from "lucide-react";

type Props = { slug: string; cardColor: string };

export function EnrollForm({
  slug,
  programId,
  cardColor,
}: Props & { programId: string }) {
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
          program_id: programId,
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
      <div className="rounded-b-xl border border-[var(--c-border)] bg-[var(--c-white)] p-6 space-y-4">
        <div
          className="rounded-lg text-sm p-3 text-center"
          style={{
            background: "rgba(77,124,106,0.10)",
            color: "var(--c-sage)",
            border: "1px solid rgba(77,124,106,0.25)",
          }}
        >
          {done.already_enrolled
            ? "Ai deja un card. Poți adăuga din nou în Wallet sau arată codul la casă."
            : "Cardul tău a fost creat. Arată codul la casă pentru ștampile."}
        </div>
        <div
          className="rounded-lg p-4 font-mono text-center text-lg tracking-wider break-all"
          style={{ background: "var(--c-sand)", color: "var(--c-black)" }}
        >
          {done.barcode_value}
        </div>
        <p className="field-hint text-xs text-center">
          Arată acest cod la casă la fiecare vizită pentru ștampile.
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={done.add_google_wallet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md btn-outline btn-full"
          >
            <Smartphone className="w-5 h-5" />
            Add to Google Wallet
          </a>
          <a
            href={done.add_apple_wallet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md btn-outline btn-full"
          >
            <Smartphone className="w-5 h-5" />
            Add to Apple Wallet
          </a>
          {done.pass_id && (
            <Link
              href={`/card/${done.pass_id}`}
              className="mt-2 text-center text-sm"
              style={{ color: "var(--c-accent)", textDecoration: "underline", textUnderlineOffset: 4 }}
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
      className="rounded-b-xl border border-[var(--c-border)] bg-[var(--c-white)] p-6 space-y-4"
    >
      {error && (
        <div
          className="rounded-lg text-sm p-3"
          style={{
            background: "rgba(200,75,47,0.08)",
            color: "var(--c-accent)",
            border: "1px solid rgba(200,75,47,0.25)",
          }}
        >
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">
          Nume *
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="field-input"
          placeholder="Numele tău"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Telefon *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="field-input"
          placeholder="07xx xxx xxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Email (opțional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
          placeholder="email@exemplu.ro"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-md btn-full"
        style={{
          backgroundColor: cardColor,
          color: "var(--c-white)",
          opacity: loading ? 0.7 : 1,
        }}
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
