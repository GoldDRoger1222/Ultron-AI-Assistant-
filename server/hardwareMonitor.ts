import { HardwareTelemetryState } from '../src/types/jarvis.js';
import os from 'os';

export class HardwareMonitorEngine {
  private static instance: HardwareMonitorEngine;
  private workloadQueue: { id: string; name: string; priority: number; status: 'QUEUED' | 'RUNNING' | 'FINISHED' }[] = [];

  private constructor() {}

  public static getInstance(): HardwareMonitorEngine {
    if (!HardwareMonitorEngine.instance) {
      HardwareMonitorEngine.instance = new HardwareMonitorEngine();
    }
    return HardwareMonitorEngine.instance;
  }

  public getTelemetry(): HardwareTelemetryState {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsagePercent = Math.round((usedMem / totalMem) * 100);

    const cpus = os.cpus();
    const cpuCount = cpus.length || 4;

    // Calculate load approximation
    const loadAvg = os.loadavg();
    const cpuUsagePercent = Math.min(100, Math.round((loadAvg[0] / cpuCount) * 100)) || 24;

    let healthState: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (cpuUsagePercent > 85 || ramUsagePercent > 90) {
      healthState = 'CRITICAL';
    } else if (cpuUsagePercent > 70 || ramUsagePercent > 75) {
      healthState = 'WARNING';
    }

    return {
      cpuUsagePercent,
      cpuTemperatureC: 44.5 + Math.round((cpuUsagePercent / 100) * 20),
      ramUsagePercent,
      ramTotalGB: Number((totalMem / (1024 * 1024 * 1024)).toFixed(1)),
      ramUsedGB: Number((usedMem / (1024 * 1024 * 1024)).toFixed(1)),
      storageUsagePercent: 38,
      batteryPercent: 96,
      isCharging: true,
      gpuUsagePercent: 18,
      networkLatencyMs: 14,
      networkSpeedMbps: 850,
      healthState,
      runningProcessesCount: 142,
      activeWorkloadsCount: this.workloadQueue.filter((w) => w.status === 'RUNNING').length,
    };
  }

  public getWorkloads() {
    return this.workloadQueue;
  }

  public queueWorkload(name: string, priority: number = 5): { id: string; status: string } {
    const item = {
      id: `wl-${Date.now()}`,
      name,
      priority,
      status: 'RUNNING' as const,
    };
    this.workloadQueue.unshift(item);
    if (this.workloadQueue.length > 20) this.workloadQueue.pop();
    return item;
  }
}
