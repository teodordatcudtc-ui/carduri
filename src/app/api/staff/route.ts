import { createClient } from "@/lib/supabase/server";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
    }

    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email + parolă minim 6 caractere sunt obligatorii." },
        { status: 400 }
      );
    }

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id, user_id")
      .eq("user_id", user.id)
      .single();
    if (!merchant) {
      return NextResponse.json({ error: "Comerciant negăsit." }, { status: 404 });
    }

    let admin;
    try {
      admin = createServiceRoleSupabase();
    } catch (e) {
      console.error("[api/staff] service role:", e);
      return NextResponse.json(
        { error: "Server misconfigurat: lipsește SUPABASE_SERVICE_ROLE_KEY în .env.local." },
        { status: 500 }
      );
    }

    const createUserRes = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });
    if (createUserRes.error || !createUserRes.data.user) {
      return NextResponse.json(
        { error: createUserRes.error?.message ?? "Nu am putut crea contul." },
        { status: 400 }
      );
    }

    const { error: staffErr } = await admin.from("merchant_staff").insert({
      merchant_id: merchant.id,
      user_id: createUserRes.data.user.id,
      role: "staff",
    });
    if (staffErr) {
      return NextResponse.json({ error: staffErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare server." },
      { status: 500 }
    );
  }
}

