import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "ScusaMaster Pro",
  description: "Genera scuse perfette per il tuo capo con l'AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-amber-50 font-sans">
        <header className="bg-white border-b border-amber-200 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-amber-700 hover:text-amber-900">
            🎭 ScusaMaster Pro
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-amber-600 hover:text-amber-800 underline underline-offset-2"
          >
            Dashboard →
          </Link>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="text-center py-4 text-xs text-amber-400">
          Nessun capo è stato effettivamente ingannato nella produzione di questa app.
        </footer>
      </body>
    </html>
  );
}
