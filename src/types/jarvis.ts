export type OrbState =
  | 'IDLE'
  | 'STANDBY'
  | 'WAKE'
  | 'LISTENING'
  | 'ANALYZING'
  | 'WORKING'
  | 'AI_SWITCHING'
  | 'THINKING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'COMPLETE'
  | 'ERROR'
  | 'SECURITY_MODE';

export type CognitiveStage =
  | 'UNDERSTAND'
  | 'ANALYZE'
  | 'PLAN'
  | 'DECIDE'
  | 'EXECUTE'
  | 'VERIFY'
  | 'ADAPT'
  | 'COMPLETE';

export type CognitiveIntentType =
  | 'COMMAND'
  | 'QUESTION'
  | 'REQUEST'
  | 'COMPLEX_TASK'
  | 'MULTI_STEP_PROJECT'
  | 'CONVERSATION';

export interface DeepTaskAnalysis {
  goal: string;
  intentType: CognitiveIntentType;
  requirements: string[];
  constraints: string[];
  dependencies: string[];
  resources: {
    aiModels: string[];
    tools: string[];
    files: string[];
    deviceActions: string[];
  };
  risks: string[];
  verificationCriteria: string[];
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  confidenceScore: number;
  needsClarification: boolean;
  clarificationQuestion?: string;
  conciseSummary?: string;
}

export type SubTaskCategoryType =
  | 'REQUIREMENTS'
  | 'ARCHITECTURE'
  | 'UI_DESIGN'
  | 'BACKEND'
  | 'DATABASE'
  | 'AUTHENTICATION'
  | 'API_INTEGRATION'
  | 'TESTING'
  | 'BUG_FIXING'
  | 'FINAL_VERIFICATION'
  | 'CUSTOM';

