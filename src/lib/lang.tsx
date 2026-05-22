'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'zh';

const translations: Record<string, Record<Lang, string>> = {
  'nav.diagnostics': { en: 'Diagnostics', zh: '诊断' },
  'nav.docs': { en: 'Docs', zh: '文档' },
  'nav.github': { en: 'GitHub', zh: 'GitHub' },
  'hero.title': { en: 'AI Diagnostics for', zh: 'AI 诊断工具' },
  'hero.title2': { en: 'Xiaomi', zh: '专为' },
  'hero.title3': { en: 'Devices', zh: 'Xiaomi 设备' },
  'hero.subtitle': { en: 'Plug your Xiaomi phone via USB, click one button, and let AI analyze crashes, battery drain, ROM issues, and more — all from your browser.', zh: '通过 USB 连接你的 Xiaomi 手机，一键启动，让 AI 分析崩溃、电池耗电、ROM 问题等 —— 全部在浏览器中完成。' },
  'hero.cta': { en: 'Start Diagnostics', zh: '开始诊断' },
  'hero.note': { en: 'No install required. Works with Chrome/Edge via WebUSB.', zh: '无需安装。通过 WebUSB 在 Chrome/Edge 中运行。' },
  'features.title': { en: 'What It Does', zh: '功能介绍' },
  'features.plug': { en: 'Plug & Diagnose', zh: '即插即诊断' },
  'features.plug_desc': { en: 'Connect via USB, browser detects device automatically. Zero setup.', zh: '通过 USB 连接，浏览器自动识别设备。无需配置。' },
  'features.ai': { en: 'AI Crash Analysis', zh: 'AI 崩溃分析' },
  'features.ai_desc': { en: 'MiMo V2.5 analyzes logcat, bugreport, and crash traces instantly.', zh: 'MiMo V2.5 实时分析 logcat、bugreport 和崩溃追踪。' },
  'features.rom': { en: 'ROM Health Check', zh: 'ROM 健康检查' },
  'features.rom_desc': { en: 'Compare your ROM against known issues and official changelogs.', zh: '将你的 ROM 与已知问题和官方更新日志进行对比。' },
  'features.solutions': { en: 'Smart Solutions', zh: '智能解决方案' },
  'features.solutions_desc': { en: 'Get step-by-step fixes based on Xiaomi community and known workarounds.', zh: '基于小米社区和已知解决方案获取分步修复指南。' },
  'features.reports': { en: 'Bug Reports', zh: '错误报告' },
  'features.reports_desc': { en: 'Generate structured reports with logs, screenshots, and AI analysis.', zh: '生成包含日志、截图和 AI 分析的结构化报告。' },
  'features.ota': { en: 'OTA Regression Tracking', zh: 'OTA 回归追踪' },
  'features.ota_desc': { en: 'Track which issues appeared after which ROM update.', zh: '追踪哪些问题出现在哪个 ROM 更新之后。' },
  'how.title': { en: 'How It Works', zh: '使用步骤' },
  'how.step1': { en: 'Connect', zh: '连接' },
  'how.step1_desc': { en: 'Plug your Xiaomi phone via USB. Chrome will ask permission — click Allow.', zh: '通过 USB 连接手机。Chrome 会请求权限 —— 点击允许。' },
  'how.step2': { en: 'Analyze', zh: '分析' },
  'how.step2_desc': { en: 'Click "Run Diagnostics". The tool collects logs and sends them to MiMo AI for analysis.', zh: '点击"开始诊断"。工具收集日志并发送至 MiMo AI 进行分析。' },
  'how.step3': { en: 'Fix', zh: '修复' },
  'how.step3_desc': { en: 'Read the AI diagnosis. Get the root cause, workaround, and official fix timeline.', zh: '查看 AI 诊断结果。获取根本原因、解决方案和官方修复时间线。' },
  'powered.title': { en: 'Powered by', zh: '技术支持' },
  'powered.subtitle': { en: 'Xiaomi MiMo Orbit 100T', zh: 'Xiaomi MiMo Orbit 100T' },
  'powered.desc': { en: 'This project is part of the Xiaomi MiMo 100 Trillion Token Creator Incentive Program', zh: '本项目是 Xiaomi MiMo 百万亿 Token 创造者激励计划的一部分' },
  'diag.title': { en: 'Device Diagnostics', zh: '设备诊断' },
  'diag.subtitle': { en: 'Connect your Xiaomi device and run AI-powered analysis', zh: '连接你的 Xiaomi 设备并运行 AI 分析' },
  'diag.connect': { en: '🔌 WebUSB', zh: '🔌 WebUSB' },
  'diag.manual': { en: '📝 Manual Logs', zh: '📝 手动输入' },
  'diag.no_device': { en: 'No Device', zh: '未检测到设备' },
  'diag.connected': { en: 'Device Connected', zh: '设备已连接' },
  'diag.usb_hint': { en: 'Enable USB Debugging on your Xiaomi phone (Developer Options → USB Debugging), then plug it in via USB.', zh: '请在手机上开启 USB 调试（设置 → 开发者选项 → USB 调试），然后通过 USB 连接。' },
  'diag.btn_idle': { en: '🔗 Connect & Diagnose', zh: '🔗 连接并诊断' },
  'diag.btn_retry': { en: '↻ Retry', zh: '↻ 重试' },
  'diag.btn_again': { en: '▶ Run Again', zh: '▶ 再次运行' },
  'diag.btn_diag': { en: '▶ Run Diagnostics', zh: '▶ 运行诊断' },
  'diag.processing': { en: '⏳ Processing...', zh: '⏳ 处理中...' },
  'diag.connecting': { en: '⏳ Connecting...', zh: '⏳ 连接中...' },
  'diag.reset': { en: '↻ Reset', zh: '↻ 重置' },
  'diag.manual_hint': { en: 'Paste your logs (logcat, bugreport, dumpsys):', zh: '粘贴你的日志（logcat、bugreport、dumpsys）：' },
  'diag.manual_btn': { en: '🔍 Analyze with MiMo', zh: '🔍 用 MiMo 分析' },
  'diag.analyzing': { en: '⏳ Analyzing...', zh: '⏳ 分析中...' },
  'diag.browser_warn': { en: '⚠️ WebUSB is not supported in your browser. Use Chrome 89+ or Edge 89+, or switch to Manual Logs mode.', zh: '⚠️ 你的浏览器不支持 WebUSB。请使用 Chrome 89+ 或 Edge 89+，或切换到手动输入模式。' },
  'status.ready': { en: 'Ready', zh: '就绪' },
  'status.usb': { en: 'Requesting USB...', zh: '请求 USB...' },
  'status.collecting': { en: 'Collecting logs...', zh: '收集日志中...' },
  'status.connected': { en: 'Connected, collecting...', zh: '已连接，收集中...' },
  'status.analyzing': { en: 'Analyzing with MiMo...', zh: 'MiMo 分析中...' },
  'status.complete': { en: 'Complete', zh: '完成' },
  'status.error': { en: 'Error', zh: '错误' },
  'log.title': { en: 'LOG COLLECTION', zh: '日志收集' },
  'analysis.title': { en: 'Xiaomi MiMo Analysis', zh: 'Xiaomi MiMo 分析结果' },
  'footer.copyright': { en: '© 2026 MiDiag — Built with Xiaomi MiMo API', zh: '© 2026 MiDiag — 基于 Xiaomi MiMo API 构建' },
  'nav.home': { en: 'Home', zh: '首页' },
};

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  
  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
