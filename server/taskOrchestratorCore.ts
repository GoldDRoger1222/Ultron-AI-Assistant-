/**
 * ULTRON Core Unified Task Orchestrator
 * 
 * Formal State Machine:
 * RECEIVED -> UNDERSTANDING -> PLANNING -> EXECUTING -> VERIFYING -> COMPLETED
 * 
 * Error Recovery Loop:
 * EXECUTING -> ERROR -> ANALYZE_ERROR -> RETRY_FIX -> VERIFYING -> COMPLETED / FAILED
 * 
 * Cancellation:
 * Immediate abort with resource teardown.
 */

import {
  OrchestratedTask,
  TaskStatus,
  TaskStep,
  CanonicalIntent,
  EvidenceRecord,
} from './types.js';

export class TaskOrchestratorCore {
  private static instance: TaskOrchestratorCore;
  private tasks: Map<string, OrchestratedTask> = new Map();
  private activeTaskId: string | null = null;

  private constructor() {}

  public static getInstance(): TaskOrchestratorCore {
    if (!TaskOrchestratorCore.instance) {
      TaskOrchestratorCore.instance = new TaskOrchestratorCore();
    }
    return TaskOrchestratorCore.instance;
  }

  public createTask(goal: string, intent: CanonicalIntent = 'MULTI_STEP_TASK', stepTitles?: string[]): OrchestratedTask {
    const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const titles = stepTitles && stepTitles.length > 0
      ? stepTitles
      : ['Analyze Requirements', 'Execute Architecture', 'Verify Output'];

    const steps: TaskStep[] = titles.map((title, idx) => ({
      stepIndex: idx,
      title,
      status: 'PENDING',
    }));

    const task: OrchestratedTask = {
      taskId,
      goal,
      status: 'RECEIVED',
      intent,
      steps,
      currentStepIndex: 0,
      retryCount: 0,
      maxRetries: 3,
      activeFiles: [],
      executionTimeMs: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(taskId, task);
    this.activeTaskId = taskId;
    return task;
  }

  public getTask(taskId: string): OrchestratedTask | undefined {
    return this.tasks.get(taskId);
  }

  public getActiveTask(): OrchestratedTask | undefined {
    return this.activeTaskId ? this.tasks.get(this.activeTaskId) : undefined;
  }

  public updateStatus(
    taskId: string,
    status: TaskStatus,
    payload?: { output?: string; error?: string; verification?: EvidenceRecord }
  ): OrchestratedTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = status;
    task.updatedAt = new Date().toISOString();

    if (payload?.output) task.finalOutput = payload.output;
    if (payload?.error) task.error = payload.error;
    if (payload?.verification) task.verification = payload.verification;

    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      task.completedAt = new Date().toISOString();
      if (this.activeTaskId === taskId) this.activeTaskId = null;
    }

    return task;
  }

  public updateStep(
    taskId: string,
    stepIndex: number,
    status: TaskStep['status'],
    details?: { resultSummary?: string; error?: string; evidence?: EvidenceRecord; executionTimeMs?: number }
  ): void {
    const task = this.tasks.get(taskId);
    if (!task || !task.steps[stepIndex]) return;

    const step = task.steps[stepIndex];
    step.status = status;
    if (details?.resultSummary) step.resultSummary = details.resultSummary;
    if (details?.error) step.error = details.error;
    if (details?.evidence) step.evidence = details.evidence;
    if (details?.executionTimeMs) step.executionTimeMs = details.executionTimeMs;

    task.updatedAt = new Date().toISOString();
  }

  public cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.status = 'CANCELLED';
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    task.finalOutput = 'Task execution cancelled by user directive.';

    if (this.activeTaskId === taskId) {
      this.activeTaskId = null;
    }

    return true;
  }

  public listTasks(limit: number = 20): OrchestratedTask[] {
    return Array.from(this.tasks.values()).reverse().slice(0, limit);
  }
}
