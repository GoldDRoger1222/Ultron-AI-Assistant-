import { UltronMission, MissionSubtask, MissionStatus, PriorityLevel } from '../src/types/jarvis.js';
import { generateAiContent } from './gemini.js';

export class MissionSystemEngine {
  private static instance: MissionSystemEngine;
  private missions: UltronMission[] = [];

  private constructor() {
    this.seedDefaultMissions();
  }

  public static getInstance(): MissionSystemEngine {
    if (!MissionSystemEngine.instance) {
      MissionSystemEngine.instance = new MissionSystemEngine();
    }
    return MissionSystemEngine.instance;
  }

  private seedDefaultMissions() {
    this.missions = [
      {
        id: 'mission-ecommerce-01',
        title: 'Full-Stack Distributed Cloud E-Commerce Engine',
        goal: 'Architect and deploy an enterprise-grade online store with real-time inventory, Stripe payments, and AI recommendations.',
        category: 'ENGINEERING',
        status: 'RUNNING',
        priority: 'CRITICAL',
        progressPercent: 68,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        startedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        subtasks: [
          {
            id: 'sub-01',
            title: 'Analyze Business & Domain Requirements',
            description: 'Decompose user personas, checkout flow, product catalog schemas.',
            assignedAgent: 'ArchitectAgent',
            status: 'COMPLETED',
            priority: 'HIGH',
            dependencies: [],
            output: 'Schema specs drafted: Product, Order, User, Inventory with ACID guarantees.',
            retryCount: 0,
            estimatedMinutes: 20,
          },
          {
            id: 'sub-02',
            title: 'Design Scalable Microservices Architecture & API Contracts',
            description: 'REST and GraphQL interfaces with OpenAPI 3.0 specifications.',
            assignedAgent: 'CoderAgent',
            status: 'COMPLETED',
            priority: 'HIGH',
            dependencies: ['sub-01'],
            output: 'Endpoints created for /api/products, /api/cart, /api/checkout, /api/orders.',
            retryCount: 0,
            estimatedMinutes: 45,
          },
          {
            id: 'sub-03',
            title: 'Implement Resilient Payment & Webhook Gateway',
            description: 'Stripe integration with idempotent webhook processing and audit logs.',
            assignedAgent: 'SecuritySentinel',
            status: 'RUNNING',
            priority: 'CRITICAL',
            dependencies: ['sub-02'],
            output: 'Drafted webhook verification logic with HMAC-SHA256 signature verification.',
            retryCount: 0,
            estimatedMinutes: 60,
          },
          {
            id: 'sub-04',
            title: 'QA Unit, Integration & Penetration Testing',
            description: 'Automated test suite covering concurrent checkouts and card validation.',
            assignedAgent: 'QAAgent',
            status: 'PLANNED',
            priority: 'HIGH',
            dependencies: ['sub-03'],
            retryCount: 0,
            estimatedMinutes: 30,
          },
          {
            id: 'sub-05',
            title: 'Production Zero-Downtime Deployment & Health Verification',
            description: 'Cloud container rollout with automated canary health checks.',
            assignedAgent: 'DevOpsAgent',
            status: 'PLANNED',
            priority: 'MEDIUM',
            dependencies: ['sub-04'],
            retryCount: 0,
            estimatedMinutes: 25,
          },
        ],
        verificationReport: 'Phase 1 & 2 verified with 100% test coverage. Payment gateway verification in progress.',
      },
      {
        id: 'mission-cyberdefense-02',
        title: 'Zero-Trust Predictive Defense & Autonomous Threat Shield',
        goal: 'Audit system ingress, enforce cryptographic key rotation, and block unauthorized device attempts.',
        category: 'AUTOMATION',
        status: 'COMPLETED',
        priority: 'HIGH',
        progressPercent: 100,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        startedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        subtasks: [
          {
            id: 'sec-01',
            title: 'Ingress Port & Token Security Scan',
            assignedAgent: 'SecuritySentinel',
            status: 'COMPLETED',
            priority: 'HIGH',
            dependencies: [],
            output: 'All ports verified behind reverse proxy. No exposed raw secrets.',
            retryCount: 0,
          },
          {
            id: 'sec-02',
            title: 'Verify Vault Key Rotation Protocols',
            assignedAgent: 'SecuritySentinel',
            status: 'COMPLETED',
            priority: 'MEDIUM',
            dependencies: ['sec-01'],
            output: 'PBKDF2 key derivation and AES-GCM encryption verified.',
            retryCount: 0,
          },
        ],
        outcomeSummary: 'Zero-Trust shield operational. 0 vulnerabilities detected.',
        verificationReport: 'Passed ISO/IEC 27001 compliance standards checklist.',
      },
    ];
  }

  public getMissions(): UltronMission[] {
    return this.missions;
  }

  public getMissionById(id: string): UltronMission | undefined {
    return this.missions.find((m) => m.id === id);
  }

