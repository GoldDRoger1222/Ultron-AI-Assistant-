import { ComputerAgentAction, PermissionLevel } from '../src/types/jarvis.js';
import { PermissionEngine } from './permissions.js';

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  updatedAt: string;
  extension?: string;
}

export interface AppProcess {
  id: string;
  name: string;
  status: 'RUNNING' | 'STOPPED' | 'SUSPENDED';
  pid: number;
  memoryMb: number;
  cpuPercent: number;
  openedAt: string;
}

export class ComputerAgentEngine {
  private static instance: ComputerAgentEngine;
  private virtualDisk: Map<string, { content: string; updatedAt: string; isDir: boolean; sizeBytes: number }> = new Map();
  private runningApps: Map<string, AppProcess> = new Map();
  private actionHistory: ComputerAgentAction[] = [];

  private constructor() {
    this.seedFileSystem();
    this.seedRunningApps();
  }

  public static getInstance(): ComputerAgentEngine {
    if (!ComputerAgentEngine.instance) {
      ComputerAgentEngine.instance = new ComputerAgentEngine();
    }
    return ComputerAgentEngine.instance;
  }

  private seedFileSystem() {
    this.virtualDisk.set('/projects', { content: '', updatedAt: new Date().toISOString(), isDir: true, sizeBytes: 4096 });
    this.virtualDisk.set('/projects/portfolio-v2', { content: '', updatedAt: new Date().toISOString(), isDir: true, sizeBytes: 4096 });
    this.virtualDisk.set('/projects/portfolio-v2/index.html', {
      content: '<!DOCTYPE html><html><head><title>Portfolio</title></head><body><h1>My Portfolio</h1></body></html>',
      updatedAt: new Date().toISOString(),
      isDir: false,
      sizeBytes: 120,
    });
    this.virtualDisk.set('/projects/portfolio-v2/src', { content: '', updatedAt: new Date().toISOString(), isDir: true, sizeBytes: 4096 });
    this.virtualDisk.set('/projects/portfolio-v2/src/App.tsx', {
      content: 'import React from "react";\nexport function Portfolio() { return <main>Portfolio Engine</main>; }',
      updatedAt: new Date().toISOString(),
      isDir: false,
      sizeBytes: 98,
    });
    this.virtualDisk.set('/documents', { content: '', updatedAt: new Date().toISOString(), isDir: true, sizeBytes: 4096 });
    this.virtualDisk.set('/documents/architecture-notes.md', {
      content: '# System Architecture\nULTRON Multi-Agent Cognitive Core with Autonomous Self-Verification and Computer Interfacing.',
      updatedAt: new Date().toISOString(),
      isDir: false,
      sizeBytes: 142,
    });
  }

  private seedRunningApps() {
    this.runningApps.set('app-vscode', {
      id: 'app-vscode',
      name: 'VS Code (Visual Studio Code)',
      status: 'RUNNING',
      pid: 4182,
      memoryMb: 420,
      cpuPercent: 1.8,
      openedAt: new Date(Date.now() - 3600000).toISOString(),
    });
    this.runningApps.set('app-terminal', {
      id: 'app-terminal',
      name: 'Integrated Terminal / Bash',
      status: 'RUNNING',
      pid: 5012,
      memoryMb: 68,
      cpuPercent: 0.4,
      openedAt: new Date(Date.now() - 1800000).toISOString(),
    });
    this.runningApps.set('app-chrome', {
      id: 'app-chrome',
      name: 'Google Chrome / Headless Browser',
      status: 'RUNNING',
      pid: 6199,
      memoryMb: 890,
      cpuPercent: 3.2,
      openedAt: new Date(Date.now() - 7200000).toISOString(),
    });
  }

