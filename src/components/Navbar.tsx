import React, { useState } from 'react';
import {
  Mic,
  MessageSquare,
  FolderGit2,
  ListTodo,
  ShieldAlert,
  Cpu,
  Activity,
  Terminal,
  Volume2,
  Sparkles,
  Smartphone,
  Brain,
  Eye,
  Database,
  RotateCcw,
  Zap,
  Menu,
  X,
  QrCode,
  Settings,
  Layers,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { OrbState } from '../types/jarvis';

export type NavTab =
  | 'HOME'
  | 'ARCHITECTURE'
  | 'NEXTGEN_OS'
  | 'STARK_LAB'
  | 'COGNITIVE'
  | 'HOLOGRAM_3D'
  | 'THINK_TANK'
  | 'MEMORY'
  | 'PERCEPTION'
  | 'MOBILE'
  | 'CHAT'
  | 'PROJECTS'
  | 'TASKS'
  | 'SECURITY'
  | 'SETTINGS';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  orbState: OrbState;
  onVoiceClick: () => void;
  isSecurityMode: boolean;
  onToggleSecurity: () => void;
  onOpenMobileDownload?: () => void;
  currentLanguage?: 'en-US' | 'bn-BD';
  onToggleLanguage?: (lang: 'en-US' | 'bn-BD') => void;
  connectionStatus?: {
    internet: boolean;
    ai: boolean;
    backend: boolean;
    voice: boolean;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  orbState,
  onVoiceClick,
  isSecurityMode,
  onToggleSecurity,
  onOpenMobileDownload,
  currentLanguage = 'bn-BD',
  onToggleLanguage,
  connectionStatus = { internet: true, ai: true, backend: true, voice: true },
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; color: string }[] = [
    { id: 'HOME', label: 'Home Center', icon: <Cpu className="w-4 h-4 text-cyan-400" />, color: 'cyan' },
    { id: 'ARCHITECTURE', label: 'Agent Architecture (VFS/Sandbox)', icon: <Layers className="w-4 h-4 text-cyan-400" />, badge: '4-TIER', color: 'cyan' },
    { id: 'NEXTGEN_OS', label: 'ULTRON Next-Gen AI OS Suite', icon: <Sparkles className="w-4 h-4 text-cyan-300" />, badge: 'OS v5.4', color: 'cyan' },
    { id: 'STARK_LAB', label: 'Stark Lab & Armors', icon: <Zap className="w-4 h-4 text-amber-400" />, badge: 'STARK', color: 'amber' },
    { id: 'COGNITIVE', label: 'Super Brain Cognitive', icon: <Brain className="w-4 h-4 text-purple-400" />, badge: 'CORE', color: 'purple' },
    { id: 'HOLOGRAM_3D', label: '3D Hologram Schematics', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, badge: '3D', color: 'cyan' },
    { id: 'THINK_TANK', label: 'Think-Tank Synthesizer', icon: <Layers className="w-4 h-4 text-blue-400" />, color: 'blue' },
    { id: 'MEMORY', label: 'Memory Matrix & Vector', icon: <Database className="w-4 h-4 text-purple-400" />, color: 'purple' },
    { id: 'PERCEPTION', label: 'Vision & Tone Sensor', icon: <Eye className="w-4 h-4 text-emerald-400" />, color: 'emerald' },
    { id: 'MOBILE', label: 'Mobile & 24/7 Controls', icon: <Smartphone className="w-4 h-4 text-cyan-400" />, badge: 'PHONE', color: 'cyan' },
    { id: 'CHAT', label: 'Interactive Chat Matrix', icon: <MessageSquare className="w-4 h-4 text-cyan-400" />, color: 'cyan' },
    { id: 'PROJECTS', label: 'Autonomous Project Hub', icon: <FolderGit2 className="w-4 h-4 text-amber-400" />, color: 'amber' },
    { id: 'TASKS', label: 'Task Execution Engine', icon: <ListTodo className="w-4 h-4 text-emerald-400" />, color: 'emerald' },
    { id: 'SECURITY', label: 'Defense & Security Mode', icon: <ShieldAlert className="w-4 h-4 text-rose-400" />, badge: isSecurityMode ? 'ACTIVE' : undefined, color: 'rose' },
    { id: 'SETTINGS', label: 'System Diagnostics & LLM', icon: <Settings className="w-4 h-4 text-neutral-400" />, color: 'neutral' },
  ];

  return (
    <>
      {/* TOP DESKTOP & MOBILE HEADER */}
      <header
        id="jarvis-top-header"
        className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-neutral-950/95 backdrop-blur-xl px-3 sm:px-4 py-2.5 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Assistant Tag */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              id="header-logo-btn"
              onClick={() => handleSelectTab('HOME')}
              className="flex items-center gap-2 text-left group"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isSecurityMode
                    ? 'border-rose-500/50 bg-rose-950/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                }`}
              >
                {isSecurityMode ? <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" /> : <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-mono font-bold tracking-widest text-sm sm:text-base text-white">
                    ULTRON
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                      isSecurityMode
                        ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                        : 'border-purple-500/40 text-purple-300 bg-purple-500/10'
                    }`}
                  >
                    {isSecurityMode ? 'SEC' : 'AI'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-mono tracking-tight hidden sm:block">
                  Cognitive Voice & Holographic AI
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-neutral-900/80 border border-neutral-800 rounded-full px-2 py-1">
            <button
              id="nav-tab-home"
              onClick={() => onTabChange('HOME')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                activeTab === 'HOME'
                  ? 'bg-cyan-500 text-black font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              HOME
            </button>
            <button
              id="nav-tab-nextgen-os"
              onClick={() => onTabChange('NEXTGEN_OS')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'NEXTGEN_OS'
                  ? 'bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-950/40 border border-cyan-500/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              OS SUITE v5.4
            </button>
            <button
              id="nav-tab-stark"
              onClick={() => onTabChange('STARK_LAB')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'STARK_LAB'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                  : 'text-amber-300 hover:text-amber-200 hover:bg-neutral-800 border border-amber-500/30'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              STARK LAB
            </button>
            <button
              id="nav-tab-cognitive"
              onClick={() => onTabChange('COGNITIVE')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'COGNITIVE'
                  ? 'bg-purple-600 text-white font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-purple-400 hover:bg-neutral-800'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              SUPER BRAIN
            </button>
            <button
              id="nav-tab-hologram"
              onClick={() => onTabChange('HOLOGRAM_3D')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'HOLOGRAM_3D'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-950/50 border border-cyan-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              3D HOLOGRAM
            </button>
            <button
              id="nav-tab-thinktank"
              onClick={() => onTabChange('THINK_TANK')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'THINK_TANK'
                  ? 'bg-cyan-500 text-black font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              THINK-TANK
            </button>
            <button
              id="nav-tab-memory"
              onClick={() => onTabChange('MEMORY')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'MEMORY'
                  ? 'bg-purple-500 text-white font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-purple-400 hover:bg-neutral-800'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              MEMORY
            </button>
            <button
              id="nav-tab-perception"
              onClick={() => onTabChange('PERCEPTION')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'PERCEPTION'
                  ? 'bg-emerald-500 text-black font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-emerald-400 hover:bg-neutral-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              VISION & TONE
            </button>
            <button
              id="nav-tab-mobile"
              onClick={() => onTabChange('MOBILE')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'MOBILE'
                  ? 'bg-cyan-500 text-black font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              MOBILE & 24/7
            </button>
            <button
              id="nav-tab-chat"
              onClick={() => onTabChange('CHAT')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                activeTab === 'CHAT'
                  ? 'bg-cyan-500 text-black font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              CHAT
            </button>
            <button
              id="nav-tab-projects"
              onClick={() => onTabChange('PROJECTS')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                activeTab === 'PROJECTS'
                  ? 'bg-cyan-500 text-black font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              PROJECTS
            </button>
            <button
              id="nav-tab-tasks"
              onClick={() => onTabChange('TASKS')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                activeTab === 'TASKS'
                  ? 'bg-cyan-500 text-black font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              TASKS
            </button>
            <button
              id="nav-tab-security"
              onClick={() => onTabChange('SECURITY')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'SECURITY' || isSecurityMode
                  ? 'bg-rose-500 text-white font-semibold shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  : 'text-neutral-300 hover:text-rose-400 hover:bg-neutral-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              SECURITY
            </button>
            <button
              id="nav-tab-settings"
              onClick={() => onTabChange('SETTINGS')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                activeTab === 'SETTINGS'
                  ? 'bg-cyan-500 text-black font-semibold shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              DIAGNOSTICS
            </button>
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Voice STT Language Quick Selector */}
            {onToggleLanguage && (
              <button
                id="header-voice-lang-toggle-btn"
                onClick={() => onToggleLanguage(currentLanguage === 'en-US' ? 'bn-BD' : 'en-US')}
                className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-neutral-900 border border-neutral-700 text-neutral-200 hover:border-cyan-400 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title={`Speech recognition language: ${currentLanguage === 'bn-BD' ? 'বাংলা (Bengali)' : 'English / Banglish'}. Click to toggle.`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{currentLanguage === 'bn-BD' ? 'বাং' : 'EN'}</span>
              </button>
            )}

            {/* Mobile App Download */}
            <button
              id="header-mobile-download-btn"
              onClick={onOpenMobileDownload}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
              title="Get Download Link & QR Code for Mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">APP</span>
            </button>

            {/* Security Mode Quick Switch */}
            <button
              id="quick-security-toggle"
              onClick={onToggleSecurity}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition-all ${
                isSecurityMode
                  ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-rose-400 hover:border-rose-500/40'
              }`}
              title="Secret phrase: 'JARVIS MODE'"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isSecurityMode ? 'SEC: ON' : 'JARVIS MODE'}
              </span>
            </button>

            {/* Header Voice Trigger */}
            <button
              id="header-voice-mic-btn"
              onClick={onVoiceClick}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all ${
                orbState === 'LISTENING'
                  ? 'border-sky-400 bg-sky-400 text-black shadow-[0_0_15px_rgba(56,189,248,0.5)] animate-pulse'
                  : orbState === 'SPEAKING'
                  ? 'border-amber-400 bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {orbState === 'LISTENING' ? 'LISTENING' : orbState === 'SPEAKING' ? 'SPEAKING' : 'VOICE'}
              </span>
            </button>

            {/* Mobile Hamburger Drawer Button */}
            <button
              id="mobile-hamburger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-cyan-500/50 transition-colors"
              aria-label="Toggle Navigation Drawer"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="xl:hidden fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-200"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-sm text-white">ULTRON MATRIX</h3>
                <p className="font-mono text-[10px] text-neutral-400">All Modules & System Controls</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Modules Grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Voice Language Selector in Mobile Drawer */}
            {onToggleLanguage && (
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs text-neutral-300 font-bold">ভয়েস ভাষা (Voice Language):</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => onToggleLanguage('bn-BD')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      currentLanguage === 'bn-BD'
                        ? 'bg-cyan-500 text-black font-bold shadow-sm'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    বাংলা
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleLanguage('en-US')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      currentLanguage === 'en-US'
                        ? 'bg-cyan-500 text-black font-bold shadow-sm'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            )}

            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              Core Applications & Modules
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-neutral-900/80 border-neutral-800/80 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-mono font-semibold text-white">
                          {item.label}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-500">
                          ID: {item.id}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenMobileDownload) onOpenMobileDownload();
              }}
              className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mobile PWA Setup</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onVoiceClick();
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono text-xs font-bold flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        id="jarvis-mobile-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-cyan-500/20 bg-neutral-950/95 backdrop-blur-xl px-1 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around shadow-2xl"
      >
        <button
          id="mobile-nav-home"
          onClick={() => onTabChange('HOME')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-colors ${
            activeTab === 'HOME' ? 'text-cyan-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>HOME</span>
        </button>

        <button
          id="mobile-nav-stark"
          onClick={() => onTabChange('STARK_LAB')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-colors ${
            activeTab === 'STARK_LAB' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>STARK</span>
        </button>

        <button
          id="mobile-nav-chat"
          onClick={() => onTabChange('CHAT')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-colors ${
            activeTab === 'CHAT' ? 'text-cyan-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>CHAT</span>
        </button>

        {/* Central Mobile Voice Orb Trigger */}
        <button
          id="mobile-nav-voice-orb"
          onClick={onVoiceClick}
          className={`-mt-5 w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all ${
            orbState === 'LISTENING'
              ? 'border-sky-400 bg-sky-400 text-black shadow-[0_0_22px_rgba(56,189,248,0.9)] scale-110 animate-pulse'
              : isSecurityMode
              ? 'border-rose-500 bg-rose-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.7)]'
              : 'border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.6)]'
          }`}
          aria-label="Toggle Voice Control"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          id="mobile-nav-mobile"
          onClick={() => onTabChange('MOBILE')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-colors ${
            activeTab === 'MOBILE' ? 'text-cyan-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>PHONE</span>
        </button>

        <button
          id="mobile-nav-tasks"
          onClick={() => onTabChange('TASKS')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-colors ${
            activeTab === 'TASKS' ? 'text-cyan-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>TASKS</span>
        </button>

        <button
          id="mobile-nav-more"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-mono text-neutral-400 hover:text-white transition-colors"
        >
          <Menu className="w-4 h-4" />
          <span>MORE</span>
        </button>
      </nav>
    </>
  );
};

