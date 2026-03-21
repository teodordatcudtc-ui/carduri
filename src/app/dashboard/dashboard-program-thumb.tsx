"use client";

import LoyaltyCard from "@/app/components/loyalty-card/LoyaltyCard";
import type { LoyaltyCardDesignProps } from "@/app/components/loyalty-card/LoyaltyCard";

/** Miniatură reală a cardului (design LoyaltyCard), pentru listă dashboard. */
export function DashboardProgramThumb({ props }: { props: LoyaltyCardDesignProps }) {
  return (
    <div
      className="relative h-[50px] w-[82px] shrink-0 overflow-hidden rounded-[8px] border border-ink-15 bg-paper shadow-[0_2px_8px_rgba(17,17,16,0.08)] ring-1 ring-black/5"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ transform: "scale(0.228)", width: 360 }}
      >
        <LoyaltyCard {...props} />
      </div>
    </div>
  );
}
