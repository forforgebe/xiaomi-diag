import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xiaomi MiDiag — AI Diagnostics for Xiaomi Devices",
  description: "Web-based AI-powered diagnostics tool for Xiaomi/HyperOS devices. Connect via USB, analyze with Xiaomi MiMo AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="fixed top-0 w-full z-50 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-xiaomi-orange">MiDiag</span>
              <span className="text-xs text-xiaomi-muted hidden sm:inline">by Xiaomi MiMo</span>
            </a>
            <div className="flex items-center gap-4 text-sm">
              <a href="/diagnostics" className="text-xiaomi-muted hover:text-white transition-colors">Diagnostics</a>
              <a href="/" className="text-xiaomi-muted hover:text-white transition-colors">About</a>
            </div>
          </div>
        </nav>
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
