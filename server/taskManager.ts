import {
  JarvisTask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TaskStep,
  TaskCheckpoint,
  TaskContextPackage,
  ProviderId,
  VerificationResult,
} from '../src/types/jarvis.js';
import { ProviderRouter } from './providers.js';

export class TaskManager {
  private static instance: TaskManager;
  private tasks: Map<string, JarvisTask> = new Map();
  private taskCounter = 1;

  private constructor() {
    this.seedInitialSampleTasks();
  }

  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  private generateTaskId(): string {
    const pad = String(this.taskCounter++).padStart(6, '0');
    return `TASK-2026-${pad}`;
  }

  private seedInitialSampleTasks() {
    const sample1: JarvisTask = {
      id: 'TASK-2026-000001',
      originalCommand: 'Build responsive Restaurant website with online menu, reservation system and gallery',
      category: 'WEB_DEVELOPMENT',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressPercent: 100,
      currentProvider: 'gemini',
      currentModel: 'gemini-3.7-flash',
      previousProviders: ['replit'],
      providerHistory: [
        {
          provider: 'replit',
          model: 'replit-agent-v2-coder',
          role: 'Initial Scaffold',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'LIMIT_REACHED',
          reason: 'Daily token rate limit reached on Replit Agent',
        },
        {
          provider: 'gemini',
          model: 'gemini-3.7-flash',
          role: 'Failover & Completion',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          status: 'SUCCESS',
          latencyMs: 240,
        },
      ],
      steps: [
        { id: 's1', name: 'Scan assets and restaurant info', status: 'COMPLETED', output: 'Identified 4 menu categories and 6 high-res photos' },
        { id: 's2', name: 'Generate UI structure & Tailwind layout', status: 'COMPLETED', output: 'Created Header, Hero, Interactive Menu, Booking modal' },
        { id: 's3', name: 'Implement Responsive Navigation & Mobile Drawer', status: 'COMPLETED', output: 'Touch-friendly mobile menu verified' },
        { id: 's4', name: 'Verify Build & Self-Test', status: 'COMPLETED', output: 'Zero syntax errors, 100% test pass' },
      ],
      currentStepIndex: 3,
      checkpoints: [
        {
          id: 'CP-001',
          stepIndex: 1,
          summary: 'Scaffold and asset index completed before failover',
          timestamp: new Date(Date.now() - 3550000).toISOString(),
          completedStepIds: ['s1'],
          changedFiles: ['/restaurant/index.html', '/restaurant/menu.json'],
          provider: 'replit',
          stateSnapshot: { phase: 'scaffold_done' },
        },
        {
          id: 'CP-002',
          stepIndex: 3,
          summary: 'Final build and responsive validation completed by Gemini failover',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          completedStepIds: ['s1', 's2', 's3', 's4'],
          changedFiles: ['/restaurant/App.tsx', '/restaurant/Menu.tsx', '/restaurant/Reservation.tsx'],
          provider: 'gemini',
          stateSnapshot: { phase: 'all_verified' },
        },
      ],
      changedFiles: ['/restaurant/App.tsx', '/restaurant/Menu.tsx', '/restaurant/Reservation.tsx'],
      importantContext: 'Theme: Dark Obsidian with Gold accent. Includes dynamic Cart & Table booking.',
      verification: {
        verified: true,
        checks: [
          { name: 'TypeScript Compilation', passed: true, details: 'Clean compile, 0 diagnostics errors' },
          { name: 'Responsive Viewport Test', passed: true, details: 'Tested 375px mobile, 768px tablet, 1440px desktop' },
          { name: 'Menu Filter Functionality', passed: true, details: 'All categories active and filter smoothly' },
        ],
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3500000).toISOString(),
    };

    this.tasks.set(sample1.id, sample1);
  }

