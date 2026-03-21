"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  programId: string;
  programTitle: string;
  className?: string;
};

export function DeleteProgramButton({ programId, programTitle, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      `Ștergi cardul „${programTitle}”? Clienții înrolați la acest program își pierd progresul pe acest card.`
    );
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/program/${programId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        window.alert(data.error === "delete_failed" ? "Nu s-a putut șterge cardul." : "Eroare la ștergere.");
        return;
      }
      router.refresh();
      router.push("/dashboard/card");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      title="Șterge cardul"
      className={
        className ??
        "inline-flex items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-white)] p-2 text-[var(--c-muted)] hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] hover:bg-[rgba(200,75,47,0.06)] transition-colors disabled:opacity-50"
      }
    >
      <Trash2 className="w-4 h-4" aria-hidden />
      <span className="sr-only">Șterge cardul</span>
    </button>
  );
}