export interface AutonomousSubTask {
  id: string;
  stepNumber: number;
  name: string;
  type: SubTaskCategoryType;
  description: string;
  assignedAi: ProviderId;
  assignedModel?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SELF_CORRECTED' | 'SKIPPED';
  outputSummary?: string;
  retryCount: number;
  verificationNotes?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface DecisionMatrix {
  chosenStrategy: string;
  evaluatedApproaches: {
    name: string;
    score: number;
    reliability: number;
    speed: number;
    securityScore: number;
    costEstimate: string;
    rationale: string;
  }[];
  selectedWorkers: {
    role: string;
    provider: ProviderId;
    model: string;
  }[];
  riskMitigation: string;
}

export interface ContextPreservationSnapshot {
  taskId: string;
  originalGoal: string;
  requirements: string[];
  currentPlan: string[];
  completedSteps: string[];
  currentStep: string;
  pendingSteps: string[];
  importantResults: string[];
  errorsEncountered: string[];
  requiredContext: string;
  filesDataReferences: string[];
  verificationStatus: string;
  fromProvider: ProviderId;
  toProvider: ProviderId;
  switchReason: string;
  timestamp: string;
}

export interface CognitiveExecutionSession {
  id: string;
  taskId: string;
  command: string;
  currentStage: CognitiveStage;
  intentType: CognitiveIntentType;
  analysis: DeepTaskAnalysis;
  decomposition: AutonomousSubTask[];
  decisionMatrix: DecisionMatrix;
  contextPreservationSnapshots: ContextPreservationSnapshot[];
  selfCorrectionIterations: number;
  maxSelfCorrectionRetries: number;
  verificationReport?: VerificationResult;
  spokenSummary: string;
  detailedOutput: string;
  currentWorker: {
    provider: ProviderId;
    model: string;
    health: ProviderHealth;
  };
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus =
  | 'QUEUED'
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'WAITING'
  | 'BLOCKED'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type TaskCategory =
  | 'GENERAL_AI'
  | 'CODING'
  | 'WEB_DEVELOPMENT'
  | 'APP_DEVELOPMENT'
  | 'PROJECT_ANALYSIS'
  | 'VISION'
  | 'IMAGE_GENERATION'
  | 'VOICE_STT'
  | 'VOICE_TTS'
  | 'DOCUMENT_ANALYSIS'
  | 'WEB_RESEARCH'
  | 'CYBERSECURITY'
  | 'CTF'
  | 'LOCAL_AI'
  | 'MOBILE_AUTOMATION'
  | 'DEVICE_CONTROL';

export type ProviderId = 'gemini' | 'replit' | 'openrouter' | 'huggingface' | 'ollama';

export type ProviderHealth =
  | 'AVAILABLE'
  | 'DEGRADED'
  | 'RATE_LIMITED'
  | 'ERROR'
  | 'OFFLINE'
  | 'DISABLED';

export type CostPreference = 'FREE_FIRST' | 'BALANCED' | 'BEST_QUALITY' | 'USER_CONTROLLED';

export interface AIProviderConfig {
  id: ProviderId;
  name: string;
  models: string[];
  capabilities: TaskCategory[];
  priority: number;
  health: ProviderHealth;
  availability: boolean;
  latencyMs: number;
  isConfigured: boolean;
  costMode: 'free' | 'freemium' | 'paid' | 'local';
  enabled: boolean;
  lastError?: string;
  cooldownUntil?: number;
}

export interface TaskStep {
  id: string;
  name: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startedAt?: string;
  completedAt?: string;
  output?: string;
  providerUsed?: ProviderId;
}

export interface TaskCheckpoint {
  id: string;
  stepIndex: number;
  summary: string;
  timestamp: string;
  completedStepIds: string[];
  changedFiles: string[];
  provider: ProviderId;
  stateSnapshot: Record<string, unknown>;
}

export interface ProviderHistoryEntry {
  provider: ProviderId;
  model: string;
  role: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILOVER' | 'LIMIT_REACHED' | 'ERROR';
  reason?: string;
  latencyMs?: number;
}

export interface VerificationResult {
  verified: boolean;
  checks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  timestamp: string;
}

export interface JarvisTask {
  id: string;
  originalCommand: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  progressPercent: number;
  currentProvider: ProviderId;
  currentModel: string;
  previousProviders: ProviderId[];
  providerHistory: ProviderHistoryEntry[];
  steps: TaskStep[];
  currentStepIndex: number;
  checkpoints: TaskCheckpoint[];
  changedFiles: string[];
  importantContext: string;
  verification?: VerificationResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

export interface TaskContextPackage {
  taskId: string;
  originalCommand: string;
  category: TaskCategory;
  projectId?: string;
  goal: string;
  completedWork: string[];
  currentStep: string;
  pendingWork: string[];
  changedFiles: string[];
  importantDecisions: string[];
  errors: string[];
  previousProvider: ProviderId;
  reasonForSwitching: string;
  expectedResult: string;
  latestCheckpoint?: TaskCheckpoint;
}

export type SecuritySubMode = 'ATTACK' | 'DEFENCE' | 'OFFENCE';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type OfflinePolicy = 'FORCE_LOCAL' | 'AUTO_DETECT' | 'CLOUD_ALLOWED';

export interface LocalOnlyStatus {
  enabled: boolean;
  policy: OfflinePolicy;
  isOnline: boolean;
  cachedResponseCount: number;
  onboardEngineStatus: 'READY' | 'ACTIVE' | 'OFFLINE';
  lastOfflineExecution?: string;
  cacheStorageBytes?: number;
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  target: string;
  category: string;
  evidence: string;
  impact: string;
  riskScore: number;
  recommendation: string;
  remediation: string;
  verified: boolean;
  timestamp: string;
}

export interface SecurityOperationLog {
  id: string;
  timestamp: string;
  taskId?: string;
  target: string;
  mode: SecuritySubMode;
  action: string;
  tool: string;
  result: 'SUCCESS' | 'BLOCKED' | 'WARNING' | 'FAILED';
  provider: ProviderId;
  details: string;
}

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  framework: string;
  language: string;
  files: ProjectFile[];
  dependencies: Record<string, string>;
  knownErrors: string[];
  buildStatus: 'SUCCESS' | 'FAILED' | 'UNTESTED';
  testStatus: 'PASSED' | 'FAILED' | 'NOT_RUN';
  lastScanned: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  taskId?: string;
  providerUsed?: ProviderId;
  modelUsed?: string;
  attachments?: {
    name: string;
    type: 'image' | 'code' | 'doc' | 'archive';
    url?: string;
    content?: string;
  }[];
  toolCalls?: {
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
    status: 'RUNNING' | 'DONE' | 'FAILED';
  }[];
  checkpointId?: string;
  didYouMean?: {
    originalInput?: string;
    suggestedCommand: string;
    category?: string;
    confidence: number;
    explanation?: string;
  };
  suggestions?: string[];
}

export type VoiceMood =
  | 'neutral'
  | 'calm'
  | 'authoritative'
  | 'excited'
  | 'empathetic'
  | 'analytical'
  | 'serious'
  | 'friendly'
  | 'cybernetic';

export type TaskUrgency =
  | 'low'
  | 'normal'
  | 'medium'
  | 'high'
  | 'critical'
  | 'emergency';

export interface ProsodyParameters {
  rate: number; // 0.75 - 1.50 (1.0 = normal)
  pitch: number; // 0.70 - 1.45 (1.0 = normal)
  volume: number; // 0.10 - 1.00 (1.0 = full)
  mood: VoiceMood;
  urgency: TaskUrgency;
  inflection?: 'flat' | 'expressive' | 'curious' | 'commanding' | 'balanced';
  dynamicPacing?: boolean;
}

export interface VoiceState {
  state:
    | 'IDLE'
    | 'STANDBY'
    | 'WAKE_WORD_STANDBY'
    | 'WAKE'
    | 'WAKE_DETECTED'
    | 'STARTING_MIC'
    | 'LISTENING'
    | 'COMMAND_CAPTURED'
    | 'MIC_LOCKED'
    | 'ANALYZING'
    | 'PLANNING'
    | 'WORKING'
    | 'AI_SWITCHING'
    | 'PROCESSING_STT'
    | 'THINKING'
    | 'TOOL_EXECUTION'
    | 'EXECUTING'
    | 'VERIFYING'
    | 'PREPARING_RESPONSE'
    | 'PREPARING_TTS'
    | 'SPEAKING'
    | 'OUTPUT_COMPLETE'
    | 'AUTHORIZED_INTERRUPT'
    | 'COMPLETE'
    | 'INTERRUPTED'
    | 'ERROR'
    | 'RECOVERY';
  requestId?: string;
  rawTranscript?: string;
  normalizedTranscript?: string;
  detectedLanguage?: 'en' | 'bn' | 'mixed' | 'hi';
  cognitiveStage?: CognitiveStage;
  errorMessage?: string;
  audioLevel?: number;
  micPermission?: 'granted' | 'denied' | 'prompt' | 'unsupported';
  isTranscribing?: boolean;
  isConversationMode?: boolean;
  isWakeWordActive?: boolean;
  wakeWordTriggered?: boolean;
  turnCount?: number;
  bargeInDetected?: boolean;
  activeAiWorker?: string;
  currentMood?: VoiceMood;
  currentUrgency?: TaskUrgency;
  activeProsody?: {
    rate: number;
    pitch: number;
    volume: number;
    mood: VoiceMood;
    urgency: TaskUrgency;
  };
}

export type MobileAppId =
  | 'youtube'
  | 'whatsapp'
  | 'phone'
  | 'camera'
  | 'maps'
  | 'spotify'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'tiktok'
  | 'telegram'
  | 'gmail'
  | 'sms'
  | 'calculator'
  | 'settings'
  | 'browser'
  | 'clock';

export type MobileActionType =
  | 'OPEN_APP'
  | 'SEARCH_YOUTUBE'
  | 'PLAY_YOUTUBE'
  | 'MAKE_CALL'
  | 'SEND_WHATSAPP'
  | 'SEND_SMS'
  | 'NAVIGATE_MAPS'
  | 'OPEN_CAMERA'
  | 'TOGGLE_TORCH'
  | 'DEVICE_VIBRATE'
  | 'CHECK_BATTERY'
  | 'GET_LOCATION'
  | 'COPY_CLIPBOARD'
  | 'TOGGLE_WAKELOCK'
  | 'BACKGROUND_SERVICE_START'
  | 'BACKGROUND_SERVICE_STOP'
  | 'COMPANION_ADB_COMMAND';

export interface MobileContact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
  avatar?: string;
  isQuickDial?: boolean;
}

export interface MobileDeviceAction {
  type: MobileActionType;
  app?: MobileAppId;
  target?: string;
  query?: string;
  phone?: string;
  contactName?: string;
  message?: string;
  torchState?: 'on' | 'off' | 'toggle';
  url?: string;
  vibratePattern?: number[];
  commandDescription: string;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
  resultDetails?: string;
}

export interface DeviceHardwareState {
  batteryLevel: number | null;
  isCharging: boolean | null;
  isWakeLockActive: boolean;
  isTorchOn: boolean;
  isBackgroundAudioActive: boolean;
  isMediaSessionActive: boolean;
  networkOnline: boolean;
  networkType: string;
  platform: string;
  isPWA: boolean;
  isCompanionConnected: boolean;
  lastAction?: MobileDeviceAction;
}

// ----------------------------------------------------
// 1. LONG-TERM PERSISTENT MEMORY & VECTOR DATABASE
// ----------------------------------------------------
export interface VectorMemoryDocument {
  id: string;
  title: string;
  content: string;
  category: 'CODE_SNIPPET' | 'BUG_FIX' | 'ARCHITECTURE' | 'REQUIREMENT' | 'USER_PREFERENCE' | 'DOCS';
  tags: string[];
  embedding?: number[];
  similarityScore?: number;
  metadata: {
    createdAt: string;
    lastAccessed: string;
    accessCount: number;
    sourceTask?: string;
    language?: string;
  };
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category?: 'LANGUAGE' | 'FRAMEWORK' | 'STYLE' | 'ARCHITECTURE' | 'PREFERENCE' | 'PROJECT';
  type?: 'PROJECT' | 'MODULE' | 'LIBRARY' | 'FEATURE' | 'DATABASE' | 'SERVICE' | 'AGENT';
  weight?: number; // 1-10
  details?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string; // e.g. 'USES', 'PREFERS', 'CONFIGURED_WITH', 'FIXED_IN', 'CONTAINS', 'DEPENDS_ON', 'PROVIDES', 'COMMUNICATES_WITH', 'CALLS'
}

export interface StrategicLearningWeights {
  technicalWeight: number; // 0 to 100
  personalAssistantWeight: number; // 0 to 100
  banglishNuanceLevel: number; // 0 to 100
  proactiveSuggestionFrequency: 'HIGH' | 'BALANCED' | 'LOW';
  activePersona: 'SUPER_BRAIN_ANALYTICAL' | 'PERSONAL_COMPANION' | 'HYBRID_INTELLIGENCE';
  updatedAt: string;
}

export interface UserPreferencesProfile {
  id: string;
  userId: string;
  preferredCodingStyle: string; // e.g. 'TypeScript Strict, Functional, Tailwind, Clean Code'
  architectureHabits: string[]; // e.g. ['Clean Architecture', 'Modular Services', 'Failover Redundancy']
  techStackPreferences: {
    frontend: string[];
    backend: string[];
    database: string[];
    styling: string[];
    testing: string[];
  };
  customDirectives: string[];
  totalLearnedPatterns: number;
  learningWeights?: StrategicLearningWeights;
  updatedAt: string;
}

// ----------------------------------------------------
// 2. MULTI-MODAL REAL-WORLD PERCEPTION & TONE
// ----------------------------------------------------
export type VoiceToneMode = 'TACTICAL_URGENT' | 'CONVERSATIONAL' | 'DEEP_TECHNICAL' | 'MENTOR' | 'CALM_COMPANION';

export interface VoiceToneProfile {
  mode: VoiceToneMode;
  name: string;
  description: string;
  pitchMultiplier: number;
  rateMultiplier: number;
  inflection: 'formal' | 'tactical' | 'relaxed' | 'scholarly';
  banglaAccentStyle: 'standard' | 'dynamic' | 'crisp_tech';
}

export interface ScreenAuditResult {
  id: string;
  timestamp: string;
  dimensions: { width: number; height: number };
  uiElementsDetected: number;
  accessibilityIssues: {
    type: 'CONTRAST' | 'TOUCH_TARGET' | 'MISSING_LABEL' | 'OVERFLOW';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    elementSelector?: string;
    fixSuggestion: string;
  }[];
  visualBugs: string[];
  uxRating: number; // 1-100
  screenshotDataUrl?: string;
}

export interface VisualInspectionReport {
  id: string;
  timestamp: string;
  targetType: 'SCREEN' | 'CAMERA_OBJECT' | 'WHITEBOARD_SKETCH' | 'IDE_EDITOR';
  summary: string;
  detectedCodeOrText?: string;
  identifiedIssues: string[];
  suggestedCodeImprovements: string[];
}

// ----------------------------------------------------
// 3. AUTONOMOUS AGENTIC WORKFLOW & RECURSIVE DEBUGGER
// ----------------------------------------------------
export interface SandboxRunResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  testsPassed: number;
  testsTotal: number;
  errorStackTrace?: string;
  memoryUsedMb?: number;
}

