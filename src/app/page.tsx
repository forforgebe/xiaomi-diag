'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [tokensLeft, setTokensLeft] = useState("99,999,999,999,999");

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-xiaomi-orange/10 border border-xiaomi-orange/20 text-xiaomi-orange text-xs mb-6">
          ✦ Powered by Xiaomi MiMo V2.5
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
          AI Diagnostics for{' '}
          <span className="text-xiaomi-orange">Xiaomi</span> Devices
        </h1>
        <p className="text-lg text-xiaomi-muted max-w-2xl mx-auto mb-8">
          Plug your Xiaomi phone via USB, click one button, and let AI analyze crashes,
          battery drain, ROM issues, and more — all from your browser. Free and open.
        </p>
        <Link
          href="/diagnostics"
          className="inline-flex items-center gap-2 bg-xiaomi-orange hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all glow-orange"
        >
          <span>Start Diagnostics</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
        <p className="text-xs text-xiaomi-muted mt-3">
          No install required. Works with Chrome/Edge via WebUSB.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">What It Does</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🔌', title: 'Plug & Diagnose', desc: 'Connect via USB, browser detects device automatically. Zero setup.' },
            { icon: '🧠', title: 'AI Crash Analysis', desc: 'MiMo V2.5 analyzes logcat, bugreport, and crash traces instantly.' },
            { icon: '📊', title: 'ROM Health Check', desc: 'Compare your ROM against known issues and official changelogs.' },
            { icon: '💡', title: 'Smart Solutions', desc: 'Get step-by-step fixes based on Xiaomi community and known workarounds.' },
            { icon: '📋', title: 'Bug Reports', desc: 'Generate structured reports with logs, screenshots, and AI analysis.' },
            { icon: '🔁', title: 'OTA Regression Tracking', desc: 'Track which issues appeared after which ROM update.' },
          ].map((f, i) => (
            <div key={i} className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6 hover:border-xiaomi-orange/30 transition-all">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-xiaomi-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Connect', desc: 'Plug your Xiaomi phone via USB. Chrome will ask permission — click Allow.' },
            { step: '2', title: 'Analyze', desc: 'Click "Run Diagnostics". The tool collects logs and sends them to MiMo AI for analysis.' },
            { step: '3', title: 'Fix', desc: 'Read the AI diagnosis. Get the root cause, workaround, and official fix timeline.' },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-xiaomi-orange/20 border border-xiaomi-orange/30 flex items-center justify-center text-xiaomi-orange font-bold text-sm shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-xiaomi-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Powered by MiMo */}
      <section className="border-t border-white/5 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-xiaomi-muted mb-2">Powered by</p>
          <p className="text-xl font-bold">
            <span className="text-xiaomi-orange">Xiaomi MiMo</span> Orbit 100T
          </p>
          <p className="text-xs text-xiaomi-muted mt-2">
            This project is part of the Xiaomi MiMo 100 Trillion Token Creator Incentive Program
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-xiaomi-muted">
        <p>© 2026 MiDiag — Built with Xiaomi MiMo API</p>
      </footer>
    </div>
  );
}
