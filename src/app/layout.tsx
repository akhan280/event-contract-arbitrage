import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Icon from "@/components/icon";

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

export const metadata: Metadata = {
  title: "Event Contract Arbitrage Calculator | Polymarket & Kalshi Trading Tool",
  description: "Free arbitrage calculator for Polymarket and Kalshi event contracts. Find profit opportunities, compare odds, and calculate potential earnings across prediction markets instantly.",
  keywords: [
    "Polymarket arbitrage",
    "Kalshi arbitrage",
    "prediction markets",
    "event contracts",
    "arbitrage calculator",
    "trading calculator",
    "market odds comparison",
    "prediction market arbitrage",
    "Polymarket trading",
    "Kalshi trading",
    "betting arbitrage",
    "market price differences",
    "arbitrage opportunities",
    "cross-platform arbitrage",
    "trading automation"
  ],
  authors: [
    {
      name: "Event Contract Arbitrage Calculator",
    }
  ],
  creator: "Event Contract Arbitrage Calculator",
  publisher: "Event Contract Arbitrage Calculator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eventarb.com",
    title: "Event Contract Arbitrage Calculator | Polymarket & Kalshi Trading Tool",
    description: "Free arbitrage calculator for Polymarket and Kalshi event contracts. Find profit opportunities, compare odds, and calculate potential earnings across prediction markets instantly.",
    siteName: "Event Contract Arbitrage Calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Contract Arbitrage Calculator | Polymarket & Kalshi Trading Tool",
    description: "Free arbitrage calculator for Polymarket and Kalshi event contracts. Find profit opportunities, compare odds, and calculate potential earnings.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  alternates: {
    canonical: "https://eventarb.com",
  },
  category: "Technology",
  verification: {
    google: "verification_token",
  },
  other: {
    "application-name": "Event Contract Arbitrage Calculator",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Arbitrage Calculator",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}