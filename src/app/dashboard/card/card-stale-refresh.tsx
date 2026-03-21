"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * După POST → redirect la ?program=..., uneori RSC rămâne cu date vechi (0 carduri).
 * Dacă URL-ul are program dar încă suntem pe empty state, forțăm un refresh.
 */
export function CardStaleRefresh() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const program = searchParams.get("program");
    const err = searchParams.get("error");
    if (!program || err) return;
    ran.current = true;
    router.refresh();
  }, [searchParams, router]);

  return null;
}
