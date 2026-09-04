/**
 * ULTRON Context Engine
 * Maintains conversation history, active task hierarchy, active files,
 * anaphoric resolution ("it", "the file", "the calculator"), user preferences,
 * tool results, and errors.
 */

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: string;
  language?: string;
  taskId?: string;
}

export interface ActiveTaskContext {
  taskId: string;
  goal: string;
  status: 'RECEIVED' | 'UNDERSTANDING' | 'PLANNING' | 'EXECUTING' | 'VERIFYING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  plan: string[];
  currentStepIndex: number;
  activeFiles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PendingAction {
  id: string;
  actionType: string;
  description: string;
  requiredPermissionLevel: number;
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

export interface UltronContextState {
  sessionId: string;
  conversationHistory: ConversationMessage[];
  currentTask: ActiveTaskContext | null;
  previousTasks: ActiveTaskContext[];
  activeProject: {
    id: string;
    name: string;
    rootPath: string;
    activeFiles: string[];
    dependencies: string[];
  };
  activeFiles: string[]; // e.g. ['/projects/calculator.py', 'src/App.tsx']
  lastReferencedFile: string | null;
  userPreferences: {
    languagePreference: 'auto' | 'en' | 'bn' | 'banglish';
    wakeWordEnabled: boolean;
    continuousConversation: boolean;
    permissionAutoApproveLevel: number; // 0 or 1
  };
  recentToolResults: Array<{
    toolName: string;
    success: boolean;
    timestamp: string;
    evidence?: unknown;
    error?: string;
  }>;
  recentErrors: Array<{
    type: string;
    message: string;
    timestamp: string;
    recovered: boolean;
  }>;
  pendingActions: PendingAction[];
}

export class ContextEngine {
  private static instance: ContextEngine;
  private state: UltronContextState;

  private constructor() {
    this.state = {
      sessionId: `sess-${Date.now()}`,
      conversationHistory: [],
      currentTask: null,
      previousTasks: [],
      activeProject: {
        id: 'proj-ultron-core',
        name: 'ULTRON Workspace',
        rootPath: '/projects',
        activeFiles: [],
        dependencies: ['typescript', 'node'],
      },
      activeFiles: [],
      lastReferencedFile: null,
      userPreferences: {
        languagePreference: 'auto',
        wakeWordEnabled: true,
        continuousConversation: false,
        permissionAutoApproveLevel: 1,
      },
      recentToolResults: [],
      recentErrors: [],
      pendingActions: [],
    };
  }

  public static getInstance(): ContextEngine {
    if (!ContextEngine.instance) {
      ContextEngine.instance = new ContextEngine();
    }
    return ContextEngine.instance;
  }

  public getState(): UltronContextState {
    return { ...this.state };
  }

  public addMessage(role: 'user' | 'assistant' | 'system', content: string, meta?: { intent?: string; language?: string; taskId?: string }): ConversationMessage {
    const msg: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      intent: meta?.intent,
      language: meta?.language,
      taskId: meta?.taskId,
    };
    this.state.conversationHistory.push(msg);
    // Keep sliding window
    if (this.state.conversationHistory.length > 50) {
      this.state.conversationHistory = this.state.conversationHistory.slice(-50);
    }
    return msg;
  }

  public trackFileReference(filePath: string) {
    if (!filePath) return;
    const normalized = filePath.trim();
    if (!this.state.activeFiles.includes(normalized)) {
      this.state.activeFiles.push(normalized);
    }
    if (!this.state.activeProject.activeFiles.includes(normalized)) {
      this.state.activeProject.activeFiles.push(normalized);
    }
    this.state.lastReferencedFile = normalized;
  }

  /**
   * Resolves anaphoric references in user prompt
   * Example: "Add a GUI" -> detects last referenced file "calculator.py"
   */
  public resolveContextualTarget(userInput: string): {
    targetFile: string | null;
    resolvedPrompt: string;
    referencedActiveProject: boolean;
  } {
    const lower = userInput.toLowerCase();
    let targetFile = this.state.lastReferencedFile;
    let resolvedPrompt = userInput;

    // Check if user explicitly mentioned a file name
    const fileMatch = userInput.match(/(?:file|script|module|component)?\s*['"`]?([\w\-./]+\.(?:py|js|ts|tsx|jsx|json|html|css|md|txt|sh))['"`]?/i);
    if (fileMatch && fileMatch[1]) {
      targetFile = fileMatch[1];
      this.trackFileReference(targetFile);
      return { targetFile, resolvedPrompt, referencedActiveProject: true };
    }

    // If user says "it", "the file", "the calculator", "this program", "the code", resolve to last active file
    const anaphoraRegex = /\b(it|the file|this file|the code|this code|the program|this program|the script|this script|oita|eta|code ta|file ta)\b/i;
    if (anaphoraRegex.test(lower) && this.state.lastReferencedFile) {
      resolvedPrompt = `${userInput} (Target context: ${this.state.lastReferencedFile})`;
    }

    return {
      targetFile,
      resolvedPrompt,
      referencedActiveProject: this.state.activeProject.activeFiles.length > 0,
    };
  }

  public setCurrentTask(task: ActiveTaskContext) {
    if (this.state.currentTask && this.state.currentTask.taskId !== task.taskId) {
      this.state.previousTasks.push(this.state.currentTask);
      if (this.state.previousTasks.length > 20) {
        this.state.previousTasks.shift();
      }
    }
    this.state.currentTask = task;
  }

  public updateCurrentTaskStatus(status: ActiveTaskContext['status'], planStepIndex?: number) {
    if (!this.state.currentTask) return;
    this.state.currentTask.status = status;
    this.state.currentTask.updatedAt = new Date().toISOString();
    if (planStepIndex !== undefined) {
      this.state.currentTask.currentStepIndex = planStepIndex;
    }
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      this.state.previousTasks.push({ ...this.state.currentTask });
      this.state.currentTask = null;
    }
  }

  public recordToolResult(toolName: string, success: boolean, evidence?: unknown, error?: string) {
    this.state.recentToolResults.push({
      toolName,
      success,
      timestamp: new Date().toISOString(),
      evidence,
      error,
    });
    if (this.state.recentToolResults.length > 30) {
      this.state.recentToolResults.shift();
    }
  }

  public recordError(type: string, message: string, recovered: boolean = false) {
    this.state.recentErrors.push({
      type,
      message,
      timestamp: new Date().toISOString(),
      recovered,
    });
    if (this.state.recentErrors.length > 20) {
      this.state.recentErrors.shift();
    }
  }

  public addPendingAction(action: Omit<PendingAction, 'id' | 'createdAt' | 'status'>): PendingAction {
    const pending: PendingAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...action,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };
    this.state.pendingActions.push(pending);
    return pending;
  }

  public resolvePendingAction(actionId: string, confirmed: boolean): PendingAction | null {
    const action = this.state.pendingActions.find((a) => a.id === actionId);
    if (!action) return null;
    action.status = confirmed ? 'CONFIRMED' : 'REJECTED';
    return action;
  }

  public clearSession() {
    this.state.conversationHistory = [];
    this.state.currentTask = null;
    this.state.activeFiles = [];
    this.state.lastReferencedFile = null;
    this.state.recentToolResults = [];
    this.state.recentErrors = [];
    this.state.pendingActions = [];
  }
}
