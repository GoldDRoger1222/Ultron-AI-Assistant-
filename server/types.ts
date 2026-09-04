/**
 * ULTRON CORE V6 — Unified Typed API Contracts
 * 
 * Strict type safety for all core subsystems:
 * - BrainRequest & BrainResponse
 * - IntentResult & Canonical Intent Types
 * - ContextState & Multi-turn History
 * - MemoryRecord & Multi-tier Memory Layers
 * - ModelRequest, ModelResponse & Providers
 * - ToolDefinition, ToolRequest & ToolResult
 * - FileSystemAdapter & File Nodes
 * - ExecutionRequest & ExecutionResult
 * - Task, TaskStep & TaskOrchestrator
 * - VerificationRequest & EvidenceRecord
 * - ErrorClassification & RecoveryStrategy
 * - VoiceState & VoiceSession
 */

// =======================================================
// 1. CANONICAL INTENTS (17 Supported Intents)
// =======================================================
export type CanonicalIntent =
  | 'CONVERSATION'
  | 'QUESTION'
  | 'RESEARCH'
  | 'CODING'
  | 'FILE_OPERATION'
  | 'CODE_EXECUTION'
  | 'WEB_SEARCH'
  | 'PROJECT_OPERATION'
  | 'DEVICE_CONTROL'
  | 'COMPUTER_CONTROL'
  | 'VISION'
  | '3D_GENERATION'
  | 'MULTI_STEP_TASK'
  | 'TASK_STATUS'
  | 'CANCEL_TASK'
  | 'SYSTEM_COMMAND'
  | 'UNKNOWN';

export interface IntentClassificationResult {
  intent: CanonicalIntent;
  confidence: number;
  rawInput: string;
  normalizedInput: string;
  detectedLanguage: 'English' | 'Bangla' | 'Banglish' | 'Hindi' | 'Other';
  isWakeWordOnly?: boolean;
  extractedEntities: Record<string, string>;
  routingExplanation: string;
  suggestedTools: string[];
}

// =======================================================
// 2. CONTEXT ENGINE CONTRACTS
// =======================================================
export interface ContextTurn {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  intent?: CanonicalIntent;
  toolCalls?: string[];
  metadata?: Record<string, unknown>;
}

export interface ContextState {
  sessionId: string;
  activeTaskId?: string;
  activeProjectId?: string;
  activeFiles: string[];
  recentToolResults: Record<string, unknown>[];
  recentErrors: string[];
  pendingActions: string[];
  relevantMemories: string[];
  userPreferences: Record<string, unknown>;
  lastReferencedFile?: string;
  lastReferencedTopic?: string;
}

// =======================================================
// 3. MEMORY ENGINE CONTRACTS (5 Layers)
// =======================================================
export type MemoryLayerType =
  | 'SESSION_MEMORY'
  | 'SHORT_TERM_MEMORY'
  | 'PROJECT_MEMORY'
  | 'LONG_TERM_MEMORY'
  | 'SEMANTIC_MEMORY';

export type MemoryCategory =
  | 'FACT'
  | 'PREFERENCE'
  | 'CODE_SNIPPET'
  | 'BUG_FIX'
  | 'ARCHITECTURE'
  | 'TOOL_RESULT'
  | 'KNOWLEDGE'
  | 'CONVERSATION_SUMMARY';

export interface MemoryRecord {
  id: string;
  layer: MemoryLayerType;
  key: string;
  title: string;
  content: string;
  category: MemoryCategory;
  tags: string[];
  importance: number; // 1 - 10
  embeddingVector?: number[];
  similarityScore?: number;
  metadata: {
    createdAt: string;
    updatedAt: string;
    accessCount: number;
    lastAccessedAt: string;
    source?: string;
  };
}

export interface SearchMemoryOptions {
  layer?: MemoryLayerType;
  category?: MemoryCategory;
  tags?: string[];
  minImportance?: number;
  limit?: number;
  semanticQuery?: string;
}

// =======================================================
// 4. MODEL ROUTER CONTRACTS
// =======================================================
export type ModelCategoryType =
  | 'FAST'
  | 'REASONING'
  | 'CODING'
  | 'MULTILINGUAL'
  | 'VISION'
  | 'GENERAL_AI'
  | 'CONVERSATION';

export interface ModelRequest {
  prompt: string;
  category?: ModelCategoryType;
  preferredProvider?: 'gemini' | 'openrouter' | 'local';
  preferredModel?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  contextHistory?: { role: 'user' | 'assistant'; content: string }[];
  timeoutMs?: number;
}

