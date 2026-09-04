import { EmergencyFailsafeStatus } from '../src/types/jarvis.js';
import { TaskManager } from './taskManager.js';

export class EmergencyFailsafeEngine {
  private static instance: EmergencyFailsafeEngine;
  private status: EmergencyFailsafeStatus = {
    isEmergencyStopped: false,
    cancelledTasksCount: 0,
    pausedTasksCount: 0,
    isolatedModules: [],
    canResume: true,
  };

  private constructor() {}

  public static getInstance(): EmergencyFailsafeEngine {
    if (!EmergencyFailsafeEngine.instance) {
      EmergencyFailsafeEngine.instance = new EmergencyFailsafeEngine();
    }
    return EmergencyFailsafeEngine.instance;
  }

  public getStatus(): EmergencyFailsafeStatus {
    return { ...this.status };
  }

  /**
   * Triggers Global Emergency Stop when user commands "ULTRON STOP" or presses emergency halt.
   */
  public triggerEmergencyStop(): EmergencyFailsafeStatus {
    const taskMgr = TaskManager.getInstance();
    const tasks = taskMgr.getAllTasks();

    let paused = 0;
    let cancelled = 0;

    for (const t of tasks) {
      if (t.status === 'IN_PROGRESS' || t.status === 'PLANNING' || t.status === 'VERIFYING') {
        taskMgr.updateTask(t.id, {
          status: 'PAUSED',
          error: 'Paused by Global Emergency Stop command ("ULTRON STOP")',
        });
        paused++;
      }
    }

    this.status = {
      isEmergencyStopped: true,
      stoppedAt: new Date().toISOString(),
      cancelledTasksCount: cancelled,
      pausedTasksCount: paused,
      isolatedModules: ['ActiveAutomationRunner', 'ExternalToolDispatch'],
      canResume: true,
    };

    return this.getStatus();
  }

  public resumeSystem(): EmergencyFailsafeStatus {
    this.status.isEmergencyStopped = false;
    this.status.isolatedModules = [];
    return this.getStatus();
  }
}
