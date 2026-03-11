import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

function generateBarcode(): string {
  const part = uuidv4().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `SP-${part}`;
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = await request.json();
    const { slug, full_name, phone, email } = body as {
      slug?: string;
      full_name?: string;
      phone?: string;
      email?: string;
    };

    if (!slug || !full_name || !phone) {
      return NextResponse.json(
        { error: "Lipsesc slug, full_name sau phone." },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const { data: merchant } = await supabase
      .from("merchants")
      .select("id, business_name")
      .eq("slug", slug)
      .single();

    if (!merchant) {
      return NextResponse.json({ error: "Locație negăsită." }, { status: 404 });
    }

    const { data: program } = await supabase
      .from("loyalty_programs")
      .select("id, stamps_required, reward_description")
      .eq("merchant_id", merchant.id)
      .single();

    if (!program) {
      return NextResponse.json({ error: "Program negăsit." }, { status: 404 });
    }

    const phoneNorm = phone.replace(/\s+/g, "").trim();
    let customer = await supabase
      .from("customers")
      .select("id")
      .eq("merchant_id", merchant.id)
      .eq("phone", phoneNorm)
      .single()
      .then((r) => r.data);

    if (!customer) {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          merchant_id: merchant.id,
          full_name: full_name.trim(),
          phone: phoneNorm,
          email: email?.trim() || null,
        })
        .select("id")
        .single();
      if (custErr) throw custErr;
      customer = newCustomer;
    }

    const existingPass = await supabase
      .from("wallet_passes")
      .select("id, barcode_value")
      .eq("customer_id", customer.id)
      .eq("merchant_id", merchant.id)
      .single()
      .then((r) => r.data);

    if (existingPass) {
      return NextResponse.json({
        already_enrolled: true,
        barcode_value: existingPass.barcode_value,
        message: "Ai deja un card la această locație.",
      });
    }

    const barcode_value = generateBarcode();
    const { data: pass, error: passErr } = await supabase
      .from("wallet_passes")
      .insert({
        customer_id: customer.id,
        merchant_id: merchant.id,
        program_id: program.id,
        barcode_value,
        stamp_count: 1,
        reward_available: false,
      })
      .select("id")
      .single();

    if (passErr) throw passErr;

    await supabase.from("stamp_events").insert({ pass_id: pass.id });

    const inferredBaseUrl = url.origin;
    let baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || inferredBaseUrl || "http://localhost:3000";
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      baseUrl = `https://${baseUrl}`;
    }
    return NextResponse.json({
      barcode_value,
      pass_id: pass.id,
      stamps_required: program.stamps_required,
      reward_description: program.reward_description,
      add_google_wallet_url: `${baseUrl}/api/wallet/google/add?pass_id=${pass.id}`,
      add_apple_wallet_url: `${baseUrl}/api/wallet/apple/add?pass_id=${pass.id}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare server." },
      { status: 500 }
    );
  }
}
