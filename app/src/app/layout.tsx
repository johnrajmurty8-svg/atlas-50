import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const inter = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atlas /50",
  description: "A living atlas of the world's most extraordinary destinations — curated by editors, illustrated by the light that finds them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: '#050912' }}>
      <body className={`${dmSerifDisplay.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
      {/* Plausible analytics — update data-domain before production launch */}
      <Script
        src="https://plausible.io/js/plausible.js"
        data-domain="atlas-50.vercel.app"
        strategy="afterInteractive"
        defer
      />
    </html>
  );
}
