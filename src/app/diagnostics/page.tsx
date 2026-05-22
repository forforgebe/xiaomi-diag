'use client';

import { useState, useRef, useEffect } from 'react';
import { analyzeWithMiMo } from '@/lib/mimo';
import { useLang } from '@/lib/lang';

// webadb is dynamically imported to avoid SSR issues (references window)

type DeviceInfo = {
  connected: boolean;
  serial?: string;
  model?: string;
  product?: string;
  fingerprint?: string;
  android?: string;
  hyperos?: string;
  build?: string;
};

type DiagResult = {
  status: 'idle' | 'connecting' | 'connected' | 'collecting' | 'analyzing' | 'done' | 'error';
  device: DeviceInfo;
  logs?: string;
  analysis?: string;
  error?: string;
};

type ConnectionMode = 'webusb' | 'manual';

/** Read ALL output from a shell command stream (handles WRTE/OKAY/CLSE framing) */
async function readShellOutput(stream: any): Promise<string> {
  const chunks: DataView[] = [];

  while (true) {
    const msg = await stream.receive();
    if (msg.cmd === 'CLSE') {
      if (msg.data && msg.data.byteLength > 0) chunks.push(msg.data);
      break;
    }
    if (msg.cmd === 'WRTE' && msg.data) {
      chunks.push(msg.data);
      // Tell the device we got this chunk so it sends the next one
      await stream.send('OKAY');
    }
    // Ignore other messages (OKAY during connect, etc.)
  }

  const total = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(combined);
}

