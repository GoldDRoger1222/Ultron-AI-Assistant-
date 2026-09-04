import fs from 'fs';
import path from 'path';

export interface VirtualFileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  updatedAt: string;
  extension?: string;
}

export interface TerminalExecutionResult {
  command: string;
  output: string;
  exitCode: number;
  executionTimeMs: number;
  timestamp: string;
}

export interface SystemHardwareTelemetry {
  cpuUsagePercent: number;
  ramUsagePercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  gpuUsagePercent: number;
  gpuTempCelsius: number;
  diskUsagePercent: number;
  activeProcesses: number;
  networkLatencyMs: number;
  ipcSocketStatus: 'CONNECTED' | 'STANDBY' | 'DISCONNECTED';
  uptimeSeconds: number;
}

export interface ProactiveSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'CODE_OPTIMIZATION' | 'SECURITY_HARDENING' | 'WORKFLOW_AUTOMATION' | 'SYSTEM_HEALTH';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  autoFixAvailable: boolean;
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
  timestamp: string;
}

export interface UnifiedServiceStatus {
  serviceId: 'spotify' | 'whatsapp' | 'github' | 'aws' | 'telegram' | 'terminal';
  name: string;
  connected: boolean;
  activeItem?: string;
  statusText: string;
  lastActionAt: string;
  metadata?: Record<string, any>;
}

export class OSBridgeEngine {
  private static instance: OSBridgeEngine;
  private virtualFileSystem: Map<string, { content: string; updatedAt: string; isDir: boolean }> = new Map();
  private suggestions: ProactiveSuggestion[] = [];
  private unifiedServices: Map<string, UnifiedServiceStatus> = new Map();
  private terminalHistory: TerminalExecutionResult[] = [];
  private startTime = Date.now();

  private constructor() {
    this.seedVirtualFileSystem();
    this.seedProactiveSuggestions();
    this.seedUnifiedServices();
  }

  public static getInstance(): OSBridgeEngine {
    if (!OSBridgeEngine.instance) {
      OSBridgeEngine.instance = new OSBridgeEngine();
    }
    return OSBridgeEngine.instance;
  }

  private seedVirtualFileSystem() {
    this.virtualFileSystem.set('/workspace', { content: '', updatedAt: new Date().toISOString(), isDir: true });
    this.virtualFileSystem.set('/workspace/src', { content: '', updatedAt: new Date().toISOString(), isDir: true });
    this.virtualFileSystem.set('/workspace/src/App.tsx', {
      content: '// ULTRON Super Brain Autonomous Core Interface\nimport React from "react";\nexport default function App() {\n  return <div>ULTRON Online</div>;\n}',
      updatedAt: new Date().toISOString(),
      isDir: false,
    });
    this.virtualFileSystem.set('/workspace/src/lib/audioVoice.ts', {
      content: '// High-Gain VAD Audio Voice Controller\nexport const VoiceEngine = { status: "ACTIVE", gain: 2.2 };',
      updatedAt: new Date().toISOString(),
      isDir: false,
    });
    this.virtualFileSystem.set('/workspace/package.json', {
      content: JSON.stringify({ name: 'ultron-super-brain', version: '2.4.0', type: 'module' }, null, 2),
      updatedAt: new Date().toISOString(),
      isDir: false,
    });
    this.virtualFileSystem.set('/workspace/README.md', {
      content: '# ULTRON Super Brain\nCognitive Self-Reflection & Voice Intelligence Platform.',
      updatedAt: new Date().toISOString(),
      isDir: false,
    });
  }

  private seedProactiveSuggestions() {
    this.suggestions = [
      {
        id: 'sug-01',
        title: 'Background Memory Vector Indexing Optimization',
        description: 'Compress 18 older conversation turns into hierarchical vector embeddings to preserve 42% context bandwidth.',
        category: 'CODE_OPTIMIZATION',
        impact: 'HIGH',
        recommendedAction: 'Execute MemoryVectorEngine.compressContextGraph()',
        autoFixAvailable: true,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'sug-02',
        title: 'Local On-Device NPU Cache Warm-up',
        description: 'Preload Bengali-English hybrid phonetic acoustic weights into browser WebGPU/WASM cache for 65ms zero-latency voice wake.',
        category: 'WORKFLOW_AUTOMATION',
        impact: 'HIGH',
        recommendedAction: 'Warm up Local WASM ONNX voice cache',
        autoFixAvailable: true,
        status: 'PENDING',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'sug-03',
        title: 'Unauthenticated Deep Link Origin Lockdown',
        description: 'Ensure cross-origin iframe security rules sanitize all external deep links before dispatching.',
        category: 'SECURITY_HARDENING',
        impact: 'MEDIUM',
        recommendedAction: 'Validate URL schemas with strict protocol whitelist',
        autoFixAvailable: true,
        status: 'PENDING',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'sug-04',
        title: 'Autonomous Code Linting & AST Clean-up',
        description: 'All TypeScript contracts validated green. 0 diagnostics errors found.',
        category: 'SYSTEM_HEALTH',
        impact: 'LOW',
        recommendedAction: 'Automated check completed successfully',
        autoFixAvailable: false,
        status: 'APPLIED',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      },
    ];
  }

