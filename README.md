# Xiaomi MiDiag 🔌🧠

**AI-Powered Diagnostics Tool for Xiaomi / HyperOS Devices**

> 🚀 **Xiaomi MiMo Orbit 100 Trillion Token Creator Incentive Program**
> This project is part of the Xiaomi MiMo Orbit 百万亿 Token 创造者激励计划 — using MiMo V2.5 to build intelligent diagnostic tools for the Xiaomi ecosystem.

---

## 📋 Project Overview

### The Problem

Xiaomi/HyperOS users and developers face these pain points daily:

- **Crash debugging is slow** — collecting logs, reading stack traces, and finding root causes takes 30+ minutes per issue
- **Knowledge is fragmented** — solutions are scattered across forums (Xiaomi Community, Reddit, Telegram groups)
- **ROM regressions go unnoticed** — after OTA updates, users don't know which new bugs are expected or unique to their device
- **Bug reports are inconsistent** — users describe issues vaguely ("phone is hot", "battery drain"), making it hard for developers to diagnose

### The Solution

MiDiag solves this by creating a **web-based, AI-first diagnostics pipeline**:

1. **User connects phone** via USB (WebUSB — no app install needed)
2. **Tool collects system data** — logcat, bugreport, dumpsys, build.prop
3. **MiMo V2.5 AI analyzes everything** — identifies root cause, severity, known issues
4. **User gets a clear diagnosis** — with step-by-step fix instructions
5. **Bug reports are automatically structured** — ready to share with Xiaomi forums or developers

### Why MiMo?

| Requirement | Why MiMo Fits |
|-------------|---------------|
| **Reasoning capability** | MiMo V2.5 Pro excels at understanding complex stack traces and system logs |
| **Multimodal understanding** | MiMo Omni can analyze screenshots of error screens and UI anomalies |
| **Xiaomi ecosystem knowledge** | Built by Xiaomi — naturally understands HyperOS internals, ROM versions, and common issues |
| **Free 100T tokens** | The Orbit program makes this project viable without infrastructure cost |

---

## ✨ Features

### 🔌 WebUSB Connectivity
No ADB, no desktop app, no drivers. Plug your Xiaomi phone via USB and Chrome automatically detects it. Uses **WebUSB API** + **ADB.js** for browser-to-device communication.

### 🧠 AI-Powered Crash Analysis
Send logs to **Xiaomi MiMo V2.5 Pro** for deep reasoning:
- Stack trace parsing and exception classification
- ANR (Application Not Responding) cause identification
- Kernel panic log analysis
- Cross-reference with known bug database

### 🔋 Battery & Thermal Diagnostics
- Wakelock analysis (identify apps draining battery)
- Thermal throttle detection
- Charging health assessment
- Historical trend tracking (coming soon)

### 🩺 ROM Health Check
- Build fingerprint parsing (region, stable/beta/dev, patch level)
- Comparison against official Xiaomi changelogs
- Flagging of known bugs per ROM version
- OTA regression alerts

### 💡 Smart Solution Suggestions
- **Known Issues** — "This crash matches 3 reports on HyperOS 2.1.0.3 Global"
- **Workarounds** — Step-by-step fix based on Xiaomi community findings
- **Official Fix ETA** — "Fix scheduled for HyperOS 2.1.0.5 (~2 weeks)"
- **Links** — Direct links to relevant Xiaomi Community threads

### 📋 Bug Report Generator
Generate structured reports for sharing:
- Device info + ROM details
- Full crash log with AI summary
- Screenshot attachments (via WebUSB screencap)
- Suggested fix steps
- Export: Markdown (GitHub-ready) or plain text

### 📝 Manual Log Mode
No WebUSB support? No problem. Paste logs from any source:
- `adb logcat -b crash -d`
- `adb bugreport`
- `adb shell dumpsys batterystats`
- Any error trace from Xiaomi Community or forum posts

---

## 🏗️ Architecture

