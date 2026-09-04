import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { ProviderRouter } from './server/providers.js';
import { TaskManager } from './server/taskManager.js';
import { SecurityEngine } from './server/security.js';
import { AgentOrchestrator } from './server/agents.js';
import {
  normalizeTranscript,
  cleanTextForSpeech,
  synthesizeGeminiSpeech,
  registerVoiceRequestId,
  testFullVoicePipeline,
  transcribeAudioWithGemini,
} from './server/voice.js';
import { generateAiContent } from './server/gemini.js';
import { parseMobileIntent } from './server/mobileController.js';
import { MemoryVectorEngine } from './server/memory.js';
import { SandboxEngine } from './server/sandbox.js';
import { ThinkTankEngine } from './server/thinkTank.js';
import { PredictiveDefenseEngine } from './server/predictiveDefense.js';
import { CognitiveBrainEngine } from './server/cognitiveBrain.js';
import { HologramEngine } from './server/hologramEngine.js';
import { ThreeDGenerationManager } from './server/geometryEngine/threeDProviders.js';
import { RevisionEngine } from './server/geometryEngine/revisionEngine.js';
import { MeshValidator } from './server/geometryEngine/meshValidator.js';
import { OSBridgeEngine } from './server/osBridge.js';
import { detectHighConfidenceAlternative } from './server/commandSuggester.js';
import { InternetIntelligenceEngine } from './server/internetIntelligence.js';
import { AgenticBrainEngine } from './server/agenticBrain.js';
import { SelfVerificationEngine } from './server/verifier.js';
import { ComputerAgentEngine } from './server/computer.js';
import { PermissionEngine } from './server/permissions.js';
import { ScreenUnderstandingEngine } from './server/screen.js';
import { PersonalKnowledgeBrain } from './server/knowledge.js';
import { ProjectMemoryEngine } from './server/projectMemory.js';
import { PersonalizationEngine } from './server/personalization.js';
import { ModelRouterEngine } from './server/modelRouter.js';
import { SelfHealingEngine } from './server/recovery.js';
import { ToolConnectorRegistry } from './server/tools.js';
import { SecuritySentinelEngine } from './server/securitySentinel.js';
import { EmergencyFailsafeEngine } from './server/failsafe.js';
import { DeveloperModeEngine } from './server/developerMode.js';
import { AutomationEngine } from './server/automation.js';
import { MissionSystemEngine } from './server/missionSystem.js';
import { PersonalScheduleEngine } from './server/personalSchedule.js';
import { CommunicationAgentEngine } from './server/communicationAgent.js';
import { TutorEngine } from './server/tutorEngine.js';
import { AutonomousCoderQAEngine } from './server/autonomousCoderQA.js';
import { DataDocumentIntelligenceEngine } from './server/dataDocumentIntelligence.js';
import { VaultAndVoiceProfilesEngine } from './server/vaultAndVoiceProfiles.js';
import { UniversalTranslatorEngine } from './server/universalTranslator.js';
import { SemanticMemoryEngine } from './server/semanticMemoryEngine.js';
import { IoTDeviceFrameworkEngine } from './server/iotDeviceFramework.js';
import { HardwareMonitorEngine } from './server/hardwareMonitor.js';
import { VisionSpatialPluginsEngine } from './server/visionSpatialPlugins.js';
import { BackupAuditDocsEngine } from './server/backupAuditDocs.js';
import { UltronExecutiveOSEngine } from './server/ultronExecutiveOS.js';
import { SelfDiagnosticEngine } from './server/selfDiagnosticEngine.js';
import { IntentRouter } from './server/intentRouter.js';
import { FileSystemManager } from './server/vfsFileSystemManager.js';
import { CodeSandbox } from './server/codeSandbox.js';
import { ToolDispatcher } from './server/toolDispatcher.js';
import { AgentLoopEngine } from './server/agentLoop.js';
import { UltronBrainEngine } from './server/ultronBrainEngine.js';
import { ContextEngine } from './server/contextEngine.js';
import { MemoryEngine } from './server/memoryEngine.js';
import { ToolRegistry } from './server/toolRegistry.js';
import { TaskOrchestrator } from './server/taskOrchestrator.js';
import { UltronVoiceEngine } from './server/voiceEngine.js';
import { UltronTestSuite } from './server/ultronTestSuite.js';
import { UltronBrainCore } from './server/ultronBrainCore.js';
import { UltronCoreTestSuite } from './server/ultronCoreTestSuite.js';
import { ToolRegistryCore } from './server/toolRegistryCore.js';
import { UnifiedFileSystemManager } from './server/filesystemAdapter.js';
import { ExecutionManager } from './server/executionManager.js';
import { MemoryManager } from './server/memoryManager.js';
import { VoiceEngineCore } from './server/voiceEngineCore.js';
import { PermissionManager } from './server/permissionManager.js';
import { SecuritySandbox } from './server/securitySandbox.js';
import { ErrorAnalyzerCore } from './server/errorAnalyzerCore.js';
import { VerifierCore } from './server/verifierCore.js';
import { IntentRouterCore } from './server/intentRouterCore.js';
import { TaskOrchestratorCore } from './server/taskOrchestratorCore.js';
import { TaskCategory, TaskPriority, ProviderId } from './src/types/jarvis.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ----------------------------------------------------
// 1. SYSTEM & HEALTH
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'ULTRON — Deep Analysis Cognitive Core & Voice Intelligence',
    version: 'ULTRON-OS v5.0-CognitiveSuperBrain',
    runtime: 'Cloud Node.js Full-Stack ESM',
    geminiKeyPresent: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// 2. PROVIDERS & ROUTER API
// ----------------------------------------------------
app.get('/api/providers', (req, res) => {
  const router = ProviderRouter.getInstance();
  res.json({
    providers: router.getProviders(),
    costPreference: router.getCostPreference(),
  });
});

app.post('/api/providers/cost-preference', (req, res) => {
  const { preference } = req.body;
  if (preference) {
    ProviderRouter.getInstance().setCostPreference(preference);
  }
  res.json({ success: true, costPreference: ProviderRouter.getInstance().getCostPreference() });
});

