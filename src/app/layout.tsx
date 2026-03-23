import type { Metadata } from "next";
import type { Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const defaultSite =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://stampio.ro";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(defaultSite),
  title: {
    default: "Stampy — Carduri de fidelitate digitale",
    template: "%s · Stampy",
  },
  description:
    "Programe de fidelizare cu ștampile digitale pentru afaceri locale. QR la casă, card pe telefon.",
  applicationName: "Stampy",
};

export const viewport: Viewport = {
  themeColor: "#F26545",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${plusJakarta.variable} ${fraunces.variable} ${jetbrainsMono.variable} overflow-x-hidden`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
