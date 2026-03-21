"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Scan } from "lucide-react";

const TITLE_BY_PREFIX: { prefix: string; title: string }[] = [
  { prefix: "/dashboard/onboarding", title: "Onboarding" },
  { prefix: "/dashboard/settings", title: "Setări companie" },
  { prefix: "/dashboard/clients", title: "Clienți" },
  { prefix: "/dashboard/card", title: "Carduri" },
  { prefix: "/dashboard/qr", title: "QR Înrolare" },
  { prefix: "/dashboard/scan", title: "Scanează client" },
  { prefix: "/dashboard/staff", title: "Angajați" },
  { prefix: "/dashboard", title: "Dashboard" },
];

function titleForPath(pathname: string): string {
  const p = pathname.replace(/\/$/, "") || "/dashboard";
  for (const { prefix, title } of TITLE_BY_PREFIX) {
    if (prefix === "/dashboard") {
      if (p === "/dashboard") return title;
      continue;
    }
    if (p === prefix || p.startsWith(`${prefix}/`)) return title;
  }
  return "Dashboard";
}

export function DashboardTopbar() {
  const pathname = usePathname() ?? "/dashboard";
  const title = titleForPath(pathname);

  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-ink-15 bg-paper px-6 py-3.5 md:px-7">
      <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard/qr"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-ink-15 bg-paper px-3 text-xs font-semibold text-ink no-underline transition hover:bg-ink-6 md:gap-2 md:px-4 md:text-[13px]"
        >
          <Download className="h-3.5 w-3.5 md:h-[13px] md:w-[13px]" aria-hidden />
          <span className="hidden sm:inline">Export</span>
        </Link>
        <Link
          href="/dashboard/scan"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-coral px-3 text-xs font-semibold text-paper no-underline transition hover:bg-coral-dark md:gap-2 md:px-4 md:text-[13px]"
        >
          <Scan className="h-3.5 w-3.5 md:h-[13px] md:w-[13px]" aria-hidden />
          <span className="hidden sm:inline">Scanează client</span>
          <span className="sm:hidden">Scan</span>
        </Link>
      </div>
    </header>
  );
}