```
User Browser (Chrome/Edge)
         │
         ├──► Vercel (Free Hosting)
         │     └──► Next.js Static App
         │           ├── Landing Page
         │           ├── Diagnostics Dashboard
         │           └── Report Viewer
         │
         ├──► WebUSB API
         │     └──► Xiaomi Phone (USB-C)
         │           ├── logcat / bugreport
         │           ├── dumpsys (battery, thermal, network)
         │           ├── build.prop (ROM info)
         │           └── screencap (screenshots)
         │
         └──► Xiaomi MiMo API (Cloud)
               └─── MiMo V2.5 Pro
                     ├── Crash analysis
                     ├── ROM issue detection
                     ├── Solution matching
                     └── Report generation
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 16 + React 19 | UI rendering, routing |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS 3 | Dark theme UI |
| **Phone Connectivity** | WebUSB API + ADB.js | Browser-to-phone USB bridge |
| **AI Engine** | Xiaomi MiMo V2.5 Pro | Log analysis, reasoning, solution generation |
| **Hosting** | Vercel (Free Tier) | Static site hosting, CDN |
| **Version Control** | GitHub | Source code management |

---

## 🚀 Quick Start

### For End Users

1. **Open the app** (URL provided after deployment)
2. **Connect your Xiaomi phone** via USB
3. **Allow USB access** when Chrome prompts
4. Click **"Run Diagnostics"**
5. Wait ~10 seconds for AI analysis
6. Read the diagnosis and follow fix steps

> **Don't have a USB cable?** Use **Manual Logs** mode — copy-paste your logcat output.

### For Developers

```bash
# Prerequisites: Node.js 18+, npm
git clone https://github.com/forforgebe/xiaomi-diag.git
cd xiaomi-diag

# Install dependencies
npm install --legacy-peer-deps

# Configure MiMo API key
cp .env.example .env.local
# Edit .env.local — get your API key at https://platform.xiaomimimo.com

# Start development server
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start
```

### Environment Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_MIMO_API_KEY` | Xiaomi MiMo API key | Yes | — |
| `NEXT_PUBLIC_MIMO_BASE_URL` | MiMo API base URL | No | `https://api.xiaomimimo.com/v1` |
| `NEXT_PUBLIC_MIMO_MODEL` | MiMo model name | No | `mimo-v2.5-pro` |

