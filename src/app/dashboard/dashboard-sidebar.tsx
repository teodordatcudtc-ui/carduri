"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  QrCode,
  Scan,
  Users,
  UserCircle2,
  LogOut,
  Settings,
} from "lucide-react";

type Merchant = { business_name: string } | null;

function navClass(active: boolean) {
  return `dash-nav-item${active ? " active" : ""}`;
}

export function DashboardSidebar({ merchant }: { merchant: Merchant }) {
  const pathname = usePathname() ?? "";

  const active = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname === "/dashboard/" ||
        pathname.startsWith("/dashboard/onboarding")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <Link
        href="/"
        className="dash-sidebar-logo no-underline text-inherit hover:opacity-90 transition-opacity"
      >
        <span className="dash-sb-mark" aria-hidden>
          <span className="dash-sb-mark-dot" />
        </span>
        <span className="dash-sb-wordmark">
          Stamp<span className="text-[var(--c-accent)]">IO</span>
        </span>
      </Link>
      {merchant?.business_name ? (
        <div className="dash-sidebar-biz">
          <div className="dash-sidebar-biz-label">Locație activă</div>
          <div className="dash-sidebar-biz-name">{merchant.business_name}</div>
        </div>
      ) : null}
      <nav className="flex-1">
        <Link href="/dashboard" className={navClass(active("/dashboard"))}>
          <LayoutDashboard aria-hidden />
          Dashboard
        </Link>
        {merchant && (
          <>
            <Link href="/dashboard/card" className={navClass(active("/dashboard/card"))}>
              <CreditCard aria-hidden />
              Carduri
            </Link>
            <Link href="/dashboard/scan" className={navClass(active("/dashboard/scan"))}>
              <Scan aria-hidden />
              Scanează
            </Link>
            <Link href="/dashboard/qr" className={navClass(active("/dashboard/qr"))}>
              <QrCode aria-hidden />
              QR Înrolare
            </Link>
            <Link href="/dashboard/staff" className={navClass(active("/dashboard/staff"))}>
              <Users aria-hidden />
              Angajați
            </Link>
            <Link href="/dashboard/clients" className={navClass(active("/dashboard/clients"))}>
              <UserCircle2 aria-hidden />
              Clienți
            </Link>
            <Link
              href="/dashboard/settings"
              className={navClass(active("/dashboard/settings"))}
            >
              <Settings aria-hidden />
              Setări
            </Link>
          </>
        )}
      </nav>
      <div className="dash-sidebar-footer">
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-md btn-dash-ghost">
            <LogOut className="w-4 h-4" />
            Deconectează
          </button>
        </form>
      </div>
    </>
  );
}
