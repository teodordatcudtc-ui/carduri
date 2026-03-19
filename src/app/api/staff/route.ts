import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServiceClient();
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

    const adminClient = supabase.auth.admin;
    const createUserRes = await adminClient.createUser({
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

    const { error: staffErr } = await supabase.from("merchant_staff").insert({
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