export interface DebuggerIteration {
  iterationNumber: number;
  timestamp: string;
  codeSnapshot: string;
  runResult: SandboxRunResult;
  errorIdentified?: string;
  rootCauseAnalysis?: string;
  proposedFixDiff?: string;
  status: 'ANALYZING' | 'PATCH_APPLIED' | 'PASSED' | 'FAILED';
}

export interface RecursiveDebugSession {
  id: string;
  taskId?: string;
  language: 'typescript' | 'javascript' | 'python' | 'bash';
  goal: string;
  initialCode: string;
  finalCode?: string;
  iterations: DebuggerIteration[];
  maxIterations: number;
  status: 'IN_PROGRESS' | 'RESOLVED_ALL_TESTS_PASSED' | 'MAX_ITERATIONS_REACHED' | 'FAILED';
  totalDurationMs: number;
}

export type CloudPlatformType = 'GITHUB' | 'VERCEL' | 'DOCKER' | 'AWS_GCP' | 'JIRA';

export interface CloudToolAction {
  id: string;
  platform: CloudPlatformType;
  action: string; // e.g. 'CREATE_PR', 'DEPLOY_PREVIEW', 'BUILD_CONTAINER', 'CHECK_IAM', 'SYNC_JIRA'
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  payload: Record<string, unknown>;
  result?: {
    output: string;
    url?: string;
    commitHash?: string;
    deploymentId?: string;
  };
  timestamp: string;
}

