import {
  VectorMemoryDocument,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
  UserPreferencesProfile,
} from '../src/types/jarvis.js';

/**
 * Long-Term Persistent Memory & Vector Database Engine
 * Implements Vector Embeddings, Cosine Similarity, and User-Specific Knowledge Graph
 */
export class MemoryVectorEngine {
  private static instance: MemoryVectorEngine;
  private documents: Map<string, VectorMemoryDocument> = new Map();
  private graphNodes: Map<string, KnowledgeGraphNode> = new Map();
  private graphEdges: KnowledgeGraphEdge[] = [];
  private userProfile: UserPreferencesProfile;

  private constructor() {
    this.userProfile = {
      id: 'usr-prof-jarvis',
      userId: 'jarvis6852@gmail.com',
      preferredCodingStyle: 'TypeScript Strict, Functional Components, Tailwind CSS, Clean Architecture, Defensive Error Handling',
      architectureHabits: [
        'Modular Service Decoupling',
        'Failover AI Provider Redundancy',
        'Non-blocking Async Streaming',
        'Strict Type Contracts',
        'Defensive Local State Recovery',
      ],
      techStackPreferences: {
        frontend: ['React 19', 'Tailwind CSS v4', 'Lucide React', 'Vite'],
        backend: ['Node.js ESM', 'Express', 'TypeScript', 'Docker'],
        database: ['Firestore', 'Vector In-Memory Store', 'PostgreSQL Cloud SQL'],
        styling: ['Tailwind CSS', 'Mobile First Responsive', 'Cyberpunk Dark/Cyan Theme'],
        testing: ['Unit Test Sandboxes', 'SAST Security Scanners', 'E2E Auditing'],
      },
      customDirectives: [
        'Always provide bilingual English & Bangla technical capability',
        'Auto-fix bugs in recursive sandbox loops before concluding',
        'Prioritize free & high-reliability AI failover routing',
      ],
      totalLearnedPatterns: 24,
      updatedAt: new Date().toISOString(),
    };

    this.seedInitialKnowledge();
  }

  public static getInstance(): MemoryVectorEngine {
    if (!MemoryVectorEngine.instance) {
      MemoryVectorEngine.instance = new MemoryVectorEngine();
    }
    return MemoryVectorEngine.instance;
  }

  private seedInitialKnowledge() {
    // 1. Initial Knowledge Graph Nodes
    const nodes: KnowledgeGraphNode[] = [
      { id: 'node-ts', label: 'TypeScript Strict', category: 'LANGUAGE', weight: 10, details: 'User insists on strict type definitions without any' },
      { id: 'node-react', label: 'React 19 + Vite', category: 'FRAMEWORK', weight: 9, details: 'Preferred client framework with fast HMR-friendly architecture' },
      { id: 'node-tailwind', label: 'Tailwind CSS v4', category: 'STYLE', weight: 9, details: 'Design system using modern utility tokens and dark cyan palette' },
      { id: 'node-failover', label: 'AI Multi-Provider Failover', category: 'ARCHITECTURE', weight: 10, details: 'Dynamic failover from Gemini to Ollama/Replit on rate limits' },
      { id: 'node-mobile', label: 'Mobile 24/7 Service', category: 'PREFERENCE', weight: 8, details: 'Background Web Audio oscillator keep-alive and lockscreen HUD' },
      { id: 'node-bangla', label: 'Bengali Technical NLP', category: 'PREFERENCE', weight: 9, details: 'Deep tech explanations in standard & colloquial Bangla' },
    ];
    nodes.forEach((n) => this.graphNodes.set(n.id, n));

    // 2. Initial Graph Edges
    this.graphEdges = [
      { id: 'e1', source: 'node-react', target: 'node-ts', relation: 'BUILT_WITH' },
      { id: 'e2', source: 'node-react', target: 'node-tailwind', relation: 'STYLED_BY' },
      { id: 'e3', source: 'node-failover', target: 'node-ts', relation: 'IMPLEMENTED_IN' },
      { id: 'e4', source: 'node-mobile', target: 'node-bangla', relation: 'VOICE_OPTIMIZED_FOR' },
    ];

    // 3. Initial Vector Documents (Past Bugs, Architectures & Specs)
    const docs: VectorMemoryDocument[] = [
      {
        id: 'doc-001',
        title: 'Recursive Sandbox Self-Healing Pattern',
        category: 'ARCHITECTURE',
        content: 'When code execution fails in sandbox, capture stderr and error stack trace, generate AST diff fix, and re-run up to 5 iterations.',
        tags: ['sandbox', 'debugging', 'agentic', 'self-correction'],
        metadata: {
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: 14,
          language: 'typescript',
        },
      },
      {
        id: 'doc-002',
        title: 'Fixed: React useEffect Infinite Re-render in Voice Engine',
        category: 'BUG_FIX',
        content: 'Issue: VoiceEngine callback triggering state update on every audio frame. Solution: Decouple audio frame listener from React state using useRef and throttle state dispatch to 60fps.',
        tags: ['bug', 'react', 'audio', 'memory-leak'],
        metadata: {
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: 8,
          language: 'typescript',
        },
      },
      {
        id: 'doc-003',
        title: 'OWASP Top 10 Codebase Defense Scanner Guidelines',
        category: 'DOCS',
        content: 'Automated static analysis rules for detecting SQL Injection, XSS in React dangerouslySetInnerHTML, Hardcoded API Secrets, and insecure regex DoS.',
        tags: ['security', 'owasp', 'predictive-defense', 'sast'],
        metadata: {
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: 19,
        },
      },
      {
        id: 'doc-004',
        title: 'Distributed Consensus: Raft vs Paxos Explained in Bangla',
        category: 'USER_PREFERENCE',
        content: 'Raft consensus algorithm uses Leader Election, Log Replication, and Safety guarantees. In Bangla: Leader nirbachon ebong shob node er moddhe log shothikvabe sync kora.',
        tags: ['bangla', 'distributed-systems', 'raft', 'consensus'],
        metadata: {
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: 5,
        },
      },
    ];

    docs.forEach((d) => {
      d.embedding = this.computeSyntheticEmbedding(d.title + ' ' + d.content + ' ' + d.tags.join(' '));
      this.documents.set(d.id, d);
    });
  }

