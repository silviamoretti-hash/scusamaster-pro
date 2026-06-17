import type { Metadata } from "next";
import { Barlow_Condensed, Figtree } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  weight: ["600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "ScusaMaster Pro",
  description: "Genera scuse perfette per il tuo capo — con l'AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${barlow.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full font-sans">
        {children}
      </body>
    </html>
  );
}