// ----------------------------------------------------
// 4. PREDICTIVE DEFENSE (OWASP TOP 10 SCANNER)
// ----------------------------------------------------
export interface PredictiveDefenseScan {
  id: string;
  timestamp: string;
  totalVulnerabilities: number;
  securityScore: number; // 0 - 100
  owaspFindings: {
    id: string;
    category: 'SQL_INJECTION' | 'XSS' | 'BROKEN_AUTH' | 'SSRF' | 'HARDCODED_SECRET' | 'MISCONFIGURATION' | 'INSECURE_DEPENDENCY';
    title: string;
    fileLocation: string;
    lineNumber?: number;
    severity: FindingSeverity;
    description: string;
    exploitScenario: string;
    autoFixPatch: string;
    applied: boolean;
  }[];
}

// ----------------------------------------------------
// 5. THINK-TANK & LIVE INFORMATION
// ----------------------------------------------------
export type CoTPhaseType = 'PLAN' | 'RESEARCH' | 'PROTOTYPE' | 'REVIEW' | 'DEPLOY';

export interface CoTPhase {
  type: CoTPhaseType;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  keyInsights: string[];
  deliverables: string[];
}

export interface ThinkTankSession {
  id: string;
  title: string;
  topic: string;
  phases: CoTPhase[];
  currentPhaseIndex: number;
  architectureBlueprint: string;
  banglaExplanation?: string;
  confidenceScore: number;
  completedAt?: string;
}