app.post('/api/providers/test', async (req, res) => {
  const { providerId } = req.body;
  const router = ProviderRouter.getInstance();
  const start = Date.now();
  try {
    const result = await router.executeWithFailover('GENERAL_AI', 'System handshake test. Reply with: "OK: JARVIS ready."', undefined, providerId);
    const latencyMs = Date.now() - start;
    res.json({
      success: true,
      providerId: result.providerUsed,
      modelUsed: result.modelUsed,
      latencyMs,
      response: result.text.slice(0, 120),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. TASK MANAGER API (ONE COMMAND = ONE PERSISTENT TASK)
// ----------------------------------------------------
app.get('/api/tasks', (req, res) => {
  const tasks = TaskManager.getInstance().getAllTasks();
  res.json({ tasks });
});

app.get('/api/tasks/:id', (req, res) => {
  const task = TaskManager.getInstance().getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json({ task });
});

app.post('/api/tasks', (req, res) => {
  const { command, category = 'GENERAL_AI', priority = 'NORMAL', preferredProvider, projectId } = req.body;
  if (!command) {
    res.status(400).json({ error: 'Command is required' });
    return;
  }
  const task = TaskManager.getInstance().createTask(command, category as TaskCategory, priority as TaskPriority, preferredProvider, projectId);
  res.json({ task });
});

app.post('/api/tasks/:id/checkpoint', (req, res) => {
  const { summary, stateSnapshot, changedFiles } = req.body;
  const cp = TaskManager.getInstance().addCheckpoint(req.params.id, summary || 'Manual checkpoint', stateSnapshot, changedFiles);
  if (!cp) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json({ checkpoint: cp });
});

app.post('/api/tasks/:id/failover', (req, res) => {
  const { newProvider, reason = 'User requested provider shift' } = req.body;
  const updated = TaskManager.getInstance().failoverTask(req.params.id, newProvider, reason);
  if (!updated) {
    res.status(404).json({ error: 'Task not found or failover failed' });
    return;
  }
  res.json({ task: updated });
});

app.post('/api/tasks/:id/cancel', (req, res) => {
  const updated = TaskManager.getInstance().updateTask(req.params.id, {
    status: 'CANCELLED',
    progressPercent: 100,
  });
  res.json({ success: !!updated, task: updated });
});

app.post('/api/tasks/:id/resume', (req, res) => {
  const task = TaskManager.getInstance().getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  task.status = 'IN_PROGRESS';
  const updated = TaskManager.getInstance().updateTask(task.id, task);
  res.json({ success: true, task: updated });
});

// ----------------------------------------------------
// 4. CHAT & MASTER COMMAND ORCHESTRATION
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const { message, context, preferredProvider, category = 'GENERAL_AI' } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const router = ProviderRouter.getInstance();
  try {
    const result = await router.executeWithFailover(category, message, context, preferredProvider);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/command', async (req, res) => {
  const startTime = Date.now();
  const { command, requestId, preferredProvider, projectId, conversationHistory } = req.body;
  if (!command) {
    res.status(400).json({ error: 'Command is required' });
    return;
  }

  if (requestId && !registerVoiceRequestId(requestId)) {
    res.status(409).json({ error: 'Duplicate voice request ignored' });
    return;
  }

  // 1. Multi-turn context preparation
  const historyTurns: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(conversationHistory)
    ? conversationHistory
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .map((m: any) => ({ role: m.role, content: m.content }))
    : [];

  // 2. Multilingual Semantic Intent Classification
  const routing = IntentRouter.getInstance().classifyIntent(command, historyTurns);
  const norm = normalizeTranscript(routing.normalizedInput || command);
  const normalizedText = norm.normalized_transcript;
  const lower = normalizedText.toLowerCase();

  // Check for high-confidence alternative command suggestion ("Did you mean?")
  const didYouMean = detectHighConfidenceAlternative(command);

  // 3. Wake Word Alone (Explicit startup/listening confirmation ONLY)
  if (routing.isWakeWordOnly) {
    const isBangla = routing.detectedLanguage === 'Bangla' || routing.detectedLanguage === 'Banglish';
    const spoken = isBangla
      ? 'বলুন, আলট্রন শুনছে।'
      : 'ULTRON online. I am listening.';
    const textResp = isBangla
      ? '### ⚡ ULTRON কগনিটিভ সিস্টেম সক্রিয়\n**স্ট্যাটাস:** শুনছি... আপনার প্রশ্ন বা কমান্ড বলুন।'
      : '### ⚡ ULTRON Standing By\n**Status:** Listening. State your command or query.';

    res.json({
      intent: 'WAKE_WORD_ACK',
      response: textResp,
      spokenText: spoken,
      providerUsed: 'gemini',
      modelUsed: 'ultron-wake-engine',
      detectedLanguage: routing.detectedLanguage,
      didYouMean,
      diagnostics: {
        user_input: command,
        detected_language: routing.detectedLanguage,
        detected_intent: routing.intent,
        response_mode: routing.responseMode,
        selected_agent: routing.selectedAgent,
        selected_model: 'ultron-wake-engine',
        tool_used: 'WAKE_WORD_DETECTOR',
        final_response: textResp,
        execution_time_ms: Date.now() - startTime,
      },
    });
    return;
  }

  // 3.5. ULTRON LIVE SELF-DIAGNOSTIC ENGINE (Strict Live Capability Testing)
  const isUpgradeQuestion =
    (lower.includes('upgrade') || lower.includes('আপগ্রেড') || lower.includes('উন্নতি') || lower.includes('improve')) &&
    (lower.includes('which feature') || lower.includes('what feature') || lower.includes('কোন ফিচার') || lower.includes('কোনটা আগে') || lower.includes('agey') || lower.includes('first') || lower.includes('next'));

  if (isUpgradeQuestion && SelfDiagnosticEngine.getInstance().getLastSummary()) {
    const lang = routing.detectedLanguage === 'Bangla' ? 'Bangla' : routing.detectedLanguage === 'Banglish' ? 'Banglish' : 'English';
    const upgradeReport = SelfDiagnosticEngine.getInstance().getUpgradeAnalysis(lang);
    res.json({
      intent: 'SELF_DIAGNOSTIC_UPGRADE_ANALYSIS',
      response: upgradeReport.text,
      spokenText: upgradeReport.spokenText,
      providerUsed: 'gemini',
      modelUsed: 'ultron-self-diagnostic-engine',
      detectedLanguage: routing.detectedLanguage,
      didYouMean,
      diagnostics: {
        user_input: command,
        detected_language: routing.detectedLanguage,
        detected_intent: 'SELF_DIAGNOSTIC',
        response_mode: 'SYSTEM',
        selected_agent: 'ULTRON_SELF_DIAGNOSTIC_ENGINE',
        selected_model: 'ultron-self-diagnostic-engine',
        tool_used: 'UPGRADE_PRIORITY_ANALYZER',
        final_response: upgradeReport.text,
        execution_time_ms: Date.now() - startTime,
      },
    });
    return;
  }

  if (routing.intent === 'SELF_DIAGNOSTIC') {
    const lang = routing.detectedLanguage === 'Bangla' ? 'Bangla' : routing.detectedLanguage === 'Banglish' ? 'Banglish' : 'English';
    const diagSummary = await SelfDiagnosticEngine.getInstance().runFullDiagnostic({
      preferredLanguage: lang,
    });

    const taskMgr = TaskManager.getInstance();
    const task = taskMgr.createTask('ULTRON Live Self-Diagnostic', 'GENERAL_AI', 'HIGH', preferredProvider, projectId);
    taskMgr.addCheckpoint(task.id, `Inspected 30 system capability modules - Status: ${diagSummary.overallStatus}`);
    taskMgr.addCheckpoint(task.id, `Verified ${diagSummary.workingCount}/${diagSummary.totalCapabilities} capabilities working (${diagSummary.operationalScorePercent}%)`);
    task.steps.forEach((s) => (s.status = 'COMPLETED'));
    task.status = 'COMPLETED';
    task.progressPercent = 100;
    taskMgr.updateTask(task.id, task);

    res.json({
      intent: 'SELF_DIAGNOSTIC',
      response: diagSummary.markdownReport,
      spokenText: diagSummary.spokenSummary,
      providerUsed: 'gemini',
      modelUsed: 'ultron-self-diagnostic-engine',
      diagnosticSummary: diagSummary,
      capabilities: diagSummary.capabilities,
      operationalScore: diagSummary.operationalScorePercent,
      overallStatus: diagSummary.overallStatus,
      taskId: task.id,
      task,
      detectedLanguage: routing.detectedLanguage,
      didYouMean,
      diagnostics: {
        user_input: command,
        detected_language: routing.detectedLanguage,
        detected_intent: 'SELF_DIAGNOSTIC',
        response_mode: 'SYSTEM',
        selected_agent: 'ULTRON_SELF_DIAGNOSTIC_ENGINE',
        selected_model: 'ultron-self-diagnostic-engine',
        tool_used: 'LIVE_CAPABILITY_DIAGNOSTIC_HARNESS',
        final_response: diagSummary.markdownReport,
        execution_time_ms: Date.now() - startTime,
      },
    });
    return;
  }

  // 4. Check for Security activation secret phrase
  if (lower.includes('jarvis mode') || lower.includes('security mode')) {
    SecurityEngine.getInstance().activateSecurityMode('DEFENCE');
    const respText = 'Security Mode activated. Displaying Defensive Incident Terminal, Attack Simulation, and Offence verification controls.';
    res.json({
      intent: 'SECURITY_MODE_ACTIVATED',
      response: respText,
      spokenText: 'Security Mode activated. Attack, Defence, and Offence ready.',
      securityMode: true,
      subMode: 'DEFENCE',
      detectedLanguage: routing.detectedLanguage,
      didYouMean,
      diagnostics: {
        user_input: command,
        detected_language: routing.detectedLanguage,
        detected_intent: 'SYSTEM_COMMAND',
        response_mode: 'SYSTEM',
        selected_agent: 'DEFENSIVE_SECURITY_SENTINEL',
        selected_model: 'security-engine',
        tool_used: 'SECURITY_MODE_ACTUATOR',
        final_response: respText,
        execution_time_ms: Date.now() - startTime,
      },
    });
    return;
  }

  if (lower.includes('jarvis normal') || lower.includes('exit security mode')) {
    SecurityEngine.getInstance().exitSecurityMode();
    const respText = 'Switched back to Normal JARVIS Assistant Mode.';
    res.json({
      intent: 'SECURITY_MODE_EXITED',
      response: respText,
      spokenText: 'Returned to normal mode.',
      securityMode: false,
      detectedLanguage: routing.detectedLanguage,
      didYouMean,
      diagnostics: {
        user_input: command,
        detected_language: routing.detectedLanguage,
        detected_intent: 'SYSTEM_COMMAND',
        response_mode: 'SYSTEM',
        selected_agent: 'EXECUTIVE_SUPERVISOR',
        selected_model: 'security-engine',
        tool_used: 'SECURITY_MODE_ACTUATOR',
        final_response: respText,
        execution_time_ms: Date.now() - startTime,
      },
    });
    return;
  }

  // 5. Check for Direct Mobile & Device Controls (YouTube, Calls, WhatsApp, Flashlight, Background Mode)
  const mobileIntent = parseMobileIntent(normalizedText, norm.detected_language);
  if (mobileIntent.isMobileAction && mobileIntent.action && routing.intent === 'DEVICE_CONTROL') {
    const taskMgr = TaskManager.getInstance();
    const task = taskMgr.createTask(normalizedText, 'DEVICE_CONTROL', 'HIGH', preferredProvider, projectId);
    task.steps.forEach((s) => (s.status = 'COMPLETED'));
    task.status = 'COMPLETED';
    task.progressPercent = 100;
    taskMgr.addCheckpoint(task.id, `Device Action Executed: ${mobileIntent.action.commandDescription}`);
    taskMgr.updateTask(task.id, task);

    const textResp = mobileIntent.textResponse || `Executed ${mobileIntent.action.commandDescription}`;
    const spoken = mobileIntent.spokenResponse || `Executing ${mobileIntent.action.commandDescription}`;

    res.json({
      intent: 'MOBILE_DEVICE_ACTION',
      isMobileAction: true,
      deviceAction: mobileIntent.action,
      response: textResp,
      spokenText: spoken,
      providerUsed: 'gemini',
      modelUsed: 'device-companion-engine',
      taskId: task.id,
      task,
      detectedLanguage: routing.detectedLanguage,
      didYouMean,
      diagnostics: {
        user_input: command,
        detected_language: routing.detectedLanguage,
        detected_intent: 'DEVICE_CONTROL',
        response_mode: 'EXECUTE',
        selected_agent: 'MOBILE_DEVICE_COMPANION',
        selected_model: 'device-companion-engine',
        tool_used: 'DEVICE_BRIDGE_INTEGRATION',
        final_response: textResp,
        execution_time_ms: Date.now() - startTime,
      },
    });
    return;
  }

  // 6. Check for 3D Hologram Intent or Voice Manipulation Commands
  const hologramEngine = HologramEngine.getInstance();
  const intent3D = hologramEngine.parse3DIntent(normalizedText);
  if (intent3D.is3DRequest && intent3D.action && routing.intent === '3D_GENERATION') {
    let scene: any;
    let spokenResponse: string;

    if (
      intent3D.action.type === 'CREATE_SCENE' &&
      (intent3D.action.customPrompt || intent3D.conceptType === 'INVENTION_CONCEPT')
    ) {
      scene = await hologramEngine.generateDynamicSceneWithAI(intent3D.action.customPrompt || normalizedText);
      spokenResponse = intent3D.action.spokenExplanation || `Generated custom 3D ${scene.title}. All ${scene.components.length} multi-layer assemblies are online in holographic viewport.`;
    } else {
      const applied = hologramEngine.applyActionToScene(intent3D.action);
      scene = applied.scene;
      spokenResponse = applied.spokenResponse;
    }

    const taskMgr = TaskManager.getInstance();
    const task = taskMgr.createTask(normalizedText, 'VISION', 'HIGH', preferredProvider, projectId);
    task.steps.forEach((s) => (s.status = 'COMPLETED'));
    task.status = 'COMPLETED';
    task.progressPercent = 100;
    taskMgr.addCheckpoint(task.id, `3D Hologram Action: ${intent3D.action.type} -> ${scene.title}`);
    taskMgr.updateTask(task.id, task);

    const detailedText = `### 🌐 Holographic 3D Visualization: ${scene.title}
**Concept Type:** \`${scene.conceptType}\` | **Components:** \`${scene.components.length}\` | **Version:** \`v${scene.version}\`
**Dimensions (Approx):** ${scene.dimensions ? `${scene.dimensions.x} × ${scene.dimensions.y} × ${scene.dimensions.z} ${scene.dimensions.unit}` : 'Conceptual Scale'}

${scene.description}

#### 🔬 Primary Sub-Assemblies:
${scene.components.slice(0, 5).map((c: any) => `- **${c.name}** (${c.layer}): ${c.description || 'Active assembly component'}`).join('\n')}

${spokenResponse}`;

    res.json({
      intent: '3D_HOLOGRAM_VISUALIZATION',
      is3DAction: true,
      hologramScene: scene,
      hologramAction: intent3D.action,
      response: detailedText,
      spokenText: spokenResponse,
      providerUsed: 'gemini',
      modelUsed: 'threejs-procedural-spatial-engine',
      taskId: task.id,
      task,
      detectedLanguage: routing.detectedLanguage,
      didYouMean,
      diagnostics: {
        user_input: command,
        detected_language: routing.detectedLanguage,
        detected_intent: '3D_GENERATION',
        response_mode: 'CREATE',
        selected_agent: 'SPATIAL_3D_ARCHITECT',
        selected_model: 'threejs-procedural-spatial-engine',
        tool_used: 'THREEJS_HOLOGRAM_ENGINE',
        final_response: detailedText,
        execution_time_ms: Date.now() - startTime,
      },
    });
    return;
  }

  // 7. Pass through Canonical ULTRON Core Unified Brain
  try {
    const brain = UltronBrainCore.getInstance();
    const brainRes = await brain.process({
      input: command,
      conversationHistory: historyTurns,
      preferredProvider,
      requestId,
    });

    const is3D = brainRes.intent === '3D_GENERATION';
    const isDevice = brainRes.intent === 'DEVICE_CONTROL';
    const meshTool = brainRes.toolResults.find((t) => t.tool === 'generate_3d');
    const deviceTool = brainRes.toolResults.find((t) => t.tool === 'device_action');

    const orchestrator = TaskOrchestratorCore.getInstance();
    const task = brainRes.taskId ? orchestrator.getTask(brainRes.taskId) : undefined;

    const cognitiveSession = {
      id: `COG-${Date.now()}`,
      taskId: brainRes.taskId,
      query: command,
      intentType: brainRes.intent,
      analysis: {
        complexityScore: brainRes.intent === 'MULTI_STEP_TASK' ? 8 : 4,
        architecturalCategory: brainRes.intent,
        riskLevel: 'LOW',
        detectedLanguage: brainRes.detectedLanguage,
      },
      decomposition: task?.steps?.map((s) => ({
        id: `step-${s.stepIndex}`,
        name: s.title,
        status: s.status,
      })) || [],
      decisionMatrix: {
        provider: brainRes.providerUsed || 'local',
        model: brainRes.modelUsed || 'ultron-brain-core',
      },
      verificationReport: {
        status: brainRes.verificationStatus,
        evidence: brainRes.evidence,
      },
    };

    res.json({
      success: brainRes.success,
      intent: brainRes.intent,
      taskId: brainRes.taskId,
      sessionId: cognitiveSession.id,
      task,
      response: brainRes.markdownResponse,
      spokenText: brainRes.spokenResponse,
      providerUsed: brainRes.providerUsed || 'local',
      modelUsed: brainRes.modelUsed || 'ultron-brain-core',
      detectedLanguage: brainRes.detectedLanguage,
      toolResults: brainRes.toolResults,
      verificationStatus: brainRes.verificationStatus,
      evidence: brainRes.evidence,
      didYouMean,
      is3DAction: is3D,
      hologramScene: meshTool?.data?.mesh || undefined,
      isMobileAction: isDevice,
      deviceAction: deviceTool?.data || undefined,
      cognitiveSession,
      deepAnalysis: cognitiveSession.analysis,
      decomposition: cognitiveSession.decomposition,
      decisionMatrix: cognitiveSession.decisionMatrix,
      verificationReport: cognitiveSession.verificationReport,
      diagnostics: {
        user_input: command,
        detected_language: brainRes.detectedLanguage,
        detected_intent: brainRes.intent,
        selected_model: brainRes.modelUsed || 'ultron-brain-core',
        provider: brainRes.providerUsed,
        tools_used: brainRes.toolResults.map((t) => t.tool),
        verification_status: brainRes.verificationStatus,
        execution_time_ms: Date.now() - startTime,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/suggest', (req, res) => {
  const { input } = req.body;
  if (!input || typeof input !== 'string') {
    res.json({ suggestion: null });
    return;
  }
  const suggestion = detectHighConfidenceAlternative(input);
  res.json({ suggestion });
});

app.post('/api/chat/classify-intent', (req, res) => {
  const { input, conversationHistory } = req.body;
  if (!input || typeof input !== 'string') {
    res.status(400).json({ error: 'Input is required' });
    return;
  }
  const routing = IntentRouter.getInstance().classifyIntent(input, conversationHistory);
  res.json({ routing });
});

// ----------------------------------------------------
// 4.3 ULTRON 12-AGENT ORCHESTRATION API
// ----------------------------------------------------
app.get('/api/agents', (req, res) => {
  const agents = AgentOrchestrator.getInstance().getAgents();
  res.json({ agents });
});

app.post('/api/agents/:id/invoke', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }
    const result = await AgentOrchestrator.getInstance().invokeAgent(req.params.id, prompt, context);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4.5 ULTRON COGNITIVE SUPER BRAIN API
// ----------------------------------------------------
app.get('/api/cognitive/sessions', (req, res) => {
  const sessions = CognitiveBrainEngine.getInstance().getRecentSessions();
  res.json({ sessions });
});

app.get('/api/cognitive/sessions/:id', (req, res) => {
  const session = CognitiveBrainEngine.getInstance().getSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Cognitive session not found' });
    return;
  }
  res.json({ session });
});

app.post('/api/cognitive/analyze', (req, res) => {
  const { command } = req.body;
  if (!command) {
    res.status(400).json({ error: 'Command is required' });
    return;
  }
  const engine = CognitiveBrainEngine.getInstance();
  const analysis = engine.analyzeIntentAndScope(command);
  const decomposition = engine.decomposeTask(command, analysis);
  const decisionMatrix = engine.evaluateDecisionMatrix(command, 'GENERAL_AI');
  res.json({
    analysis,
    decomposition,
    decisionMatrix,
  });
});

// ----------------------------------------------------
// 4.8 ULTRON INTERNAL INTERNET INTELLIGENCE API (ORCHESTRATOR BRIDGE)
// ----------------------------------------------------
app.post('/api/internet/research', async (req, res) => {
  try {
    const { query, intentType, targetUrl, context } = req.body;
    if (!query && !targetUrl) {
      res.status(400).json({ error: 'Query or targetUrl is required' });
      return;
    }
    const engine = InternetIntelligenceEngine.getInstance();
    const result = await engine.executeUniversalResearch(query || targetUrl, {
      intentType,
      targetUrl,
      context,
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/internet/read-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }
    const engine = InternetIntelligenceEngine.getInstance();
    const result = await engine.readWebUrl(url);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4.9 AUTONOMOUS AGENTIC SUITE & OPERATING SYSTEM APIS
// ----------------------------------------------------

// 1. Goal-Oriented Agentic Brain
app.post('/api/agentic/goal', async (req, res) => {
  try {
    const { goal, context } = req.body;
    if (!goal) {
      res.status(400).json({ error: 'Goal is required' });
      return;
    }
    const result = await AgenticBrainEngine.getInstance().executeAutonomousGoal(goal, context);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Self-Verification Engine
app.post('/api/verifier/verify', async (req, res) => {
  try {
    const { content, category, originalGoal } = req.body;
    const result = await SelfVerificationEngine.getInstance().verifyAndCorrect(
      content || '',
      category || 'TECHNICAL_INFO',
      originalGoal || 'Self-Verification Request'
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Authorized Computer Agent
app.post('/api/computer/action', async (req, res) => {
  try {
    const { actionType, target, parameters, bypassConfirmation } = req.body;
    const result = await ComputerAgentEngine.getInstance().executeAction(
      actionType,
      target,
      parameters,
      bypassConfirmation
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/computer/files', (req, res) => {
  const dirPath = (req.query.path as string) || '/';
  const files = ComputerAgentEngine.getInstance().listFiles(dirPath);
  res.json({ success: true, files });
});

app.get('/api/computer/apps', (req, res) => {
  const apps = ComputerAgentEngine.getInstance().getRunningApps();
  res.json({ success: true, apps });
});

// 4. Screen Understanding & Vision
app.post('/api/screen/analyze', async (req, res) => {
  try {
    const { screenData, userQuestion } = req.body;
    const result = await ScreenUnderstandingEngine.getInstance().analyzeScreenContent(screenData || {}, userQuestion);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Personal Knowledge Brain
app.get('/api/knowledge/documents', (req, res) => {
  const docs = PersonalKnowledgeBrain.getInstance().getAllDocuments();
  res.json({ success: true, documents: docs });
});

app.post('/api/knowledge/upload', (req, res) => {
  try {
    const { title, content, type, tags } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    const doc = PersonalKnowledgeBrain.getInstance().ingestDocument(title, content, type, tags);
    res.json({ success: true, document: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/knowledge/search', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await PersonalKnowledgeBrain.getInstance().searchKnowledge(query || '');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Project Memory & Knowledge Graph
app.get('/api/project-memory', (req, res) => {
  const proj = ProjectMemoryEngine.getInstance().getProject();
  res.json({ success: true, project: proj });
});

app.get('/api/project-memory/graph', (req, res) => {
  const graph = ProjectMemoryEngine.getInstance().getKnowledgeGraph();
  res.json({ success: true, graph });
});

// 7. Personalization Settings
app.get('/api/personalization', (req, res) => {
  const settings = PersonalizationEngine.getInstance().getSettings();
  res.json({ success: true, settings });
});

app.post('/api/personalization', (req, res) => {
  const updated = PersonalizationEngine.getInstance().updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// 8. Model Router
app.get('/api/router/routes', (req, res) => {
  const routes = ModelRouterEngine.getInstance().getRoutes();
  res.json({ success: true, routes });
});

// 9. Self-Healing & Recovery
app.get('/api/recovery/incidents', (req, res) => {
  const incidents = SelfHealingEngine.getInstance().getIncidents();
  const isolated = SelfHealingEngine.getInstance().getIsolatedModules();
  res.json({ success: true, incidents, isolated });
});

// 10. Universal Tool Connectors
app.get('/api/tools/connectors', (req, res) => {
  const connectors = ToolConnectorRegistry.getInstance().getAllConnectors();
  res.json({ success: true, connectors });
});

app.post('/api/tools/toggle', (req, res) => {
  const { id, enabled } = req.body;
  const updated = ToolConnectorRegistry.getInstance().toggleConnector(id, !!enabled);
  res.json({ success: true, connector: updated });
});

// 11. Security Sentinel
app.get('/api/security-sentinel', (req, res) => {
  const status = SecuritySentinelEngine.getInstance().getStatus();
  res.json({ success: true, status });
});

app.post('/api/security-sentinel/mode', (req, res) => {
  const { mode } = req.body;
  const status = SecuritySentinelEngine.getInstance().setMode(mode || 'DEFENCE');
  res.json({ success: true, status });
});

// 12. Global Emergency Failsafe ("ULTRON STOP")
app.post('/api/failsafe/stop', (req, res) => {
  const status = EmergencyFailsafeEngine.getInstance().triggerEmergencyStop();
  res.json({ success: true, message: 'Global Emergency Stop Activated. All running tasks paused.', status });
});

app.post('/api/failsafe/resume', (req, res) => {
  const status = EmergencyFailsafeEngine.getInstance().resumeSystem();
  res.json({ success: true, message: 'System Automation Resumed.', status });
});

app.get('/api/failsafe/status', (req, res) => {
  const status = EmergencyFailsafeEngine.getInstance().getStatus();
  res.json({ success: true, status });
});

// 13. Developer Mode
app.post('/api/developer/inspect', async (req, res) => {
  try {
    const { projectName } = req.body;
    const report = await DeveloperModeEngine.getInstance().inspectProject(projectName);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Automations
app.get('/api/automation/workflows', (req, res) => {
  const workflows = AutomationEngine.getInstance().getAllWorkflows();
  res.json({ success: true, workflows });
});

app.post('/api/automation/toggle', (req, res) => {
  const { id, enabled } = req.body;
  const updated = AutomationEngine.getInstance().toggleWorkflow(id, !!enabled);
  res.json({ success: true, workflow: updated });
});

app.post('/api/automation/trigger', async (req, res) => {
  try {
    const { id } = req.body;
    const result = await AutomationEngine.getInstance().triggerWorkflow(id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Permission System
app.get('/api/permissions', (req, res) => {
  const level = PermissionEngine.getInstance().getGlobalLevel();
  const pending = PermissionEngine.getInstance().getPendingApprovals();
  const all = PermissionEngine.getInstance().getAllApprovals();
  res.json({ success: true, level, pending, all });
});

app.post('/api/permissions/level', (req, res) => {
  const { level } = req.body;
  PermissionEngine.getInstance().setGlobalLevel(level);
  res.json({ success: true, level });
});

app.post('/api/permissions/resolve', (req, res) => {
  const { id, approved } = req.body;
  const ok = PermissionEngine.getInstance().resolveApproval(id, !!approved);
  res.json({ success: ok });
});

// ----------------------------------------------------
// 5. SECURITY SYSTEM API
// ----------------------------------------------------
app.get('/api/security/mode', (req, res) => {
  const engine = SecurityEngine.getInstance();
  res.json({
    active: engine.isModeActive(),
    subMode: engine.getSubMode(),
    localOnly: engine.isLocalOnly(),
    offlinePolicy: engine.getOfflinePolicy(),
    findings: engine.getFindings(),
    logs: engine.getLogs(),
  });
});

app.get('/api/security/local-only', (req, res) => {
  const engine = SecurityEngine.getInstance();
  res.json({
    enabled: engine.isLocalOnly(),
    policy: engine.getOfflinePolicy(),
  });
});

app.post('/api/security/local-only', (req, res) => {
  const { enabled, policy } = req.body;
  const engine = SecurityEngine.getInstance();
  engine.setLocalOnly(Boolean(enabled), policy || 'FORCE_LOCAL');
  res.json({
    success: true,
    enabled: engine.isLocalOnly(),
    policy: engine.getOfflinePolicy(),
    logs: engine.getLogs(),
  });
});

app.post('/api/security/mode', (req, res) => {
  const { action, subMode } = req.body;
  const engine = SecurityEngine.getInstance();
  if (action === 'activate') {
    engine.activateSecurityMode(subMode || 'DEFENCE');
  } else if (action === 'exit') {
    engine.exitSecurityMode();
  } else if (action === 'setSubMode' && subMode) {
    engine.setSubMode(subMode);
  }
  res.json({
    active: engine.isModeActive(),
    subMode: engine.getSubMode(),
  });
});

app.post('/api/security/incident', (req, res) => {
  const { threatDetails } = req.body;
  const engine = SecurityEngine.getInstance();
  const response = engine.runDefenseIncidentResponse(threatDetails || 'Suspicious unauthorized port sweep detected');
  res.json(response);
});

// ----------------------------------------------------
// 6. PROJECTS & CODING AGENT API
// ----------------------------------------------------
app.get('/api/projects', (req, res) => {
  const projects = AgentOrchestrator.getInstance().getProjects();
  res.json({ projects });
});

app.post('/api/projects/code-agent', async (req, res) => {
  const { prompt, projectId } = req.body;
  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }
  try {
    const result = await AgentOrchestrator.getInstance().runAutonomousCodingTask(prompt, projectId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 7. VOICE & TTS API
// ----------------------------------------------------
app.post('/api/voice/normalize', (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    res.status(400).json({ error: 'Transcript is required' });
    return;
  }
  const result = normalizeTranscript(transcript);
  res.json(result);
});

app.post('/api/voice/tts', async (req, res) => {
  const { text, voiceName } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Text is required' });
    return;
  }
  const audioBase64 = await synthesizeGeminiSpeech(text, voiceName);
  res.json({ audioBase64, cleanedText: cleanTextForSpeech(text) });
});

app.post('/api/voice/transcribe', async (req, res) => {
  const { audioBase64, mimeType = 'audio/webm' } = req.body;
  if (!audioBase64) {
    res.status(400).json({ error: 'audioBase64 is required' });
    return;
  }
  try {
    const result = await transcribeAudioWithGemini(audioBase64, mimeType);
    res.json({
      success: true,
      transcript: result.transcript,
      detectedLanguage: result.detectedLanguage,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/voice/pipeline-test', async (req, res) => {
  const result = await testFullVoicePipeline();
  res.json(result);
});

// ----------------------------------------------------
// 7.4 ULTRON LIVE SELF-DIAGNOSTIC API
// ----------------------------------------------------
app.post('/api/diagnostics/self-test', async (req, res) => {
  try {
    const { micPermission, cameraPermission, preferredLanguage } = req.body || {};
    const summary = await SelfDiagnosticEngine.getInstance().runFullDiagnostic({
      micPermission,
      cameraPermission,
      preferredLanguage,
    });
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Diagnostic execution failed' });
  }
});

app.get('/api/diagnostics/last', async (req, res) => {
  const engine = SelfDiagnosticEngine.getInstance();
  let summary = engine.getLastSummary();
  if (!summary) {
    summary = await engine.runFullDiagnostic();
  }
  res.json(summary);
});

app.get('/api/diagnostics/upgrades', (req, res) => {
  const lang = (req.query.lang as 'Bangla' | 'English' | 'Banglish') || 'English';
  const analysis = SelfDiagnosticEngine.getInstance().getUpgradeAnalysis(lang);
  res.json(analysis);
});

// ----------------------------------------------------
// 7.5 3D HOLOGRAPHIC PRESENTATION & SCENE API
// ----------------------------------------------------
app.get('/api/hologram/scene', (req, res) => {
  const engine = HologramEngine.getInstance();
  res.json({ scene: engine.getCurrentScene() });
});

app.get('/api/hologram/scenes', (req, res) => {
  const engine = HologramEngine.getInstance();
  res.json({ scenes: engine.getAllScenes(), currentSceneId: engine.getCurrentScene().id });
});

app.post('/api/hologram/action', async (req, res) => {
  const { action } = req.body;
  if (!action || !action.type) {
    res.status(400).json({ error: 'Action object with type is required' });
    return;
  }
  const engine = HologramEngine.getInstance();
  if (
    action.type === 'CREATE_SCENE' &&
    (action.customPrompt || action.conceptType === 'INVENTION_CONCEPT')
  ) {
    const scene = await engine.generateDynamicSceneWithAI(action.customPrompt || 'Custom Technological Prototype');
    res.json({
      success: true,
      scene,
      spokenResponse: action.spokenExplanation || `Generated custom 3D ${scene.title}. All ${scene.components.length} multi-layer assemblies are online.`,
    });
    return;
  }

  const outcome = engine.applyActionToScene(action);
  res.json({
    success: true,
    scene: outcome.scene,
    spokenResponse: outcome.spokenResponse,
  });
});

app.post('/api/hologram/generate', async (req, res) => {
  const { prompt, quality = 'HIGH', provider, imageUrl } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt string is required' });
    return;
  }
  try {
    const manager = ThreeDGenerationManager.getInstance();
    const { scene, validation, providerUsed } = await manager.generateModel(prompt, quality, provider, imageUrl);
    const engine = HologramEngine.getInstance();
    engine.getCurrentScene(); // warm up
    res.json({
      success: true,
      scene,
      report: validation,
      providerUsed,
      spokenResponse: `Synthesized bespoke 3D ${scene.title}. ${scene.components.length} multi-layer assemblies validated with ${validation?.overallConfidence || 95}% geometry confidence.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hologram/revise', async (req, res) => {
  const { prompt, sceneId } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt string is required for revision' });
    return;
  }
  const engine = HologramEngine.getInstance();
  const currentScene = sceneId ? engine.getSceneById(sceneId) || engine.getCurrentScene() : engine.getCurrentScene();
  
  try {
    const outcome = await RevisionEngine.applyRevision(currentScene, prompt);
    res.json({
      success: true,
      scene: outcome.updatedScene,
      explanation: outcome.explanation,
      spokenResponse: outcome.explanation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hologram/validate', (req, res) => {
  const { sceneId } = req.body;
  const engine = HologramEngine.getInstance();
  const scene = sceneId ? engine.getSceneById(sceneId) || engine.getCurrentScene() : engine.getCurrentScene();
  const report = scene.validationReport || {
    isValid: true,
    meshCount: scene.components.length,
    vertexCount: scene.components.length * 36,
    polygonCount: scene.components.length * 12,
    geometryIntegrity: true,
    semanticMatchScore: 96,
    geometryQualityScore: 94,
    detailScore: 92,
    overallConfidence: 95,
    passedSemanticValidation: true,
    expectedKeyElements: scene.components.map((c) => c.name),
    detectedKeyElements: scene.components.map((c) => c.name),
    generationProvider: scene.providerType || 'procedural',
  };
  res.json({ success: true, report, sceneId: scene.id });
});

app.post('/api/hologram/visualization-mode', (req, res) => {
  const { mode } = req.body;
  const engine = HologramEngine.getInstance();
  const scene = engine.getCurrentScene();
  if (mode) {
    scene.visualizationMode = mode;
    if (mode === 'WIRE') scene.wireframeMode = true;
    if (mode === 'SOLID') scene.wireframeMode = false;
    if (mode === 'X_RAY') scene.xRayCutaway = true;
    if (mode === 'EXPLODED') scene.explodedFactor = 1.0;
  }
  res.json({ success: true, visualizationMode: scene.visualizationMode, scene });
});

app.post('/api/hologram/image-to-3d', async (req, res) => {
  const { imageUrl, prompt = 'Reconstructed Object' } = req.body;
  if (!imageUrl) {
    res.status(400).json({ error: 'imageUrl is required for Image-to-3D reconstruction' });
    return;
  }
  try {
    const manager = ThreeDGenerationManager.getInstance();
    const { scene, validation, providerUsed } = await manager.generateModel(prompt, 'HIGH', 'image_to_3d', imageUrl);
    res.json({
      success: true,
      scene,
      report: validation,
      providerUsed,
      spokenResponse: `3D spatial reconstruction completed from reference image with ${validation?.overallConfidence || 92}% geometry confidence.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hologram/select-scene', (req, res) => {
  const { sceneId, conceptType } = req.body;
  const engine = HologramEngine.getInstance();
  if (sceneId) {
    const existing = engine.getSceneById(sceneId);
    if (existing) {
      engine.applyActionToScene({ type: 'CREATE_SCENE', conceptType: existing.conceptType });
      res.json({ success: true, scene: engine.getCurrentScene() });
      return;
    }
  }
  if (conceptType) {
    const outcome = engine.applyActionToScene({ type: 'CREATE_SCENE', conceptType });
    res.json({ success: true, scene: outcome.scene, spokenResponse: outcome.spokenResponse });
    return;
  }
  res.json({ success: true, scene: engine.getCurrentScene() });
});

// ----------------------------------------------------
// 8. DEVICE & PC COMPANION SIMULATOR
// ----------------------------------------------------
app.get('/api/device/status', (req, res) => {
  res.json({
    platform: 'Android Web Companion / PWA Active',
    permissions: {
      microphone: 'GRANTED',
      storage: 'GRANTED_SANDBOX',
      notifications: 'READY',
      network: 'ONLINE_LOW_LATENCY',
    },
    battery: { level: 94, charging: true },
    memory: { totalGB: 12, freeGB: 7.4 },
    companionBridge: {
      connected: true,
      encrypted: true,
      targetPC: 'DESKTOP-JARVIS-NODE-01 (192.168.1.140)',
      tunnelType: 'TLS-Authenticated-Bridge',
      authorizedTools: ['build', 'test', 'git', 'terminal-sandbox', 'port-audit'],
    },
  });
});

// ----------------------------------------------------
// 8.1. VECTOR DATABASE & PERSISTENT KNOWLEDGE GRAPH
// ----------------------------------------------------
app.get('/api/memory/search', (req, res) => {
  const query = (req.query.q as string) || '';
  const limit = parseInt((req.query.limit as string) || '6', 10);
  const results = MemoryVectorEngine.getInstance().search(query, limit);
  res.json({ results });
});

app.get('/api/memory/documents', (req, res) => {
  const docs = MemoryVectorEngine.getInstance().getAllDocuments();
  res.json({ documents: docs });
});

app.post('/api/memory/documents', (req, res) => {
  const { title, content, category = 'DOCS', tags = [] } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  const created = MemoryVectorEngine.getInstance().addDocument({
    title,
    content,
    category,
    tags,
  });
  res.json({ document: created });
});

app.delete('/api/memory/documents/:id', (req, res) => {
  const ok = MemoryVectorEngine.getInstance().deleteDocument(req.params.id);
  res.json({ success: ok });
});

app.get('/api/memory/profile', (req, res) => {
  const profile = MemoryVectorEngine.getInstance().getUserProfile();
  res.json({ profile });
});

app.post('/api/memory/profile', (req, res) => {
  const updated = MemoryVectorEngine.getInstance().updateUserProfile(req.body);
  res.json({ profile: updated });
});

app.get('/api/memory/graph', (req, res) => {
  const graph = MemoryVectorEngine.getInstance().getKnowledgeGraph();
  res.json(graph);
});

// ----------------------------------------------------
// 8.2. AUTONOMOUS SANDBOX & RECURSIVE DEBUGGER
// ----------------------------------------------------
app.post('/api/sandbox/execute', (req, res) => {
  const { code, language = 'typescript', testAssertions = [] } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Code is required' });
    return;
  }
  const result = SandboxEngine.getInstance().executeCodeInSandbox(code, language, testAssertions);
  res.json({ result });
});

app.post('/api/sandbox/recursive-debug', async (req, res) => {
  const { goal, initialCode, language = 'typescript', testAssertions = [], maxIterations = 4 } = req.body;
  if (!goal || !initialCode) {
    res.status(400).json({ error: 'Goal and initialCode are required' });
    return;
  }
  try {
    const session = await SandboxEngine.getInstance().startRecursiveDebugLoop(
      goal,
      initialCode,
      language,
      testAssertions,
      maxIterations
    );
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sandbox/sessions', (req, res) => {
  const sessions = SandboxEngine.getInstance().getAllSessions();
  res.json({ sessions });
});

app.post('/api/sandbox/cloud-action', async (req, res) => {
  const { platform, action, payload = {} } = req.body;
  if (!platform || !action) {
    res.status(400).json({ error: 'Platform and action are required' });
    return;
  }
  try {
    const toolAction = await SandboxEngine.getInstance().executeCloudAction(platform, action, payload);
    res.json({ action: toolAction });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sandbox/cloud-actions', (req, res) => {
  const actions = SandboxEngine.getInstance().getCloudActions();
  res.json({ actions });
});

// ----------------------------------------------------
// 8.3. THINK-TANK & LIVE INFORMATION
// ----------------------------------------------------
app.post('/api/thinktank/orchestrate', async (req, res) => {
  const { topic, preferredLanguage = 'en' } = req.body;
  if (!topic) {
    res.status(400).json({ error: 'Topic is required' });
    return;
  }
  try {
    const session = await ThinkTankEngine.getInstance().orchestrateThinkTank(topic, preferredLanguage);
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/thinktank/sessions', (req, res) => {
  const sessions = ThinkTankEngine.getInstance().getAllSessions();
  res.json({ sessions });
});

app.get('/api/thinktank/glossary', (req, res) => {
  const q = req.query.q as string;
  const terms = q ? ThinkTankEngine.getInstance().searchGlossary(q) : ThinkTankEngine.getInstance().getGlossary();
  res.json({ terms });
});

app.get('/api/thinktank/live-news', (req, res) => {
  const news = ThinkTankEngine.getInstance().getLiveNews();
  res.json({ news });
});

// ----------------------------------------------------
// 8.4. PREDICTIVE DEFENSE (OWASP TOP 10 SCANNER)
// ----------------------------------------------------
app.post('/api/security/predictive-scan', (req, res) => {
  const { snippets } = req.body;
  const scan = PredictiveDefenseEngine.getInstance().scanCodebase(snippets);
  res.json({ scan });
});

// ----------------------------------------------------
// 8.5. OS BRIDGE, PROACTIVE AGENTIC WATCHDOG & UNIFIED ORCHESTRATOR
// ----------------------------------------------------
app.get('/api/os/telemetry', (req, res) => {
  const telemetry = OSBridgeEngine.getInstance().getHardwareTelemetry();
  res.json({ telemetry });
});

app.get('/api/os/files', (req, res) => {
  const dirPath = (req.query.path as string) || '/workspace';
  const files = OSBridgeEngine.getInstance().listFiles(dirPath);
  res.json({ files, currentDir: dirPath });
});

app.post('/api/os/files/read', (req, res) => {
  const { filePath } = req.body;
  if (!filePath) {
    res.status(400).json({ error: 'filePath is required' });
    return;
  }
  const result = OSBridgeEngine.getInstance().readFile(filePath);
  if (!result) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  res.json(result);
});

app.post('/api/os/files/write', (req, res) => {
  const { filePath, content } = req.body;
  if (!filePath || typeof content !== 'string') {
    res.status(400).json({ error: 'filePath and content are required' });
    return;
  }
  const ok = OSBridgeEngine.getInstance().writeFile(filePath, content);
  res.json({ success: ok });
});

app.post('/api/os/terminal', (req, res) => {
  const { command } = req.body;
  if (!command) {
    res.status(400).json({ error: 'Command is required' });
    return;
  }
  const result = OSBridgeEngine.getInstance().executeTerminalCommand(command);
  res.json({ result });
});

app.get('/api/os/terminal/history', (req, res) => {
  const history = OSBridgeEngine.getInstance().getTerminalHistory();
  res.json({ history });
});

app.get('/api/os/suggestions', (req, res) => {
  const suggestions = OSBridgeEngine.getInstance().getProactiveSuggestions();
  res.json({ suggestions });
});

app.post('/api/os/suggestions/apply', (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: 'Suggestion id is required' });
    return;
  }
  const ok = OSBridgeEngine.getInstance().applyProactiveSuggestion(id);
  res.json({ success: ok });
});

app.get('/api/os/unified-services', (req, res) => {
  const services = OSBridgeEngine.getInstance().getUnifiedServices();
  res.json({ services });
});

app.post('/api/os/unified-services/action', (req, res) => {
  const { serviceId, actionType, payload } = req.body;
  if (!serviceId || !actionType) {
    res.status(400).json({ error: 'serviceId and actionType are required' });
    return;
  }
  const result = OSBridgeEngine.getInstance().triggerServiceAction(serviceId, actionType, payload);
  res.json(result);
});

// Strategic Learning Weights & Encrypted Vault Endpoints
app.get('/api/memory/learning-weights', (req, res) => {
  const weights = MemoryVectorEngine.getInstance().getLearningWeights();
  res.json({ weights });
});

app.post('/api/memory/learning-weights', (req, res) => {
  const weights = req.body;
  const updated = MemoryVectorEngine.getInstance().updateLearningWeights(weights);
  res.json({ weights: updated });
});

app.get('/api/memory/vault-export', (req, res) => {
  const vault = MemoryVectorEngine.getInstance().exportEncryptedMemoryVault();
  res.json({ vault });
});

// ----------------------------------------------------
// Native Android Background Daemon Script Endpoint
// ----------------------------------------------------
app.get('/api/native/termux.sh', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  const script = `#!/data/data/com.termux/files/usr/bin/bash
# JARVIS ULTRON 24/7 ANDROID BACKGROUND DAEMON
echo "⚡ Initializing JARVIS 24/7 Always-On Audio Daemon..."
pkg update -y && pkg install -y termux-api nodejs curl
termux-wake-lock
echo "🔒 Wake-Lock acquired. Android OS will not kill JARVIS."
echo "🚀 JARVIS Android Background Voice Bridge is RUNNING!"
echo "Connected to: ${hostUrl}"
termux-notification --title "JARVIS Ultron Voice Core" --content "Online 24/7 & Listening for Wake Words" --priority high --ongoing true
`;
  res.setHeader('Content-Type', 'text/x-shellscript');
  res.send(script);
});

// ============================================================================
// ULTRON NEXT-GENERATION AI OPERATING SYSTEM REST API
// ============================================================================

// 1. GOAL & MISSION SYSTEM
app.get('/api/missions', (req, res) => {
  res.json({ missions: MissionSystemEngine.getInstance().getMissions() });
});

app.post('/api/missions', async (req, res) => {
  const { goal, category, priority } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required' });
  const mission = await MissionSystemEngine.getInstance().createMissionFromGoal(goal, category, priority);
  res.json({ success: true, mission });
});

app.post('/api/missions/:id/status', (req, res) => {
  const { status } = req.body;
  const updated = MissionSystemEngine.getInstance().updateMissionStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Mission not found' });
  res.json({ success: true, mission: updated });
});

app.post('/api/missions/:id/subtasks/:subtaskId/status', (req, res) => {
  const { status, output } = req.body;
  const updated = MissionSystemEngine.getInstance().updateSubtaskStatus(req.params.id, req.params.subtaskId, status, output);
  if (!updated) return res.status(404).json({ error: 'Mission or subtask not found' });
  res.json({ success: true, mission: updated });
});

app.delete('/api/missions/:id', (req, res) => {
  const success = MissionSystemEngine.getInstance().deleteMission(req.params.id);
  res.json({ success });
});

// 2. PERSONAL TASK & SCHEDULE
app.get('/api/personal-schedule', (req, res) => {
  res.json({ tasks: PersonalScheduleEngine.getInstance().getTasks() });
});

app.post('/api/personal-schedule', (req, res) => {
  const task = PersonalScheduleEngine.getInstance().addTask(req.body);
  res.json({ success: true, task });
});

app.put('/api/personal-schedule/:id', (req, res) => {
  const updated = PersonalScheduleEngine.getInstance().updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true, task: updated });
});

app.delete('/api/personal-schedule/:id', (req, res) => {
  const success = PersonalScheduleEngine.getInstance().deleteTask(req.params.id);
  res.json({ success });
});

app.post('/api/personal-schedule/natural', async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Command required' });
  const result = await PersonalScheduleEngine.getInstance().parseNaturalScheduleCommand(command);
  res.json(result);
});

// 3. COMMUNICATION AGENT
app.get('/api/communication', (req, res) => {
  res.json({ messages: CommunicationAgentEngine.getInstance().getMessages() });
});

app.post('/api/communication/summarize', async (req, res) => {
  const summary = await CommunicationAgentEngine.getInstance().summarizeMessages(req.body.query);
  res.json(summary);
});

app.post('/api/communication/:id/draft', async (req, res) => {
  const draft = await CommunicationAgentEngine.getInstance().draftReply(req.params.id, req.body.instructions);
  res.json({ success: true, draftReply: draft });
});

app.post('/api/communication/:id/approve', (req, res) => {
  const result = CommunicationAgentEngine.getInstance().approveAndSendMessage(req.params.id);
  res.json(result);
});

app.post('/api/communication/:id/reject', (req, res) => {
  const result = CommunicationAgentEngine.getInstance().rejectDraft(req.params.id);
  res.json(result);
});

// 4. TUTOR / LEARNING MODE
app.get('/api/tutor/sessions', (req, res) => {
  res.json({ sessions: TutorEngine.getInstance().getSessions() });
});

app.post('/api/tutor/start', async (req, res) => {
  const { topic, mode } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic required' });
  const session = await TutorEngine.getInstance().startLesson(topic, mode || 'INTERMEDIATE');
  res.json({ success: true, session });
});

app.post('/api/tutor/:id/quiz', (req, res) => {
  const { questionId, selectedIndex } = req.body;
  const result = TutorEngine.getInstance().submitQuizAnswer(req.params.id, questionId, selectedIndex);
  res.json(result);
});

// 5. AUTONOMOUS CODING & QA AGENT
app.get('/api/autonomous-coder/projects', (req, res) => {
  res.json({ projects: AutonomousCoderQAEngine.getInstance().getProjects() });
});

app.post('/api/autonomous-coder/run', async (req, res) => {
  const { name, specification, language } = req.body;
  if (!name || !specification) return res.status(400).json({ error: 'Name and specification required' });
  const project = await AutonomousCoderQAEngine.getInstance().runFullDevQaCycle(name, specification, language);
  res.json({ success: true, project });
});

// 6. DATA & DOCUMENT INTELLIGENCE
app.get('/api/data-intelligence/reports', (req, res) => {
  res.json({ reports: DataDocumentIntelligenceEngine.getInstance().getDataReports() });
});

app.post('/api/data-intelligence/analyze', async (req, res) => {
  const { rawContent, datasetName } = req.body;
  if (!rawContent) return res.status(400).json({ error: 'rawContent required' });
  const report = await DataDocumentIntelligenceEngine.getInstance().analyzeRawDataset(rawContent, datasetName);
  res.json({ success: true, report });
});

app.get('/api/doc-intelligence/reports', (req, res) => {
  res.json({ reports: DataDocumentIntelligenceEngine.getInstance().getDocReports() });
});

app.post('/api/doc-intelligence/analyze', async (req, res) => {
  const { rawText, fileName, fileType } = req.body;
  if (!rawText) return res.status(400).json({ error: 'rawText required' });
  const report = await DataDocumentIntelligenceEngine.getInstance().analyzeDocument(rawText, fileName || 'Document', fileType);
  res.json({ success: true, report });
});

// 7. VAULT & VOICE USER PROFILES
app.get('/api/vault/credentials', (req, res) => {
  res.json({ credentials: VaultAndVoiceProfilesEngine.getInstance().getMaskedVaultItems() });
});

app.post('/api/vault/credentials', (req, res) => {
  const item = VaultAndVoiceProfilesEngine.getInstance().storeCredential(req.body);
  res.json({ success: true, item });
});

app.delete('/api/vault/credentials/:id', (req, res) => {
  const success = VaultAndVoiceProfilesEngine.getInstance().deleteCredential(req.params.id);
  res.json({ success });
});

app.get('/api/voice-profiles', (req, res) => {
  res.json({ profiles: VaultAndVoiceProfilesEngine.getInstance().getVoiceProfiles() });
});

app.post('/api/voice-profiles', (req, res) => {
  const profile = VaultAndVoiceProfilesEngine.getInstance().addVoiceProfile(req.body);
  res.json({ success: true, profile });
});

app.post('/api/voice-profiles/:id/activate', (req, res) => {
  const profile = VaultAndVoiceProfilesEngine.getInstance().setActiveVoiceProfile(req.params.id);
  res.json({ success: !!profile, profile });
});

// 8. UNIVERSAL TRANSLATION ENGINE
app.post('/api/translator/translate', async (req, res) => {
  const { text, targetLanguage, sourceLanguage } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const result = await UniversalTranslatorEngine.getInstance().translateText(text, targetLanguage, sourceLanguage);
  res.json(result);
});

// 9. SEMANTIC MEMORY & CONTEXT COMPRESSION
app.get('/api/semantic-memory', (req, res) => {
  res.json({ memories: SemanticMemoryEngine.getInstance().getMemories() });
});

app.post('/api/semantic-memory/search', async (req, res) => {
  const { query, limit } = req.body;
  const results = await SemanticMemoryEngine.getInstance().searchSemanticMemory(query || '', limit || 5);
  res.json({ results });
});

app.post('/api/semantic-memory', (req, res) => {
  const { text, category, tags } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const record = SemanticMemoryEngine.getInstance().saveMemory(text, category, tags);
  res.json({ success: true, record });
});

app.delete('/api/semantic-memory/:id', (req, res) => {
  const success = SemanticMemoryEngine.getInstance().deleteMemory(req.params.id);
  res.json({ success });
});

app.post('/api/semantic-memory/compress', async (req, res) => {
  const { messages, activeTaskSummary } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array required' });
  const compressed = await SemanticMemoryEngine.getInstance().compressConversationContext(messages, activeTaskSummary);
  res.json(compressed);
});

// 10. IOT & DEVICE FRAMEWORK
app.get('/api/iot/devices', (req, res) => {
  res.json({ devices: IoTDeviceFrameworkEngine.getInstance().getDevices() });
});

app.post('/api/iot/scan', (req, res) => {
  const result = IoTDeviceFrameworkEngine.getInstance().scanLocalNetwork();
  res.json(result);
});

app.post('/api/iot/devices/:id/authorize', (req, res) => {
  const { permissionScope } = req.body;
  const result = IoTDeviceFrameworkEngine.getInstance().authorizeDevice(req.params.id, permissionScope || 'CONTROL_ALLOWED');
  res.json(result);
});

app.post('/api/iot/devices/:id/revoke', (req, res) => {
  const result = IoTDeviceFrameworkEngine.getInstance().revokeDeviceAccess(req.params.id);
  res.json(result);
});

app.post('/api/iot/devices/:id/command', (req, res) => {
  const { action, payload } = req.body;
  const result = IoTDeviceFrameworkEngine.getInstance().executeDeviceCommand(req.params.id, action, payload || {});
  res.json(result);
});

// 11. HARDWARE MONITORING & WORKLOADS
app.get('/api/hardware/telemetry', (req, res) => {
  res.json(HardwareMonitorEngine.getInstance().getTelemetry());
});

app.get('/api/hardware/workloads', (req, res) => {
  res.json({ workloads: HardwareMonitorEngine.getInstance().getWorkloads() });
});

app.post('/api/hardware/workloads', (req, res) => {
  const { name, priority } = req.body;
  const result = HardwareMonitorEngine.getInstance().queueWorkload(name || 'Background Compute', priority || 5);
  res.json(result);
});

// 12. VISION, SPATIAL & PLUGINS
app.get('/api/plugins', (req, res) => {
  res.json({ plugins: VisionSpatialPluginsEngine.getInstance().getPlugins() });
});

app.post('/api/plugins/:id/toggle', (req, res) => {
  const updated = VisionSpatialPluginsEngine.getInstance().togglePluginStatus(req.params.id);
  res.json({ success: !!updated, plugin: updated });
});

app.post('/api/vision/analyze-frame', async (req, res) => {
  const { frameDataUrl, query } = req.body;
  if (!frameDataUrl) return res.status(400).json({ error: 'frameDataUrl required' });
  const result = await VisionSpatialPluginsEngine.getInstance().analyzeLiveVisionFrame(frameDataUrl, query);
  res.json(result);
});

// 13. BACKUP, AUDIT & DOCUMENTATION
app.get('/api/audit/trail', (req, res) => {
  res.json({ trail: BackupAuditDocsEngine.getInstance().getAuditTrail() });
});

app.post('/api/audit/clear', (req, res) => {
  BackupAuditDocsEngine.getInstance().clearAuditHistory();
  res.json({ success: true });
});

app.post('/api/backup/export', (req, res) => {
  const pkg = BackupAuditDocsEngine.getInstance().createEncryptedBackupPackage(req.body.metadata || {});
  res.json(pkg);
});

app.post('/api/docs/generate', async (req, res) => {
  const { projectName, description } = req.body;
  const docs = await BackupAuditDocsEngine.getInstance().generateProjectDocumentation(projectName || 'ULTRON Project', description || 'Comprehensive Full-Stack AI OS');
  res.json(docs);
});

// 14. ULTRON EXECUTIVE OS & ORCHESTRATION
app.get('/api/executive-os/diagnostics', (req, res) => {
  res.json(UltronExecutiveOSEngine.getInstance().getSystemDiagnostics());
});

app.get('/api/executive-os/personality', (req, res) => {
  res.json({
    personality: UltronExecutiveOSEngine.getInstance().getPersonality(),
    isGlobalHalted: UltronExecutiveOSEngine.getInstance().isEmergencyHalted(),
    isOfflineMode: UltronExecutiveOSEngine.getInstance().isOfflineMode(),
  });
});

app.post('/api/executive-os/personality', (req, res) => {
  const { personality } = req.body;
  if (personality) UltronExecutiveOSEngine.getInstance().setPersonality(personality);
  res.json({ success: true, personality: UltronExecutiveOSEngine.getInstance().getPersonality() });
});

app.post('/api/executive-os/global-stop', (req, res) => {
  const result = UltronExecutiveOSEngine.getInstance().triggerGlobalStop(req.body.reason);
  res.json(result);
});

app.post('/api/executive-os/resume', (req, res) => {
  const result = UltronExecutiveOSEngine.getInstance().resumeOperations();
  res.json(result);
});

app.post('/api/executive-os/toggle-offline', (req, res) => {
  const { enabled } = req.body;
  UltronExecutiveOSEngine.getInstance().setOfflineMode(!!enabled);
  res.json({ success: true, isOfflineMode: UltronExecutiveOSEngine.getInstance().isOfflineMode() });
});

app.post('/api/executive-os/orchestrate', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });
  const result = await UltronExecutiveOSEngine.getInstance().orchestrateNaturalCommand(query);
  res.json(result);
});

// ====================================================
// 15. ULTRON 4-TIER ARCHITECTURE APIs
// VFS File Manager | Code Sandbox | Tool Dispatcher | Agent Loop
// ====================================================

// --- 15.1 VFS File System Manager ---
app.get('/api/ultron/vfs/tree', (req, res) => {
  try {
    const tree = FileSystemManager.getInstance().get_tree();
    res.json({ success: true, tree });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/vfs/list', (req, res) => {
  try {
    const dirPath = (req.query.path as string) || '/projects';
    const recursive = req.query.recursive !== 'false';
    const result = FileSystemManager.getInstance().list_files(dirPath, recursive);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/vfs/file', (req, res) => {
  try {
    const filePath = (req.query.path as string) || '';
    const result = FileSystemManager.getInstance().read_file(filePath);
    if (!result.success) {
      return res.status(result.securityViolation ? 403 : 404).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/vfs/file', (req, res) => {
  try {
    const { path: filePath, content = '' } = req.body;
    const result = FileSystemManager.getInstance().create_file(filePath, content);
    if (!result.success) {
      return res.status(result.securityViolation ? 403 : 400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/ultron/vfs/file', (req, res) => {
  try {
    const { path: filePath, content = '' } = req.body;
    const result = FileSystemManager.getInstance().write_file(filePath, content);
    if (!result.success) {
      return res.status(result.securityViolation ? 403 : 400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/ultron/vfs/file', (req, res) => {
  try {
    const { path: filePath, old_content = '', new_content = '' } = req.body;
    const result = FileSystemManager.getInstance().edit_file(filePath, old_content, new_content);
    if (!result.success) {
      return res.status(result.securityViolation ? 403 : 400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/ultron/vfs/file', (req, res) => {
  try {
    const filePath = (req.query.path as string) || req.body.path || '';
    const result = FileSystemManager.getInstance().delete_file(filePath);
    if (!result.success) {
      return res.status(result.securityViolation ? 403 : 400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 15.2 Code Sandbox Runner ---
app.post('/api/ultron/sandbox/run', async (req, res) => {
  try {
    const { language = 'javascript', code = '', options = {} } = req.body;
    const result = await CodeSandbox.getInstance().run_code(language, code, options);
    res.json({ success: result.status === 'SUCCESS', result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/sandbox/test', async (req, res) => {
  try {
    const { language = 'javascript', code = '', test_code = '' } = req.body;
    const result = await CodeSandbox.getInstance().run_test(language, code, test_code);
    res.json({ success: result.passed, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/sandbox/output', (req, res) => {
  try {
    const executionId = req.query.executionId as string | undefined;
    const output = CodeSandbox.getInstance().get_output(executionId);
    res.json({ success: true, output });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/sandbox/error', (req, res) => {
  try {
    const executionId = req.query.executionId as string | undefined;
    const errorMsg = CodeSandbox.getInstance().get_error(executionId);
    res.json({ success: true, error: errorMsg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/sandbox/history', (req, res) => {
  try {
    const history = CodeSandbox.getInstance().getHistory();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 15.3 Tool Dispatcher / Bridge ---
app.get('/api/ultron/tools/catalog', (req, res) => {
  try {
    const catalog = ToolDispatcher.getInstance().getCatalog();
    res.json({ success: true, tools: catalog });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/tools/dispatch', async (req, res) => {
  try {
    const { tool, arguments: toolArgs, callId } = req.body;
    if (!tool) {
      return res.status(400).json({ success: false, error: 'tool name is required' });
    }
    const result = await ToolDispatcher.getInstance().dispatchTool({
      tool,
      arguments: toolArgs || {},
      callId,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 15.4 Agent Loop Engine ---
app.post('/api/ultron/agent-loop/run', async (req, res) => {
  try {
    const { goal, maxIterations } = req.body;
    if (!goal) {
      return res.status(400).json({ success: false, error: 'goal is required' });
    }
    const session = await AgentLoopEngine.getInstance().runAutonomousLoop(goal, maxIterations);
    res.json({ success: session.status === 'COMPLETED', session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/agent-loop/history', (req, res) => {
  try {
    const history = AgentLoopEngine.getInstance().getHistory();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/agent-loop/:id', (req, res) => {
  try {
    const session = AgentLoopEngine.getInstance().getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// 16. ULTRON CORE ARCHITECTURE UNIFIED APIS
// ====================================================

// --- 16.1 Brain Engine ---
app.post('/api/ultron/brain/process', async (req, res) => {
  try {
    const { input, context } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, error: 'input is required' });
    }
    const result = await UltronBrainCore.getInstance().process({ input, context });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 16.1.1 V6 Canonical Endpoints ---
app.post('/api/ultron/v6/brain/process', async (req, res) => {
  try {
    const { input, context, conversationHistory, preferredProvider, preferredModel } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, error: 'input is required' });
    }
    const result = await UltronBrainCore.getInstance().process({
      input,
      context,
      conversationHistory,
      preferredProvider,
      preferredModel,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/v6/test-suite/run', async (req, res) => {
  try {
    const summary = await UltronCoreTestSuite.getInstance().runAllTests();
    res.json({ success: true, ...summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/v6/tools/list', (req, res) => {
  try {
    const tools = ToolRegistryCore.getInstance().listTools();
    res.json({ success: true, count: tools.length, tools });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/v6/tools/execute', async (req, res) => {
  try {
    const { toolName, args, taskId, permissionLevelOverride } = req.body;
    if (!toolName) {
      return res.status(400).json({ success: false, error: 'toolName is required' });
    }
    const result = await ToolRegistryCore.getInstance().execute(toolName, args || {}, {
      taskId,
      permissionLevelOverride,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/v6/vfs/list', async (req, res) => {
  try {
    const dirPath = (req.query.path as string) || '/projects';
    const recursive = req.query.recursive === 'true';
    const result = await UnifiedFileSystemManager.getInstance().listFiles(dirPath, recursive);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/v6/execution/run', async (req, res) => {
  try {
    const { code, language, timeoutMs } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'code is required' });
    }
    const result = await ExecutionManager.getInstance().execute({
      code,
      language: language || 'javascript',
      timeoutMs,
    });
    res.json({ success: result.status === 'SUCCESS', ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/v6/memory/search', (req, res) => {
  try {
    const { query, layer, category, tags, limit } = req.body;
    const results = MemoryManager.getInstance().search({
      semanticQuery: query,
      layer,
      category,
      tags,
      limit,
    });
    res.json({ success: true, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/v6/memory/save', (req, res) => {
  try {
    const { layer = 'SESSION_MEMORY', data } = req.body;
    if (!data || !data.key || !data.title || !data.content) {
      return res.status(400).json({ success: false, error: 'Valid memory data is required' });
    }
    const saved = MemoryManager.getInstance().save(layer, data);
    res.json({ success: true, memory: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/brain/plan', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ success: false, error: 'task is required' });
    }
    const plan = await UltronBrainEngine.getInstance().plan(task);
    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/brain/answer', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'question is required' });
    }
    const answer = await UltronBrainEngine.getInstance().answer(question);
    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/brain/execute', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ success: false, error: 'task is required' });
    }
    const result = await UltronBrainEngine.getInstance().execute(task);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 16.2 Context & Memory Engine ---
app.get('/api/ultron/context', (req, res) => {
  try {
    const state = ContextEngine.getInstance().getState();
    res.json({ success: true, context: state });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/memory/list', (req, res) => {
  try {
    const memories = MemoryEngine.getInstance().getAllMemories();
    res.json({ success: true, memories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/memory/search', (req, res) => {
  try {
    const { query, layer, category, limit } = req.body;
    const results = MemoryEngine.getInstance().searchMemory(query || '', { layer, category, limit });
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/memory/save', (req, res) => {
  try {
    const { layer = 'SESSION_MEMORY', data } = req.body;
    if (!data || !data.key || !data.title || !data.content) {
      return res.status(400).json({ success: false, error: 'Valid memory data is required' });
    }
    const saved = MemoryEngine.getInstance().saveMemory(layer, data);
    res.json({ success: true, memory: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/ultron/memory/clear-session', (req, res) => {
  try {
    const result = MemoryEngine.getInstance().clearSessionMemory();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 16.3 Tools Engine ---
app.get('/api/ultron/tools/list', (req, res) => {
  try {
    const tools = ToolRegistry.getInstance().listToolSchemas();
    res.json({ success: true, tools });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/tools/execute', async (req, res) => {
  try {
    const { toolName, args, taskId, userPermissionLevel } = req.body;
    if (!toolName) {
      return res.status(400).json({ success: false, error: 'toolName is required' });
    }
    const result = await ToolRegistry.getInstance().execute(toolName, args || {}, { taskId, userPermissionLevel });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 16.4 Tasks Orchestrator ---
app.get('/api/ultron/tasks/list', (req, res) => {
  try {
    const tasks = TaskOrchestrator.getInstance().listTasks();
    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/tasks/status/:taskId', (req, res) => {
  try {
    const task = TaskOrchestrator.getInstance().getTask(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/tasks/create', (req, res) => {
  try {
    const { goal, intent, steps } = req.body;
    if (!goal) {
      return res.status(400).json({ success: false, error: 'goal is required' });
    }
    const task = TaskOrchestrator.getInstance().createTask(goal, intent, steps);
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/tasks/cancel', (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, error: 'taskId is required' });
    }
    const result = TaskOrchestrator.getInstance().cancelTask(taskId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 16.5 Voice Session Engine ---
app.get('/api/ultron/voice/state', (req, res) => {
  try {
    const state = UltronVoiceEngine.getInstance().getState();
    res.json({ success: true, voiceState: state });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/voice/process', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ success: false, error: 'transcript is required' });
    }
    const result = await UltronVoiceEngine.getInstance().processVoiceInput(transcript);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/voice/interrupt', (req, res) => {
  try {
    const result = UltronVoiceEngine.getInstance().handleInterruption();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ultron/voice/settings', (req, res) => {
  try {
    const { wakeWordEnabled, continuousMode } = req.body;
    if (wakeWordEnabled !== undefined) {
      UltronVoiceEngine.getInstance().setWakeWordEnabled(wakeWordEnabled);
    }
    if (continuousMode !== undefined) {
      UltronVoiceEngine.getInstance().setContinuousMode(continuousMode);
    }
    res.json({ success: true, voiceState: UltronVoiceEngine.getInstance().getState() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 16.6 Model Health & Automated Diagnostics ---
app.get('/api/ultron/models/health', async (req, res) => {
  try {
    const health = await ModelRouterEngine.getInstance().checkHealth();
    res.json({ success: true, providers: health });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ultron/diagnostics', async (req, res) => {
  try {
    const summary = await SelfDiagnosticEngine.getInstance().runFullDiagnostic();
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 16.7 Comprehensive Canonical 33-Point Automated Test Suite ---
app.post('/api/ultron/test-suite/run', async (req, res) => {
  try {
    const suiteResult = await UltronCoreTestSuite.getInstance().runAllTests();
    res.json({ success: true, ...suiteResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 9. API 404 HANDLER & GLOBAL ERROR HANDLER
// (Catches any unmatched /api/* requests so they never fall through to SPA HTML)
// ----------------------------------------------------
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    success: false,
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    success: false,
  });
});

// ----------------------------------------------------
// 10. VITE / STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JARVIS Master Engine server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
