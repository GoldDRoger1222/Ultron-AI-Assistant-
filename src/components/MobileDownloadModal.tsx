import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Zap,
  Radio,
  X,
  Layers,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Cpu,
} from 'lucide-react';
import { AndroidNativeSuite } from './AndroidNativeSuite';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Live Mobile URLs
  const devUrl = 'https://ais-dev-37hibhzgc2cm5dmslydony-599506132638.asia-east1.run.app';
  const sharedUrl = 'https://ais-pre-37hibhzgc2cm5dmslydony-599506132638.asia-east1.run.app';
  
  // Default to DEV because dev container is actively running right now
  const [activeUrlType, setActiveUrlType] = useState<'DEV' | 'SHARED' | 'CURRENT'>('DEV');
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Dynamic origin if available
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : devUrl;
  const activeUrl = activeUrlType === 'CURRENT' ? currentOrigin : (activeUrlType === 'DEV' ? devUrl : sharedUrl);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleTriggerInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPromptEvent(null);
      }
    } else {
      // Fallback guide notice
      handleCopyUrl(activeUrl);
      alert(
        'On Mobile Chrome / Edge: Tap browser menu (⋮) -> "Add to Home screen" or "Install app".\nOn iPhone (Safari): Tap Share icon -> "Add to Home Screen".'
      );
    }
  };

  const handleShareToMobile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JARVIS Mobile Intelligence App',
          text: 'Open JARVIS on your mobile device for voice assistant, 3D holograms, and background control:',
          url: activeUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch (err) {
        console.warn('Share cancelled or not supported:', err);
      }
    } else {
      handleCopyUrl(activeUrl);
    }
  };

  const handleDownloadLauncherHtml = () => {
    const launcherHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#06b6d4">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>JARVIS Mobile Launcher</title>
  <style>
    body {
      background: #000;
      color: #22d3ee;
      font-family: monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .orb {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, #22d3ee, #0284c7, #000);
      box-shadow: 0 0 40px #06b6d4;
      margin-bottom: 24px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.08); opacity: 1; }
    }
    .btn {
      background: #06b6d4;
      color: #000;
      font-weight: bold;
      padding: 14px 28px;
      border-radius: 30px;
      text-decoration: none;
      font-size: 16px;
      margin-top: 20px;
      display: inline-block;
    }
  </style>
  <script>
    setTimeout(() => {
      window.location.href = "${activeUrl}";
    }, 1500);
  </script>
</head>
<body>
  <div class="orb"></div>
  <h2>INITIALIZING JARVIS MOBILE CORE...</h2>
  <p>Redirecting to your mobile intelligence instance...</p>
  <a class="btn" href="${activeUrl}">TAP HERE TO OPEN IMMEDIATELY</a>
</body>
</html>`;

    const blob = new Blob([launcherHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'JARVIS-Mobile-App-Launcher.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate QR Code SVG matrix algorithm (High-Density Clean Rendering)
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=00e5ff&bgcolor=0a0a0f&data=${encodeURIComponent(
    activeUrl
  )}`;

  return (
    <div
      id="mobile-download-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="mobile-download-modal-container"
        className="bg-neutral-950 border border-cyan-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-cyan-950/40 p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white">
                  JARVIS MOBILE DOWNLOAD & PWA INSTALLER
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  READY
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Install on Android & iOS with 24/7 background audio, flashlight, voice wake-word, and lock screen controls.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* URL Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400">Target Endpoint:</span>
              <button
                onClick={() => setActiveUrlType('DEV')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeUrlType === 'DEV'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                ● Active Live Server (Recommended)
              </button>
              <button
                onClick={() => setActiveUrlType('SHARED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeUrlType === 'SHARED'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                Shared URL
              </button>
            </div>

            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dev Server Active & Online</span>
            </div>
          </div>

          {/* Center 2-Column: QR Code on Left, Direct Download & Actions on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: QR Code Scanner (5 COLS) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-neutral-900/50 border border-cyan-500/20 rounded-2xl text-center space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                Scan with Mobile Camera
              </span>

              <div className="p-3 bg-neutral-950 border-2 border-cyan-500/40 rounded-2xl shadow-xl shadow-cyan-950/30 relative group">
                <img
                  src={qrSvgUrl}
                  alt="JARVIS Mobile QR Code"
                  className="w-48 h-48 rounded-xl object-contain"
                />
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="bg-black/90 text-cyan-300 font-mono text-[10px] px-2 py-1 rounded border border-cyan-500/50">
                    SCAN TO OPEN
                  </span>
                </div>
              </div>

              <p className="text-[11px] font-mono text-neutral-400 max-w-[200px]">
                Open iPhone Camera or Android Google Lens to scan and open instantly.
              </p>
            </div>

            {/* Right: Direct Download & Installation Suite (7 COLS) */}
            <div className="md:col-span-7 space-y-4">
              {/* Active Mobile Link Box */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-neutral-400 block font-semibold">
                  Direct Mobile Web & PWA Link:
                </span>
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={activeUrl}
                    className="flex-1 bg-transparent text-xs font-mono text-cyan-300 outline-none select-all truncate"
                  />
                  <button
                    onClick={() => handleCopyUrl(activeUrl)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Install PWA Button */}
                <button
                  onClick={handleTriggerInstall}
                  className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstalled ? 'ALREADY INSTALLED' : 'INSTALL PWA (WEBAPK)'}</span>
                </button>

                {/* 2. Download Standalone Launcher HTML */}
                <button
                  onClick={handleDownloadLauncherHtml}
                  className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-cyan-500/50 text-white font-mono text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>DOWNLOAD LAUNCHER (.HTML)</span>
                </button>

                {/* 3. Send to WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Open JARVIS Mobile Platform on your phone: ${activeUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SHARE TO WHATSAPP</span>
                </a>

                {/* 4. Native Web Share */}
                <button
                  onClick={handleShareToMobile}
                  className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-purple-500/50 text-purple-300 font-mono text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{shareSuccess ? 'SHARED!' : 'NATIVE PHONE SHARE'}</span>
                </button>
              </div>

              {/* Instant Launch Link */}
              <div className="pt-2">
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-neutral-950 hover:bg-neutral-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <span>LAUNCH IN NEW MOBILE BROWSER TAB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Android Native 24/7 APK & Background Daemon Suite */}
          <AndroidNativeSuite serverUrl={activeUrl} />

          {/* 3-Step Simple Mobile Guide */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              HOW TO INSTALL JARVIS AS A FULLSCREEN NATIVE APP
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Android (Chrome / Samsung / Brave):
                </span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  1. Scan the QR code or open the link in Chrome.<br />
                  2. Tap the three dots menu (⋮) at top right.<br />
                  3. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.<br />
                  4. JARVIS is now installed in your app drawer!
                </p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-1">
                <span className="text-sky-400 font-bold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  iPhone & iPad (Safari):
                </span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  1. Scan the QR code or open the link in Safari.<br />
                  2. Tap the <strong>Share button (⎋)</strong> at the bottom.<br />
                  3. Scroll down and tap <strong>"Add to Home Screen"</strong>.<br />
                  4. Tap "Add" to launch in fullscreen with no address bar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-900 p-4 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Active 24/7 background keep-alive audio & lock screen controls ready.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
