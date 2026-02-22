import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PredictaPK | AI Market Price Predictions",
  description: "Get instant AI-powered price predictions for cars, bikes, and properties across Pakistan. Powered by advanced machine learning.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "PredictaPK | AI Market Price Predictions",
    description: "Get instant AI-powered price predictions for cars, bikes, and properties across Pakistan. Your smart AI forecasting companion.",
    siteName: "PredictaPK",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "PredictaPK Logo",
      },
    ],
    type: "website",
  },
};

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