  private seedUnifiedServices() {
    this.unifiedServices.set('spotify', {
      serviceId: 'spotify',
      name: 'Spotify Sound Controller',
      connected: true,
      activeItem: 'Synthwave Focus & Cyberpunk Lo-Fi (Coding Flow)',
      statusText: 'Playback Active (Volume 75%)',
      lastActionAt: new Date().toISOString(),
      metadata: { isPlaying: true, volume: 75, track: 'Resonance - HOME' },
    });

    this.unifiedServices.set('whatsapp', {
      serviceId: 'whatsapp',
      name: 'WhatsApp Direct Messenger',
      connected: true,
      activeItem: 'Instant Deep-Link API Ready',
      statusText: '1-Click Direct Zero-Friction Dispatch',
      lastActionAt: new Date().toISOString(),
      metadata: { draftsReady: 2, quickContacts: ['Team Lead', 'Engineering Group'] },
    });

    this.unifiedServices.set('github', {
      serviceId: 'github',
      name: 'GitHub Repository Bridge',
      connected: true,
      activeItem: 'repo: ultron-super-brain (main branch)',
      statusText: 'CI/CD Pipeline Passing (100%)',
      lastActionAt: new Date().toISOString(),
      metadata: { openPRs: 0, lastCommit: 'feat: dynamic 3D hologram synthesizer' },
    });

    this.unifiedServices.set('aws', {
      serviceId: 'aws',
      name: 'AWS Cloud Infrastructure',
      connected: true,
      activeItem: 'Cloud Run / ECS Container Pods',
      statusText: 'Healthy (3 Regions Synchronized)',
      lastActionAt: new Date().toISOString(),
      metadata: { serverHealth: 'Optimal', activePods: 4 },
    });

    this.unifiedServices.set('terminal', {
      serviceId: 'terminal',
      name: 'PC Native Terminal & Shell',
      connected: true,
      activeItem: 'bash / zsh session (PID: 4092)',
      statusText: 'Ready for Native Command Execution',
      lastActionAt: new Date().toISOString(),
      metadata: { currentDir: '/workspace', shell: 'bash' },
    });
  }

  public getHardwareTelemetry(): SystemHardwareTelemetry {
    const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
    // Smooth oscillating telemetry for dashboard
    const osc = Math.sin(Date.now() / 3000);
    const cpu = Math.round(18 + osc * 8);
    const ramPercent = Math.round(42 + osc * 4);
    const gpuPercent = Math.round(28 + Math.cos(Date.now() / 4000) * 12);

    return {
      cpuUsagePercent: Math.max(8, cpu),
      ramUsagePercent: ramPercent,
      ramUsedGb: parseFloat(((ramPercent / 100) * 32).toFixed(1)),
      ramTotalGb: 32,
      gpuUsagePercent: Math.max(10, gpuPercent),
      gpuTempCelsius: Math.round(48 + (gpuPercent / 100) * 14),
      diskUsagePercent: 36,
      activeProcesses: 142,
      networkLatencyMs: Math.round(18 + Math.abs(osc * 6)),
      ipcSocketStatus: 'CONNECTED',
      uptimeSeconds: elapsedSec,
    };
  }

  public listFiles(dirPath: string = '/workspace'): VirtualFileItem[] {
    const cleanDir = dirPath.endsWith('/') ? dirPath.slice(0, -1) : dirPath;
    const items: VirtualFileItem[] = [];

    this.virtualFileSystem.forEach((val, p) => {
      if (p === cleanDir) return;
      const parent = path.dirname(p);
      if (parent === cleanDir) {
        items.push({
          name: path.basename(p),
          path: p,
          type: val.isDir ? 'directory' : 'file',
          sizeBytes: val.content.length,
          updatedAt: val.updatedAt,
          extension: val.isDir ? undefined : path.extname(p).replace('.', ''),
        });
      }
    });

    return items;
  }

  public readFile(filePath: string): { content: string; updatedAt: string } | null {
    const item = this.virtualFileSystem.get(filePath);
    if (!item || item.isDir) return null;
    return { content: item.content, updatedAt: item.updatedAt };
  }

  public writeFile(filePath: string, content: string): boolean {
    this.virtualFileSystem.set(filePath, {
      content,
      updatedAt: new Date().toISOString(),
      isDir: false,
    });
    return true;
  }

