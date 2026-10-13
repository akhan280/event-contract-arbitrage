import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { CSPostHogProvider } from "../lib/posthog";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const description =
  "Find arbitrage between Kalshi, Polymarket, and Robinhood event contracts. See position size, fees, payout, and annualized return.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eventarb.com"),
  title: "Event Contract Arbitrage Calculator for Kalshi, Polymarket & Robinhood",
  description,
  keywords: [
    "Polymarket arbitrage",
    "Kalshi arbitrage",
    "Robinhood event contracts",
    "prediction market arbitrage",
    "event contract calculator",
    "cross-exchange arbitrage",
  ],
  authors: [{ name: "Areeb Khan", url: "https://x.com/areebkhan280" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Event Contract Arbitrage Calculator",
    description,
    siteName: "Event Arb",
    images: [{ url: "/thumbnail.png", width: 1200, height: 630, alt: "Event Contract Arbitrage Calculator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Contract Arbitrage Calculator",
    description,
    images: ["/thumbnail.png"],
  },
  alternates: { canonical: "/" },
  category: "Finance",
  applicationName: "Event Arb",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CSPostHogProvider>
          {children}
          <Toaster />
          <Analytics />
        </CSPostHogProvider>
      </body>
    </html>
  );
}