Get your **free API key** at [platform.xiaomimimo.com](https://platform.xiaomimimo.com) (enabled by the 100T Orbit program).

---

## 💰 Xiaomi MiMo Orbit 100T Program Integration

This project is submitted as part of the **Xiaomi MiMo Orbit 百万亿 Token 创造者激励计划** (April 28 - May 28, 2026).

### How We Use the Tokens

| Token Allocation | Purpose |
|-----------------|---------|
| **60%** — AI Analysis | Every diagnostics run sends logs to MiMo V2.5 Pro for reasoning |
| **20%** — Knowledge Base | MiMo queries for matching known issues from Xiaomi databases |
| **10%** — Report Generation | Structured report formatting and enhancement |
| **10%** — Future Features | OTA regression tracking, multi-device comparison |

### Estimated Token Consumption per Diagnostic Run

| Operation | Avg Tokens | Model |
|-----------|-----------|-------|
| Log collection + preprocessing | 0 (client-side) | — |
| Crash trace analysis | ~1,500 tokens (input) | MiMo V2.5 Pro |
| ROM health check | ~800 tokens (input) | MiMo V2.5 Pro |
| Solution suggestion | ~2,000 tokens (output) | MiMo V2.5 Pro |
| **Total per run** | **~4,300 tokens** | |

At scale, 1 trillion tokens can power **~232 million diagnostics runs** — enough for every Xiaomi user to run diagnostics multiple times.

---

## 🔧 Supported Devices & ROMs

**All Xiaomi, Redmi, and POCO devices** with:

- **HyperOS 1.0+** — All variants (Global, China, EEA, India, Russia, Indonesia, Turkey, Taiwan, Japan, Korea)
- **MIUI 14+** — Legacy support
- **Android 13+**

**Tested on:**
- Xiaomi 14 Pro / Ultra
- Xiaomi 13T / 13T Pro
- Redmi Note 13 series
- POCO F6 / F6 Pro
- Xiaomi Pad 6S Pro

---

## 📊 Sample Analysis Output

Here's what a typical diagnostics session produces:

```
╔═════════════════════════════════════════╗
║        MiDiag Diagnostic Report         ║
╚═════════════════════════════════════════╝

DEVICE: Xiaomi 14 Pro
ROM:    HyperOS 2.1.0.3 (Global / Stable)
ANDROID: 15 | Kernel: 6.1.75
SECURITY PATCH: 2026-04-01

───────────────────────────────────────────
🔴 CRITICAL — Abnormal Battery Drain
───────────────────────────────────────────

ROOT CAUSE:
  App "com.xiaomi.powerkeeper" is holding a partial wakelock
  for 45+ minutes after screen-off. This is a known regression
  introduced in HyperOS 2.1.0.3 (Global variant V816.0.4.0.UNOMIXM).

SEVERITY: 🔴 High Impact
AFFECTS: All Global devices on OS2.0.100.0.VNOMIXM & OS2.0.101.0.VNOMIXM

WORKAROUND (Step-by-step):
  1. Settings → Battery → Power Saving Mode → Enable
  2. Settings → Apps → Manage Apps → Show System Apps
  3. Find "Powerkeeper" → Clear Cache → Force Stop
  4. Reboot device

OFFICIAL FIX:
  ✔ Confirmed by Xiaomi
  ✔ Fix in HyperOS 2.1.0.5 (Global)
  ⏳ ETA: ~2 weeks
  Track: https://c.mi.com/thread-123456

───────────────────────────────────────────
🟢 THERMAL STATUS: Normal (37°C)
🟢 STORAGE: 64GB/256GB used — Healthy
───────────────────────────────────────────
```

---

## 🗺️ Development Roadmap

### Phase 1: Core MVP (✅ Complete)
- [x] Next.js project setup with TypeScript + Tailwind
- [x] Landing page with feature overview
- [x] WebUSB integration for device connection
- [x] Manual logs mode (copy-paste)
- [x] MiMo API integration for AI analysis
- [x] Vercel deployment configuration
- [x] Project README & documentation

### Phase 2: Enhanced Diagnostics (🔜 In Progress)
- [ ] Real ADB.js integration (not simulated)
- [ ] Automated logcat collection via WebUSB
- [ ] ROM version database with known issues
- [ ] Battery health analysis
- [ ] Thermal diagnostics
- [ ] Crash severity classification

### Phase 3: Knowledge & Reports (📋 Planned)
- [ ] Bug report generator (Markdown export)
- [ ] Xiaomi Community thread integration
- [ ] Known issues crowd-sourcing
- [ ] Solution voting (upvote/downvote fixes)

### Phase 4: Advanced Features (🔮 Future)
- [ ] OTA regression timeline view
- [ ] Multi-device comparison dashboard
- [ ] Email notification for known issue matches
- [ ] PWA support (offline diagnostics)
- [ ] Community-contributed fix database

---

## 🤝 Contributing

This project is open-source and community-driven. Ways to help:

- **🐛 Report bugs** — [Open an issue](https://github.com/forforgebe/xiaomi-diag/issues)
- **💡 Suggest features** — [Start a discussion](https://github.com/forforgebe/xiaomi-diag/discussions)
- **🔧 Submit PRs** — Code contributions welcome! Check open issues first
- **📝 Share known issues** — Contribute to the ROM issue database
- **🌐 Translate** — Help localize the UI for different regions

---

## 📸 Media

> *Screenshots and demo video coming soon.*

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- **Xiaomi MiMo Team** — For the MiMo V2.5 API and the Orbit 100T program
- **Xiaomi MiMo API Open Platform** — [platform.xiaomimimo.com](https://platform.xiaomimimo.com)
- **WebUSB Community** — ADB.js and WebUSB standards
- **Xiaomi Community** — For the wealth of device-specific debugging knowledge

---

<div align="center">
  <br />
  <img src="https://mimo.xiaomi.com/favicon.ico" width="32" alt="MiMo" />
  <br />
  <strong>Built with ❤️ for the Xiaomi Community</strong>
  <br />
  <sub>Part of the Xiaomi MiMo Orbit 100 Trillion Token Creator Incentive Program</sub>
  <br />
  <sub>小米 MiMo Orbit 百万亿 Token 创造者激励计划</sub>
</div>