export interface ModelResponse {
  success: boolean;
  text: string;
  spokenText?: string;
  providerUsed: string;
  modelUsed: string;
  finishReason?: string;
  latencyMs: number;
  error?: string;
  fallbackTriggered?: boolean;
}

// =======================================================
// 5. PERMISSIONS & SECURITY
// =======================================================
export type PermissionLevel = 0 | 1 | 2 | 3;
// Level 0: Read-only
// Level 1: Normal modification
// Level 2: Sensitive operations
// Level 3: Dangerous/destructive (explicit confirmation)

export interface PermissionCheckResult {
  allowed: boolean;
  requiredLevel: PermissionLevel;
  currentLevel: PermissionLevel;
  requiresConfirmation: boolean;
  approvalId?: string;
  reason: string;
}

// =======================================================
// 6. TOOL REGISTRY CONTRACTS
// =======================================================
export type ToolCategory =
  | 'FILE'
  | 'CODE'
  | 'WEB'
  | 'PROJECT'
  | 'TASK'
  | 'DEVICE'
  | 'VISION'
  | '3D'
  | 'SYSTEM';

export interface ToolDefinition<TArgs = Record<string, any>, TResult = any> {
  name: string;
  category: ToolCategory;
  description: string;
  permissionLevel: PermissionLevel;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; required?: boolean; enum?: string[] }>;
    required?: string[];
  };
  timeoutMs: number;
  isAvailableInRuntime: boolean;
  unavailableReason?: string;
  handler: (args: TArgs, context?: ToolExecutionContext) => Promise<ToolExecutionResult<TResult>>;
  verify?: (args: TArgs, result: ToolExecutionResult<TResult>) => Promise<EvidenceRecord>;
}

export interface ToolExecutionContext {
  taskId?: string;
  sessionId?: string;
  permissionLevelOverride?: PermissionLevel;
  skipVerification?: boolean;
}

export interface ToolExecutionResult<TData = any> {
  success: boolean;
  tool: string;
  taskId?: string;
  data?: TData;
  error?: {
    type: ErrorClassification;
    message: string;
    details?: string;
    recoverable?: boolean;
  } | null;
  evidence?: EvidenceRecord | null;
  executionTimeMs: number;
}

// =======================================================
// 7. FILESYSTEM ADAPTER CONTRACTS
// =======================================================
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  sizeBytes: number;
  updatedAt: string;
  createdAt: string;
  extension?: string;
  isReadOnly?: boolean;
  isVirtual?: boolean;
}

export interface FileStat {
  exists: boolean;
  type?: 'file' | 'directory';
  sizeBytes?: number;
  updatedAt?: string;
  createdAt?: string;
  path?: string;
  isVirtual?: boolean;
}

export interface FileOperationResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  evidence?: EvidenceRecord;
  statusCode?: 'SUCCESS' | 'FILE_NOT_FOUND' | 'TOOL_UNAVAILABLE' | 'PERMISSION_DENIED' | 'IO_ERROR';
}

export interface IFileSystemAdapter {
  createFile(filePath: string, content: string): Promise<FileOperationResult<FileNode>>;
  readFile(filePath: string): Promise<FileOperationResult<FileNode>>;
  updateFile(filePath: string, content: string): Promise<FileOperationResult<FileNode>>;
  deleteFile(filePath: string): Promise<FileOperationResult<boolean>>;
  listFiles(dirPath?: string, recursive?: boolean): Promise<FileOperationResult<FileNode[]>>;
  searchFiles(query: string, dirPath?: string): Promise<FileOperationResult<FileNode[]>>;
  moveFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult<FileNode>>;
  copyFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult<FileNode>>;
  stat(filePath: string): Promise<FileStat>;
  isAvailable(): boolean;
}

// =======================================================
// 8. CODE EXECUTION CONTRACTS
// =======================================================
export interface ExecutionRequest {
  language: 'javascript' | 'typescript' | 'python' | 'bash' | 'c' | 'cpp' | string;
  code: string;
  timeoutMs?: number;
  memoryLimitMb?: number;
  envVars?: Record<string, string>;
  vfsWorkingDirectory?: string;
  stdin?: string;
}

export interface ExecutionResult {
  id: string;
  language: string;
  code: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'SECURITY_BLOCKED' | 'RUNTIME_UNAVAILABLE';
  error?: string;
  evidence?: EvidenceRecord;
  timestamp: string;
}

