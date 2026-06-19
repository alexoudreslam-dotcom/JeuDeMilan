import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Buck Crew",
  description: "Prototype du mini-jeu hebdomadaire du restaurant."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#17100d"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={pixelFont.variable}>
      <body>{children}</body>
    </html>
  );
}
