import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Nunito, Zain } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
});

const arabic = Zain({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Happy Birthday, Zaina 🦆",
  description: "A little journey made with love — ducks, flowers and a letter.",
};

export const viewport: Viewport = {
  themeColor: "#251451",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${hand.variable} ${arabic.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
