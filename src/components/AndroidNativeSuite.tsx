import React, { useState } from 'react';
import {
  Smartphone,
  Terminal,
  Code,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  generateAndroidManifestXml,
  generateCapacitorConfigJson,
  generateTermuxOneClickScript,
  JARVIS_NATIVE_CONFIG,
} from '../lib/androidNativeGuide';

interface AndroidNativeSuiteProps {
  serverUrl: string;
}

export const AndroidNativeSuite: React.FC<AndroidNativeSuiteProps> = ({ serverUrl }) => {
  const [activeTab, setActiveTab] = useState<'TERMUX' | 'CAPACITOR' | 'MANIFEST'>('TERMUX');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const termuxScript = generateTermuxOneClickScript(serverUrl);
  const capacitorJson = generateCapacitorConfigJson(serverUrl);
  const manifestXml = generateAndroidManifestXml();

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Native Android 24/7 Background System Suite
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                FOREGROUND DAEMON
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400">
              Run JARVIS with persistent microphone access even when the screen is locked and apps are closed.
            </p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
          <button
            onClick={() => setActiveTab('TERMUX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'TERMUX'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            1. Termux Daemon (No-PC / 1-Min)
          </button>
          <button
            onClick={() => setActiveTab('CAPACITOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'CAPACITOR'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            2. Capacitor APK Config
          </button>
          <button
            onClick={() => setActiveTab('MANIFEST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'MANIFEST'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            3. AndroidManifest.xml
          </button>
        </div>
      </div>

      {/* Tab 1: Termux 1-Minute Always-On Setup */}
      {activeTab === 'TERMUX' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono space-y-1">
              <span className="font-bold text-purple-200">
                Easiest Method: Run JARVIS 24/7 background listener on phone directly via Termux
              </span>
              <p className="text-neutral-300">
                Termux can run in the Android background indefinitely with full Wake-Lock and microphone keep-alive.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                One-Click Termux Command (Paste into Termux app):
              </span>
              <button
                onClick={() => copyToClipboard(`pkg install -y curl && curl -sSL "${serverUrl}/api/native/termux.sh" | bash`, 'termux-cmd')}
                className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'termux-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'termux-cmd' ? 'Copied Command!' : 'Copy 1-Line Command'}</span>
              </button>
            </div>

            <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto select-all">
              {`pkg update -y && pkg install -y termux-api nodejs curl
termux-wake-lock
echo "JARVIS Always-On Background Daemon Starting..."`}
            </pre>
          </div>

          {/* Step by step */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-cyan-400 font-bold">Step 1: Install Termux</span>
              <p className="text-neutral-400 text-[11px]">
                Download <strong>Termux</strong> & <strong>Termux:API</strong> from F-Droid or GitHub.
              </p>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-cyan-400 font-bold">Step 2: Paste Command</span>
              <p className="text-neutral-400 text-[11px]">
                Paste the command above and press Enter. Grant audio & wake-lock permissions.
              </p>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-cyan-400 font-bold">Step 3: 24/7 Always Active</span>
              <p className="text-neutral-400 text-[11px]">
                JARVIS will remain active in the background even when you lock your screen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Capacitor APK Config */}
      {activeTab === 'CAPACITOR' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" />
              capacitor.config.json (For Android Studio / APK Build):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(capacitorJson, 'cap-json')}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'cap-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cap-json' ? 'Copied!' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={() => handleDownloadFile(capacitorJson, 'capacitor.config.json', 'application/json')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download capacitor.config.json</span>
              </button>
            </div>
          </div>

          <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-purple-300 max-h-60 overflow-y-auto">
            {capacitorJson}
          </pre>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-400 space-y-1">
            <span className="text-white font-bold block">⚡ 3-Step APK Build Command:</span>
            <code>npx cap init "JARVIS Ultron" "com.jarvis.ultron.ai"</code><br />
            <code>npx cap add android</code><br />
            <code>npx cap open android (Builds APK in Android Studio)</code>
          </div>
        </div>
      )}

      {/* Tab 3: AndroidManifest.xml */}
      {activeTab === 'MANIFEST' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              AndroidManifest.xml (Configured with FOREGROUND_SERVICE_MICROPHONE):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(manifestXml, 'manifest-xml')}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'manifest-xml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'manifest-xml' ? 'Copied!' : 'Copy XML'}</span>
              </button>
              <button
                onClick={() => handleDownloadFile(manifestXml, 'AndroidManifest.xml', 'text/xml')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download AndroidManifest.xml</span>
              </button>
            </div>
          </div>

          <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-emerald-300 max-h-60 overflow-y-auto">
            {manifestXml}
          </pre>
        </div>
      )}
    </div>
  );
};
