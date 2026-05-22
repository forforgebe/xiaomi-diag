'use client';

import { useState, useRef, useEffect } from 'react';
import { analyzeWithMiMo } from '@/lib/mimo';

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

type AdbDevice = {
  shell: (cmd: string) => Promise<any>;
  serial: string;
};

// Type for webadb
declare const Adb: any;

export default function DiagnosticsPage() {
  const [result, setResult] = useState<DiagResult>({ status: 'idle', device: { connected: false } });
  const [mode, setMode] = useState<ConnectionMode>('webusb');
  const [manualLog, setManualLog] = useState('');
  const [adbSupported, setAdbSupported] = useState(true);
  const [adbDevice, setAdbDevice] = useState<AdbDevice | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supported = 'usb' in navigator;
    setAdbSupported(supported);
    if (!supported) setMode('manual');
  }, []);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [result.logs, result.analysis]);

  // Read all output from a shell stream
  async function readStream(stream: any): Promise<string> {
    const chunks: string[] = [];
    try {
      while (true) {
        const data = await stream.receive();
        if (!data || data.byteLength === 0) break;
        chunks.push(new TextDecoder().decode(data));
      }
    } catch (e: any) {
      if (!e.message?.includes('closed')) chunks.push('[stream ended]');
    }
    return chunks.join('');
  }

  // Run a shell command and get full output
  async function shellExec(device: AdbDevice, cmd: string): Promise<string> {
    const stream = await device.shell(cmd);
    return await readStream(stream);
  }

  const connectAndDiagnose = async () => {
    setResult(prev => ({ ...prev, status: 'connecting', error: undefined, device: { connected: false } }));
    try {
      // Step 1: Open WebUSB transport
      const transport = await Adb.open('WebUSB');
      setResult(prev => ({ ...prev, status: 'connected' }));

      // Step 2: Connect ADB
      const device: AdbDevice = await transport.connectAdb('host::');
      setAdbDevice(device);

      const info: DeviceInfo = { connected: true, serial: device.serial || '' };
      setResult(prev => ({ ...prev, status: 'collecting', device: info }));

      // Step 3: Collect device info asynchronously
      try {
        const getPropStream = await device.shell('getprop');
        const getPropOutput = await readStream(getPropStream);
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
        // Device info is best-effort
      }

      // Step 4: Collect logs in parallel
      const batchCmds = [
        shellExec(device, 'logcat -b crash -b main -b system -d -t 500 2>/dev/null || logcat -d -t 500'),
        shellExec(device, 'dumpsys battery'),
        shellExec(device, 'dumpsys batterystats 2>/dev/null | head -100'),
      ];
      const [logcat, battery, batterystats] = await Promise.all(batchCmds);

      const allLogs = `=== DEVICE INFO ===
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

      // Step 5: Send to MiMo
      const analysis = await analyzeWithMiMo(allLogs,
        `Device: ${info.model}\nROM: ${info.hyperos}\nAndroid: ${info.android}\nBuild: ${info.build}`
      );

      setResult(prev => ({ ...prev, analysis, status: 'done' }));
    } catch (err: any) {
      const msg = err.message || String(err);
      setResult(prev => ({
        ...prev, status: 'error',
        error: msg.includes('No device selected')
          ? 'No device selected.'
          : `Connection failed: ${msg}\n\nMake sure:\n1. USB Debugging is enabled (Settings → Developer Options → USB Debugging)\n2. Phone is connected via USB\n3. You're using Chrome or Edge`
      }));
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
    setAdbDevice(null);
  };

  const statusBadge = () => {
    const map: Record<string, { color: string; label: string }> = {
      idle: { color: 'bg-gray-600', label: 'Ready' },
      connecting: { color: 'bg-yellow-500 animate-pulse', label: 'Requesting USB...' },
      connected: { color: 'bg-blue-500 animate-pulse', label: 'Connected, collecting...' },
      collecting: { color: 'bg-blue-500 animate-pulse', label: 'Collecting logs...' },
      analyzing: { color: 'bg-purple-500 animate-pulse', label: 'Analyzing with MiMo...' },
      done: { color: 'bg-green-500', label: 'Complete' },
      error: { color: 'bg-red-500', label: 'Error' },
    };
    const s = map[result.status];
    return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
      {s.label}
    </span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Device Diagnostics</h1>
          <p className="text-sm text-xiaomi-muted">Connect your Xiaomi device and run AI-powered analysis</p>
        </div>
        {statusBadge()}
      </div>

      <div className="flex gap-2 mb-6 p-1 bg-xiaomi-card/30 rounded-lg w-fit border border-white/5">
        <button onClick={() => setMode('webusb')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'webusb' ? 'bg-xiaomi-orange text-white' : 'text-xiaomi-muted hover:text-white'}`}>🔌 WebUSB</button>
        <button onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-xiaomi-orange text-white' : 'text-xiaomi-muted hover:text-white'}`}>📝 Manual Logs</button>
      </div>

      {mode === 'webusb' && (
        <div className="space-y-6">
          <div className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-3 h-3 rounded-full ${result.device.connected ? 'bg-green-500 glow-green' : 'bg-gray-600'}`} />
              <div>
                <p className="font-semibold">{result.device.connected ? 'Device Connected' : 'No Device'}</p>
                <p className="text-xs text-xiaomi-muted">
                  {result.device.connected
                    ? `${result.device.model || ''} (${result.device.serial || '?'})`
                    : 'Enable USB Debugging on your Xiaomi phone (Developer Options → USB Debugging), then plug it in via USB.'}
                </p>
              </div>
            </div>

            {result.device.connected && (
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono bg-black/30 rounded-lg p-3">
                <div><span className="text-xiaomi-muted">Model:</span> {result.device.model || '?'}</div>
                <div><span className="text-xiaomi-muted">ROM:</span> {result.device.hyperos || '?'}</div>
                <div><span className="text-xiaomi-muted">Android:</span> {result.device.android || '?'}</div>
                <div><span className="text-xiaomi-muted">Serial:</span> {result.device.serial || '?'}</div>
              </div>
            )}

            <button onClick={connectAndDiagnose}
              disabled={result.status === 'connecting' || result.status === 'collecting' || result.status === 'analyzing'}
              className="px-6 py-3 bg-xiaomi-orange hover:bg-orange-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {result.status === 'idle' && '🔗 Connect & Diagnose'}
              {result.status === 'connecting' && '⏳ Connecting...'}
              {(result.status === 'collecting' || result.status === 'analyzing') && '⏳ Processing...'}
              {result.status === 'done' && '▶ Run Again'}
              {result.status === 'error' && '↻ Retry'}
              {result.status === 'connected' && '▶ Run Diagnostics'}
            </button>
            {result.status !== 'idle' && (
              <button onClick={resetAll} className="ml-3 px-4 py-3 border border-white/10 rounded-lg text-sm text-xiaomi-muted hover:text-white transition-all">
                ↻ Reset
              </button>
            )}
          </div>

          {!adbSupported && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm">
              ⚠️ WebUSB is not supported in your browser. Use Chrome 89+ or Edge 89+, or switch to <button onClick={() => setMode('manual')} className="text-xiaomi-orange underline">Manual Logs mode</button>.
            </div>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6">
          <label className="block text-sm font-medium mb-2">Paste your logs (logcat, bugreport, dumpsys):</label>
          <textarea value={manualLog} onChange={(e) => setManualLog(e.target.value)}
            placeholder={`Paste your log output here...`}
            className="w-full h-40 bg-black/40 border border-white/10 rounded-lg p-4 text-sm font-mono text-xiaomi-text placeholder:text-xiaomi-muted/50 focus:outline-none focus:border-xiaomi-orange/50 resize-y" />
          <div className="flex gap-3 mt-4">
            <button onClick={handleManualDiagnose} disabled={!manualLog.trim() || result.status === 'analyzing'}
              className="px-6 py-3 bg-xiaomi-orange hover:bg-orange-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {result.status === 'analyzing' ? '⏳ Analyzing...' : '🔍 Analyze with MiMo'}
            </button>
            <button onClick={resetAll} className="px-4 py-3 border border-white/10 rounded-lg text-sm text-xiaomi-muted hover:text-white transition-all">Clear</button>
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
                <span className="text-xs font-medium text-xiaomi-muted">LOG COLLECTION</span>
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
                <span className="text-sm font-medium">Xiaomi MiMo Analysis</span>
              </div>
              <div className="text-sm text-xiaomi-text/80 leading-relaxed whitespace-pre-wrap">
                {result.analysis}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