  /**
   * Generates a Dry-Run / Simulation plan before executing complex computer operations.
   */
  public generateDryRunPlan(actionType: string, target: string, params?: Record<string, any>): string {
    switch (actionType) {
      case 'DELETE_FILE':
        return `[SIMULATION DRY-RUN]:\n1. Target path: "${target}"\n2. Safety Check: Verify not a protected root directory\n3. Action: Permanently remove file node\n4. Estimated Impact: 1 item deleted. Irreversible operation.`;
      case 'ORGANIZE_FILES':
        return `[SIMULATION DRY-RUN]:\n1. Scan directory: "${target}"\n2. Group by file extensions (.ts, .tsx, .css, .md)\n3. Create target structured subfolders\n4. Move 8 matching items safely`;
      case 'EXECUTE_SCRIPT':
        return `[SIMULATION DRY-RUN]:\n1. Script: "${target}"\n2. Sandbox: Isolated sub-process\n3. Arguments: ${JSON.stringify(params || {})}\n4. Expected Output: Execution logs & exit code`;
      case 'RUN_TEST':
        return `[SIMULATION DRY-RUN]:\n1. Test Suite: "${target}"\n2. Runner: Vitest / Jest Engine\n3. Test cases to execute: 12 tests across unit & e2e modules`;
      default:
        return `[SIMULATION DRY-RUN]:\n1. Planned Action: ${actionType} on target "${target}"\n2. Parameters: ${JSON.stringify(params || {})}\n3. Execution mode: Authorized Computer Agent`;
    }
  }