export interface BanglaTechTerm {
  englishTerm: string;
  banglaTerm: string;
  phonetic: string;
  definitionBangla: string;
  definitionEnglish: string;
  exampleUse: string;
  category: 'DISTRIBUTED_SYSTEMS' | 'AI_ML' | 'SECURITY' | 'ALGORITHMS' | 'DEVOPS' | 'QUANTUM';
}

export interface LiveNewsItem {
  id: string;
  title: string;
  source: string;
  category: 'AI_BREAKTHROUGH' | 'CYBERSECURITY' | 'DEV_FRAMEWORKS' | 'CLOUD_INFRA';
  summary: string;
  timestamp: string;
  url: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'CRITICAL';
}

// ----------------------------------------------------
// 7. ULTRON AUTONOMOUS SYSTEM & AGENTIC BRAIN UPGRADE
// ----------------------------------------------------

export type PermissionLevel = 0 | 1 | 2 | 3; // 0: Observe, 1: Suggest, 2: Execute normal, 3: Sensitive confirmation

export interface AgenticActionStep {
  id: string;
  stepNumber: number;
  agentRole: 'PLANNER' | 'RESEARCHER' | 'CODER' | 'CRITIC' | 'VERIFIER' | 'WRITER' | 'COMPUTER_AGENT' | 'SECURITY_SENTINEL';
  actionName: string;
  toolUsed?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFYING' | 'CORRECTING' | 'FAILED' | 'SKIPPED';
  inputPayload?: any;
  resultPayload?: any;
  verificationStatus?: 'VERIFIED' | 'UNCERTAIN' | 'DISPUTED' | 'FAILED';
  verificationNotes?: string;
  uncertaintyScore?: number; // 0 (certain) to 1 (high uncertainty)
  requiresConfirmation?: boolean;
  confirmedByUser?: boolean;
  dryRunPlan?: string;
  timestamp: string;
}

export interface VerificationCriticReport {
  target: string;
  category: 'CODING' | 'RESEARCH' | 'CALCULATION' | 'TECHNICAL_INFO' | 'IMPORTANT_DECISION' | 'AUTOMATION';
  criticAssessment: string;
  verdict: 'APPROVED' | 'REQUIRES_CORRECTION' | 'UNCERTAIN' | 'FLAGGED_RISK';
  certaintyRating: number; // 0.0 - 1.0
  correctionSuggested?: string;
  appliedCorrections?: string[];
  detectedErrors?: string[];
  isVerified: boolean;
  disclaimer?: string;
}

export interface ActionApprovalRequest {
  id: string;
  action: string;
  target: string;
  permissionLevel: PermissionLevel;
  dryRunPlan?: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  metadata?: Record<string, any>;
}

export interface WebSourceCitation {
  id?: string;
  url: string;
  title: string;
  snippet: string;
  domain: string;
  relevanceScore?: number;
  credibilityScore?: number;
  publishedDate?: string;
  isAuthoritative?: boolean;
  isGrounded?: boolean;
  safetyStatus?: string;
  trustScore?: number;
}

export interface FactVerificationItem {
  claim: string;
  status?: 'VERIFIED' | 'DISPUTED' | 'UNVERIFIED' | 'PLAUSIBLE' | 'CONFIRMED' | 'CONSENSUAL' | string;
  verified?: boolean;
  confidence?: number;
  confidenceScore?: number;
  supportingSources?: string[];
  sources?: string[];
  notes?: string;
  rationale?: string;
}

export interface MultiSourceComparison {
  topic?: string;
  consensus?: string;
  consensusPoints?: string[];
  conflictingPoints?: string[];
  discrepancies?: string[];
  conflictingClaims?: string[];
  authoritativeSource?: string;
  dominantPerspective?: string;
  sourcesAnalyzedCount?: number;
}

export interface InternetResearchResult {
  query: string;
  intentType: 'SEARCH' | 'DEEP_DIVE' | 'FACT_CHECK' | 'CODE_DOCS' | 'LIVE_DATA' | 'DEEP_RESEARCH' | 'URL_READ' | 'COMPARATIVE_ANALYSIS';
  synthesizedAnswer?: string;
  summary?: string;
  simpleSummary?: string;
  detailedAnalysis?: string;
  technicalDeepDive?: string;
  banglaExplanation?: string;
  spokenBrief?: string;
  sources: WebSourceCitation[];
  factVerification?: FactVerificationItem[];
  factVerifications?: FactVerificationItem[];
  multiSourceComparison?: MultiSourceComparison;
  sourceComparison?: MultiSourceComparison;
  followUpLinks?: { label: string; url: string; context?: string }[];
  securityAudit?: {
    isSanitized: boolean;
    promptInjectionDetected: boolean;
    blockedThreats: string[];
    safeContentExtracted: boolean;
  };
  confidenceScore?: number;
  timestamp: string;
  executionPipeline?: any[];
  extractedCodeSnippets?: { language: string; code: string; context: string }[];
  cached?: boolean;
}

