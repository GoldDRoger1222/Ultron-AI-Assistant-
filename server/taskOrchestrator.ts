/**
 * ULTRON Task Orchestrator & State Machine
 * 
 * Life Cycle:
 * RECEIVED -> UNDERSTANDING -> PLANNING -> EXECUTING -> VERIFYING -> COMPLETED
 * 
 * Failure / Self-Correction Path:
 * EXECUTING -> ERROR -> ANALYZE_ERROR -> RETRY/FIX -> VERIFY -> COMPLETED | FAILED
 * 
 * Task ID Format: ULTRON-TASK-XXXX
 */

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
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  resultSummary?: string;
  error?: string;
  evidence?: unknown;
}

export interface OrchestratedTask {
  taskId: string;
  goal: string;
  status: TaskStatus;
  intent: string;
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
}

export class TaskOrchestrator {
  private static instance: TaskOrchestrator;
  private tasks: Map<string, OrchestratedTask> = new Map();
  private taskCounter = 1000;

  private constructor() {}

  public static getInstance(): TaskOrchestrator {
    if (!TaskOrchestrator.instance) {
      TaskOrchestrator.instance = new TaskOrchestrator();
    }
    return TaskOrchestrator.instance;
  }

  public generateTaskId(): string {
    this.taskCounter++;
    return `ULTRON-TASK-${this.taskCounter}`;
  }

  public createTask(goal: string, intent = 'TASK', steps?: string[]): OrchestratedTask {
    const taskId = this.generateTaskId();
    const now = new Date().toISOString();

    const planSteps: TaskStep[] = (steps && steps.length > 0)
      ? steps.map((s, idx) => ({
          stepIndex: idx + 1,
          title: s,
          status: 'PENDING',
        }))
      : [
          { stepIndex: 1, title: 'Understand requirements & decompose task', status: 'PENDING' },
          { stepIndex: 2, title: 'Plan architectural steps & tool selections', status: 'PENDING' },
          { stepIndex: 3, title: 'Execute tools in sandbox / VFS', status: 'PENDING' },
          { stepIndex: 4, title: 'Verify tangible evidence and test results', status: 'PENDING' },
        ];

    const task: OrchestratedTask = {
      taskId,
      goal,
      status: 'RECEIVED',
      intent,
      steps: planSteps,
      currentStepIndex: 0,
      retryCount: 0,
      maxRetries: 3,
      activeFiles: [],
      executionTimeMs: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(taskId, task);
    return task;
  }

  public updateStatus(taskId: string, status: TaskStatus, details?: { error?: string; output?: string; stepIndex?: number }): OrchestratedTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = status;
    task.updatedAt = new Date().toISOString();

    if (details?.error) task.error = details.error;
    if (details?.output) task.finalOutput = details.output;
    if (details?.stepIndex !== undefined) task.currentStepIndex = details.stepIndex;

    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      task.completedAt = new Date().toISOString();
    }

    return task;
  }

  public updateStep(taskId: string, stepIndex: number, patch: Partial<TaskStep>): OrchestratedTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const step = task.steps.find((s) => s.stepIndex === stepIndex);
    if (step) {
      Object.assign(step, patch);
    }
    task.updatedAt = new Date().toISOString();
    return task;
  }

  public cancelTask(taskId: string): { success: boolean; message: string; task?: OrchestratedTask } {
    const task = this.tasks.get(taskId);
    if (!task) {
      return { success: false, message: `Task ${taskId} not found.` };
    }

    task.status = 'CANCELLED';
    task.updatedAt = new Date().toISOString();
    task.completedAt = new Date().toISOString();

    return {
      success: true,
      message: `Task ${taskId} ("${task.goal}") successfully cancelled.`,
      task,
    };
  }

  public getTask(taskId: string): OrchestratedTask | undefined {
    return this.tasks.get(taskId);
  }

  public listTasks(limit = 20): OrchestratedTask[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  public getActiveTask(): OrchestratedTask | undefined {
    return Array.from(this.tasks.values()).find(
      (t) => !['COMPLETED', 'FAILED', 'CANCELLED'].includes(t.status)
    );
  }
}
