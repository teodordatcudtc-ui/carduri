import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CreditCard,
  QrCode,
  Scan,
  Users,
  LogOut,
  Settings,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, business_name, slug")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen flex bg-[var(--c-sand)]">
      <div className="dash-layout w-full">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-logo">
            <div className="dash-sidebar-dot" />
            StampIO
          </div>
          <nav className="flex-1">
            <Link href="/dashboard" className="dash-nav-item">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            {merchant && (
              <>
                <Link
                  href="/dashboard/settings"
                  className="dash-nav-item"
                >
                  <Settings className="w-4 h-4" />
                  Setări
                </Link>
                <Link href="/dashboard/card" className="dash-nav-item">
                  <CreditCard className="w-4 h-4" />
                  Card
                </Link>
                <Link href="/dashboard/qr" className="dash-nav-item">
                  <QrCode className="w-4 h-4" />
                  QR înrolare
                </Link>
                <Link href="/dashboard/scan" className="dash-nav-item">
                  <Scan className="w-4 h-4" />
                  Scanează
                </Link>
                <Link href="/dashboard/staff" className="dash-nav-item">
                  <Users className="w-4 h-4" />
                  Angajați
                </Link>
              </>
            )}
          </nav>
          <div
            style={{
              marginTop: "auto",
              paddingTop: 12,
              borderTop: "1px solid var(--c-border)",
            }}
          >
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn btn-md btn-ghost">
                <LogOut className="w-4 h-4" />
                Deconectare
              </button>
            </form>
          </div>
        </aside>
        <main className="dash-main">
          {children}
        </main>
      </div>
    </div>
  );
}
