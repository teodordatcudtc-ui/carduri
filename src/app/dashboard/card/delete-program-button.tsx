"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { StampyAlertDialog, StampyConfirmDialog } from "@/components/ui/stampy-modal";

type Props = {
  programId: string;
  programTitle: string;
  className?: string;
};

export function DeleteProgramButton({ programId, programTitle, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/program/${programId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setConfirmOpen(false);
        setErrorMessage(
          data.error === "delete_failed" ? "Nu s-a putut șterge cardul." : "Eroare la ștergere."
        );
        return;
      }
      setConfirmOpen(false);
      router.refresh();
      router.push("/dashboard/card");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirmOpen(true);
        }}
        disabled={loading}
        title="Șterge acest card"
        className={
          className ??
          "inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-[rgba(214,59,38,0.55)] bg-[#fff5f3] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--c-danger)] shadow-sm transition-colors hover:bg-[#ffeae6] hover:border-[var(--c-danger)] disabled:opacity-50 sm:min-h-[36px]"
        }
      >
        <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>Șterge</span>
      </button>

      <StampyConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Ștergi acest card?"
        description={
          <>
            Ștergi cardul <span className="font-semibold text-[var(--c-black)]">„{programTitle}”</span>?
            Clienții înrolați la acest program își pierd progresul pe acest card.
          </>
        }
        confirmLabel="Șterge cardul"
        cancelLabel="Anulează"
        variant="destructive"
        loading={loading}
        onConfirm={runDelete}
      />

      <StampyAlertDialog
        open={errorMessage !== null}
        onOpenChange={(open) => {
          if (!open) setErrorMessage(null);
        }}
        title="Nu s-a putut șterge"
        message={errorMessage ?? ""}
        buttonLabel="Am înțeles"
      />
    </>
  );
}
