# Xiaomi MiDiag 🔌🧠

**AI-Powered Diagnostics Tool for Xiaomi / HyperOS Devices**

Built with **Xiaomi MiMo V2.5** — plug your phone via USB, click one button, and let AI analyze crashes, battery drain, ROM issues, and more. All from your browser. No desktop app required.

---

## 📱 What Is This?

MiDiag is a web-based diagnostics assistant specifically built for **Xiaomi devices running HyperOS**. It connects to your phone via **WebUSB** (no ADB setup needed), automatically collects system logs, and uses **Xiaomi MiMo AI** to:

- 🔍 **Analyze crash traces & ANRs** — identify root causes in seconds
- 🔋 **Detect battery drain sources** — wakelocks, thermal throttling, misbehaving apps
- 🩺 **Check ROM health** — compare your build against known issues & official changelogs
- 💡 **Suggest fixes** — step-by-step solutions based on Xiaomi community knowledge
- 📋 **Generate bug reports** — structured reports with logs, screenshots, and AI analysis

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **WebUSB Connection** | Connect via browser — no ADB, no drivers, no desktop app |
| **One-Click Diagnostics** | Collect logs, analyze, get results in under 30 seconds |
| **AI Crash Analysis** | Powered by Xiaomi MiMo V2.5 reasoning model |
| **ROM Issue Database** | Cross-reference with known HyperOS bugs per version/region |
| **Auto-Fix Suggestions** | Step-by-step workarounds from Xiaomi community & official sources |
| **Bug Report Generator** | Export structured reports (Markdown/PDF) with full context |
| **Manual Log Mode** | Paste logs from any source if WebUSB isn't available |
| **Free & Open** | No cost, no account required for basic usage |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Chrome/Edge)               │
│  ┌──────────────┐     ┌───────────────────────────┐  │
│  │  Next.js UI   │     │     WebUSB / ADB.js       │  │
│  │  (Vercel)     │◄───►│  (Phone Communication)    │  │
│  └──────┬───────┘     └─────────────┬─────────────┘  │
│         │                           │                 │
│         │                           ▼                 │
│         │                  ┌──────────────┐          │
│         │                  │  Xiaomi Phone │          │
│         │                  │  (via USB-C)  │          │
│         │                  └──────────────┘          │
│         │                                            │
│         ▼                                            │
│  ┌────────────────┐                                  │
│  │  MiMo V2.5 API  │◄── AI Analysis Pipeline         │
│  │  (Xiaomi Cloud) │                                  │
│  └────────────────┘                                  │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 + React 19 + TypeScript + Tailwind CSS |
| **Hosting** | Vercel (Free Tier) |
| **Phone Connectivity** | WebUSB API + ADB.js |
| **AI Engine** | Xiaomi MiMo V2.5 Pro (Chat Completions API) |
| **Styling** | Dark theme, Xiaomi brand colors |

---

## 🚀 Getting Started

### For Users

1. **Open the app** — visit the deployed URL
2. **Connect your phone** — plug your Xiaomi device via USB-C to your computer
3. **Grant permission** — Chrome will ask to access the USB device (required for WebUSB)
4. **Click "Run Diagnostics"** — the tool collects logs and sends them to MiMo for analysis
5. **Read your diagnosis** — get the root cause, severity level, and step-by-step fix

> **No WebUSB?** Use "Manual Logs" mode — paste any logcat/dumpsys/bugreport output.

### For Developers

```bash
# Clone the repo
git clone https://github.com/forforgebe/xiaomi-diag.git
cd xiaomi-diag

# Install dependencies
npm install

# Set up your MiMo API key
cp .env.example .env.local
# Edit .env.local and add your MiMo API key

# Run development server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_MIMO_API_KEY` | Xiaomi MiMo API key | Yes (for AI analysis) |

Get your API key at [platform.xiaomimimo.com](https://platform.xiaomimimo.com)

---

## 📸 Screenshots

> *Coming soon — the app is currently in active development.*

- **Landing page** — project overview and feature highlights
- **Diagnostics dashboard** — device connection, log collection, AI analysis output
- **Sample report** — generated bug report with full AI diagnosis

---

## 🔧 Supported Devices

All Xiaomi, Redmi, and POCO devices running:

- **HyperOS 1.0+** (all variants: Global, China, EEA, India, Russia, Indonesia, etc.)
- **MIUI 14+** (legacy support)
- **Android 13+**

Tested on: Xiaomi 14 Pro, Xiaomi 13T, Redmi Note 13, POCO F6

---

## 🧪 Sample Diagnostics Output

```
🔴 CRITICAL — Abnormal Battery Drain Detected

Root Cause:
  com.xiaomi.powerkeeper is holding a partial wakelock for 45+ minutes
  after screen-off. This is a known regression in HyperOS 2.1.0.3 (Global).

Affected Builds:
  • OS2.0.100.0.VNOMIXM (Global)
  • OS2.0.101.0.VNOMIXM (Global)

Workaround:
  1. Settings → Battery → Power Saving Mode → Enable
  2. Settings → Apps → System Apps → Powerkeeper → Clear Cache
  3. Restart device

Official Fix:
  Scheduled for HyperOS 2.1.0.5 (ETA: ~2 weeks)
  Track at: https://c.mi.com/thread-XXXXXX
```

---

## 🗺️ Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| **P1: Core MVP** | ✅ Done | WebUSB connection, log collection, MiMo analysis |
| **P2: Diagnostics** | 🔄 In Progress | Crash parser, ROM health check, battery analyzer |
| **P3: Knowledge Base** | ⏳ Planned | Community-sourced known issues database |
| **P4: Reports** | ⏳ Planned | Bug report generator (Markdown/PDF) |
| **P5: Multi-Device** | ⏳ Planned | Compare diagnostics across multiple Xiaomi devices |
| **P6: OTA Tracker** | ⏳ Planned | Track regressions across ROM updates over time |

---

## 🤝 How to Contribute

This project is part of the **Xiaomi MiMo Orbit 100 Trillion Token Creator Incentive Program**.

- Found a bug? [Open an issue](https://github.com/forforgebe/xiaomi-diag/issues)
- Have a suggestion? [Start a discussion](https://github.com/forforgebe/xiaomi-diag/discussions)
- Want to contribute? PRs are welcome!

---

## 📄 License

MIT — do whatever you want, just give credit.

---

## 🙏 Powered By

- **[Xiaomi MiMo V2.5](https://mimo.xiaomi.com)** — AI reasoning engine
- **[Xiaomi MiMo API Open Platform](https://platform.xiaomimimo.com)** — API access and 100T Token support
- **[WebUSB API](https://wicg.github.io/webusb/)** — browser-to-device communication
- **[ADB.js](https://github.com/webadb/webadb.js)** — JavaScript ADB implementation
- **[Next.js](https://nextjs.org)** — React framework
- **[Vercel](https://vercel.com)** — Free hosting

---

<div align="center">
  <sub>Built with ❤️ for the Xiaomi community | 小米 MiMo Orbit 100T</sub>
</div>
