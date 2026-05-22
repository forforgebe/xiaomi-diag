'use client';

import Link from 'next/link';
import { useLang } from '@/lib/lang';

export default function Home() {
  const { t } = useLang();

  const features = [
    { key: 'plug', icon: '🔌' },
    { key: 'ai', icon: '🧠' },
    { key: 'rom', icon: '📊' },
    { key: 'solutions', icon: '💡' },
    { key: 'reports', icon: '📋' },
    { key: 'ota', icon: '🔁' },
  ];

  const steps = [
    { key: 'step1' },
    { key: 'step2' },
    { key: 'step3' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-xiaomi-orange/10 border border-xiaomi-orange/20 text-xiaomi-orange text-xs mb-6">
          ✦ Powered by Xiaomi MiMo V2.5
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
          {t('hero.title')}{' '}
          <span className="text-xiaomi-orange">{t('hero.title2')}</span>{' '}
          {t('hero.title3')}
        </h1>
        <p className="text-lg text-xiaomi-muted max-w-2xl mx-auto mb-8">
          {t('hero.subtitle')}
        </p>
        <Link
          href="/diagnostics"
          className="inline-flex items-center gap-2 bg-xiaomi-orange hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all glow-orange"
        >
          <span>{t('hero.cta')}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
        <p className="text-xs text-xiaomi-muted mt-3">
          {t('hero.note')}
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">{t('features.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6 hover:border-xiaomi-orange/30 transition-all">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{t('features.' + f.key)}</h3>
              <p className="text-sm text-xiaomi-muted">{t('features.' + f.key + '_desc')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">{t('how.title')}</h2>
        <div className="space-y-6">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-xiaomi-orange/20 border border-xiaomi-orange/30 flex items-center justify-center text-xiaomi-orange font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('how.' + s.key)}</h3>
                <p className="text-sm text-xiaomi-muted">{t('how.' + s.key + '_desc')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GitHub & Docs */}
      <section className="border-t border-white/5 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <p className="text-sm text-xiaomi-muted">{t('powered.title')}</p>
          <p className="text-xl font-bold">
            <span className="text-xiaomi-orange">{t('powered.subtitle')}</span>
          </p>
          <p className="text-xs text-xiaomi-muted">{t('powered.desc')}</p>
          <div className="flex justify-center gap-4 pt-4">
            <a href="https://github.com/forforgebe/xiaomi-diag" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm text-xiaomi-muted hover:text-white hover:border-xiaomi-orange/40 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a href="https://github.com/forforgebe/xiaomi-diag" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm text-xiaomi-muted hover:text-white hover:border-xiaomi-orange/40 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              Docs
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-xiaomi-muted">
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  );
}