// =======================================================
// 9. TASK ORCHESTRATOR & STATE MACHINE CONTRACTS
// =======================================================
export type TaskStatus =
  | 'RECEIVED'
  | 'UNDERSTANDING'
  | 'PLANNING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'ERROR'
  | 'ANALYZE_ERROR'
  | 'RETRY_FIX'
  | 'FAILED'
  | 'CANCELLED';

export interface TaskStep {
  stepIndex: number;
  title: string;
  toolRequired?: string;
  toolArgs?: Record<string, unknown>;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'SELF_CORRECTED';
  resultSummary?: string;
  error?: string;
  evidence?: EvidenceRecord;
  executionTimeMs?: number;
}

export interface OrchestratedTask {
  taskId: string;
  goal: string;
  status: TaskStatus;
  intent: CanonicalIntent;
  steps: TaskStep[];
  currentStepIndex: number;
  retryCount: number;
  maxRetries: number;
  activeFiles: string[];
  executionTimeMs: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  finalOutput?: string;
  error?: string;
  verification?: EvidenceRecord;
}

// =======================================================
// 10. EVIDENCE & VERIFICATION CONTRACTS
// =======================================================
export interface EvidenceRecord {
  verified: boolean;
  verificationType:
    | 'FILESYSTEM_READBACK'
    | 'CODE_EXIT_CODE'
    | 'DEVICE_STATUS_TELEMETRY'
    | 'WEB_CONTENT_HASH'
    | 'SYNTAX_PARSER'
    | 'RUNTIME_PROBE'
    | 'BUILD_ARTIFACT_EXISTS'
    | 'FILE_SYSTEM_ENTRY'
    | 'DEPENDENCY_RESOLVED';
  timestamp: string;
  details: string;
  target?: string;
  actualState?: unknown;
  expectedState?: unknown;
  evidenceHash?: string;
  dataSnippet?: string;
}

// =======================================================
// 11. ERROR CLASSIFICATION & RECOVERY
// =======================================================
export type ErrorClassification =
  | 'AUTH_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'FILE_NOT_FOUND'
  | 'PERMISSION_ERROR'
  | 'SYNTAX_ERROR'
  | 'BUILD_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'RUNTIME_ERROR'
  | 'TOOL_UNAVAILABLE'
  | 'RUNTIME_UNAVAILABLE'
  | 'VERIFICATION_FAILED'
  | 'UNKNOWN_ERROR';

export interface ErrorAnalysis {
  type: ErrorClassification;
  message: string;
  recoverable: boolean;
  suggestedAction: string;
  recommendedRetryStrategy?: 'IMMEDIATE' | 'BACKOFF' | 'FALLBACK_TOOL' | 'FALLBACK_PROVIDER' | 'ASK_USER';
  safeFixPrompt?: string;
  originalError: unknown;
}

export interface RecoveryStrategy {
  action: 'RETRY' | 'PATCH' | 'FALLBACK_LOCAL' | 'ABORT' | 'REQUEST_CONFIRMATION';
  delayMs?: number;
  patchPayload?: string;
  reason: string;
}

// =======================================================
// 12. VOICE STATE MACHINE
// =======================================================
export type CanonicalVoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'THINKING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'ERROR';

// =======================================================
// 13. CANONICAL BRAIN REQUEST / RESPONSE
// =======================================================
export interface BrainRequest {
  input: string;
  context?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  sessionId?: string;
  preferredProvider?: 'gemini' | 'openrouter' | 'local';
  preferredModel?: string;
  requestId?: string;
  autoApprovePermissionLevel?: PermissionLevel;
}

export interface BrainResponse {
  success: boolean;
  taskId?: string;
  intent: CanonicalIntent;
  rawInput: string;
  normalizedInput: string;
  detectedLanguage: 'English' | 'Bangla' | 'Banglish' | 'Hindi' | 'Other';
  modelUsed?: string;
  providerUsed?: string;
  spokenResponse: string;
  markdownResponse: string;
  toolResults: ToolExecutionResult[];
  verificationStatus: 'VERIFIED' | 'FAILED' | 'NOT_APPLICABLE' | 'UNAVAILABLE';
  evidence?: EvidenceRecord | null;
  executionTimeMs: number;
  diagnostics: {
    taskId?: string;
    intent: CanonicalIntent;
    model: string;
    provider: string;
    toolsUsed: string[];
    status: string;
    executionTimeMs: number;
    retryCount: number;
    verification: string;
    error?: string;
  };
  error?: string;
}
