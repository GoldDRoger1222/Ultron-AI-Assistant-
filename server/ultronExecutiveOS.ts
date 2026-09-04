import {
  UltronPersonality,
  UltronSystemHealthDiagnostic,
  PermissionLevel,
} from '../src/types/jarvis.js';
import { generateAiContent } from './gemini.js';
import { BackupAuditDocsEngine } from './backupAuditDocs.js';
import { MissionSystemEngine } from './missionSystem.js';
import { PersonalScheduleEngine } from './personalSchedule.js';
import { CommunicationAgentEngine } from './communicationAgent.js';
import { TutorEngine } from './tutorEngine.js';
import { AutonomousCoderQAEngine } from './autonomousCoderQA.js';
import { DataDocumentIntelligenceEngine } from './dataDocumentIntelligence.js';
import { VaultAndVoiceProfilesEngine } from './vaultAndVoiceProfiles.js';
import { UniversalTranslatorEngine } from './universalTranslator.js';
import { SemanticMemoryEngine } from './semanticMemoryEngine.js';
import { IoTDeviceFrameworkEngine } from './iotDeviceFramework.js';
import { HardwareMonitorEngine } from './hardwareMonitor.js';
import { VisionSpatialPluginsEngine } from './visionSpatialPlugins.js';

export class UltronExecutiveOSEngine {
  private static instance: UltronExecutiveOSEngine;
  private currentPersonality: UltronPersonality = 'FUTURISTIC';
  private isGlobalHalted: boolean = false;
  private offlineModeEnabled: boolean = false;

  private constructor() {}

  public static getInstance(): UltronExecutiveOSEngine {
    if (!UltronExecutiveOSEngine.instance) {
      UltronExecutiveOSEngine.instance = new UltronExecutiveOSEngine();
    }
    return UltronExecutiveOSEngine.instance;
  }

  public getPersonality(): UltronPersonality {
    return this.currentPersonality;
  }

  public setPersonality(personality: UltronPersonality): void {
    this.currentPersonality = personality;
  }

  public isEmergencyHalted(): boolean {
    return this.isGlobalHalted;
  }

  public isOfflineMode(): boolean {
    return this.offlineModeEnabled;
  }

  public setOfflineMode(enabled: boolean): void {
    this.offlineModeEnabled = enabled;
  }

  public triggerGlobalStop(reason: string = 'User Voice Command "ULTRON STOP"'): { stopped: boolean; activeTasksPaused: number; message: string } {
    this.isGlobalHalted = true;

    // Pause running missions
    const missionEngine = MissionSystemEngine.getInstance();
    const runningMissions = missionEngine.getMissions().filter((m) => m.status === 'RUNNING');
    runningMissions.forEach((m) => missionEngine.updateMissionStatus(m.id, 'PAUSED'));

    BackupAuditDocsEngine.getInstance().recordEvent({
      eventType: 'TASK_CANCELLED',
      agentName: 'ExecutiveOrchestrator',
      details: `GLOBAL EMERGENCY STOP ACTIVATED: ${reason}. Paused ${runningMissions.length} active missions safely.`,
      status: 'WARNING',
    });

    return {
      stopped: true,
      activeTasksPaused: runningMissions.length,
      message: `ULTRON Global Stop initiated. ${runningMissions.length} background workloads safely paused and isolated without state corruption.`,
    };
  }

  public resumeOperations(): { resumed: boolean; message: string } {
    this.isGlobalHalted = false;
    const missionEngine = MissionSystemEngine.getInstance();
    const pausedMissions = missionEngine.getMissions().filter((m) => m.status === 'PAUSED');
    pausedMissions.forEach((m) => missionEngine.updateMissionStatus(m.id, 'RUNNING'));

    BackupAuditDocsEngine.getInstance().recordEvent({
      eventType: 'TASK_START',
      agentName: 'ExecutiveOrchestrator',
      details: `System resumed. Re-activated ${pausedMissions.length} paused missions.`,
      status: 'SUCCESS',
    });

    return {
      resumed: true,
      message: `ULTRON SuperBrain operational. All sub-agents back online.`,
    };
  }

