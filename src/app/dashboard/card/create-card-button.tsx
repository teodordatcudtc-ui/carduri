"use client";

import { useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline";
};

/**
 * Creează program prin API (JSON), apoi navigare completă la card.
 * Evită redirect-urile 303 opace la fetch și cache-ul RSC.
 */
export function CreateCardButton({ children, className, variant = "primary" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/programs", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        programId?: string;
        redirectTo?: string;
        error?: string;
        message?: string;
      };

      if (res.ok && data.ok && data.programId) {
        const url =
          data.redirectTo ?? `${window.location.origin}/dashboard/card?program=${data.programId}`;
        window.location.assign(url);
        return;
      }

      if (data.error === "multi_program_migration") {
        window.location.assign("/dashboard/card?error=multi_program_migration");
        return;
      }

      setError(
        data.message ||
          (data.error === "insert_failed" ? "Nu s-a putut crea cardul." : "Eroare la creare.")
      );
    } catch {
      setError("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  }

  const base =
    variant === "primary"
      ? "btn btn-md btn-accent px-8"
      : "text-sm font-medium px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-white)] hover:bg-[var(--c-sand)] transition-colors";

  return (
    <div className="inline-block text-left">
      <button type="button" disabled={loading} onClick={handleClick} className={className ?? base}>
        {loading ? "Se creează…" : children}
      </button>
      {error && (
        <p className="mt-3 text-sm text-[var(--c-accent)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
