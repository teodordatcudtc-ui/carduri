import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const passId = searchParams.get("pass_id");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!passId) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  // TODO: When APPLE_WALLET_* is configured, generate .pkpass and return
  // Content-Disposition: attachment; filename="pass.pkpass"
  const hasAppleConfig = !!(
    process.env.APPLE_WALLET_PASS_TYPE_ID &&
    process.env.APPLE_WALLET_TEAM_ID &&
    process.env.APPLE_WALLET_KEY_ID &&
    process.env.APPLE_WALLET_PRIVATE_KEY
  );

  if (hasAppleConfig) {
    // const buffer = await generateApplePass(passId);
    // return new NextResponse(buffer, {
    //   headers: {
    //     "Content-Type": "application/vnd.apple.pkpass",
    //     "Content-Disposition": 'attachment; filename="stampio.pkpass"',
    //   },
    // });
  }

  return NextResponse.redirect(`${baseUrl}/card/${passId}?wallet=apple`);
}
