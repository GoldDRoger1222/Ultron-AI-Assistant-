/**
 * ULTRON Core Unified Context Engine
 * 
 * Manages:
 * - Multi-turn conversational history with metadata & intents
 * - Active task status & step tracking
 * - Active workspace files & contextual reference resolution ("it", "the file", "the calculator")
 * - Recent tool results and error cache
 * - User preferences & working facts
 */

import {
  ContextTurn,
  ContextState,
  CanonicalIntent,
} from './types.js';

export class ContextEngineCore {
  private static instance: ContextEngineCore;
  private turns: ContextTurn[] = [];
  private state: ContextState;

  private constructor() {
    this.state = {
      sessionId: `SESSION-${Date.now()}`,
      activeFiles: [],
      recentToolResults: [],
      recentErrors: [],
      pendingActions: [],
      relevantMemories: [],
      userPreferences: {},
    };
  }

  public static getInstance(): ContextEngineCore {
    if (!ContextEngineCore.instance) {
      ContextEngineCore.instance = new ContextEngineCore();
    }
    return ContextEngineCore.instance;
  }

  public addTurn(
    role: 'user' | 'assistant' | 'system' | 'tool',
    content: string,
    metadata?: { intent?: CanonicalIntent; taskId?: string; toolCalls?: string[] }
  ): ContextTurn {
    const turn: ContextTurn = {
      id: `TURN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      intent: metadata?.intent,
      toolCalls: metadata?.toolCalls,
      metadata,
    };

    this.turns.push(turn);
    if (this.turns.length > 50) this.turns.shift();

    // Check for file references to update active files
    const fileMatches = content.match(/[a-zA-Z0-9_\-./]+\.(?:py|js|ts|tsx|jsx|html|css|json|md|txt)/g);
    if (fileMatches && fileMatches.length > 0) {
      for (const f of fileMatches) {
        this.trackFileReference(f);
      }
    }

    return turn;
  }

  public trackFileReference(filePath: string): void {
    const norm = filePath.startsWith('/') ? filePath : `/projects/${filePath}`;
    this.state.lastReferencedFile = norm;
    if (!this.state.activeFiles.includes(norm)) {
      this.state.activeFiles.unshift(norm);
      if (this.state.activeFiles.length > 10) this.state.activeFiles.pop();
    }
  }

  /**
   * Resolve pronouns and relative phrases ("it", "the file", "the calculator", "oi ta")
   */
  public resolveContextualTarget(rawPrompt: string): {
    targetFile?: string;
    resolvedPrompt: string;
    hadContextualReference: boolean;
  } {
    const lower = rawPrompt.toLowerCase();
    let targetFile = this.state.lastReferencedFile;
    let hadContextualReference = false;
    let resolvedPrompt = rawPrompt;

    const pronounPatterns = [
      /\b(to it|on it|with it|run it|test it|execute it|debug it|fix it|delete it|update it)\b/i,
      /\b(the file|this file|the script|the program|the code)\b/i,
      /\b(oi file ta|oita|eita|ei code ta)\b/i,
    ];

    for (const pat of pronounPatterns) {
      if (pat.test(lower)) {
        hadContextualReference = true;
        if (targetFile) {
          resolvedPrompt = `${rawPrompt} (referring to ${targetFile})`;
        }
        break;
      }
    }

    return {
      targetFile,
      resolvedPrompt,
      hadContextualReference,
    };
  }

  public setActiveTask(taskId: string): void {
    this.state.activeTaskId = taskId;
  }

  public getActiveTask(): string | undefined {
    return this.state.activeTaskId;
  }

  public getRecentTurns(limit: number = 10): ContextTurn[] {
    return this.turns.slice(-limit);
  }

  public getState(): ContextState {
    return { ...this.state };
  }

  public clearHistory(): void {
    this.turns = [];
    this.state.activeFiles = [];
    this.state.lastReferencedFile = undefined;
  }
}
