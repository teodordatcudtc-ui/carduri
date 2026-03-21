"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type ConfirmProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function StampioConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmă",
  cancelLabel = "Anulează",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmProps) {
  const titleId = useId();
  const descId = useId();
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = window.setTimeout(() => confirmBtnRef.current?.focus(), 50);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    return undefined;
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]" role="presentation">
          <motion.button
            type="button"
            aria-label="Închide"
            className="absolute inset-0 bg-[var(--c-black)]/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !loading && onOpenChange(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              className="pointer-events-auto w-full max-w-[420px] rounded-[14px] border border-[var(--c-border)] bg-[var(--c-white)] shadow-[0_20px_50px_rgba(17,17,16,0.14)]"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-6">
                <div className="flex gap-3">
                  {variant === "destructive" && (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "var(--c-accent-lt)", color: "var(--c-danger)" }}
                      aria-hidden
                    >
                      <AlertTriangle className="h-5 w-5" strokeWidth={2} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2
                      id={titleId}
                      className="text-[15px] font-bold leading-tight tracking-tight text-[var(--c-black)]"
                    >
                      {title}
                    </h2>
                    <div
                      id={descId}
                      className="mt-2 text-[13px] leading-relaxed text-[var(--c-muted)]"
                    >
                      {description}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={loading}
                    className="btn btn-md btn-outline w-full sm:w-auto"
                    onClick={() => onOpenChange(false)}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    ref={confirmBtnRef}
                    type="button"
                    disabled={loading}
                    className="btn btn-md w-full sm:w-auto"
                    style={
                      variant === "destructive"
                        ? {
                            background: "var(--c-danger)",
                            color: "#fff",
                            border: "none",
                          }
                        : {
                            background: "var(--c-accent)",
                            color: "#fff",
                            border: "none",
                          }
                    }
                    onClick={() => void onConfirm()}
                  >
                    {loading ? "Se șterge…" : confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

type AlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: React.ReactNode;
  buttonLabel?: string;
};

export function StampioAlertDialog({
  open,
  onOpenChange,
  title = "Eroare",
  message,
  buttonLabel = "OK",
}: AlertProps) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    return undefined;
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]" role="presentation">
          <motion.button
            type="button"
            aria-label="Închide"
            className="absolute inset-0 bg-[var(--c-black)]/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              className="pointer-events-auto w-full max-w-[400px] rounded-[14px] border border-[var(--c-border)] bg-[var(--c-white)] shadow-[0_20px_50px_rgba(17,17,16,0.14)]"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-6">
                <div className="flex gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(214,59,38,0.12)", color: "var(--c-danger)" }}
                    aria-hidden
                  >
                    <AlertTriangle className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2
                      id={titleId}
                      className="text-[15px] font-bold leading-tight text-[var(--c-black)]"
                    >
                      {title}
                    </h2>
                    <p id={descId} className="mt-2 text-[13px] leading-relaxed text-[var(--c-muted)]">
                      {message}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="btn btn-md btn-accent"
                    onClick={() => onOpenChange(false)}
                  >
                    {buttonLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
