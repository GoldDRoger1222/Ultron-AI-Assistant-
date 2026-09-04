/**
 * ULTRON Multi-Tier Memory Engine
 * 
 * 4 Structured Memory Layers:
 * - SHORT_TERM_MEMORY (immediate turns, working facts, transient context)
 * - SESSION_MEMORY (current active session states, goals, milestones)
 * - PROJECT_MEMORY (codebase architecture, dependencies, schemas, verified files)
 * - LONG_TERM_MEMORY (user preferences, persistent problem solutions, learned habits)
 * 
 * Filtering: Only stores useful, high-signal information (never blind spam).
 */

export type MemoryLayer = 'SHORT_TERM_MEMORY' | 'SESSION_MEMORY' | 'PROJECT_MEMORY' | 'LONG_TERM_MEMORY';

export interface MemoryRecord {
  id: string;
  layer: MemoryLayer;
  key: string;
  title: string;
  content: string;
  category: 'FACT' | 'PREFERENCE' | 'CODE_SNIPPET' | 'BUG_FIX' | 'ARCHITECTURE' | 'TOOL_RESULT' | 'CONVERSATION_SUMMARY';
  tags: string[];
  importance: number; // 1 to 10
  metadata: {
    createdAt: string;
    updatedAt: string;
    accessCount: number;
    lastAccessedAt: string;
    source?: string;
  };
}

export interface SearchMemoryOptions {
  layer?: MemoryLayer;
  category?: MemoryRecord['category'];
  tags?: string[];
  limit?: number;
  minImportance?: number;
}

export class MemoryEngine {
  private static instance: MemoryEngine;
  private memories: Map<string, MemoryRecord> = new Map();

  private constructor() {
    this.seedDefaultKnowledge();
  }

  public static getInstance(): MemoryEngine {
    if (!MemoryEngine.instance) {
      MemoryEngine.instance = new MemoryEngine();
    }
    return MemoryEngine.instance;
  }

  private seedDefaultKnowledge() {
    this.saveMemory('LONG_TERM_MEMORY', {
      key: 'user-identity',
      title: 'Master User Profile & Engineering Standards',
      content: 'User builds high-reliability full-stack TypeScript, React, and Python applications. Emphasizes real execution over simulations and hates fake "Done" statuses without proof.',
      category: 'PREFERENCE',
      tags: ['user', 'standards', 'preferences'],
      importance: 10,
    });

    this.saveMemory('LONG_TERM_MEMORY', {
      key: 'multilingual-support',
      title: 'Bangla, Banglish, and English NLP Instructions',
      content: 'Respond directly in the language the user speaks. For Bangla and Banglish, provide articulate and technically accurate answers preserving engineering terminology.',
      category: 'PREFERENCE',
      tags: ['bangla', 'banglish', 'language', 'nlp'],
      importance: 9,
    });

    this.saveMemory('PROJECT_MEMORY', {
      key: 'ultron-architecture-vfs',
      title: 'ULTRON Virtual File System & Code Sandbox Specification',
      content: 'VFS isolates file access into /projects, /workspace, /temp, /sandbox. CodeSandbox provides isolated execution with execution timeouts.',
      category: 'ARCHITECTURE',
      tags: ['vfs', 'sandbox', 'architecture'],
      importance: 9,
    });
  }