export default function DiagnosticsPage() {
  const { t, lang } = useLang();
  const [result, setResult] = useState<DiagResult>({ status: 'idle', device: { connected: false } });
  const [mode, setMode] = useState<ConnectionMode>('webusb');
  const [manualLog, setManualLog] = useState('');
  const [adbSupported, setAdbSupported] = useState(true);
  const [adbStatus, setAdbStatus] = useState<string>('');
  const outputRef = useRef<HTMLDivElement>(null);
  // Keep a reference to the ADB device so we can reuse it
  const adbDeviceRef = useRef<any>(null);

  useEffect(() => {
    const supported = 'usb' in navigator;
    setAdbSupported(supported);
    if (!supported) setMode('manual');
  }, []);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [result.logs, result.analysis]);

  const connectAndDiagnose = async () => {
    setResult(prev => ({ ...prev, status: 'connecting', error: undefined, device: { connected: false } }));
    setAdbStatus('');

    try {
      // Step 1: Open WebUSB transport (shows browser device picker)
      setAdbStatus(lang === 'zh' ? '正在打开 USB 连接...' : 'Opening USB connection...');
      // Dynamically import webadb (avoids SSR window reference errors)
      const Adb = (await import('webadb')).default;
      Adb.Opt.key_size = 2048;

      const transport = await Adb.open('WebUSB');
      setResult(prev => ({ ...prev, status: 'connected' }));
      setAdbStatus(lang === 'zh' ? 'USB 已连接，正在建立 ADB 连接...' : 'USB connected, establishing ADB connection...');

      // Step 2: Connect ADB with auth handshake
      const device = await transport.connectAdb('host::');
      adbDeviceRef.current = device;

      const serial = device.banner?.split(':')?.[0] || 'unknown';
      const info: DeviceInfo = { connected: true, serial };
      setResult(prev => ({ ...prev, status: 'collecting', device: info }));
      setAdbStatus(lang === 'zh' ? '已连接，正在收集设备信息...' : 'Connected, collecting device info...');

      // Step 3: Get device properties
      try {
        const shellStream = await device.shell('getprop');
        const getPropOutput = await readShellOutput(shellStream);
        const lines = getPropOutput.split('\n');
        for (const line of lines) {
          const match = line.match(/\[([^\]]+)\]:\s*\[([^\]]*)\]/);
          if (match) {
            const key = match[1];
            const val = match[2];
            if (key.includes('ro.product.model') && !info.model) info.model = val;
            if (key.includes('ro.product.name') && !info.product) info.product = val;
            if (key.includes('ro.build.fingerprint') && !info.fingerprint) info.fingerprint = val;
            if (key.includes('ro.build.version.sdk')) info.android = 'Android ' + val;
            if (key.includes('ro.build.version.incremental') && !info.build) info.build = val;
            if (key.includes('ro.build.version.hyperos')) info.hyperos = 'HyperOS ' + val;
          }
        }
        if (!info.hyperos) info.hyperos = 'HyperOS ' + (info.build || '?');
        info.android = info.android || 'Android ?';
        info.model = info.model || 'Xiaomi Device';
        setResult(prev => ({ ...prev, device: info }));
      } catch (e) {
        console.warn('getprop failed, using defaults', e);
      }

      // Step 4: Collect logs in parallel
      setAdbStatus(lang === 'zh' ? '正在收集日志...' : 'Collecting logs...');

      // Run shell commands sequentially to avoid stream conflicts
      const logStream = await device.shell('logcat -b crash -b main -b system -d -t 500 2>/dev/null');
      const logcat = await readShellOutput(logStream);

      const batStream = await device.shell('dumpsys battery');
      const battery = await readShellOutput(batStream);

      const batStatStream = await device.shell('dumpsys batterystats 2>/dev/null | head -100');
      const batterystats = await readShellOutput(batStatStream);

      const deviceLabel = lang === 'zh' ? '设备信息' : 'DEVICE INFO';
      const allLogs = `=== ${deviceLabel} ===
Model: ${info.model}
ROM: ${info.hyperos}
Android: ${info.android}
Build: ${info.build}
Fingerprint: ${info.fingerprint}

=== LOGCAT (last 500 lines) ===
${logcat}

=== BATTERY ===
${battery}

=== BATTERY STATS ===
${batterystats}`;

      setResult(prev => ({ ...prev, logs: allLogs, status: 'analyzing' }));
      setAdbStatus(lang === 'zh' ? '正在使用 MiMo AI 分析...' : 'Analyzing with MiMo AI...');

      const analysis = await analyzeWithMiMo(allLogs,
        `Device: ${info.model}\nROM: ${info.hyperos}\nAndroid: ${info.android}\nBuild: ${info.build}`
      );

      setResult(prev => ({ ...prev, analysis, status: 'done' }));
      setAdbStatus('');
    } catch (err: any) {
      const msg = err.message || String(err);
      console.error('ADB error:', err);

      // User-friendly error messages
      let errHint: string;
      if (msg.includes('No device selected') || msg.includes('requestDevice')) {
        errHint = lang === 'zh'
          ? '未选择 USB 设备。请确保：\n1. 手机已通过 USB 连接\n2. USB 调试已开启\n3. 使用 Chrome 或 Edge 浏览器'
          : 'No USB device selected. Make sure:\n1. Phone is connected via USB\n2. USB Debugging is enabled\n3. You\'re using Chrome or Edge';
      } else if (msg.includes('open') || msg.includes('claim') || msg.includes('interface')) {
        errHint = lang === 'zh'
          ? '无法打开 ADB 接口。请：\n1. 断开并重新连接 USB\n2. 在手机上确认「允许 USB 调试」\n3. 尝试更换 USB 线或端口'
          : 'Cannot open ADB interface. Please:\n1. Disconnect and reconnect USB\n2. Confirm "Allow USB debugging" on phone\n3. Try a different USB cable or port';
      } else if (msg.includes('auth') || msg.includes('denied')) {
        errHint = lang === 'zh'
          ? 'ADB 授权被拒绝。请在手机上确认 RSA 密钥授权。'
          : 'ADB authorization denied. Please confirm RSA key fingerprint on your phone.';
      } else if (msg.includes('Failed to connect') || msg.includes('version')) {
        errHint = lang === 'zh'
          ? 'ADB 连接失败。可能是手机不支持或 USB 调试模式异常。'
          : 'ADB connection failed. Phone may not support it or USB Debugging is misconfigured.';
      } else {
        errHint = lang === 'zh'
          ? `连接失败: ${msg}\n\n请确保：\n1. USB 调试已开启\n2. 手机已通过 USB 连接\n3. 使用 Chrome 或 Edge 浏览器`
          : `Connection failed: ${msg}\n\nMake sure:\n1. USB Debugging is enabled\n2. Phone is connected via USB\n3. You're using Chrome or Edge`;
      }
      setResult(prev => ({
        ...prev, status: 'error',
        error: errHint
      }));
      setAdbStatus('');
    }
  };

  const handleManualDiagnose = async () => {
    if (!manualLog.trim()) return;
    setResult(prev => ({ ...prev, status: 'analyzing', device: { connected: true, model: 'Manual Input' }, logs: manualLog }));
    try {
      const analysis = await analyzeWithMiMo(manualLog, 'Device: Manual input (user-provided logs)');
      setResult(prev => ({ ...prev, status: 'done', analysis }));
    } catch (err: any) {
      setResult(prev => ({ ...prev, status: 'error', error: err.message }));
    }
  };

  const resetAll = () => {
    setResult({ status: 'idle', device: { connected: false } });
    setManualLog('');
    setAdbStatus('');
    adbDeviceRef.current = null;
  };

  const statusMap: Record<string, { color: string; labelKey: string }> = {
    idle: { color: 'bg-gray-600', labelKey: 'status.ready' },
    connecting: { color: 'bg-yellow-500 animate-pulse', labelKey: 'status.usb' },
    connected: { color: 'bg-blue-500 animate-pulse', labelKey: 'status.connected' },
    collecting: { color: 'bg-blue-500 animate-pulse', labelKey: 'status.collecting' },
    analyzing: { color: 'bg-purple-500 animate-pulse', labelKey: 'status.analyzing' },
    done: { color: 'bg-green-500', labelKey: 'status.complete' },
    error: { color: 'bg-red-500', labelKey: 'status.error' },
  };

  const getBtnLabel = () => {
    switch (result.status) {
      case 'idle': return t('diag.btn_idle');
      case 'connecting': return t('diag.connecting');
      case 'connected': return t('diag.btn_diag');
      case 'collecting':
      case 'analyzing': return t('diag.processing');
      case 'done': return t('diag.btn_again');
      case 'error': return t('diag.btn_retry');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('diag.title')}</h1>
          <p className="text-sm text-xiaomi-muted">{t('diag.subtitle')}</p>
        </div>
        {(() => {
          const s = statusMap[result.status];
          return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              {t(s.labelKey)}
            </span>
          );
        })()}
      </div>

      <div className="flex gap-2 mb-6 p-1 bg-xiaomi-card/30 rounded-lg w-fit border border-white/5">
        <button onClick={() => setMode('webusb')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'webusb' ? 'bg-xiaomi-orange text-white' : 'text-xiaomi-muted hover:text-white'}`}>{t('diag.connect')}</button>
        <button onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-xiaomi-orange text-white' : 'text-xiaomi-muted hover:text-white'}`}>{t('diag.manual')}</button>
      </div>

      {mode === 'webusb' && (
        <div className="space-y-6">
          <div className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-3 h-3 rounded-full ${result.device.connected ? 'bg-green-500 glow-green' : 'bg-gray-600'}`} />
              <div>
                <p className="font-semibold">{result.device.connected ? t('diag.connected') : t('diag.no_device')}</p>
                <p className="text-xs text-xiaomi-muted">
                  {result.device.connected
                    ? `${result.device.model || ''} (${result.device.serial || '?'})`
                    : t('diag.usb_hint')}
                </p>
              </div>
            </div>

            {adbStatus && (
              <div className="mb-3 text-xs text-xiaomi-muted/70 font-mono">
                {adbStatus}
              </div>
            )}

            {result.device.connected && (
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono bg-black/30 rounded-lg p-3">
                <div><span className="text-xiaomi-muted">Model:</span> {result.device.model || '?'}</div>
                <div><span className="text-xiaomi-muted">ROM:</span> {result.device.hyperos || '?'}</div>
                <div><span className="text-xiaomi-muted">Android:</span> {result.device.android || '?'}</div>
                <div><span className="text-xiaomi-muted">Serial:</span> {result.device.serial || '?'}</div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={connectAndDiagnose}
                disabled={result.status === 'connecting' || result.status === 'collecting' || result.status === 'analyzing'}
                className="px-6 py-3 bg-xiaomi-orange hover:bg-orange-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                {getBtnLabel()}
              </button>
              {result.status !== 'idle' && (
                <button onClick={resetAll} className="px-4 py-3 border border-white/10 rounded-lg text-sm text-xiaomi-muted hover:text-white transition-all">
                  {t('diag.reset')}
                </button>
              )}
            </div>
          </div>

          {!adbSupported && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm">
              {t('diag.browser_warn')}
            </div>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6">
          <label className="block text-sm font-medium mb-2">{t('diag.manual_hint')}</label>
          <textarea value={manualLog} onChange={(e) => setManualLog(e.target.value)}
            placeholder={lang === 'zh' ? '在此粘贴日志...' : 'Paste your log output here...'}
            className="w-full h-40 bg-black/40 border border-white/10 rounded-lg p-4 text-sm font-mono text-xiaomi-text placeholder:text-xiaomi-muted/50 focus:outline-none focus:border-xiaomi-orange/50 resize-y" />
          <div className="flex gap-3 mt-4">
            <button onClick={handleManualDiagnose} disabled={!manualLog.trim() || result.status === 'analyzing'}
              className="px-6 py-3 bg-xiaomi-orange hover:bg-orange-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {result.status === 'analyzing' ? t('diag.analyzing') : t('diag.manual_btn')}
            </button>
            <button onClick={resetAll} className="px-4 py-3 border border-white/10 rounded-lg text-sm text-xiaomi-muted hover:text-white transition-all">{t('diag.reset')}</button>
          </div>
        </div>
      )}

      {result.error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300 whitespace-pre-wrap">
          ❌ {result.error}
        </div>
      )}

      {(result.logs || result.analysis) && (
        <div ref={outputRef} className="mt-6 space-y-6 max-h-[800px] overflow-y-auto">
          {result.logs && (
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-xiaomi-green font-mono">●</span>
                <span className="text-xs font-medium text-xiaomi-muted">{t('log.title')}</span>
              </div>
              <pre className="text-xs font-mono text-xiaomi-text/70 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {result.logs.substring(0, 3000)}{result.logs.length > 3000 ? '\n... (truncated)' : ''}
              </pre>
            </div>
          )}
          {result.analysis && (
            <div className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xiaomi-orange text-lg">🧠</span>
                <span className="text-sm font-medium">{t('analysis.title')}</span>
              </div>
              <div className="text-sm text-xiaomi-text/80 leading-relaxed whitespace-pre-wrap">
                {result.analysis}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GitHub link at bottom */}
      <div className="mt-8 text-center">
        <a href="https://github.com/forforgebe/xiaomi-diag" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-xs text-xiaomi-muted hover:text-white hover:border-xiaomi-orange/30 transition-all">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View on GitHub
        </a>
      </div>
    </div>
  );
}
