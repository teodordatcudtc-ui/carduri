import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

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
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-surface md:grid md:min-h-screen md:grid-cols-[192px_1fr]">
      <aside className="dash-sidebar">
        <DashboardSidebar merchant={merchant} />
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface">
        <DashboardTopbar />
        <main className="dash-scroll flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 md:px-7">
          {children}
        </main>
      </div>
    </div>
  );
}