export interface ComputerAgentAction {
  id: string;
  actionType: 'OPEN_APP' | 'CLOSE_APP' | 'READ_FILE' | 'CREATE_FILE' | 'RENAME_FILE' | 'MOVE_FILE' | 'DELETE_FILE' | 'SEARCH_FILES' | 'OPEN_BROWSER' | 'NAVIGATE_URL' | 'EXECUTE_SCRIPT' | 'RUN_TEST' | 'TAKE_SCREENSHOT' | 'SYSTEM_TELEMETRY';
  target: string;
  parameters?: Record<string, any>;
  permissionLevelRequired: PermissionLevel;
  isSensitive: boolean;
  dryRunSummary: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTED' | 'REJECTED' | 'FAILED';
  executionResult?: string;
  timestamp: string;
}

export interface ScreenAnalysisResult {
  id: string;
  timestamp: string;
  permissionGranted: boolean;
  detectedUIElements: {
    type: 'BUTTON' | 'INPUT' | 'ERROR_MESSAGE' | 'TERMINAL_OUTPUT' | 'CODE_BLOCK' | 'NAVIGATION' | 'WINDOW';
    label: string;
    coordinates?: { x: number; y: number; width: number; height: number };
    state?: string;
  }[];
  extractedText: string;
  identifiedErrors: string[];
  layoutDescription: string;
  codeEditorAnalysis?: {
    fileType?: string;
    syntaxErrors?: string[];
    selectedCode?: string;
    suggestedFix?: string;
  };
  terminalAnalysis?: {
    lastCommand?: string;
    exitCode?: number;
    stackTrace?: string;
    remedyRecommendation?: string;
  };
  aiExplanation: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: 'PDF' | 'DOC' | 'NOTE' | 'PROJECT_FILE' | 'MANUAL' | 'DOCUMENTATION' | 'IMAGE';
  sizeBytes: number;
  tags: string[];
  chunksCount: number;
  uploadedAt: string;
  summary: string;
  embeddingsStatus: 'INDEXED' | 'PROCESSING' | 'FAILED';
}

export interface KnowledgeChunk {
  id: string;
  docId: string;
  docTitle: string;
  content: string;
  chunkIndex: number;
  score?: number;
}

export interface ProjectPersistentMemory {
  id: string;
  projectName: string;
  architecture: string;
  currentVersion: string;
  featuresCompleted: string[];
  featuresPending: string[];
  knownBugs: string[];
  configuration: Record<string, any>;
  importantDecisions: { decision: string; rationale: string; date: string }[];
  todos: { id: string; task: string; completed: boolean; priority: 'LOW' | 'NORMAL' | 'HIGH' }[];
  dependencies: { name: string; version: string; status: 'ACTIVE' | 'UNUSED' | 'DEPRECATED' }[];
  updatedAt: string;
}

export interface StructuredKnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface UserPersonalizationSettings {
  language: 'en-US' | 'bn-BD' | 'banglish';
  responseLength: 'CONCISE' | 'BALANCED' | 'THOROUGH';
  explanationDifficulty: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  voiceStyle: 'STARK_BRITISH' | 'BENGALI_NATURAL' | 'NEUTRAL_AI';
  speakingSpeed: number; // 0.8 to 1.5
  preferredAiModel: string;
  preferredTools: string[];
  uiTheme: 'CYBER_DARK' | 'STEALTH_OBSIDIAN' | 'NEO_CYAN';
  personalizationEnabled: boolean;
}

export interface ModelRouteEntry {
  category: 'CODING' | 'VISION' | 'FAST_CONVERSATION' | 'DEEP_RESEARCH' | 'OFFLINE';
  primaryModel: string;
  fallback1: string;
  fallback2: string;
  localFallback: string;
  currentActive: string;
  health: 'HEALTHY' | 'DEGRADED' | 'FAILOVER_ACTIVE' | 'OFFLINE';
  latencyMs: number;
}

export interface SelfHealingIncident {
  id: string;
  timestamp: string;
  moduleName: string;
  errorDetected: string;
  actionTaken: 'ISOLATED' | 'RESTARTED' | 'RETRIED' | 'FALLBACK_ACTIVATED' | 'USER_REPORTED';
  recoveryStatus: 'RECOVERED' | 'DEGRADED' | 'MANUAL_INTERVENTION_REQUIRED';
  details: string;
}

