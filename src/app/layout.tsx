import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { LangProvider } from "@/lib/lang";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xiaomi MiDiag — AI Diagnostics for Xiaomi Devices",
  description: "Web-based AI-powered diagnostics tool for Xiaomi/HyperOS devices. Connect via USB, analyze with Xiaomi MiMo AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LangProvider>
          <NavBar />
          <main className="pt-14">{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
