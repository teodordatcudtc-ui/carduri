import { canAccessDashboard } from "@/lib/subscription";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (user && path.startsWith("/dashboard")) {
    const onboarding = path.startsWith("/dashboard/onboarding");
    const billing = path.startsWith("/dashboard/billing");

    // Folosește * ca să nu pice query-ul dacă migrarea 009 nu e aplicată încă
    // (select pe coloane inexistente → eroare → merchant null → loop la onboarding).
    const { data: merchant } = await supabase
      .from("merchants")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!merchant) {
      if (!onboarding) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/onboarding";
        return NextResponse.redirect(url);
      }
    } else if (!canAccessDashboard(merchant) && !billing && !onboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/billing";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