export interface UniversalConnector {
  id: string;
  name: string;
  category: 'GIT' | 'CLOUD_STORAGE' | 'EMAIL' | 'CALENDAR' | 'SMART_HOME' | 'AI_PROVIDER' | 'API' | 'IOT' | 'SYSTEM' | 'TERMINAL';
  description: string;
  permissionsRequired: PermissionLevel;
  authStatus: 'AUTHENTICATED' | 'REQUIRES_AUTH' | 'NOT_CONFIGURED';
  enabled: boolean;
  status: 'ONLINE' | 'STANDBY' | 'ERROR';
  lastUsed?: string;
  error?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: {
    type: 'BUILD_FAILED' | 'STORAGE_LOW' | 'SCHEDULED_CRON' | 'SECURITY_ALERT' | 'FILE_CHANGED';
    config?: Record<string, any>;
  };
  condition: string;
  actions: { name: string; tool: string; params: Record<string, any> }[];
  permissionLevel: PermissionLevel;
  enabled: boolean;
  lastRun?: string;
  lastResult?: string;
}

export interface SecuritySentinelStatus {
  mode: 'NORMAL' | 'DEFENCE' | 'LOCKDOWN';
  activeSessionsCount: number;
  connectedDevices: { id: string; name: string; ip: string; status: 'TRUSTED' | 'PENDING' | 'BLOCKED' }[];
  suspiciousActivityAlerts: { id: string; timestamp: string; title: string; risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; autoBlocked: boolean }[];
  failedLoginAttempts: number;
  apiHealthSecurityScore: number; // 0 - 100
  lockdownEnabled: boolean;
  lastSecurityAudit: string;
}

export interface EmergencyFailsafeStatus {
  isEmergencyStopped: boolean;
  stoppedAt?: string;
  cancelledTasksCount: number;
  pausedTasksCount: number;
  isolatedModules: string[];
  canResume: boolean;
}

export interface DeveloperModeReport {
  id: string;
  projectName: string;
  timestamp: string;
  architectureReview: string;
  dependenciesReview: { name: string; version: string; recommendation: string }[];
  codeQualityScore: number; // 0 - 100
  identifiedBugs: { file: string; line?: number; issue: string; fixSnippet?: string }[];
  suggestedRefactorings: { title: string; description: string; impact: string }[];
  testsSummary: { total: number; passed: number; failed: number; testNames: string[] };
  generatedDocsMarkdown: string;
}

// ============================================================================
// ULTRON NEXT-GENERATION AI OPERATING SYSTEM TYPES
// ============================================================================

export type MissionStatus = 'PLANNED' | 'RUNNING' | 'PAUSED' | 'WAITING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface MissionSubtask {
  id: string;
  title: string;
  description?: string;
  assignedAgent: string;
  status: MissionStatus;
  priority: PriorityLevel;
  dependencies: string[]; // subtask IDs
  output?: string;
  retryCount: number;
  estimatedMinutes?: number;
}

export interface UltronMission {
  id: string;
  goal: string;
  title: string;
  category: 'ENGINEERING' | 'RESEARCH' | 'BUSINESS' | 'CREATIVE' | 'AUTOMATION' | 'EDUCATION';
  status: MissionStatus;
  priority: PriorityLevel;
  progressPercent: number;
  subtasks: MissionSubtask[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  verificationReport?: string;
  outcomeSummary?: string;
}

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  reminderTime?: string;
  isRecurring: boolean;
  recurrenceRule?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | string;
  priority: PriorityLevel;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  tags: string[];
  calendarEventId?: string;
  createdAt: string;
}

export interface CommunicationMessage {
  id: string;
  channel: 'EMAIL' | 'CALENDAR' | 'MESSAGING' | 'NOTIFICATION';
  sender: string;
  recipient: string;
  subject?: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  requiresReply: boolean;
  suggestedDraftReply?: string;
  isSensitive: boolean;
  approvalStatus?: 'NOT_REQUIRED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export interface TutorCourseSession {
  id: string;
  topic: string;
  mode: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  conceptExplanation: string;
  codeExamples: { language: string; code: string; explanation: string }[];
  quizQuestions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    userSelectedIndex?: number;
    isCorrect?: boolean;
  }[];
  detectedMistakes: string[];
  studyPlanSteps: string[];
  masteryScore: number; // 0 - 100
  updatedAt: string;
}

export interface AutonomousCodingProject {
  id: string;
  name: string;
  language: 'CPP' | 'PYTHON' | 'JAVASCRIPT' | 'TYPESCRIPT' | 'HTML_CSS' | 'FLUTTER' | 'RUST' | 'GO' | 'SQL';
  architecturePlan: string;
  files: { path: string; content: string; language: string }[];
  executionStatus: 'IDLE' | 'ANALYZING' | 'CODING' | 'RUNNING' | 'TESTING' | 'FIXING' | 'VERIFIED' | 'FAILED';
  testSuite: {
    name: string;
    type: 'UNIT' | 'INTEGRATION' | 'API' | 'UI' | 'REGRESSION' | 'SECURITY' | 'PERFORMANCE';
    passed: boolean;
    durationMs: number;
    errorOutput?: string;
  }[];
  autoFixAttempts: number;
  lastRunOutput?: string;
}