  /**
   * Dispatches and executes an authorized computer agent action.
   */
  public async executeAction(
    actionType: ComputerAgentAction['actionType'],
    target: string,
    params?: Record<string, any>,
    bypassConfirmation = false
  ): Promise<{
    success: boolean;
    result: string;
    action: ComputerAgentAction;
    requiresUserConfirmation?: boolean;
    dryRunPlan?: string;
  }> {
    const permEngine = PermissionEngine.getInstance();
    const isSensitive = permEngine.isActionSensitive(actionType);
    const requiredLevel: PermissionLevel = isSensitive ? 3 : 2;
    const dryRun = this.generateDryRunPlan(actionType, target, params);

    const actionId = `CA-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const actionObj: ComputerAgentAction = {
      id: actionId,
      actionType,
      target,
      parameters: params,
      permissionLevelRequired: requiredLevel,
      isSensitive,
      dryRunSummary: dryRun,
      status: 'PENDING_APPROVAL',
      timestamp: new Date().toISOString(),
    };

    if (!bypassConfirmation) {
      const permCheck = permEngine.checkPermission(actionType, target, requiredLevel);
      if (!permCheck.allowed && permCheck.requiresConfirmation) {
        actionObj.status = 'PENDING_APPROVAL';
        this.actionHistory.unshift(actionObj);
        return {
          success: false,
          result: permCheck.reason,
          action: actionObj,
          requiresUserConfirmation: true,
          dryRunPlan: dryRun,
        };
      }
      if (!permCheck.allowed) {
        actionObj.status = 'REJECTED';
        actionObj.executionResult = permCheck.reason;
        this.actionHistory.unshift(actionObj);
        return {
          success: false,
          result: permCheck.reason,
          action: actionObj,
        };
      }
    }

    // Execution Logic
    let execResult = '';
    let isSuccess = true;

    try {
      switch (actionType) {
        case 'OPEN_APP': {
          const appId = `app-${target.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          const existing = this.runningApps.get(appId);
          if (existing) {
            existing.status = 'RUNNING';
            execResult = `Application "${existing.name}" is already running (PID: ${existing.pid}) and brought to foreground focus.`;
          } else {
            const newApp: AppProcess = {
              id: appId,
              name: target,
              status: 'RUNNING',
              pid: Math.floor(1000 + Math.random() * 8000),
              memoryMb: 180,
              cpuPercent: 1.2,
              openedAt: new Date().toISOString(),
            };
            this.runningApps.set(appId, newApp);
            execResult = `Launched "${target}" successfully (PID: ${newApp.pid}).`;
          }
          break;
        }

        case 'CLOSE_APP': {
          const appEntry = Array.from(this.runningApps.values()).find(
            (a) => a.name.toLowerCase().includes(target.toLowerCase()) || a.id.toLowerCase().includes(target.toLowerCase())
          );
          if (appEntry) {
            appEntry.status = 'STOPPED';
            this.runningApps.delete(appEntry.id);
            execResult = `Closed application "${appEntry.name}" (PID: ${appEntry.pid}).`;
          } else {
            execResult = `Application "${target}" was not running.`;
          }
          break;
        }

        case 'READ_FILE': {
          const file = this.virtualDisk.get(target);
          if (file) {
            execResult = file.isDir
              ? `Directory listing for ${target}: ${this.listFiles(target).map((f) => f.name).join(', ')}`
              : file.content;
          } else {
            isSuccess = false;
            execResult = `Error: File not found at path "${target}".`;
          }
          break;
        }

        case 'CREATE_FILE': {
          const content = params?.content || '';
          this.virtualDisk.set(target, {
            content,
            updatedAt: new Date().toISOString(),
            isDir: false,
            sizeBytes: Buffer.byteLength(content, 'utf8'),
          });
          execResult = `Created file "${target}" (${Buffer.byteLength(content, 'utf8')} bytes).`;
          break;
        }

        case 'DELETE_FILE': {
          if (this.virtualDisk.has(target)) {
            this.virtualDisk.delete(target);
            execResult = `Deleted file "${target}" safely.`;
          } else {
            isSuccess = false;
            execResult = `File "${target}" does not exist.`;
          }
          break;
        }

        case 'SEARCH_FILES': {
          const query = target.toLowerCase();
          const matches: string[] = [];
          for (const [p, meta] of this.virtualDisk.entries()) {
            if (p.toLowerCase().includes(query) || (!meta.isDir && meta.content.toLowerCase().includes(query))) {
              matches.push(p);
            }
          }
          execResult = matches.length > 0 ? `Found ${matches.length} matching files:\n${matches.join('\n')}` : `No files matching "${target}" were found.`;
          break;
        }

        case 'RUN_TEST': {
          execResult = `Test runner output for "${target}":\n✓ 8 tests passed in src/components\n✓ 4 tests passed in server modules\nTotal: 12 passed, 0 failed, 0 flaky (Duration: 340ms).`;
          break;
        }

        case 'EXECUTE_SCRIPT': {
          execResult = `Executed approved script "${target}" with exit code 0:\nOutput: [OK] Initialization complete. All system hooks resolved.`;
          break;
        }

        case 'NAVIGATE_URL':
        case 'OPEN_BROWSER': {
          execResult = `Navigated browser context to: "${target}". Status 200 OK. Page rendered.`;
          break;
        }

        case 'SYSTEM_TELEMETRY': {
          execResult = `System Status: CPU 14% | RAM 4.2GB / 16.0GB (26%) | Storage: 45% used | Active Processes: ${this.runningApps.size}`;
          break;
        }

        default:
          execResult = `Executed action ${actionType} on ${target} successfully.`;
      }
    } catch (err: any) {
      isSuccess = false;
      execResult = `Execution failure on ${actionType}: ${err.message}`;
    }

    actionObj.status = isSuccess ? 'EXECUTED' : 'FAILED';
    actionObj.executionResult = execResult;
    this.actionHistory.unshift(actionObj);
    if (this.actionHistory.length > 100) this.actionHistory.pop();

    return {
      success: isSuccess,
      result: execResult,
      action: actionObj,
    };
  }

  public listFiles(dirPath = '/'): FileItem[] {
    const items: FileItem[] = [];
    for (const [p, meta] of this.virtualDisk.entries()) {
      if (p !== dirPath && p.startsWith(dirPath)) {
        const relative = p.slice(dirPath === '/' ? 1 : dirPath.length + 1);
        if (!relative.includes('/')) {
          items.push({
            name: relative,
            path: p,
            type: meta.isDir ? 'directory' : 'file',
            sizeBytes: meta.sizeBytes,
            updatedAt: meta.updatedAt,
            extension: meta.isDir ? undefined : relative.split('.').pop(),
          });
        }
      }
    }
    return items;
  }

  public getRunningApps(): AppProcess[] {
    return Array.from(this.runningApps.values());
  }

  public getActionHistory(): ComputerAgentAction[] {
    return this.actionHistory;
  }
}
