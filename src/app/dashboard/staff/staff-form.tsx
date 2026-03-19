"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StaffForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setLoading(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setOk(true);
      setEmail("");
      setPassword("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eroare la creare cont.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-white)] p-4">
      <h2 className="font-semibold text-[var(--c-black)]">Adaugă angajat</h2>
      {error && (
        <div
          className="rounded-lg text-sm p-2"
          style={{
            background: "rgba(200,75,47,0.08)",
            color: "var(--c-accent)",
            border: "1px solid rgba(200,75,47,0.25)",
          }}
        >
          {error}
        </div>
      )}
      {ok && (
        <div
          className="rounded-lg text-sm p-2"
          style={{
            background: "rgba(77,124,106,0.10)",
            color: "var(--c-sage)",
            border: "1px solid rgba(77,124,106,0.25)",
          }}
        >
          Contul de angajat a fost creat.
        </div>
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="angajat@exemplu.ro"
        className="w-full field-input"
      />
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="parolă simplă (min 6)"
        className="w-full field-input"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full btn btn-md btn-accent"
      >
        {loading ? "Se creează..." : "Creează cont angajat"}
      </button>
    </form>
  );
}

