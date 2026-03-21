import { NextResponse } from "next/server";

const MAX_LEN = 8000;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalid" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const email = typeof o.email === "string" ? o.email.trim() : "";
  const message = typeof o.message === "string" ? o.message.trim() : "";
  const firstName = typeof o.firstName === "string" ? o.firstName.trim() : "";
  const lastName = typeof o.lastName === "string" ? o.lastName.trim() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Adresă de email invalidă" }, { status: 400 });
  }
  if (!message || message.length < 5) {
    return NextResponse.json({ error: "Mesajul este prea scurt (min. 5 caractere)" }, { status: 400 });
  }
  if (message.length > MAX_LEN) {
    return NextResponse.json({ error: "Mesajul este prea lung" }, { status: 400 });
  }

  // Log server-side (în producție poți înlocui cu Resend / SendGrid etc.)
  console.info("[contact]", { email, firstName, lastName, messageLength: message.length });

  return NextResponse.json({ ok: true });
}