  public getAllTasks(): JarvisTask[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getTask(id: string): JarvisTask | undefined {
    return this.tasks.get(id);
  }

  public createTask(
    command: string,
    category: TaskCategory,
    priority: TaskPriority = 'NORMAL',
    preferredProvider?: ProviderId,
    projectId?: string
  ): JarvisTask {
    const router = ProviderRouter.getInstance();
    const selection = router.selectBestProvider(category, preferredProvider);
    const id = this.generateTaskId();
    const now = new Date().toISOString();

    const task: JarvisTask = {
      id,
      originalCommand: command,
      category,
      priority,
      status: 'PLANNING',
      progressPercent: 10,
      currentProvider: selection.provider.id,
      currentModel: selection.model,
      previousProviders: [],
      providerHistory: [
        {
          provider: selection.provider.id,
          model: selection.model,
          role: 'Initial Assignment',
          timestamp: now,
          status: 'SUCCESS',
        },
      ],
      steps: [
        { id: `${id}-s1`, name: 'Analyze Requirements & Intent', status: 'IN_PROGRESS' },
        { id: `${id}-s2`, name: 'Generate Execution Plan & Architecture', status: 'PENDING' },
        { id: `${id}-s3`, name: 'Execute Code & Workspace Modifications', status: 'PENDING' },
        { id: `${id}-s4`, name: 'Self-Verification & Test Validation', status: 'PENDING' },
      ],
      currentStepIndex: 0,
      checkpoints: [],
      changedFiles: [],
      importantContext: `Initialized for user command: "${command}"`,
      createdAt: now,
      updatedAt: now,
      projectId,
    };

    this.tasks.set(id, task);
    return task;
  }

  public updateTask(id: string, partial: Partial<JarvisTask>): JarvisTask | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  public addCheckpoint(
    taskId: string,
    summary: string,
    stateSnapshot: Record<string, unknown> = {},
    changedFiles: string[] = []
  ): TaskCheckpoint | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const completedIds = task.steps.filter((s) => s.status === 'COMPLETED').map((s) => s.id);
    const cp: TaskCheckpoint = {
      id: `CP-${task.checkpoints.length + 1}-${Date.now().toString().slice(-4)}`,
      stepIndex: task.currentStepIndex,
      summary,
      timestamp: new Date().toISOString(),
      completedStepIds: completedIds,
      changedFiles: Array.from(new Set([...task.changedFiles, ...changedFiles])),
      provider: task.currentProvider,
      stateSnapshot,
    };

    task.checkpoints.push(cp);
    task.changedFiles = cp.changedFiles;
    task.updatedAt = new Date().toISOString();
    return cp;
  }

  public buildContextTransferPackage(taskId: string, reason: string): TaskContextPackage | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const completedWork = task.steps
      .filter((s) => s.status === 'COMPLETED')
      .map((s) => `${s.name}: ${s.output || 'Done'}`);

    const pendingWork = task.steps
      .filter((s) => s.status === 'PENDING' || s.status === 'IN_PROGRESS')
      .map((s) => s.name);

    return {
      taskId: task.id,
      originalCommand: task.originalCommand,
      category: task.category,
      projectId: task.projectId,
      goal: `Execute user command "${task.originalCommand}" without losing prior progress`,
      completedWork,
      currentStep: task.steps[task.currentStepIndex]?.name || 'Execution',
      pendingWork,
      changedFiles: task.changedFiles,
      importantDecisions: [task.importantContext],
      errors: task.error ? [task.error] : [],
      previousProvider: task.currentProvider,
      reasonForSwitching: reason,
      expectedResult: 'Complete verification of all steps with 0 remaining defects',
      latestCheckpoint: task.checkpoints[task.checkpoints.length - 1],
    };
  }

  public failoverTask(taskId: string, newProvider: ProviderId, reason: string): JarvisTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    // 1. Create checkpoint of current state
    this.addCheckpoint(taskId, `Checkpoint before failover from ${task.currentProvider} to ${newProvider}: ${reason}`);

    // 2. Transfer context
    const router = ProviderRouter.getInstance();
    const selection = router.selectBestProvider(task.category, newProvider);

    task.previousProviders.push(task.currentProvider);
    task.currentProvider = selection.provider.id;
    task.currentModel = selection.model;
    task.providerHistory.push({
      provider: selection.provider.id,
      model: selection.model,
      role: 'Failover Continuation',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      reason,
    });
    task.updatedAt = new Date().toISOString();
    return task;
  }
}
