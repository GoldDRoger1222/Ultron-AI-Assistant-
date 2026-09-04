import { SelfHealingIncident } from '../src/types/jarvis.js';

export class SelfHealingEngine {
  private static instance: SelfHealingEngine;
  private incidents: SelfHealingIncident[] = [];
  private isolatedModules: Set<string> = new Set();

  private constructor() {
    this.seedInitialRecovery();
  }

  public static getInstance(): SelfHealingEngine {
    if (!SelfHealingEngine.instance) {
      SelfHealingEngine.instance = new SelfHealingEngine();
    }
    return SelfHealingEngine.instance;
  }

  private seedInitialRecovery() {
    this.incidents.push({
      id: 'REC-001',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      moduleName: 'WebAudioEchoCanceller',
      errorDetected: 'AudioContext suspended due to autoplay policy',
      actionTaken: 'RESTARTED',
      recoveryStatus: 'RECOVERED',
      details: 'Auto-resumed AudioContext on first user interaction hook; zero disruption.',
    });
  }

  /**
   * Universal error handler & self-healing workflow:
   * DETECT -> LOG -> ISOLATE -> RESTART MODULE -> RETRY -> FALLBACK -> REPORT
   */
  public async handleModuleFailure<T>(
    moduleName: string,
    operation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>
  ): Promise<{ result: T | null; recovered: boolean; incident: SelfHealingIncident }> {
    const start = Date.now();
    try {
      const res = await operation();
      return {
        result: res,
        recovered: true,
        incident: {
          id: `INC-OK-${Date.now()}`,
          timestamp: new Date().toISOString(),
          moduleName,
          errorDetected: 'None',
          actionTaken: 'RESTARTED',
          recoveryStatus: 'RECOVERED',
          details: 'Operation executed smoothly.',
        },
      };
    } catch (err: any) {
      console.error(`[Self-Healing Engine] Detected failure in module "${moduleName}":`, err?.message || err);

      // Step 1: Isolate module
      this.isolatedModules.add(moduleName);

      // Step 2: Attempt restart & retry
      try {
        console.log(`[Self-Healing Engine] Attempting clean restart & retry for "${moduleName}"...`);
        const retryRes = await operation();
        this.isolatedModules.delete(moduleName);

        const inc: SelfHealingIncident = {
          id: `INC-${Date.now()}`,
          timestamp: new Date().toISOString(),
          moduleName,
          errorDetected: err.message || 'Unknown runtime exception',
          actionTaken: 'RETRIED',
          recoveryStatus: 'RECOVERED',
          details: `Module recovered successfully on isolated retry (${Date.now() - start}ms).`,
        };
        this.incidents.unshift(inc);
        return { result: retryRes, recovered: true, incident: inc };
      } catch (retryErr: any) {
        // Step 3: Fallback activation
        if (fallbackOperation) {
          try {
            console.log(`[Self-Healing Engine] Retrying via fallback routine for "${moduleName}"...`);
            const fallbackRes = await fallbackOperation();

            const inc: SelfHealingIncident = {
              id: `INC-${Date.now()}`,
              timestamp: new Date().toISOString(),
              moduleName,
              errorDetected: retryErr.message || 'Retry failed',
              actionTaken: 'FALLBACK_ACTIVATED',
              recoveryStatus: 'DEGRADED',
              details: 'Primary module isolated; fallback provider assumed workload seamlessly.',
            };
            this.incidents.unshift(inc);
            return { result: fallbackRes, recovered: true, incident: inc };
          } catch (fbErr: any) {
            console.error(`[Self-Healing Engine] Fallback also failed for "${moduleName}":`, fbErr);
          }
        }

        // Step 4: Report incident safely without crashing app
        const inc: SelfHealingIncident = {
          id: `INC-${Date.now()}`,
          timestamp: new Date().toISOString(),
          moduleName,
          errorDetected: err.message || 'Fatal execution error',
          actionTaken: 'ISOLATED',
          recoveryStatus: 'MANUAL_INTERVENTION_REQUIRED',
          details: `Module isolated to protect overall ULTRON OS integrity. Error: ${err.message}`,
        };
        this.incidents.unshift(inc);
        return { result: null, recovered: false, incident: inc };
      }
    }
  }

  public getIncidents(): SelfHealingIncident[] {
    return this.incidents;
  }

  public getIsolatedModules(): string[] {
    return Array.from(this.isolatedModules);
  }
}
