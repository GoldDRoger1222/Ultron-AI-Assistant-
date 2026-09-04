import { ProjectPersistentMemory, StructuredKnowledgeGraph } from '../src/types/jarvis.js';

export class ProjectMemoryEngine {
  private static instance: ProjectMemoryEngine;
  private projects: Map<string, ProjectPersistentMemory> = new Map();
  private knowledgeGraph: StructuredKnowledgeGraph = { nodes: [], edges: [] };

  private constructor() {
    this.seedPrimaryProjectMemory();
  }

  public static getInstance(): ProjectMemoryEngine {
    if (!ProjectMemoryEngine.instance) {
      ProjectMemoryEngine.instance = new ProjectMemoryEngine();
    }
    return ProjectMemoryEngine.instance;
  }

  private seedPrimaryProjectMemory() {
    const ultronProject: ProjectPersistentMemory = {
      id: 'proj-ultron-core',
      projectName: 'ULTRON Autonomous Super Brain',
      architecture: 'Full-Stack Express + React 18 + Modular Autonomous Agents + Google GenAI',
      currentVersion: '5.2.0',
      featuresCompleted: [
        'Voice Interaction & Full-Duplex Audio',
        'Real-Time Internet Intelligence & Google Search Grounding',
        'Vision & Screen Understanding Engine',
        '3D Hologram Core & Physics Visualizer',
        'Air Gesture Hand Tracking HUD',
        'Multi-AI Provider Failover Cascade',
        'Predictive Defense & Security Sentinel',
        'Goal-Oriented Agentic Task Decomposition',
        'Personal Knowledge Brain & Vector Store',
      ],
      featuresPending: [
        'Quantum Telemetry Simulation Sub-node',
        'Deep Biological Neural Interface Prototype',
      ],
      knownBugs: [
        'Minor: WebKit Safari requires user gesture unlock before Web Audio synth playback',
      ],
      configuration: {
        port: 3000,
        defaultProvider: 'gemini',
        primaryModel: 'gemini-3.7-flash',
        fallbackModel: 'gemini-3.1-pro-preview',
        localModel: 'onnx-web-local',
        permissionLevel: 2,
      },
      importantDecisions: [
        {
          decision: 'Implement modular micro-engine backend instead of single monolith',
          rationale: 'Isolates runtime failures so a crashed plugin or API rate-limit cannot crash the rest of ULTRON.',
          date: '2026-08-20',
        },
        {
          decision: 'Enforce Level 3 confirmation for file deletions & sensitive external calls',
          rationale: 'Prevents accidental data loss or unauthorized modifications during autonomous execution.',
          date: '2026-08-25',
        },
      ],
      todos: [
        { id: 'td-1', task: 'Continuous self-testing on tool connector hooks', completed: true, priority: 'HIGH' },
        { id: 'td-2', task: 'Expand knowledge graph entity relations for microservices', completed: false, priority: 'NORMAL' },
      ],
      dependencies: [
        { name: '@google/genai', version: '^0.1.2', status: 'ACTIVE' },
        { name: 'express', version: '^4.19.2', status: 'ACTIVE' },
        { name: 'three', version: '^0.160.0', status: 'ACTIVE' },
        { name: 'lucide-react', version: '^0.344.0', status: 'ACTIVE' },
        { name: 'motion', version: '^11.0.0', status: 'ACTIVE' },
      ],
      updatedAt: new Date().toISOString(),
    };

    this.projects.set(ultronProject.id, ultronProject);

    // Seed Knowledge Graph
    this.knowledgeGraph = {
      nodes: [
        { id: 'proj-1', label: 'ULTRON OS', type: 'PROJECT' },
        { id: 'mod-brain', label: 'Agentic Cognitive Brain', type: 'MODULE' },
        { id: 'mod-verifier', label: 'Self-Verification Engine', type: 'MODULE' },
        { id: 'mod-computer', label: 'Authorized Computer Agent', type: 'MODULE' },
        { id: 'mod-screen', label: 'Screen Vision', type: 'MODULE' },
        { id: 'mod-knowledge', label: 'Personal Knowledge Brain', type: 'MODULE' },
        { id: 'mod-security', label: 'Security Sentinel', type: 'MODULE' },
        { id: 'lib-genai', label: '@google/genai SDK', type: 'LIBRARY' },
        { id: 'feat-failover', label: 'Zero-Latency Failover', type: 'FEATURE' },
        { id: 'feat-internet', label: 'Internet Search Grounding', type: 'FEATURE' },
      ],
      edges: [
        { id: 'e-1', source: 'proj-1', target: 'mod-brain', relation: 'CONTAINS' },
        { id: 'e-2', source: 'proj-1', target: 'mod-verifier', relation: 'CONTAINS' },
        { id: 'e-3', source: 'proj-1', target: 'mod-computer', relation: 'CONTAINS' },
        { id: 'e-4', source: 'proj-1', target: 'mod-screen', relation: 'CONTAINS' },
        { id: 'e-5', source: 'proj-1', target: 'mod-knowledge', relation: 'CONTAINS' },
        { id: 'e-6', source: 'proj-1', target: 'mod-security', relation: 'CONTAINS' },
        { id: 'e-7', source: 'mod-brain', target: 'lib-genai', relation: 'DEPENDS_ON' },
        { id: 'e-8', source: 'mod-brain', target: 'feat-failover', relation: 'PROVIDES' },
        { id: 'e-9', source: 'mod-brain', target: 'feat-internet', relation: 'PROVIDES' },
        { id: 'e-10', source: 'mod-brain', target: 'mod-verifier', relation: 'COMMUNICATES_WITH' },
      ],
    };
  }

  public getProject(id = 'proj-ultron-core'): ProjectPersistentMemory | undefined {
    return this.projects.get(id);
  }

  public getAllProjects(): ProjectPersistentMemory[] {
    return Array.from(this.projects.values());
  }

  public updateProject(id: string, partial: Partial<ProjectPersistentMemory>): ProjectPersistentMemory | undefined {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  public getKnowledgeGraph(): StructuredKnowledgeGraph {
    return this.knowledgeGraph;
  }

  public addGraphNode(node: StructuredKnowledgeGraph['nodes'][0]): void {
    if (!this.knowledgeGraph.nodes.some((n) => n.id === node.id)) {
      this.knowledgeGraph.nodes.push(node);
    }
  }

  public addGraphEdge(edge: StructuredKnowledgeGraph['edges'][0]): void {
    if (!this.knowledgeGraph.edges.some((e) => e.id === edge.id)) {
      this.knowledgeGraph.edges.push(edge);
    }
  }
}
