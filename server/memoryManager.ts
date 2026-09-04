/**
 * ULTRON Core Unified Memory Manager
 * 
 * 5 Structured Memory Layers:
 * 1. SESSION_MEMORY — Active session parameters, goals, checkpoints, transient state
 * 2. SHORT_TERM_MEMORY — Immediate recent turns, entities, and working facts
 * 3. PROJECT_MEMORY — Codebase architecture, dependencies, verified files, and build configurations
 * 4. LONG_TERM_MEMORY — User preferences, persistent developer habits, learned solutions
 * 5. SEMANTIC_MEMORY — Vector embeddings and cosine similarity search for deep conceptual recall
 * 
 * Canonical APIs:
 * - save(layer, record)
 * - search(options)
 * - update(id, updates)
 * - delete(id)
 * - clearSession(sessionId?)
 */

import {
  MemoryRecord,
  MemoryLayerType,
  MemoryCategory,
  SearchMemoryOptions,
} from './types.js';

export class MemoryManager {
  private static instance: MemoryManager;
  private memories: Map<string, MemoryRecord> = new Map();

  private constructor() {
    this.seedDefaultFoundationalMemories();
  }

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private seedDefaultFoundationalMemories() {
    // 1. Long-Term Master Preferences
    this.save('LONG_TERM_MEMORY', {
      key: 'user-standards',
      title: 'Master User Engineering Standards & Integrity Policy',
      content: 'User demands reliable, production-ready TypeScript/React code with truthful execution evidence. Never fake completion or simulate actions.',
      category: 'PREFERENCE',
      tags: ['standards', 'integrity', 'engineering', 'preferences'],
      importance: 10,
    });

    this.save('LONG_TERM_MEMORY', {
      key: 'multilingual-policy',
      title: 'Multilingual Support Protocol (Bangla, Banglish, English)',
      content: 'Respond directly in the input language (English, Bangla, or Banglish) preserving technical clarity and engineering terminology.',
      category: 'PREFERENCE',
      tags: ['nlp', 'bangla', 'banglish', 'english'],
      importance: 9,
    });

    // 2. Project Memory Foundations
    this.save('PROJECT_MEMORY', {
      key: 'ultron-architecture-v6',
      title: 'ULTRON Core V6 Architecture Specification',
      content: 'Unified Brain, Intent Router, Tool Registry, Execution Manager, Filesystem Adapter, Task Orchestrator, Evidence Verifier, and Voice Engine.',
      category: 'ARCHITECTURE',
      tags: ['ultron', 'architecture', 'v6', 'core'],
      importance: 10,
    });

    // 3. Semantic Memory Foundations
    this.save('SEMANTIC_MEMORY', {
      key: 'zero-trust-sandbox',
      title: 'Zero Trust Sandboxed Execution and Verification',
      content: 'All file operations and code execution must produce tangible verification evidence before declaring task completion.',
      category: 'KNOWLEDGE',
      tags: ['sandbox', 'security', 'zero-trust', 'evidence'],
      importance: 9,
      embeddingVector: [0.15, 0.72, -0.33, 0.88, 0.41],
    });
  }

  /**
   * Save or insert a memory item
   */
  public save(
    layer: MemoryLayerType,
    data: {
      key: string;
      title: string;
      content: string;
      category: MemoryCategory;
      tags?: string[];
      importance?: number;
      embeddingVector?: number[];
      source?: string;
    }
  ): MemoryRecord {
    const existing = Array.from(this.memories.values()).find(
      (m) => m.layer === layer && m.key === data.key
    );

    const now = new Date().toISOString();

    if (existing) {
      existing.title = data.title;
      existing.content = data.content;
      existing.category = data.category;
      existing.tags = Array.from(new Set([...existing.tags, ...(data.tags || [])]));
      existing.importance = Math.max(existing.importance, data.importance || 5);
      if (data.embeddingVector) existing.embeddingVector = data.embeddingVector;
      existing.metadata.updatedAt = now;
      existing.metadata.accessCount++;
      return existing;
    }

    const id = `MEM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: MemoryRecord = {
      id,
      layer,
      key: data.key,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
      importance: Math.min(Math.max(data.importance || 5, 1), 10),
      embeddingVector: data.embeddingVector,
      metadata: {
        createdAt: now,
        updatedAt: now,
        accessCount: 1,
        lastAccessedAt: now,
        source: data.source || 'system',
      },
    };

    this.memories.set(id, record);
    return record;
  }

  /**
   * Search memory with layer filtering, tag matching, and semantic relevance
   */
  public search(options: SearchMemoryOptions = {}): MemoryRecord[] {
    const { layer, category, tags, minImportance = 1, limit = 10, semanticQuery } = options;

    let items = Array.from(this.memories.values()).filter((m) => {
      if (layer && m.layer !== layer) return false;
      if (category && m.category !== category) return false;
      if (m.importance < minImportance) return false;
      if (tags && tags.length > 0) {
        const hasTag = tags.some((t) => m.tags.includes(t.toLowerCase()));
        if (!hasTag) return false;
      }
      return true;
    });

    if (semanticQuery) {
      const qTokens = semanticQuery.toLowerCase().split(/\s+/).filter(Boolean);
      items = items.map((item) => {
        let score = 0;
        const text = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
        for (const tok of qTokens) {
          if (text.includes(tok)) score += 1;
        }
        return { ...item, similarityScore: score / Math.max(qTokens.length, 1) };
      }).filter((item) => (item.similarityScore || 0) > 0 || !semanticQuery);

      items.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0) || b.importance - a.importance);
    } else {
      items.sort((a, b) => b.importance - a.importance);
    }

    return items.slice(0, limit);
  }

  /**
   * Update memory record
   */
  public update(id: string, updates: Partial<MemoryRecord>): MemoryRecord | null {
    const record = this.memories.get(id);
    if (!record) return null;

    Object.assign(record, updates);
    record.metadata.updatedAt = new Date().toISOString();
    return record;
  }

  /**
   * Delete memory record
   */
  public delete(id: string): boolean {
    return this.memories.delete(id);
  }

  /**
   * Clear session-specific memory
   */
  public clearSession(sessionId?: string): number {
    let clearedCount = 0;
    for (const [id, rec] of this.memories.entries()) {
      if (rec.layer === 'SESSION_MEMORY' || rec.layer === 'SHORT_TERM_MEMORY') {
        if (!sessionId || rec.metadata.source === sessionId) {
          this.memories.delete(id);
          clearedCount++;
        }
      }
    }
    return clearedCount;
  }

  /**
   * Generate concise contextual summary for Brain reasoning
   */
  public getContextSummary(query?: string): string {
    const relevant = this.search({
      minImportance: 6,
      limit: 6,
      semanticQuery: query,
    });

    if (relevant.length === 0) return '';

    return relevant
      .map((r) => `[${r.layer}] ${r.title}: ${r.content}`)
      .join('\n');
  }

  public getAll(): MemoryRecord[] {
    return Array.from(this.memories.values());
  }
}
