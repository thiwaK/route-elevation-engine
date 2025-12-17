import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elevation Profile Generator for Routes | Route Elevation Engine",
  description:
    "Generate accurate elevation profiles for any route. Visualize altitude changes, analyze terrain, and export elevation data easily.",

  keywords: [
    "elevation profile",
    "route elevation",
    "elevation profile generator",
    "terrain analysis",
    "GPS elevation",
    "route analysis",
  ],

  alternates: {
    canonical: "https://thiwak.github.io/route-elevation-engine/",
  },

  openGraph: {
    title: "Route Elevation Engine – Elevation Profile Generator",
    description:
      "Create detailed elevation profiles for routes. Analyze climbs, descents, and terrain with precision.",
    url: "https://thiwak.github.io/route-elevation-engine/",
    siteName: "Route Elevation Engine",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Route elevation profile visualization",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Route Elevation Engine – Elevation Profile Generator",
    description:
      "Generate and visualize elevation profiles for routes. Perfect for hiking, cycling, and route planning.",
    images: ["/og-image.png"],
  },
};
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
