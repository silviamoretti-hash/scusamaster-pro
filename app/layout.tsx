import type { Metadata } from "next";
import { Barlow_Condensed, Figtree } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
      <body className="min-h-full flex flex-col font-sans">
        <header
          className="px-6 py-5 flex items-center justify-between"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Link
            href="/"
            className="font-display text-2xl font-black tracking-tight text-white leading-none"
          >
            ScusaMaster Pro
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-white/75 hover:text-white transition-colors"
          >
            Dashboard →
          </Link>
        </header>

        <main className="flex-1">{children}</main>

        <footer
          className="text-center py-4 text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          Nessun capo è stato effettivamente ingannato nella produzione di questa app.
        </footer>
      </body>
    </html>
  );
}