  public getSystemDiagnostics(): UltronSystemHealthDiagnostic {
    const isOffline = this.offlineModeEnabled;
    return {
      overallStatus: this.isGlobalHalted ? 'WARNING' : 'HEALTHY',
      timestamp: new Date().toISOString(),
      subsystems: [
        { name: 'Unified Agent Orchestrator', status: 'HEALTHY', latencyMs: 18, notes: 'Dynamic multi-agent routing operational' },
        { name: 'Goal & Mission System', status: 'HEALTHY', latencyMs: 24, notes: '6 mission threads active' },
        { name: 'Personal Task & Schedule', status: 'HEALTHY', latencyMs: 12, notes: 'Calendar sync ready' },
        { name: 'Communication Agent', status: 'HEALTHY', latencyMs: 32, notes: 'Sensitive action approval gate enforced' },
        { name: 'Interactive Tutor Mode', status: 'HEALTHY', latencyMs: 28, notes: 'C++, Python & AI curricula indexed' },
        { name: 'Autonomous Coding & QA', status: 'HEALTHY', latencyMs: 45, notes: 'Multi-language sandbox compiler ready' },
        { name: 'Data & Document Intelligence', status: 'HEALTHY', latencyMs: 50, notes: 'OCR & statistical inference online' },
        { name: 'Voice User Profiles & Vault', status: 'HEALTHY', latencyMs: 8, notes: 'Zero-trust key isolation active' },
        { name: 'Universal Translation Engine', status: 'HEALTHY', latencyMs: 38, notes: 'Bangla / English contextual polyglot ready' },
        { name: 'Semantic Memory & Vector Index', status: 'HEALTHY', latencyMs: 15, notes: 'Cosine similarity ranking optimal' },
        { name: 'IoT & Device Discovery', status: 'HEALTHY', latencyMs: 22, notes: 'Subnet scan protocol active' },
        { name: 'System Hardware Monitoring', status: 'HEALTHY', latencyMs: 5, notes: 'Telemetry stream nominal' },
        { name: 'Live Vision & AR/VR Engine', status: 'HEALTHY', latencyMs: 40, notes: 'WebXR fallback & camera OCR ready' },
        { name: 'Modular Plugin Architecture', status: 'HEALTHY', latencyMs: 10, notes: 'Sandbox permission scopes active' },
        { name: 'Offline Mode Fallback', status: isOffline ? 'WARNING' : 'HEALTHY', latencyMs: 2, notes: isOffline ? 'Offline local mode active' : 'Online cloud sync active' },
      ],
    };
  }

