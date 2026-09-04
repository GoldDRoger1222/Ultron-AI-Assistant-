import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Youtube,
  PhoneCall,
  MessageSquare,
  Flashlight,
  Battery,
  BatteryCharging,
  Radio,
  Navigation,
  Camera,
  Vibrate,
  ShieldCheck,
  Play,
  Pause,
  ExternalLink,
  Volume2,
  Plus,
  Trash2,
  Lock,
  Share2,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  MapPin,
  Download,
  QrCode,
} from 'lucide-react';
import { MobileBridge } from '../lib/mobileBridge';
import { VoiceEngine } from '../lib/audioVoice';
import {
  DeviceHardwareState,
  MobileContact,
  MobileDeviceAction,
} from '../types/jarvis';
import { OSBridgePanel } from '../components/OSBridgePanel';
import { UnifiedOrchestratorPanel } from '../components/UnifiedOrchestratorPanel';

interface MobileControlProps {
  onRunCommand: (cmd: string) => void;
  onVoiceClick: () => void;
  onOpenMobileDownload?: () => void;
}

export const MobileControl: React.FC<MobileControlProps> = ({
  onRunCommand,
  onVoiceClick,
  onOpenMobileDownload,
}) => {
  const bridge = MobileBridge.getInstance();
  const voiceEngine = VoiceEngine.getInstance();
  const [activeSubTab, setActiveSubTab] = useState<'MOBILE_SUITE' | 'OS_PC_BRIDGE' | 'UNIFIED_ORCHESTRATOR'>('MOBILE_SUITE');
  const [hardwareState, setHardwareState] = useState<DeviceHardwareState>(
    bridge.getHardwareState()
  );
  const [isWakeWordActive, setIsWakeWordActive] = useState<boolean>(
    voiceEngine.isWakeWordEnabled()
  );
  const [contacts, setContacts] = useState<MobileContact[]>(bridge.getContacts());
  const [actionHistory, setActionHistory] = useState<MobileDeviceAction[]>(
    bridge.getActionHistory()
  );

  // Form states
  const [ytQuery, setYtQuery] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waMsg, setWaMsg] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [mapsDest, setMapsDest] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = bridge.onStateChange((state) => {
      setHardwareState(state);
      setActionHistory(bridge.getActionHistory());
    });
    return () => unsubscribe();
  }, []);

  const handleToggleWakeWord = () => {
    const active = voiceEngine.toggleWakeWordMode((cmd) => onRunCommand(cmd));
    setIsWakeWordActive(active);
    showNotice(
      active
        ? '🎙️ "Hey Jarvis" Wake-Word Standby Active! Say "Hey Jarvis" anytime.'
        : 'Wake-Word Standby deactivated.'
    );
  };

  const handleToggleBackground = async () => {
    const active = bridge.toggleBackgroundKeepAlive();
    showNotice(
      active
        ? '🔋 Background Keep-Alive Service Activated! JARVIS is now persistent in background.'
        : 'Background service deactivated.'
    );
  };

  const handleToggleTorch = async () => {
    const turnedOn = await bridge.toggleTorch();
    showNotice(turnedOn ? '🔦 Flashlight turned ON' : 'Flashlight turned OFF');
  };

  const handleToggleWakeLock = async () => {
    if (hardwareState.isWakeLockActive) {
      bridge.releaseWakeLock();
      showNotice('Screen WakeLock released.');
    } else {
      const ok = await bridge.requestWakeLock();
      showNotice(
        ok
          ? '🔒 Screen WakeLock active (Screen will stay awake).'
          : 'WakeLock not supported or permission denied.'
      );
    }
  };

  const handleVibrateTest = () => {
    bridge.vibrate([100, 50, 150, 50, 200]);
    showNotice('📳 Haptic pulse executed on mobile device.');
  };

  const handleFetchGps = async () => {
    setGpsLoading(true);
    try {
      const coords = await bridge.getCoordinates();
      setGpsLocation({ lat: coords.latitude, lng: coords.longitude });
      showNotice(`📍 GPS Location acquired: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } catch (err: any) {
      showNotice(`GPS Error: ${err.message}`);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const added = bridge.addContact({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: 'Personal',
      isQuickDial: true,
      avatar: '👤',
    });
    setContacts(bridge.getContacts());
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
    showNotice(`Added contact: ${added.name}`);
  };

  const handleDeleteContact = (id: string) => {
    bridge.deleteContact(id);
    setContacts(bridge.getContacts());
    showNotice('Contact removed.');
  };

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Banner Notice */}
      {bannerNotice && (
        <div
          id="mobile-banner-notice"
          className="fixed bottom-20 right-4 z-50 bg-neutral-900 border border-cyan-500 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce"
        >
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-mono">{bannerNotice}</span>
        </div>
      )}

      {/* HEADER & HERO CONTROLLER */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                Mobile Automation & Background Suite
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-mono tracking-tight">
              Mobile Control & Background Service
            </h1>
            <p className="text-sm text-neutral-400 font-mono mt-1 max-w-2xl">
              Execute direct mobile actions: Open YouTube, make phone calls, send WhatsApp/SMS, control flashlight, and keep JARVIS active 24/7 in the background with lock screen controls.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0">
            {/* Master Wake Word Engine Card */}
            <div className="bg-neutral-950/80 border border-cyan-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isWakeWordActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse'
                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">
                    HEY JARVIS
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      isWakeWordActive
                        ? 'border-cyan-500 text-cyan-300 bg-cyan-500/20'
                        : 'border-neutral-700 text-neutral-400 bg-neutral-800'
                    }`}
                  >
                    {isWakeWordActive ? 'ALWAYS-ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  {isWakeWordActive
                    ? 'Say "Hey Jarvis" or "হে জার্ভিস"'
                    : 'Wake-word standby deactivated'}
                </p>
              </div>
              <button
                id="toggle-wakeword-service-btn"
                onClick={handleToggleWakeWord}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all shadow-md ml-auto ${
                  isWakeWordActive
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                {isWakeWordActive ? 'DISABLE' : 'ENABLE'}
              </button>
            </div>

            {/* Master Background Keep-Alive Toggle Card */}
            <div className="bg-neutral-950/80 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  hardwareState.isBackgroundAudioActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse'
                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                }`}
              >
                <Radio className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">
                    BACKGROUND ENGINE
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      hardwareState.isBackgroundAudioActive
                        ? 'border-emerald-500 text-emerald-300 bg-emerald-500/20'
                        : 'border-neutral-700 text-neutral-400 bg-neutral-800'
                    }`}
                  >
                    {hardwareState.isBackgroundAudioActive ? 'RUNNING' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  {hardwareState.isBackgroundAudioActive
                    ? 'Loop & WakeLock keeping process alive'
                    : 'Keep alive when app is minimized'}
                </p>
              </div>
              <button
                id="toggle-background-service-btn"
                onClick={handleToggleBackground}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all shadow-md ml-auto ${
                  hardwareState.isBackgroundAudioActive
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {hardwareState.isBackgroundAudioActive ? 'STOP' : 'ACTIVATE'}
              </button>
            </div>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-t border-neutral-800/80 pt-4 relative z-10">
          <button
            id="tab-mobile-suite"
            onClick={() => setActiveSubTab('MOBILE_SUITE')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'MOBILE_SUITE'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-900/30'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            MOBILE 24/7 SUITE
          </button>
          <button
            id="tab-os-pc-bridge"
            onClick={() => setActiveSubTab('OS_PC_BRIDGE')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'OS_PC_BRIDGE'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-900/30'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            PC NATIVE OS & TERMINAL
          </button>
          <button
            id="tab-unified-orchestrator"
            onClick={() => setActiveSubTab('UNIFIED_ORCHESTRATOR')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'UNIFIED_ORCHESTRATOR'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-900/30'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Radio className="w-4 h-4 text-purple-300" />
            UNIFIED ORCHESTRATOR & WATCHDOG
          </button>

          {onOpenMobileDownload && (
            <button
              id="btn-open-mobile-download-modal"
              onClick={onOpenMobileDownload}
              className="ml-auto px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 transition-all shadow-md cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>MOBILE DOWNLOAD & QR</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'OS_PC_BRIDGE' && <OSBridgePanel />}

      {activeSubTab === 'UNIFIED_ORCHESTRATOR' && <UnifiedOrchestratorPanel />}

      {activeSubTab === 'MOBILE_SUITE' && (
        <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Battery */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            {hardwareState.isCharging ? (
              <BatteryCharging className="w-5 h-5 animate-pulse" />
            ) : (
              <Battery className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Battery</span>
            <span className="text-sm font-mono font-bold text-white">
              {hardwareState.batteryLevel !== null ? `${hardwareState.batteryLevel}%` : 'Normal'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 block truncate">
              {hardwareState.isCharging ? 'Charging' : 'Discharging'}
            </span>
          </div>
        </div>

        {/* Screen Wake Lock */}
        <div
          onClick={handleToggleWakeLock}
          className="bg-neutral-900/70 border border-neutral-800 hover:border-cyan-500/40 cursor-pointer rounded-xl p-3.5 flex items-center gap-3 transition-all"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              hardwareState.isWakeLockActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Wake Lock</span>
            <span className="text-sm font-mono font-bold text-white">
              {hardwareState.isWakeLockActive ? 'ON' : 'OFF'}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 block">Tap to toggle</span>
          </div>
        </div>

        {/* Flashlight / Torch */}
        <div
          onClick={handleToggleTorch}
          className="bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/40 cursor-pointer rounded-xl p-3.5 flex items-center gap-3 transition-all"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              hardwareState.isTorchOn
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            <Flashlight className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Torch / Light</span>
            <span className="text-sm font-mono font-bold text-white">
              {hardwareState.isTorchOn ? 'ACTIVE' : 'OFF'}
            </span>
            <span className="text-[10px] font-mono text-amber-400 block">Tap switch</span>
          </div>
        </div>

        {/* Haptic Vibration */}
        <div
          onClick={handleVibrateTest}
          className="bg-neutral-900/70 border border-neutral-800 hover:border-purple-500/40 cursor-pointer rounded-xl p-3.5 flex items-center gap-3 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Vibrate className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Vibration</span>
            <span className="text-sm font-mono font-bold text-white">Haptic</span>
            <span className="text-[10px] font-mono text-purple-400 block">Pulse test</span>
          </div>
        </div>

        {/* GPS Location */}
        <div
          onClick={handleFetchGps}
          className="bg-neutral-900/70 border border-neutral-800 hover:border-sky-500/40 cursor-pointer rounded-xl p-3.5 flex items-center gap-3 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <MapPin className={`w-5 h-5 ${gpsLoading ? 'animate-spin' : ''}`} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">GPS Tracker</span>
            <span className="text-sm font-mono font-bold text-white">
              {gpsLocation ? `${gpsLocation.lat.toFixed(2)}, ${gpsLocation.lng.toFixed(2)}` : 'Get GPS'}
            </span>
            <span className="text-[10px] font-mono text-sky-400 block truncate">Tap location</span>
          </div>
        </div>

        {/* Lockscreen Media Controls */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Lockscreen HUD</span>
            <span className="text-sm font-mono font-bold text-white">
              {hardwareState.isMediaSessionActive ? 'Active' : 'Ready'}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 block">Notification Bar</span>
          </div>
        </div>
      </div>

      {/* QUICK VOICE & TOUCH SHORTCUT ACTIONS */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
        <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          QUICK MOBILE VOICE / TAP COMMANDS (ENGLISH & BANGLA)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <button
            onClick={() => onRunCommand('Open YouTube and play Shape of You')}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/50 rounded-xl text-left flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Youtube className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white block group-hover:text-red-400">
                ▶️ Open YouTube: Shape of You
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                "YouTube e গান চালাও"
              </span>
            </div>
          </button>

          <button
            onClick={() => onRunCommand('Call Mom')}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/50 rounded-xl text-left flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white block group-hover:text-emerald-400">
                📞 Call Mom (+1234567890)
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                "Mom ke phone koro"
              </span>
            </div>
          </button>

          <button
            onClick={() => onRunCommand('Send WhatsApp to Alex saying I am on my way')}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/50 rounded-xl text-left flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white block group-hover:text-emerald-400">
                💬 Send WhatsApp: "On my way"
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                "WhatsApp e message pathaw"
              </span>
            </div>
          </button>

          <button
            onClick={() => onRunCommand('Turn on flashlight')}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 rounded-xl text-left flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Flashlight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white block group-hover:text-amber-400">
                🔦 Toggle Flashlight (Torch)
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                "Torch jalao / আলো জ্বালাও"
              </span>
            </div>
          </button>

          <button
            onClick={() => onRunCommand('Keep running in mobile background all the time')}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/50 rounded-xl text-left flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white block group-hover:text-cyan-400">
                🔋 Run in Mobile Background 24/7
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                "Background e cholte thako"
              </span>
            </div>
          </button>

          <button
            onClick={() => onRunCommand('Open Google Maps to Airport')}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/50 rounded-xl text-left flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white block group-hover:text-sky-400">
                🗺️ Navigate: Airport Maps
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                "Maps e rasta dekhao"
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* TWO COLUMN MAIN AUTOMATION SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: YOUTUBE & CALL CONTROLLER (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. YOUTUBE AUTOMATION CARD */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">
                    YouTube Mobile Player & Search
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Direct app deep-link or browser playback
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  bridge.executeAction({
                    type: 'OPEN_APP',
                    app: 'youtube',
                    commandDescription: 'Open YouTube App',
                  })
                }
                className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-800 px-2.5 py-1.5 rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open App
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search video, artist, Bangla song, or tutorial..."
                  value={ytQuery}
                  onChange={(e) => setYtQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && ytQuery.trim()) {
                      bridge.executeAction({
                        type: 'SEARCH_YOUTUBE',
                        app: 'youtube',
                        query: ytQuery.trim(),
                        commandDescription: `Search YouTube for "${ytQuery.trim()}"`,
                      });
                    }
                  }}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => {
                    if (ytQuery.trim()) {
                      bridge.executeAction({
                        type: 'SEARCH_YOUTUBE',
                        app: 'youtube',
                        query: ytQuery.trim(),
                        commandDescription: `Search YouTube for "${ytQuery.trim()}"`,
                      });
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  PLAY
                </button>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Bangla Hit Songs',
                  'Python AI Tutorial',
                  'Lo-Fi Coding Beats',
                  'Tech Reviews 2026',
                  'C++ Full Course',
                  'Cybersecurity CTF',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setYtQuery(tag);
                      bridge.executeAction({
                        type: 'SEARCH_YOUTUBE',
                        app: 'youtube',
                        query: tag,
                        commandDescription: `Search YouTube for "${tag}"`,
                      });
                    }}
                    className="text-[11px] font-mono bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg transition-all"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. DIRECT PHONE CALL & CONTACTS DIRECTORY */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">
                    Phone Dialer & Contacts Directory
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Say "Call Him" or tap contact to dial instantly
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Contact
              </button>
            </div>

            {/* Custom Dial input */}
            <div className="flex gap-2 mb-4">
              <input
                type="tel"
                placeholder="Enter any phone number (e.g. +1234567890)..."
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  if (customPhone.trim()) {
                    bridge.executeAction({
                      type: 'MAKE_CALL',
                      app: 'phone',
                      phone: customPhone.trim(),
                      commandDescription: `Call ${customPhone.trim()}`,
                    });
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                DIAL
              </button>
            </div>

            {/* Add Contact Modal / Form */}
            {showAddContact && (
              <form
                onSubmit={handleAddContact}
                className="p-3 bg-neutral-950 border border-cyan-500/40 rounded-xl space-y-2.5 mb-4 animate-in fade-in"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name (e.g. Mom, Alex)..."
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    required
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number..."
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    required
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="px-3 py-1 text-xs font-mono text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 bg-cyan-500 text-black font-mono text-xs font-bold rounded-lg"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            )}

            {/* Saved Contacts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-2 group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl">{c.avatar || '👤'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white truncate">
                          {c.name}
                        </span>
                        {c.relation && (
                          <span className="text-[9px] font-mono text-neutral-400 bg-neutral-800 px-1.5 py-0.2 rounded">
                            {c.relation}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400 block truncate">
                        {c.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        bridge.executeAction({
                          type: 'MAKE_CALL',
                          app: 'phone',
                          phone: c.phone,
                          contactName: c.name,
                          commandDescription: `Call ${c.name} (${c.phone})`,
                        })
                      }
                      className="p-2 bg-emerald-600/30 hover:bg-emerald-500 text-emerald-300 hover:text-black rounded-lg transition-all"
                      title={`Call ${c.name}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        bridge.executeAction({
                          type: 'SEND_WHATSAPP',
                          app: 'whatsapp',
                          phone: c.phone,
                          message: `Hello ${c.name}`,
                          commandDescription: `WhatsApp ${c.name}`,
                        })
                      }
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-all"
                      title="WhatsApp message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-1.5 text-neutral-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. WHATSAPP & SMS DISPATCHER */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white">
                  WhatsApp & SMS Direct Messenger
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Dispatch instant formatted messages
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="tel"
                  placeholder="Target Phone (Optional)..."
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Message content..."
                  value={waMsg}
                  onChange={(e) => setWaMsg(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    bridge.executeAction({
                      type: 'SEND_SMS',
                      app: 'sms',
                      phone: waPhone,
                      message: waMsg || 'Hello from JARVIS',
                      commandDescription: `Send SMS: "${waMsg || 'Hello'}"`,
                    });
                  }}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-medium rounded-xl transition-all"
                >
                  Send SMS
                </button>
                <button
                  onClick={() => {
                    bridge.executeAction({
                      type: 'SEND_WHATSAPP',
                      app: 'whatsapp',
                      phone: waPhone,
                      message: waMsg || 'Hello from JARVIS',
                      commandDescription: `Send WhatsApp: "${waMsg || 'Hello'}"`,
                    });
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Send WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: APP GRID & BACKGROUND GUIDE (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. ALL-APP LAUNCHER DECK */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              MOBILE APP LAUNCHER DECK
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'hover:border-red-500' },
                { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'hover:border-emerald-500' },
                { id: 'maps', name: 'Maps', icon: '🗺️', color: 'hover:border-sky-500' },
                { id: 'spotify', name: 'Spotify', icon: '🎧', color: 'hover:border-green-500' },
                { id: 'camera', name: 'Camera', icon: '📸', color: 'hover:border-amber-500' },
                { id: 'facebook', name: 'Facebook', icon: '🌐', color: 'hover:border-blue-500' },
                { id: 'instagram', name: 'Insta', icon: '📷', color: 'hover:border-pink-500' },
                { id: 'telegram', name: 'Telegram', icon: '✈️', color: 'hover:border-sky-400' },
                { id: 'gmail', name: 'Gmail', icon: '✉️', color: 'hover:border-rose-500' },
                { id: 'calculator', name: 'Calculator', icon: '🔢', color: 'hover:border-neutral-500' },
                { id: 'settings', name: 'Settings', icon: '⚙️', color: 'hover:border-cyan-500' },
                { id: 'browser', name: 'Browser', icon: '🌍', color: 'hover:border-indigo-500' },
              ].map((app) => (
                <button
                  key={app.id}
                  onClick={() =>
                    bridge.executeAction({
                      type: 'OPEN_APP',
                      app: app.id as any,
                      commandDescription: `Launch ${app.name}`,
                    })
                  }
                  className={`p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${app.color} group`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {app.icon}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white truncate w-full">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 24/7 MOBILE BACKGROUND RUNTIME GUIDE */}
          <div className="bg-neutral-900/60 border border-cyan-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                HOW JARVIS STAYS ALIVE IN MOBILE BACKGROUND
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono text-neutral-300">
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-cyan-400 font-bold block mb-1">
                  1. Silent Audio Keep-Alive Stream
                </span>
                Plays an imperceptible, silent Web Audio oscillator that tells Android and iOS to prioritize JARVIS as an active media process, preventing OS memory sleep.
              </div>

              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-emerald-400 font-bold block mb-1">
                  2. Lock Screen MediaSession Controls
                </span>
                Places JARVIS directly on your mobile lock screen and notification shade with Play/Pause/Voice controls so you can control it without unlocking.
              </div>

              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">
                  3. Screen WakeLock API
                </span>
                Prevents your device screen from auto-dimming during critical operations and coding runs.
              </div>

              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-purple-400 font-bold block mb-1">
                  4. Add to Mobile Home Screen (PWA)
                </span>
                Tap your browser menu (⋮ on Chrome or Share on Safari) &rarr; select <strong>"Add to Home screen"</strong> to install JARVIS as a fullscreen native app!
              </div>
            </div>
          </div>

          {/* 3. RECENT DEVICE ACTIONS LOG */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase">
                DEVICE EXECUTION LOG
              </h3>
              <span className="text-[10px] font-mono text-neutral-500">
                {actionHistory.length} actions
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {actionHistory.length === 0 ? (
                <p className="text-xs font-mono text-neutral-500 py-3 text-center">
                  No device commands executed yet.
                </p>
              ) : (
                actionHistory.map((act, i) => (
                  <div
                    key={i}
                    className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="min-w-0">
                      <span className="text-white block truncate">{act.commandDescription}</span>
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {act.resultDetails}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        act.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : act.status === 'EXECUTING'
                          ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};
