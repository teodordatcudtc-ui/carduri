import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://stampio.ro";

export const metadata: Metadata = {
  title: "Stampy — Loyalty SaaS pentru HoReCa",
  description:
    "QR la casă, card digital pe telefon, ștampilă în 3 secunde. Program de fidelizare fără aplicație instalată — pentru cafenele și restaurante din România.",
  applicationName: "Stampy",
  keywords: [
    "loyalty",
    "fidelizare",
    "ștampile digitale",
    "HoReCa",
    "QR",
    "card digital",
    "România",
  ],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: siteUrl,
    siteName: "Stampy",
    title: "Stampy — Loyalty SaaS pentru HoReCa",
    description:
      "QR la casă, card digital pe telefon, ștampilă în 3 secunde. Fără aplicație instalată.",
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "Stampy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stampy — Loyalty SaaS pentru HoReCa",
    description:
      "QR la casă, card digital pe telefon, ștampilă în 3 secunde. Fără aplicație instalată.",
    images: [`${siteUrl}/logo.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPage user={user} />;
}
