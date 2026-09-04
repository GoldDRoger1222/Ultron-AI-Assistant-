import { SecuritySentinelStatus } from '../src/types/jarvis.js';

export class SecuritySentinelEngine {
  private static instance: SecuritySentinelEngine;
  private status: SecuritySentinelStatus = {
    mode: 'DEFENCE',
    activeSessionsCount: 1,
    connectedDevices: [
      { id: 'dev-local', name: 'Authorized Master Terminal', ip: '127.0.0.1', status: 'TRUSTED' },
      { id: 'dev-mobile-paired', name: 'ULTRON Mobile Companion (Android)', ip: '192.168.1.104', status: 'TRUSTED' },
    ],
    suspiciousActivityAlerts: [
      {
        id: 'alt-01',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        title: 'Untrusted Port Ingress Probing Blocked',
        risk: 'LOW',
        autoBlocked: true,
      },
    ],
    failedLoginAttempts: 0,
    apiHealthSecurityScore: 98,
    lockdownEnabled: false,
    lastSecurityAudit: new Date().toISOString(),
  };

  private constructor() {}

  public static getInstance(): SecuritySentinelEngine {
    if (!SecuritySentinelEngine.instance) {
      SecuritySentinelEngine.instance = new SecuritySentinelEngine();
    }
    return SecuritySentinelEngine.instance;
  }

  public getStatus(): SecuritySentinelStatus {
    return { ...this.status };
  }

  public setMode(mode: 'NORMAL' | 'DEFENCE' | 'LOCKDOWN'): SecuritySentinelStatus {
    this.status.mode = mode;
    this.status.lockdownEnabled = mode === 'LOCKDOWN';
    this.status.lastSecurityAudit = new Date().toISOString();
    return this.getStatus();
  }

  public logSuspiciousActivity(title: string, risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): void {
    this.status.suspiciousActivityAlerts.unshift({
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      risk,
      autoBlocked: true,
    });
    if (this.status.suspiciousActivityAlerts.length > 30) {
      this.status.suspiciousActivityAlerts.pop();
    }
  }
}