export interface DataIntelligenceAnalysis {
  id: string;
  datasetName: string;
  rowCount: number;
  columnCount: number;
  columns: { name: string; type: string; nullCount: number; sampleValues: any[] }[];
  summaryStats: Record<string, { min?: number; max?: number; avg?: number; uniqueCount?: number; topValue?: any }>;
  identifiedPatterns: string[];
  trendAnalysis: string;
  recommendedVisualizations: { type: 'BAR' | 'LINE' | 'PIE' | 'SCATTER' | 'TABLE'; title: string; xKey: string; yKey: string }[];
  generatedReport: string;
  cleanedRowCount: number;
}

export interface DocumentIntelligenceAnalysis {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'DOCX' | 'TXT' | 'IMAGE' | 'SCREENSHOT' | 'MANUAL';
  extractedText: string;
  summary: string;
  extractedTables: { headers: string[]; rows: string[][] }[];
  extractedKeyFacts: string[];
  technicalExplanations: string[];
  comparisonFindings?: string[];
  isTemporarilyCached: boolean;
}

export interface VoiceUserProfile {
  id: string;
  name: string;
  voicePreference: string;
  language: 'bn-BD' | 'en-US' | 'banglish';
  permissionLevel: VoicePermissionLevel;
  confidenceThreshold: number; // 0.0 - 1.0
  customKeywords: string[];
  isActive: boolean;
}

export interface CredentialVaultItem {
  id: string;
  serviceName: string;
  keyName: string;
  maskedValue: string; // e.g. "sk-ant-••••••••••••"
  category: 'AI_PROVIDER' | 'CLOUD_SERVICE' | 'DATABASE' | 'OAUTH_TOKEN' | 'IOT_KEY' | 'CUSTOM_API';
  environmentVarName?: string;
  lastAccessed?: string;
  isEncrypted: boolean;
}

export interface UniversalTranslationOutput {
  originalText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  banglishRomanized?: string;
  detectedNuances: string[];
  phoneticAudioGuide?: string;
}

export interface SemanticMemoryRecord {
  id: string;
  category: 'CONVERSATION' | 'PROJECT' | 'PREFERENCE' | 'KNOWLEDGE' | 'FACT';
  text: string;
  vectorId: string;
  embeddingPreview?: number[];
  similarityScore?: number;
  tags: string[];
  createdAt: string;
  lastRetrievedAt?: string;
}

export interface DiscoveredLocalDevice {
  id: string;
  name: string;
  deviceType: 'LIGHT' | 'SMART_PLUG' | 'SENSOR' | 'MEDIA_PLAYER' | 'CONTROLLER' | 'ROUTER' | 'CAMERA' | 'OTHER';
  ipAddress: string;
  macAddress?: string;
  status: 'ONLINE' | 'OFFLINE' | 'PAIRING';
  isAuthorized: boolean;
  permissionScope: 'READ_ONLY' | 'CONTROL_ALLOWED' | 'ADMIN_RESTRICTED';
  telemetryData?: Record<string, any>;
}

export interface HardwareTelemetryState {
  cpuUsagePercent: number;
  cpuTemperatureC: number;
  ramUsagePercent: number;
  ramTotalGB: number;
  ramUsedGB: number;
  storageUsagePercent: number;
  batteryPercent: number;
  isCharging: boolean;
  gpuUsagePercent?: number;
  networkLatencyMs: number;
  networkSpeedMbps: number;
  healthState: 'NORMAL' | 'WARNING' | 'CRITICAL';
  runningProcessesCount: number;
  activeWorkloadsCount: number;
}

export interface UltronPluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissionsRequired: string[];
  toolsProvided: { name: string; description: string; parameters: Record<string, any> }[];
  status: 'ACTIVE' | 'DISABLED' | 'ERROR';
  isSandboxed: boolean;
}

export interface AuditTimelineEvent {
  id: string;
  timestamp: string;
  eventType: 'TASK_START' | 'AGENT_INVOCATION' | 'TOOL_CALL' | 'MODEL_INFERENCE' | 'ACTION_COMPLETED' | 'ERROR_DETECTED' | 'RETRY_ATTEMPT' | 'USER_CONFIRMATION' | 'TASK_CANCELLED' | 'SECURITY_CHECK';
  agentName: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'PENDING';
  durationMs?: number;
  maskedPayload?: string;
}

export type UltronPersonality = 'PROFESSIONAL' | 'FRIENDLY' | 'TEACHER' | 'DEVELOPER' | 'RESEARCHER' | 'MINIMAL' | 'FUTURISTIC';

export interface UltronSystemHealthDiagnostic {
  overallStatus: 'HEALTHY' | 'WARNING' | 'ERROR';
  timestamp: string;
  subsystems: {
    name: string;
    status: 'HEALTHY' | 'WARNING' | 'ERROR';
    latencyMs: number;
    notes: string;
  }[];
}

export type VoicePermissionLevel = 'FULL_ADMIN' | 'EXECUTE_STANDARD' | 'SUGGEST_ONLY' | 'READ_ONLY' | 'BLOCKED';

export type MissionObjective = UltronMission;