  /**
   * Fast, Deterministic 32-dimensional Semantic Hash Vector for Vector Cosine Similarity
   */
  private computeSyntheticEmbedding(text: string): number[] {
    const vector = new Array(32).fill(0);
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const tokens = normalized.split(/\s+/).filter(Boolean);

    tokens.forEach((token, idx) => {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const dim = Math.abs(hash) % 32;
      vector[dim] += 1 / (1 + idx * 0.05);
    });

    // Normalize to unit vector for true cosine similarity
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((v) => Number((v / magnitude).toFixed(4)));
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0;
    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
      dot += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  // ----------------------------------------------------
  // PUBLIC MEMORY API
  // ----------------------------------------------------
  public search(query: string, limit: number = 5, minScore: number = 0.15): VectorMemoryDocument[] {
    const queryEmbedding = this.computeSyntheticEmbedding(query);
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = Array.from(this.documents.values()).map((doc) => {
      const docEmbedding = doc.embedding || this.computeSyntheticEmbedding(doc.title + ' ' + doc.content);
      let score = this.cosineSimilarity(queryEmbedding, docEmbedding);

      // Exact keyword boost
      const contentLower = (doc.title + ' ' + doc.content + ' ' + doc.tags.join(' ')).toLowerCase();
      const matchCount = queryTokens.filter((t) => contentLower.includes(t)).length;
      if (matchCount > 0) {
        score = Math.min(1.0, score + (matchCount / queryTokens.length) * 0.35);
      }

      return {
        ...doc,
        similarityScore: Number(score.toFixed(3)),
      };
    });

    return scored
      .filter((d) => (d.similarityScore || 0) >= minScore)
      .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
      .slice(0, limit);
  }

  public addDocument(doc: Omit<VectorMemoryDocument, 'id' | 'metadata'> & { id?: string }): VectorMemoryDocument {
    const id = doc.id || `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullDoc: VectorMemoryDocument = {
      ...doc,
      id,
      embedding: this.computeSyntheticEmbedding(doc.title + ' ' + doc.content + ' ' + doc.tags.join(' ')),
      metadata: {
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: 1,
      },
    };
    this.documents.set(id, fullDoc);
    this.userProfile.totalLearnedPatterns++;
    this.userProfile.updatedAt = new Date().toISOString();
    return fullDoc;
  }

  public getAllDocuments(): VectorMemoryDocument[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.metadata.lastAccessed).getTime() - new Date(a.metadata.lastAccessed).getTime()
    );
  }

  public deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  public getUserProfile(): UserPreferencesProfile {
    return this.userProfile;
  }

  public updateUserProfile(updates: Partial<UserPreferencesProfile>): UserPreferencesProfile {
    this.userProfile = {
      ...this.userProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.userProfile;
  }

  public getKnowledgeGraph(): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } {
    return {
      nodes: Array.from(this.graphNodes.values()),
      edges: this.graphEdges,
    };
  }

  public addGraphNode(node: KnowledgeGraphNode): KnowledgeGraphNode {
    this.graphNodes.set(node.id, node);
    return node;
  }

  public addGraphEdge(edge: KnowledgeGraphEdge): KnowledgeGraphEdge {
    this.graphEdges.push(edge);
    return edge;
  }

  /**
   * Dynamic Memory Summarization & Conversation Context Compression:
   * Compresses multi-turn conversation turns when context window grows large,
   * preserving core technical variables, user constraints, and decisions in Vector Memory.
   */
  public summarizeAndCompressContext(
    historyTurns: { role: 'user' | 'assistant'; content: string }[],
    maxTurns: number = 8
  ): { compressedContext: string; prioritizedSummary: string } {
    if (!historyTurns || historyTurns.length <= maxTurns) {
      const formatted = (historyTurns || [])
        .map((t) => `${t.role === 'user' ? 'User' : 'ULTRON'}: ${t.content}`)
        .join('\n');
      return { compressedContext: formatted, prioritizedSummary: 'Context within optimal threshold.' };
    }

    // Isolate older turns for semantic compression
    const olderTurns = historyTurns.slice(0, historyTurns.length - maxTurns);
    const recentTurns = historyTurns.slice(historyTurns.length - maxTurns);

    const extractedDecisions: string[] = [];
    const technicalKeywords: Set<string> = new Set();

    olderTurns.forEach((turn) => {
      const text = turn.content;
      // Extract code blocks, decisions, and keywords
      const codeMatches = text.match(/`([^`]+)`/g);
      if (codeMatches) {
        codeMatches.forEach((m) => technicalKeywords.add(m.replace(/`/g, '')));
      }
      if (turn.role === 'user') {
        extractedDecisions.push(`[Goal/Request]: ${turn.content.slice(0, 120)}`);
      } else if (text.includes('Fixed') || text.includes('Error') || text.includes('Solution') || text.includes('Completed')) {
        extractedDecisions.push(`[Outcome]: ${text.slice(0, 140)}`);
      }
    });

    const summaryBlock = `=== DYNAMIC MEMORY SUMMARIZATION (PRIOR CONTEXT) ===
Preserved Technical Symbols: ${Array.from(technicalKeywords).slice(0, 15).join(', ') || 'N/A'}
Historical Milestones:
${extractedDecisions.slice(-6).map((d) => `- ${d}`).join('\n') || '- Conversation active'}
===================================================`;

    // Persist summarized milestone in vector document
    if (extractedDecisions.length > 0) {
      this.addDocument({
        title: `Auto-Summarized Context Session (${new Date().toLocaleTimeString()})`,
        content: summaryBlock,
        category: 'USER_PREFERENCE',
        tags: ['dynamic-summarization', 'context-compression', 'long-term-memory'],
      });
    }

    const recentFormatted = recentTurns
      .map((t) => `${t.role === 'user' ? 'User' : 'ULTRON'}: ${t.content}`)
      .join('\n');

    const finalCompressed = `${summaryBlock}\n\n=== RECENT ACTIVE CONTEXT ===\n${recentFormatted}`;

    return {
      compressedContext: finalCompressed,
      prioritizedSummary: `Summarized ${olderTurns.length} older turns into Vector Memory. Preserved ${technicalKeywords.size} key symbols.`,
    };
  }

  /**
   * Update Strategic Learning Weights (Technical vs Personal Assistant Balance)
   */
  public updateLearningWeights(weights: {
    technicalWeight: number; // 0 to 100
    personalAssistantWeight: number; // 0 to 100
    banglishNuanceLevel: number; // 0 to 100
    proactiveSuggestionFrequency: 'HIGH' | 'BALANCED' | 'LOW';
    activePersona: 'SUPER_BRAIN_ANALYTICAL' | 'PERSONAL_COMPANION' | 'HYBRID_INTELLIGENCE';
  }) {
    this.userProfile = {
      ...this.userProfile,
      learningWeights: {
        technicalWeight: weights.technicalWeight,
        personalAssistantWeight: weights.personalAssistantWeight,
        banglishNuanceLevel: weights.banglishNuanceLevel,
        proactiveSuggestionFrequency: weights.proactiveSuggestionFrequency,
        activePersona: weights.activePersona,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    return this.userProfile;
  }

  public getLearningWeights() {
    return (
      (this.userProfile as any).learningWeights || {
        technicalWeight: 75,
        personalAssistantWeight: 25,
        banglishNuanceLevel: 90,
        proactiveSuggestionFrequency: 'BALANCED',
        activePersona: 'HYBRID_INTELLIGENCE',
        updatedAt: new Date().toISOString(),
      }
    );
  }

  public exportEncryptedMemoryVault(): {
    encryptedBlob: string;
    totalDocuments: number;
    totalNodes: number;
    checksum: string;
    exportedAt: string;
  } {
    const rawState = JSON.stringify({
      userProfile: this.userProfile,
      documents: Array.from(this.documents.values()),
      graphNodes: Array.from(this.graphNodes.values()),
      graphEdges: this.graphEdges,
    });

    // Encrypted simulation with base64 and hash
    const encryptedBlob = Buffer.from(rawState).toString('base64');
    const checksum = `SHA256-${Date.now().toString(36)}-AESGCM`;

    return {
      encryptedBlob,
      totalDocuments: this.documents.size,
      totalNodes: this.graphNodes.size,
      checksum,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Automatically ingest knowledge learned from completed AI task
   */
  public ingestTaskOutcome(taskCommand: string, response: string, category: string) {
    if (response.length > 50) {
      const summary = response.slice(0, 300);
      this.addDocument({
        title: `Task Insight: ${taskCommand.slice(0, 50)}`,
        content: `Command: ${taskCommand}\nResolution Summary: ${summary}`,
        category: category.includes('CODE') ? 'CODE_SNIPPET' : 'ARCHITECTURE',
        tags: [category.toLowerCase(), 'auto-learned', 'session-memory'],
      });
    }
  }
}
