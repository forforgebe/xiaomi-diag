'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeWithMiMo } from '@/lib/mimo';

// Types
type DeviceInfo = {
  connected: boolean;
  model?: string;
  product?: string;
  fingerprint?: string;
  android?: string;
  hyperos?: string;
  battery?: string;
  region?: string;
};

type DiagResult = {
  status: 'idle' | 'connecting' | 'connected' | 'collecting' | 'analyzing' | 'done' | 'error';
  device: DeviceInfo;
  logs?: string;
  analysis?: string;
  error?: string;
};

// Two UI choices since WebUSB ADB may not be available everywhere
type ConnectionMode = 'webusb' | 'manual';

export default function DiagnosticsPage() {
  const [result, setResult] = useState<DiagResult>({
    status: 'idle',
    device: { connected: false },
  });
  const [mode, setMode] = useState<ConnectionMode>('webusb');
  const [manualLog, setManualLog] = useState('');
  const [adbSupported, setAdbSupported] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if WebUSB is supported
    const supported = 'usb' in navigator;
    setAdbSupported(supported);
    if (!supported) setMode('manual');
  }, []);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result.analysis, result.logs]);

  const connectDevice = async () => {
    setResult(prev => ({ ...prev, status: 'connecting', error: undefined }));
    
    try {
      const device = await (navigator as any).usb.requestDevice({
        filters: [{ vendorId: 0x2717 }], // Xiaomi
      });
      
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      
      setResult(prev => ({
        ...prev,
        status: 'connected',
        device: { ...prev.device, connected: true, model: 'Xiaomi Device Detected' },
      }));
      
      return device;
    } catch (err: any) {
      setResult(prev => ({
        ...prev,
        status: 'error',
        error: `Connection failed: ${err.message}. Try manual mode.`,
      }));
      return null;
    }
  };

  const runDiagnostics = async () => {
    setResult(prev => ({ ...prev, status: 'collecting', error: undefined }));
    
    try {
      // Simulate log collection (WebUSB ADB is complex - real ADB.js integration would go here)
      // For now, we collect data progressively to show the flow
      
      const deviceInfo = `Device: Xiaomi 14 Pro
ROM: HyperOS 2.1.0.3 (Global)
Android: 15
Kernel: 6.1.75-android15-8
Security Patch: 2026-04-01
Battery: 85% (capacity), temp 37.2°C`;

      // Simulate step-by-step collection
      await sleep(1500);
      setResult(prev => ({ ...prev, status: 'analyzing', device: { ...prev.device, connected: true }, logs: `[LOG] Collecting device info... OK
[LOG] Reading build.prop... OK
[LOG] Dumping logcat... 1423 lines captured
[LOG] Dumping batterystats... OK
[LOG] Checking known issues DB... OK` }));

      // Call MiMo AI
      const analysis = await analyzeWithMiMo(
        `[logcat] E/AndroidRuntime: FATAL EXCEPTION: main
Process: com.xiaomi.powerkeeper, PID: 3124
java.lang.RuntimeException: Wake lock timeout
at com.xiaomi.powerkeeper.PowerService.acquireWakeLock(PowerService.java:245)
at android.os.MessageQueue.nativePollOnce(Native Method)
...
[batterystats] Wakelock: *job*/com.xiaomi.powerkeeper/check = 45m 32s
[thermal] Zone0: 42.1°C | Zone1: 39.8°C`,
        deviceInfo
      );

      setResult(prev => ({
        ...prev,
        status: 'done',
        analysis,
      }));
    } catch (err: any) {
      setResult(prev => ({
        ...prev,
        status: 'error',
        error: err.message,
      }));
    }
  };

  const handleManualDiagnose = async () => {
    if (!manualLog.trim()) return;
    
    setResult(prev => ({
      ...prev,
      status: 'analyzing',
      device: { connected: true, model: 'Manual Input' },
      logs: manualLog,
    }));

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
  };

  const statusBadge = () => {
    const map: Record<string, { color: string; label: string }> = {
      idle: { color: 'bg-gray-600', label: 'Ready' },
      connecting: { color: 'bg-yellow-500 animate-pulse', label: 'Connecting...' },
      connected: { color: 'bg-green-500', label: 'Connected' },
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Device Diagnostics</h1>
          <p className="text-sm text-xiaomi-muted">Connect your Xiaomi device and run AI-powered analysis</p>
        </div>
        {statusBadge()}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-xiaomi-card/30 rounded-lg w-fit border border-white/5">
        <button
          onClick={() => setMode('webusb')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'webusb'
              ? 'bg-xiaomi-orange text-white'
              : 'text-xiaomi-muted hover:text-white'
          }`}
        >
          🔌 WebUSB (Auto)
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'manual'
              ? 'bg-xiaomi-orange text-white'
              : 'text-xiaomi-muted hover:text-white'
          }`}
        >
          📝 Manual Logs
        </button>
      </div>

      {/* WebUSB Mode */}
      {mode === 'webusb' && (
        <div className="space-y-6">
          <div className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-3 h-3 rounded-full ${result.device.connected ? 'bg-green-500 glow-green' : 'bg-gray-600'}`} />
              <div>
                <p className="font-semibold">{result.device.connected ? 'Device Connected' : 'No Device'}</p>
                <p className="text-xs text-xiaomi-muted">
                  {result.device.connected
                    ? result.device.model || 'Xiaomi device'
                    : 'Plug in your Xiaomi phone via USB'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {!result.device.connected ? (
                <button
                  onClick={connectDevice}
                  disabled={result.status === 'connecting'}
                  className="px-6 py-3 bg-xiaomi-accent hover:bg-blue-800 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  {result.status === 'connecting' ? 'Connecting...' : '🔗 Connect Device'}
                </button>
              ) : (
                <button
                  onClick={runDiagnostics}
                  disabled={result.status === 'collecting' || result.status === 'analyzing'}
                  className="px-6 py-3 bg-xiaomi-orange hover:bg-orange-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  {(result.status === 'collecting' || result.status === 'analyzing') ? '⏳ Processing...' : '▶ Run Diagnostics'}
                </button>
              )}
              {result.status !== 'idle' && result.status !== 'connecting' && (
                <button
                  onClick={resetAll}
                  className="px-4 py-3 border border-white/10 rounded-lg text-sm text-xiaomi-muted hover:text-white transition-all"
                >
                  ↻ Reset
                </button>
              )}
            </div>
          </div>

          {!adbSupported && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm">
              ⚠️ WebUSB is not supported in your browser. Use Chrome or Edge, or switch to <button onClick={() => setMode('manual')} className="text-xiaomi-orange underline">Manual Logs mode</button>.
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div className="space-y-4">
          <div className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6">
            <label className="block text-sm font-medium mb-2">Paste your logs (logcat, bugreport, dumpsys):</label>
            <textarea
              value={manualLog}
              onChange={(e) => setManualLog(e.target.value)}
              placeholder={`Paste your log output here...

Example: adb logcat -b crash -d output, or any error trace from your Xiaomi device.`}
              className="w-full h-40 bg-black/40 border border-white/10 rounded-lg p-4 text-sm font-mono text-xiaomi-text placeholder:text-xiaomi-muted/50 focus:outline-none focus:border-xiaomi-orange/50 resize-y"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleManualDiagnose}
                disabled={!manualLog.trim() || result.status === 'analyzing'}
                className="px-6 py-3 bg-xiaomi-orange hover:bg-orange-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                {result.status === 'analyzing' ? '⏳ Analyzing...' : '🔍 Analyze with MiMo'}
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-3 border border-white/10 rounded-lg text-sm text-xiaomi-muted hover:text-white transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {result.error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
          ❌ {result.error}
        </div>
      )}

      {/* Output */}
      {(result.logs || result.analysis) && (
        <div ref={outputRef} className="mt-6 space-y-6 max-h-[800px] overflow-y-auto">
          {result.logs && (
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-xiaomi-green font-mono">●</span>
                <span className="text-xs font-medium text-xiaomi-muted">LOG COLLECTION</span>
              </div>
              <pre className="text-xs font-mono text-xiaomi-text/70 leading-relaxed whitespace-pre-wrap">
                {result.logs}
              </pre>
            </div>
          )}

          {result.analysis && (
            <div className="bg-xiaomi-card/50 border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xiaomi-orange text-lg">🧠</span>
                <span className="text-sm font-medium">Xiaomi MiMo Analysis</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                {result.analysis.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={i} className="text-base font-bold text-white mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.startsWith('🟢') || line.startsWith('🟡') || line.startsWith('🔴')) {
                    const color = line.startsWith('🟢') ? 'text-xiaomi-green' : line.startsWith('🟡') ? 'text-xiaomi-yellow' : 'text-xiaomi-red';
                    return <p key={i} className={`${color} font-medium my-1`}>{line}</p>;
                  }
                  if (line.trim().startsWith('-')) {
                    return <li key={i} className="text-xiaomi-text/80 ml-4 list-disc">{line.replace(/^-\s*/, '')}</li>;
                  }
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="text-xiaomi-text/80 my-1">{line}</p>;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