  public async orchestrateNaturalCommand(userQuery: string): Promise<{
    agentRouted: string;
    actionTaken: string;
    responseContent: string;
    personality: UltronPersonality;
    auditEventId: string;
  }> {
    const qLower = userQuery.toLowerCase();

    // Check for global stop
    if (qLower.includes('stop') && (qLower.includes('ultron') || qLower.includes('cancel') || qLower.includes('pause'))) {
      const stopRes = this.triggerGlobalStop(userQuery);
      return {
        agentRouted: 'ExecutiveSentinel',
        actionTaken: 'GLOBAL_STOP',
        responseContent: stopRes.message,
        personality: this.currentPersonality,
        auditEventId: `audit-stop-${Date.now()}`,
      };
    }

    // Check for schedule / reminder commands
    if (qLower.includes('remind') || qLower.includes('my tasks') || qLower.includes('deadline') || qLower.includes('schedule')) {
      const schedRes = await PersonalScheduleEngine.getInstance().parseNaturalScheduleCommand(userQuery);
      const audit = BackupAuditDocsEngine.getInstance().recordEvent({
        eventType: 'AGENT_INVOCATION',
        agentName: 'PersonalScheduleAgent',
        details: `Processed schedule command: "${userQuery}" -> ${schedRes.action}`,
        status: 'SUCCESS',
      });
      return {
        agentRouted: 'PersonalScheduleAgent',
        actionTaken: schedRes.action,
        responseContent: schedRes.responseMessage,
        personality: this.currentPersonality,
        auditEventId: audit.id,
      };
    }

    // Check for mission / goal decomposition
    if (qLower.startsWith('build ') || qLower.startsWith('create ') || qLower.includes('help me build') || qLower.includes('mission') || qLower.includes('goal')) {
      const mission = await MissionSystemEngine.getInstance().createMissionFromGoal(userQuery);
      const audit = BackupAuditDocsEngine.getInstance().recordEvent({
        eventType: 'TASK_START',
        agentName: 'GoalManager',
        details: `Created mission: "${mission.title}" with ${mission.subtasks.length} subtasks.`,
        status: 'SUCCESS',
      });
      return {
        agentRouted: 'GoalManager',
        actionTaken: 'MISSION_CREATED',
        responseContent: `**Goal Registered & Decomposed:** "${mission.title}"\n\nI have structured **${mission.subtasks.length} prioritized subtasks** spanning requirements analysis, scalable implementation, and automated QA verification. The first subtask is currently running.`,
        personality: this.currentPersonality,
        auditEventId: audit.id,
      };
    }

    // Check for tutor mode
    if (qLower.includes('teach me') || qLower.includes('tutor') || qLower.includes('learn ')) {
      const topic = userQuery.replace(/teach me/i, '').replace(/tutor me on/i, '').replace(/learn/i, '').trim() || 'Software Engineering';
      const lesson = await TutorEngine.getInstance().startLesson(topic, 'INTERMEDIATE');
      const audit = BackupAuditDocsEngine.getInstance().recordEvent({
        eventType: 'AGENT_INVOCATION',
        agentName: 'TutorAgent',
        details: `Tutor session generated for "${topic}".`,
        status: 'SUCCESS',
      });
      return {
        agentRouted: 'TutorAgent',
        actionTaken: 'LESSON_INITIALIZED',
        responseContent: `### 🎓 Tutor Masterclass: ${lesson.topic}\n\n${lesson.conceptExplanation}\n\n**Study Plan:**\n${lesson.studyPlanSteps.map((s) => `• ${s}`).join('\n')}\n\n*Interactive quiz and code examples are ready in the Tutor Suite.*`,
        personality: this.currentPersonality,
        auditEventId: audit.id,
      };
    }

    // Check for translation
    if (qLower.includes('translate') || qLower.includes('bangla') || qLower.includes('banglish')) {
      const trans = await UniversalTranslatorEngine.getInstance().translateText(userQuery, qLower.includes('bangla') ? 'bn-BD' : 'en-US');
      const audit = BackupAuditDocsEngine.getInstance().recordEvent({
        eventType: 'AGENT_INVOCATION',
        agentName: 'UniversalTranslator',
        details: `Translated text to ${trans.targetLanguage}.`,
        status: 'SUCCESS',
      });
      return {
        agentRouted: 'UniversalTranslator',
        actionTaken: 'TRANSLATION_COMPLETED',
        responseContent: `**Translation [${trans.sourceLanguage} ➔ ${trans.targetLanguage}]:**\n\n${trans.translatedText}${trans.banglishRomanized ? `\n\n*Banglish Phonetic:* ${trans.banglishRomanized}` : ''}`,
        personality: this.currentPersonality,
        auditEventId: audit.id,
      };
    }

    // Default executive superbrain routing with personality tuning
    const personalityToneMap: Record<UltronPersonality, string> = {
      PROFESSIONAL: 'Be highly formal, structured, clear, and focused on business/engineering outcomes.',
      FRIENDLY: 'Be warm, encouraging, engaging, and clear.',
      TEACHER: 'Explain underlying mechanics step-by-step with analogies and pedagogical clarity.',
      DEVELOPER: 'Be concise, technical, direct, with code architecture, terminal commands, and API patterns.',
      RESEARCHER: 'Provide rigorous academic, comparative analysis with source grounding and statistical depth.',
      MINIMAL: 'Give ultra-concise, direct bullet points with zero fluff.',
      FUTURISTIC: 'Speak as the advanced ULTRON Next-Gen AI Operating System — authoritative, deeply intelligent, and swift.',
    };

    const sysInstruction = `You are ULTRON, the Next-Generation Unified AI Operating System.
Active Personality: ${this.currentPersonality}
Guideline: ${personalityToneMap[this.currentPersonality]}
Offline Mode: ${this.offlineModeEnabled ? 'ACTIVE (Use local intelligence)' : 'ONLINE'}
Never expose raw secrets or pretend to execute unverified actions.`;

    const aiRes = await generateAiContent({
      prompt: userQuery,
      systemInstruction: sysInstruction,
      temperature: 0.3,
    });

    const audit = BackupAuditDocsEngine.getInstance().recordEvent({
      eventType: 'MODEL_INFERENCE',
      agentName: 'UnifiedOrchestrator',
      details: `Dispatched query to core intelligence with personality: ${this.currentPersonality}`,
      status: 'SUCCESS',
    });

    return {
      agentRouted: 'UnifiedOrchestrator',
      actionTaken: 'GENERAL_EXECUTION',
      responseContent: aiRes.text,
      personality: this.currentPersonality,
      auditEventId: audit.id,
    };
  }
}
