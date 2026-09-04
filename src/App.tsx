import React, { useState, useEffect, useRef } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { VoiceHUD } from './components/VoiceHUD';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Security } from './pages/Security';
import { Diagnostics } from './pages/Diagnostics';
import { MobileControl } from './pages/MobileControl';
import { ThinkTank } from './pages/ThinkTank';
import { MemoryEngine } from './pages/MemoryEngine';
import { PerceptionEngine } from './pages/PerceptionEngine';
import { Hologram3D } from './pages/Hologram3D';
import { HologramBackdrop } from './components/HologramBackdrop';
import { StarkJarvisLab } from './components/StarkJarvisLab';
import { CognitiveBrainPanel } from './components/CognitiveBrainPanel';
import { UltronNextGenOSSuite } from './components/UltronNextGenOSSuite';
import { UltronAgentArchitecturePanel } from './components/UltronAgentArchitecturePanel';
import { UltronCoreArchitecturePanel } from './components/UltronCoreArchitecturePanel';
import { MobileDownloadModal } from './components/MobileDownloadModal';
import { FirstRunOnboardingModal } from './components/FirstRunOnboardingModal';
import { VoiceEngine } from './lib/audioVoice';
import { MobileBridge } from './lib/mobileBridge';
import { apiFetch } from './lib/api';
import { LocalIntelligenceEngine } from './lib/localIntelligence';
import { findAlternativeCommand } from './lib/commandSuggestions';
import {
  OrbState,
  VoiceState,
  ChatMessage,
  JarvisTask,
  ProviderId,
  SecuritySubMode,
  CognitiveExecutionSession,
} from './types/jarvis';
import { HologramScene } from './types/hologram';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('HOME');
  const [orbState, setOrbState] = useState<OrbState>('IDLE');
  const [voiceState, setVoiceState] = useState<VoiceState>({ state: 'IDLE' });
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [currentLanguage, setCurrentLanguage] = useState<'en-US' | 'bn-BD'>(() => {
    try {
      const saved = localStorage.getItem('jarvis_language');
      if (saved === 'en-US' || saved === 'bn-BD') return saved;
    } catch {}
    return 'bn-BD';
  });
  const [isSecurityMode, setIsSecurityMode] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('gemini');
  const [isMobileDownloadOpen, setIsMobileDownloadOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('ultron_onboarding_completed');
  });

  const [activeHologramScene, setActiveHologramScene] = useState<HologramScene | null>(null);
  const [currentCognitiveSession, setCurrentCognitiveSession] = useState<CognitiveExecutionSession | null>(null);
  const [recentCognitiveSessions, setRecentCognitiveSessions] = useState<CognitiveExecutionSession[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content:
        "**ULTRON Super Brain & Voice Intelligence Online.**\n\nDeep Analysis Cognitive Core is operational. Give me any command in English, Bangla, or Banglish (e.g. *'Heyy ULTRON, create full-stack mobile app'*, *'Debug my backend architecture'*, or *'Heyy ULTRON YouTube e gan chalao'*).",
      timestamp: new Date().toISOString(),
      providerUsed: 'gemini',
      modelUsed: 'gemini-3.7-flash',
    },
  ]);

  const [tasks, setTasks] = useState<JarvisTask[]>([]);
  const [activeTask, setActiveTask] = useState<JarvisTask | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize Voice Engine listener & Wake Word Standby
  useEffect(() => {
    const engine = VoiceEngine.getInstance();
    const bridge = MobileBridge.getInstance();

    const unsubscribe = engine.onStateChange((vState, oState) => {
      setVoiceState({ ...vState });
      setOrbState(isSecurityMode ? 'SECURITY_MODE' : oState);
      setAudioLevel(vState.audioLevel || 0);
    });

    // Start Hey Jarvis Standby mode & Background persistence
    engine.startWakeWordStandby((transcript) => {
      handleExecuteCommand(transcript);
    });

    // Wire physical headphone / lockscreen buttons to JARVIS voice trigger
    bridge.setupMediaSession(() => {
      engine.startListening((transcript) => {
        handleExecuteCommand(transcript);
      });
    });

    fetchTasks();
    fetchSecurityStatus();
    fetchCognitiveSessions();

    // Auto-resume audio context & background hold on first user tap anywhere
    const handleFirstTouch = () => {
      bridge.startBackgroundKeepAlive();
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });

    return () => {
      unsubscribe();
    };
  }, [isSecurityMode]);

  const fetchCognitiveSessions = async () => {
    try {
      const data = await apiFetch<{ sessions: CognitiveExecutionSession[] }>('/api/cognitive/sessions');
      if (data.sessions && data.sessions.length > 0) {
        setRecentCognitiveSessions(data.sessions);
        if (!currentCognitiveSession) {
          setCurrentCognitiveSession(data.sessions[0]);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch cognitive sessions:', err?.message || err);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await apiFetch<{ tasks: JarvisTask[] }>('/api/tasks');
      const normalizedTasks = (data.tasks || []).map((t: JarvisTask) => ({
        ...t,
        checkpoints: t.checkpoints || [],
        steps: t.steps || [],
        previousProviders: t.previousProviders || [],
        providerHistory: t.providerHistory || [],
      }));
      setTasks(normalizedTasks);
      if (normalizedTasks.length > 0) {
        const current =
          normalizedTasks.find(
            (t: JarvisTask) => t.status === 'IN_PROGRESS' || t.status === 'PLANNING'
          ) || normalizedTasks[0];
        setActiveTask(current);
      }
    } catch (err: any) {
      console.warn('Failed to fetch tasks:', err?.message || err);
    }
  };

  const fetchSecurityStatus = async () => {
    try {
      const data = await apiFetch<{ active: boolean }>('/api/security/mode');
      setIsSecurityMode(data.active);
    } catch (err: any) {
      console.warn('Failed to fetch security mode:', err?.message || err);
    }
  };

  // Master command handler (Voice or Text)
  const handleExecuteCommand = async (commandText: string, attachments?: any[]) => {
    if (!commandText.trim() && (!attachments || attachments.length === 0)) return;

    const engine = VoiceEngine.getInstance();
    // LOCK: Prevent premature listening while Jarvis thinks, generates, or speaks
    engine.setProcessing(true);

    // 1. Add user message to conversation
    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: commandText,
      timestamp: new Date().toISOString(),
      attachments,
    };
    
    // Capture latest history for context
    const currentHistory = [...messages, userMsg].slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setOrbState(isSecurityMode ? 'SECURITY_MODE' : 'ANALYZING');

    const localEngine = LocalIntelligenceEngine.getInstance();
    const isLocalExecutionForced = !navigator.onLine && localEngine.shouldExecuteLocally();

    try {
      let data: any;

      if (isLocalExecutionForced) {
        // Direct local onboard processing: 0ms network latency, zero hanging requests
        data = localEngine.executeOnboardCommand(commandText);
      } else {
        try {
          data = await apiFetch<any>('/api/chat/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              command: commandText,
              requestId: `REQ-${Date.now()}`,
              preferredProvider: selectedProvider,
              conversationHistory: currentHistory,
            }),
            timeoutMs: 30000, // Ample time for full multimodal reasoning and Super Brain cognitive analysis
          });

          // Cache cloud response for future offline access
          if (data?.response && !data.error) {
            localEngine.cacheCloudResponse(
              commandText,
              data.response,
              data.spokenText || data.response,
              data.intent || 'GENERAL_ASSISTANCE',
              data.hologramScene
            );
          }
        } catch (netErr: any) {
          console.warn('[Network-Notice] Primary AI request failed or offline. Engaging onboard fallback:', netErr?.message || netErr);
          // Seamlessly execute via onboard local intelligence engine
          data = localEngine.executeOnboardCommand(commandText);
        }
      }

      // Update Cognitive Brain Session State
      if (data.cognitiveSession) {
        setCurrentCognitiveSession(data.cognitiveSession);
        setRecentCognitiveSessions((prev) => [
          data.cognitiveSession,
          ...prev.filter((s) => s.id !== data.cognitiveSession.id),
        ]);
      }

      // Check if 3D Holographic Visualization was returned
      if (data.is3DAction || data.intent === '3D_HOLOGRAM_VISUALIZATION') {
        if (data.hologramScene) {
          setActiveHologramScene(data.hologramScene);
        }
        setActiveTab('HOLOGRAM_3D');
      }

      // Check if security mode toggled
      if (data.intent === 'SECURITY_MODE_ACTIVATED') {
        setIsSecurityMode(true);
        setActiveTab('SECURITY');
      } else if (data.intent === 'SECURITY_MODE_EXITED') {
        setIsSecurityMode(false);
      }

      // Check and execute direct mobile device automation (YouTube, Calls, WhatsApp, Flashlight, Background Keep-Alive)
      if (data.isMobileAction && data.deviceAction) {
        MobileBridge.getInstance().executeAction(data.deviceAction);
      } else {
        // Also run local device action detector for immediate local hardware response
        const localAction = MobileBridge.getInstance().parseAndExecuteLocalMobileCommand(commandText);
        if (localAction?.type === 'BACKGROUND_SERVICE_START') {
          MobileBridge.getInstance().startBackgroundKeepAlive();
        }
      }

      const clientSuggestion = findAlternativeCommand(commandText);
      const matchedSuggestion = data.didYouMean || (clientSuggestion ? {
        originalInput: clientSuggestion.originalInput,
        suggestedCommand: clientSuggestion.suggestedCommand,
        category: clientSuggestion.category,
        confidence: clientSuggestion.confidence,
        explanation: clientSuggestion.explanation,
      } : undefined);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        providerUsed: data.providerUsed,
        modelUsed: data.modelUsed,
        taskId: data.taskId,
        didYouMean: matchedSuggestion,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.task) {
        setActiveTask(data.task);
        fetchTasks();
      }

      // Natural Spoken Voice Response with Barge-In & Auto-Resumption
      if (data.spokenText) {
        engine.speak(data.spokenText, () => {
          engine.setProcessing(false);
        });
      } else {
        engine.setProcessing(false);
      }
    } catch (err: any) {
      console.warn('Command dispatch notification:', err);
      engine.setProcessing(false);
      const clientSuggestion = findAlternativeCommand(commandText);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Execution Notice**: ${err.message || 'Request processing failed. Please try again.'}`,
        timestamp: new Date().toISOString(),
        didYouMean: clientSuggestion ? {
          originalInput: clientSuggestion.originalInput,
          suggestedCommand: clientSuggestion.suggestedCommand,
          category: clientSuggestion.category,
          confidence: clientSuggestion.confidence,
          explanation: clientSuggestion.explanation,
        } : undefined,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      fetchTasks();
    }
  };

  const handleVoiceToggle = () => {
    const engine = VoiceEngine.getInstance();
    if (voiceState.state === 'LISTENING' || voiceState.state === 'STARTING_MIC') {
      engine.finishListeningAndSubmit();
    } else if (voiceState.state === 'SPEAKING') {
      // Barge-in interruption
      engine.triggerBargeIn();
    } else {
      // Start continuous two-way conversational session
      engine.startConversation((finalTranscript) => {
        handleExecuteCommand(finalTranscript);
      });
    }
  };

  const handleToggleSecurityMode = async (action: 'activate' | 'exit', subMode: SecuritySubMode = 'DEFENCE') => {
    try {
      const data = await apiFetch<any>('/api/security/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, subMode }),
      });
      setIsSecurityMode(data.active);
      if (data.active) {
        setActiveTab('SECURITY');
      }
    } catch (err) {
      console.error('Failed to toggle security mode:', err);
    }
  };

  const handleRunAutonomousTask = async (prompt: string, projectId: string) => {
    const data = await apiFetch<any>('/api/projects/code-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, projectId }),
    });
    fetchTasks();
    return data;
  };

  const handleFailoverTask = async (taskId: string, newProvider: ProviderId) => {
    try {
      await apiFetch(`/api/tasks/${taskId}/failover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newProvider, reason: 'Manual operator failover shift' }),
      });
      fetchTasks();
    } catch (err) {
      console.error('Failover failed:', err);
    }
  };

  const handleResumeTask = async (taskId: string) => {
    try {
      await apiFetch(`/api/tasks/${taskId}/resume`, { method: 'POST' });
      fetchTasks();
    } catch (err) {
      console.error('Resume failed:', err);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      await apiFetch(`/api/tasks/${taskId}/cancel`, { method: 'POST' });
      fetchTasks();
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Ambient 3D Holographic Particle Backdrop */}
      <HologramBackdrop opacity={0.35} />

      {/* Futuristic HUD Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        orbState={orbState}
        onVoiceClick={handleVoiceToggle}
        isSecurityMode={isSecurityMode}
        onToggleSecurity={() => handleToggleSecurityMode(isSecurityMode ? 'exit' : 'activate', 'DEFENCE')}
        onOpenMobileDownload={() => setIsMobileDownloadOpen(true)}
        currentLanguage={currentLanguage}
        onToggleLanguage={(lang) => {
          setCurrentLanguage(lang);
          VoiceEngine.getInstance().setLanguage(lang);
        }}
      />

      {/* Main Page Content Router */}
      <main className="flex-1 pb-24 md:pb-8 w-full max-w-full min-w-0 overflow-x-hidden">
        {activeTab === 'HOME' && (
          <Home
            orbState={orbState}
            audioLevel={audioLevel}
            onVoiceClick={handleVoiceToggle}
            onRunCommand={(cmd) => {
              setActiveTab('CHAT');
              handleExecuteCommand(cmd);
            }}
            activeTask={activeTask}
            isSecurityMode={isSecurityMode}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenMobileDownload={() => setIsMobileDownloadOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            currentLanguage={currentLanguage}
            onToggleLanguage={(lang) => {
              setCurrentLanguage(lang);
              VoiceEngine.getInstance().setLanguage(lang);
            }}
          />
        )}

        {activeTab === 'ARCHITECTURE' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-[640px] space-y-6">
            <UltronCoreArchitecturePanel />
            <UltronAgentArchitecturePanel />
          </div>
        )}

        {activeTab === 'NEXTGEN_OS' && (
          <UltronNextGenOSSuite />
        )}

        {activeTab === 'STARK_LAB' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <StarkJarvisLab
              orbState={orbState}
              onVoiceCommand={(cmd) => {
                setActiveTab('CHAT');
                handleExecuteCommand(cmd);
              }}
              onExecuteProtocol={(proto) => {
                handleExecuteCommand(`Execute Stark Protocol: ${proto.name} (${proto.code})`);
              }}
            />
          </div>
        )}

        {activeTab === 'COGNITIVE' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-130px)] min-h-[640px]">
            <CognitiveBrainPanel
              currentSession={currentCognitiveSession}
              recentSessions={recentCognitiveSessions}
              onAnalyzeCommand={(cmd) => handleExecuteCommand(cmd)}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'HOLOGRAM_3D' && (
          <Hologram3D
            currentScene={activeHologramScene || undefined}
            onSceneChange={setActiveHologramScene}
            onVoiceCommandSubmit={handleExecuteCommand}
          />
        )}

        {activeTab === 'THINK_TANK' && <ThinkTank />}

        {activeTab === 'MEMORY' && <MemoryEngine />}

        {activeTab === 'PERCEPTION' && <PerceptionEngine />}

        {activeTab === 'MOBILE' && (
          <MobileControl
            onRunCommand={(cmd) => {
              setActiveTab('CHAT');
              handleExecuteCommand(cmd);
            }}
            onVoiceClick={handleVoiceToggle}
            onOpenMobileDownload={() => setIsMobileDownloadOpen(true)}
          />
        )}

        {activeTab === 'CHAT' && (
          <Chat
            messages={messages}
            onSendMessage={handleExecuteCommand}
            isLoading={isLoading}
            orbState={orbState}
            onVoiceClick={handleVoiceToggle}
            selectedProvider={selectedProvider}
            onSelectProvider={(p) => setSelectedProvider(p)}
          />
        )}

        {activeTab === 'PROJECTS' && (
          <Projects onRunAutonomousTask={handleRunAutonomousTask} />
        )}

        {activeTab === 'TASKS' && (
          <Tasks
            tasks={tasks}
            onRefreshTasks={fetchTasks}
            onFailoverTask={handleFailoverTask}
            onResumeTask={handleResumeTask}
            onCancelTask={handleCancelTask}
          />
        )}

        {activeTab === 'SECURITY' && (
          <Security
            isSecurityMode={isSecurityMode}
            onToggleSecurityMode={handleToggleSecurityMode}
          />
        )}

        {activeTab === 'SETTINGS' && <Diagnostics />}
      </main>

      {/* Floating Reactive Voice HUD */}
      <VoiceHUD
        voiceState={voiceState}
        onInterrupt={() => VoiceEngine.getInstance().interrupt()}
        onStopListening={() => VoiceEngine.getInstance().stopListening()}
        onFinishSpeaking={() => VoiceEngine.getInstance().finishListeningAndSubmit()}
        onEndConversation={() => VoiceEngine.getInstance().endConversation()}
        onToggleLanguage={(lang) => {
          setCurrentLanguage(lang);
          VoiceEngine.getInstance().setLanguage(lang);
        }}
        currentLanguage={currentLanguage}
        onToggleWakeWord={() => {
          VoiceEngine.getInstance().toggleWakeWordMode((transcript) => {
            handleExecuteCommand(transcript);
          });
        }}
        isWakeWordActive={voiceState.isWakeWordActive ?? true}
        onQuickCommandSelect={(cmd) => {
          VoiceEngine.getInstance().stopListening();
          handleExecuteCommand(cmd);
        }}
      />

      {/* Mobile Download & PWA Install Center Modal */}
      <MobileDownloadModal
        isOpen={isMobileDownloadOpen}
        onClose={() => setIsMobileDownloadOpen(false)}
      />

      {/* First-Run Onboarding & System Setup Wizard Modal */}
      <FirstRunOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(settings) => {
          console.log('[ULTRON] Onboarding configured:', settings);
          if (settings.primaryProvider) {
            setSelectedProvider(settings.primaryProvider);
          }
        }}
      />
    </div>
  );
}