  /**
   * Save or insert a memory item into a specific layer
   */
  public saveMemory(
    layer: MemoryLayer,
    data: {
      key: string;
      title: string;
      content: string;
      category: MemoryRecord['category'];
      tags?: string[];
      importance?: number;
      source?: string;
    }
  ): MemoryRecord {
    const existing = Array.from(this.memories.values()).find((m) => m.layer === layer && m.key === data.key);
    const now = new Date().toISOString();

    if (existing) {
      existing.title = data.title;
      existing.content = data.content;
      existing.category = data.category;
      existing.tags = data.tags || existing.tags;
      existing.importance = data.importance ?? existing.importance;
      existing.metadata.updatedAt = now;
      existing.metadata.lastAccessedAt = now;
      return existing;
    }

    const newRecord: MemoryRecord = {
      id: `mem-${layer.toLowerCase().slice(0, 4)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      layer,
      key: data.key,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
      importance: data.importance || 5,
      metadata: {
        createdAt: now,
        updatedAt: now,
        accessCount: 1,
        lastAccessedAt: now,
        source: data.source,
      },
    };

    this.memories.set(newRecord.id, newRecord);
    return newRecord;
  }

  /**
   * Search memory across layers using lexical/tag match and importance scoring
   */
  public searchMemory(query: string, options?: SearchMemoryOptions): MemoryRecord[] {
    const qLower = query.toLowerCase();
    const tokens = qLower.split(/[\s,?.!:;]+/).filter((t) => t.length > 1);

    const results: Array<{ record: MemoryRecord; score: number }> = [];

    for (const record of this.memories.values()) {
      if (options?.layer && record.layer !== options.layer) continue;
      if (options?.category && record.category !== options.category) continue;
      if (options?.minImportance && record.importance < options.minImportance) continue;
      if (options?.tags && options.tags.length > 0) {
        const hasTag = options.tags.some((t) => record.tags.includes(t.toLowerCase()));
        if (!hasTag) continue;
      }

      let score = 0;
      const titleLower = record.title.toLowerCase();
      const contentLower = record.content.toLowerCase();
      const keyLower = record.key.toLowerCase();

      if (keyLower.includes(qLower)) score += 8;
      if (titleLower.includes(qLower)) score += 6;
      if (contentLower.includes(qLower)) score += 4;

      for (const token of tokens) {
        if (titleLower.includes(token)) score += 2;
        if (contentLower.includes(token)) score += 1;
        if (record.tags.some((t) => t.toLowerCase().includes(token))) score += 2;
      }

      if (score > 0 || !query.trim()) {
        score += record.importance * 0.5;
        record.metadata.accessCount += 1;
        record.metadata.lastAccessedAt = new Date().toISOString();
        results.push({ record, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    const limit = options?.limit || 10;
    return results.slice(0, limit).map((r) => r.record);
  }

  /**
   * Update an existing memory
   */
  public updateMemory(id: string, patch: Partial<Omit<MemoryRecord, 'id' | 'metadata'>>): MemoryRecord | null {
    const mem = this.memories.get(id);
    if (!mem) return null;

    if (patch.layer) mem.layer = patch.layer;
    if (patch.key) mem.key = patch.key;
    if (patch.title) mem.title = patch.title;
    if (patch.content) mem.content = patch.content;
    if (patch.category) mem.category = patch.category;
    if (patch.tags) mem.tags = patch.tags;
    if (patch.importance !== undefined) mem.importance = patch.importance;
    mem.metadata.updatedAt = new Date().toISOString();

    return mem;
  }

  /**
   * Delete a memory item
   */
  public deleteMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  /**
   * Clear session-only memories while keeping project & long-term memories intact
   */
  public clearSessionMemory(): { clearedCount: number } {
    let cleared = 0;
    for (const [id, record] of Array.from(this.memories.entries())) {
      if (record.layer === 'SESSION_MEMORY' || record.layer === 'SHORT_TERM_MEMORY') {
        this.memories.delete(id);
        cleared++;
      }
    }
    return { clearedCount: cleared };
  }

  /**
   * Get contextual summary for planner before executing complex tasks
   */
  public getPlanningContextSummary(query: string): string {
    const relevant = this.searchMemory(query, { limit: 5 });
    if (relevant.length === 0) return '';

    return relevant
      .map((r) => `[MEMORY: ${r.layer}/${r.category}] ${r.title}: ${r.content}`)
      .join('\n');
  }

  public getAllMemories(): MemoryRecord[] {
    return Array.from(this.memories.values());
  }
}
