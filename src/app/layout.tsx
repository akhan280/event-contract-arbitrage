import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Icon from "@/components/icon";
import { Analytics } from "@vercel/analytics/react"

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
  metadataBase: new URL('https://eventarb.com'),
  title: "Event Contract Arbitrage Calculator for Kalshi, Polymarket & More | Multi-Platform Calculator",
  description: "Professional arbitrage calculator for event contracts across Kalshi, Polymarket, Robinhood, and Interactive Brokers. Find real-time arbitrage opportunities, compare market odds, and maximize profits with our comprehensive trading tools. Perfect for professional traders and arbitrage specialists.",
  keywords: [
    // Platform-specific terms
    "Polymarket arbitrage", "Kalshi arbitrage", "Robinhood options arbitrage",
    "Interactive Brokers arbitrage", "multi-platform arbitrage",
    
    // Trading terms
    "event contract trading", "prediction markets", "binary options",
    "options trading", "futures trading", "cross-exchange arbitrage",
    
    // Feature-specific terms
    "real-time arbitrage calculator", "trading calculator",
    "market odds comparison", "price discrepancy finder",
    "arbitrage opportunity scanner", "trading automation tools",
    
    // Professional terms
    "professional trading tools", "institutional trading",
    "algorithmic trading", "quantitative analysis",
    "market making", "statistical arbitrage",
    
    // Market-specific terms
    "prediction market arbitrage", "binary options trading",
    "futures market arbitrage", "cross-market opportunities",
    "market price differences", "risk-free arbitrage"
  ],
  authors: [
    {
      name: "Event Contract Arbitrage Calculator",
      url: "https://eventarb.com",
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
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eventarb.com",
    title: "Professional Multi-Platform Arbitrage Calculator for Event Contracts",
    description: "Maximize profits with our comprehensive arbitrage calculator. Compare odds and find opportunities across Kalshi, Polymarket, Robinhood, and Interactive Brokers instantly.",
    siteName: "Event Contract Arbitrage Calculator",
    images: [
      {
        url: "https://eventarb.com/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Event Contract Arbitrage Calculator Dashboard",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Trading Tools for Event Contract Arbitrage",
    description: "Find arbitrage opportunities across major platforms: Kalshi, Polymarket, Robinhood, and Interactive Brokers. Real-time calculations and market analysis.",
    images: ["https://eventarb.com/thumbnail.png"],
    creator: "@eventarb",
    site: "@eventarb",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  alternates: {
    canonical: "https://eventarb.com",
    languages: {
      'en-US': 'https://eventarb.com',
    }
  },
  category: "Finance",
  verification: {
    google: "verification_token",
    yandex: "yandex_verification_token",
  },
  other: {
    "application-name": "Event Contract Arbitrage Calculator",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "EventArb Calculator",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#000000",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <Toaster />
        <Analytics></Analytics>
      </body>
    </html>
  );
}