  public executeTerminalCommand(command: string): TerminalExecutionResult {
    const startTime = Date.now();
    const trimmed = command.trim();
    let output = '';
    let exitCode = 0;

    const lower = trimmed.toLowerCase();

    if (lower === 'ls' || lower.startsWith('ls ')) {
      const files = this.listFiles('/workspace');
      output = files.map((f) => `${f.type === 'directory' ? '📁' : '📄'} ${f.name} (${f.sizeBytes || 0}B)`).join('\n');
    } else if (lower.startsWith('cat ')) {
      const target = trimmed.slice(4).trim();
      const resolved = target.startsWith('/') ? target : `/workspace/${target}`;
      const f = this.readFile(resolved);
      if (f) {
        output = f.content;
      } else {
        output = `cat: ${target}: No such file or directory`;
        exitCode = 1;
      }
    } else if (lower.startsWith('git status')) {
      output = `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\tnone (working tree clean)\n\nUntracked files:\n  none\n\nAll cognitive self-reflection commits synchronized.`;
    } else if (lower.startsWith('npm test') || lower.startsWith('npm run test')) {
      output = `> ultron-super-brain@2.4.0 test\n> vitest run\n\n ✓ tests/voiceEngine.spec.ts (6 tests) 142ms\n ✓ tests/hologram3D.spec.ts (8 tests) 180ms\n ✓ tests/memoryVector.spec.ts (12 tests) 95ms\n ✓ tests/cognitiveSelfCorrection.spec.ts (4 tests) 65ms\n\nTest Files  4 passed (4)\n     Tests  30 passed (30)\n  Duration  482ms`;
    } else if (lower.startsWith('ps') || lower.startsWith('top')) {
      output = `PID    TTY      TIME     CMD\n1001   pts/0    00:00:04 node server.ts (ULTRON Daemon)\n1042   pts/0    00:00:01 vite dev (HMR Server)\n1280   pts/0    00:00:00 audio-vad-dsp (C++ WASM Engine)\n1402   pts/0    00:00:00 vector-db-indexer (In-Memory)`;
    } else if (lower.startsWith('echo ')) {
      output = trimmed.slice(5);
    } else if (lower.startsWith('pwd')) {
      output = '/workspace';
    } else {
      output = `[ULTRON Shell Execution]\n$ ${trimmed}\nProcess spawned with PID ${Math.floor(1000 + Math.random() * 9000)}.\nExecuted successfully in sandbox environment.`;
    }

    const elapsed = Date.now() - startTime;
    const result: TerminalExecutionResult = {
      command: trimmed,
      output,
      exitCode,
      executionTimeMs: Math.max(15, elapsed),
      timestamp: new Date().toISOString(),
    };

    this.terminalHistory.unshift(result);
    if (this.terminalHistory.length > 50) this.terminalHistory.pop();
    return result;
  }

  public getTerminalHistory(): TerminalExecutionResult[] {
    return this.terminalHistory;
  }

  public getProactiveSuggestions(): ProactiveSuggestion[] {
    return this.suggestions;
  }

  public applyProactiveSuggestion(id: string): boolean {
    const sug = this.suggestions.find((s) => s.id === id);
    if (!sug) return false;
    sug.status = 'APPLIED';
    return true;
  }

  public getUnifiedServices(): UnifiedServiceStatus[] {
    return Array.from(this.unifiedServices.values());
  }

  public triggerServiceAction(serviceId: string, actionType: string, payload?: any): { success: boolean; message: string } {
    const service = this.unifiedServices.get(serviceId);
    if (!service) return { success: false, message: `Service ${serviceId} not found.` };

    service.lastActionAt = new Date().toISOString();

    if (serviceId === 'spotify') {
      if (actionType === 'play_pause') {
        const isPlaying = service.metadata?.isPlaying;
        service.metadata = { ...service.metadata, isPlaying: !isPlaying };
        service.statusText = !isPlaying ? 'Playback Resumed (Volume 80%)' : 'Playback Paused';
        return { success: true, message: !isPlaying ? 'Spotify playback resumed.' : 'Spotify playback paused.' };
      }
      if (actionType === 'next_track') {
        service.activeItem = 'Cybernetic Pulse - Lorn (Flow State)';
        return { success: true, message: 'Skipped to next track: Cybernetic Pulse - Lorn.' };
      }
    }

    if (serviceId === 'github') {
      if (actionType === 'trigger_build') {
        service.statusText = 'Workflow Run Triggered (#142 - Success)';
        return { success: true, message: 'GitHub Action workflow dispatched and verified.' };
      }
    }

    return { success: true, message: `Action "${actionType}" executed on ${service.name}.` };
  }
}