  public async createMissionFromGoal(goal: string, category: UltronMission['category'] = 'ENGINEERING', priority: PriorityLevel = 'HIGH'): Promise<UltronMission> {
    const prompt = `You are ULTRON Goal & Mission Manager. Decompose the following high-level objective into an actionable, prioritized engineering mission plan with 4-6 sequential subtasks.
Goal: "${goal}"
Category: ${category}
Priority: ${priority}

Return ONLY valid JSON matching this exact structure:
{
  "title": "Short descriptive mission title",
  "category": "${category}",
  "priority": "${priority}",
  "subtasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "assignedAgent": "ArchitectAgent | CoderAgent | QAAgent | ResearchAgent | SecuritySentinel",
      "priority": "CRITICAL | HIGH | MEDIUM | LOW",
      "dependencies": [],
      "estimatedMinutes": 30
    }
  ]
}`;

    let subtasks: MissionSubtask[] = [];
    let title = goal.slice(0, 50);

    try {
      const response = await generateAiContent({
        prompt,
        systemInstruction: 'You are ULTRON Goal Decomposition SuperBrain. Respond strictly in valid JSON.',
        temperature: 0.2,
      });

      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      title = parsed.title || title;

      if (Array.isArray(parsed.subtasks)) {
        subtasks = parsed.subtasks.map((st: any, idx: number) => ({
          id: `st-${Date.now()}-${idx + 1}`,
          title: st.title || `Subtask ${idx + 1}`,
          description: st.description || '',
          assignedAgent: st.assignedAgent || 'CoderAgent',
          status: idx === 0 ? 'RUNNING' : 'PLANNED',
          priority: st.priority || 'HIGH',
          dependencies: idx > 0 ? [`st-${Date.now()}-${idx}`] : [],
          retryCount: 0,
          estimatedMinutes: st.estimatedMinutes || 30,
        }));
      }
    } catch {
      // Fallback decomposition
      subtasks = [
        {
          id: `st-${Date.now()}-1`,
          title: 'Understand & Analyze Requirements',
          description: `Analyze objective: ${goal}`,
          assignedAgent: 'ArchitectAgent',
          status: 'RUNNING',
          priority: 'HIGH',
          dependencies: [],
          retryCount: 0,
          estimatedMinutes: 15,
        },
        {
          id: `st-${Date.now()}-2`,
          title: 'Execute Core Architecture & Implementation',
          description: 'Develop required components and services.',
          assignedAgent: 'CoderAgent',
          status: 'PLANNED',
          priority: 'HIGH',
          dependencies: [`st-${Date.now()}-1`],
          retryCount: 0,
          estimatedMinutes: 45,
        },
        {
          id: `st-${Date.now()}-3`,
          title: 'Verification, Testing & Output Validation',
          description: 'Run QA test suite and verify completion criteria.',
          assignedAgent: 'QAAgent',
          status: 'PLANNED',
          priority: 'MEDIUM',
          dependencies: [`st-${Date.now()}-2`],
          retryCount: 0,
          estimatedMinutes: 20,
        },
      ];
    }

    const newMission: UltronMission = {
      id: `mission-${Date.now()}`,
      goal,
      title,
      category,
      status: 'RUNNING',
      priority,
      progressPercent: 10,
      subtasks,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    };

    this.missions.unshift(newMission);
    return newMission;
  }

  public updateMissionStatus(id: string, status: MissionStatus): UltronMission | null {
    const mission = this.missions.find((m) => m.id === id);
    if (!mission) return null;
    mission.status = status;
    if (status === 'COMPLETED') {
      mission.progressPercent = 100;
      mission.completedAt = new Date().toISOString();
      mission.subtasks.forEach((st) => (st.status = 'COMPLETED'));
      mission.outcomeSummary = `Mission "${mission.title}" successfully completed and verified.`;
    } else if (status === 'CANCELLED' || status === 'FAILED') {
      mission.subtasks.forEach((st) => {
        if (st.status === 'RUNNING' || st.status === 'PLANNED') {
          st.status = status;
        }
      });
    }
    return mission;
  }

  public updateSubtaskStatus(missionId: string, subtaskId: string, status: MissionStatus, output?: string): UltronMission | null {
    const mission = this.missions.find((m) => m.id === missionId);
    if (!mission) return null;
    const subtask = mission.subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return null;

    subtask.status = status;
    if (output) subtask.output = output;

    // Recalculate progress
    const completed = mission.subtasks.filter((st) => st.status === 'COMPLETED').length;
    mission.progressPercent = Math.round((completed / mission.subtasks.length) * 100);

    if (mission.progressPercent === 100) {
      mission.status = 'COMPLETED';
      mission.completedAt = new Date().toISOString();
      mission.outcomeSummary = `All ${mission.subtasks.length} subtasks completed and verified.`;
    }

    return mission;
  }

  public deleteMission(id: string): boolean {
    const initLen = this.missions.length;
    this.missions = this.missions.filter((m) => m.id !== id);
    return this.missions.length < initLen;
  }
}
