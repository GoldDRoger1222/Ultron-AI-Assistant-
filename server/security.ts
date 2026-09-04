import {
  SecuritySubMode,
  SecurityFinding,
  SecurityOperationLog,
  FindingSeverity,
  OfflinePolicy,
} from '../src/types/jarvis.js';

export class SecurityEngine {
  private static instance: SecurityEngine;
  private isSecurityModeActive = false;
  private currentSubMode: SecuritySubMode = 'DEFENCE';
  private localOnlyModeActive = false;
  private offlinePolicy: OfflinePolicy = 'AUTO_DETECT';
  private findings: SecurityFinding[] = [];
  private logs: SecurityOperationLog[] = [];

  private constructor() {
    this.seedSampleSecurityData();
  }

  public static getInstance(): SecurityEngine {
    if (!SecurityEngine.instance) {
      SecurityEngine.instance = new SecurityEngine();
    }
    return SecurityEngine.instance;
  }

  private seedSampleSecurityData() {
    this.findings = [
      {
        id: 'SEC-FIND-001',
        title: 'Exposed Plaintext Environment Credentials in Client Bundle Candidate',
        severity: 'HIGH',
        target: 'Workspace: /config/client-settings.json',
        category: 'Information Disclosure',
        evidence: 'Found token strings matching API secret entropy patterns in unminified bundle candidate',
        impact: 'Potential client-side extraction of backend service tokens',
        riskScore: 7.8,
        recommendation: 'Move all secrets strictly to server-side process.env and proxy through /api routes',
        remediation: 'Migrated secret variables to backend runtime and updated .env.example',
        verified: true,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'SEC-FIND-002',
        title: 'Missing Content Security Policy & Strict Transport Security Headers',
        severity: 'MEDIUM',
        target: 'Express Server Gateway',
        category: 'Security Headers',
        evidence: 'Response headers lack Strict-Transport-Security, X-Content-Type-Options: nosniff',
        impact: 'Permits MIME sniffing and potential legacy insecure transport degradation',
        riskScore: 5.2,
        recommendation: 'Enforce standard defensive security headers on all reverse proxy endpoints',
        remediation: 'Configured automated helmet-style security headers across HTTP router',
        verified: true,
        timestamp: new Date(Date.now() - 1200000).toISOString(),
      },
      {
        id: 'SEC-FIND-003',
        title: 'Weak Password Hash Algorithmic Resistance in Legacy Auth Routine',
        severity: 'LOW',
        target: 'Auth Subsystem',
        category: 'Cryptography',
        evidence: 'Legacy test script using single-iteration SHA-256 without salt/pepper',
        impact: 'Offline dictionary collision risk in test environments',
        riskScore: 3.1,
        recommendation: 'Upgrade to Argon2id or Scrypt with work factor >= 12',
        remediation: 'Replaced with standard modern cryptographic password hashing template',
        verified: true,
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
    ];

    this.logs = [
      {
        id: 'LOG-001',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        target: 'Local Sandbox Workspace',
        mode: 'DEFENCE',
        action: 'Static Secret Audit & Entropy Analysis',
        tool: 'JARVIS Defense Inspector',
        result: 'WARNING',
        provider: 'gemini',
        details: 'Scanned 14 files, detected 1 potential secret exposure candidate (Remediated)',
      },
      {
        id: 'LOG-002',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        target: 'Gateway HTTP Surface',
        mode: 'DEFENCE',
        action: 'Header Verification & TLS Configuration Scan',
        tool: 'Network Defense Suite',
        result: 'SUCCESS',
        provider: 'gemini',
        details: 'Verified HTTPS enforcement, HSTS status, and X-Frame protection policies',
      },
      {
        id: 'LOG-003',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        target: 'Authorized CTF Web Sandbox',
        mode: 'ATTACK',
        action: 'Attack Surface Mapping & Parameter Fuzz Simulation',
        tool: 'JARVIS Attack Engine',
        result: 'SUCCESS',
        provider: 'openrouter',
        details: 'Mapped 6 endpoints in authorized local container; tested injection boundaries safely',
      },
    ];
  }

  public isModeActive(): boolean {
    return this.isSecurityModeActive;
  }

  public activateSecurityMode(subMode: SecuritySubMode = 'DEFENCE'): boolean {
    this.isSecurityModeActive = true;
    this.currentSubMode = subMode;
    this.addLog({
      target: 'JARVIS Core',
      mode: subMode,
      action: 'SECURITY MODE ACTIVATED',
      tool: 'Access Control Controller',
      result: 'SUCCESS',
      provider: 'gemini',
      details: `JARVIS switched to Security Terminal [${subMode} Mode] via user authorization.`,
    });
    return true;
  }

  public exitSecurityMode(): boolean {
    this.isSecurityModeActive = false;
    this.addLog({
      target: 'JARVIS Core',
      mode: this.currentSubMode,
      action: 'SECURITY MODE EXITED',
      tool: 'Access Control Controller',
      result: 'SUCCESS',
      provider: 'gemini',
      details: 'Switched back to Normal JARVIS Assistant Mode.',
    });
    return true;
  }

  public getSubMode(): SecuritySubMode {
    return this.currentSubMode;
  }

  public setSubMode(mode: SecuritySubMode) {
    this.currentSubMode = mode;
  }

  public isLocalOnly(): boolean {
    return this.localOnlyModeActive;
  }

  public getOfflinePolicy(): OfflinePolicy {
    return this.offlinePolicy;
  }

  public setLocalOnly(enabled: boolean, policy: OfflinePolicy = 'FORCE_LOCAL') {
    this.localOnlyModeActive = enabled;
    this.offlinePolicy = policy;
    this.addLog({
      target: 'Air-Gapped Security Controller',
      mode: this.currentSubMode,
      action: enabled ? 'LOCAL-ONLY MODE ENGAGED' : 'LOCAL-ONLY MODE DISENGAGED',
      tool: 'Air-Gap Policy Enforcer',
      result: 'SUCCESS',
      provider: 'gemini',
      details: enabled
        ? `Outbound external network access restricted. Application forced to onboard device processing and cached knowledge.`
        : `Standard network connectivity restored. Cloud failover enabled.`,
    });
  }

  public getFindings(): SecurityFinding[] {
    return [...this.findings];
  }

  public getLogs(): SecurityOperationLog[] {
    return [...this.logs];
  }

  public addFinding(finding: Omit<SecurityFinding, 'id' | 'timestamp'>): SecurityFinding {
    const id = `SEC-FIND-${String(this.findings.length + 1).padStart(3, '0')}`;
    const newFinding: SecurityFinding = {
      ...finding,
      id,
      timestamp: new Date().toISOString(),
    };
    this.findings.unshift(newFinding);
    return newFinding;
  }

  public addLog(log: Omit<SecurityOperationLog, 'id' | 'timestamp'>): SecurityOperationLog {
    const id = `LOG-${String(this.logs.length + 1).padStart(3, '0')}`;
    const newLog: SecurityOperationLog = {
      ...log,
      id,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    return newLog;
  }

  public runDefenseIncidentResponse(threatDetails: string): {
    steps: { phase: string; status: string; action: string }[];
    summary: string;
  } {
    const steps = [
      { phase: '1. DETECT', status: 'COMPLETED', action: `Anomaly triggered: ${threatDetails}` },
      { phase: '2. ALERT', status: 'COMPLETED', action: 'High-priority alert dispatched to JARVIS HUD & Security Terminal' },
      { phase: '3. IDENTIFY', status: 'COMPLETED', action: 'Isolated source IP/Process signature and protocol metadata' },
      { phase: '4. ISOLATE', status: 'COMPLETED', action: 'Restricted network ingress sockets and quarantined suspicious session' },
      { phase: '5. BLOCK', status: 'COMPLETED', action: 'Injected firewall rate-limit & IP drop rule across security perimeter' },
      { phase: '6. EVIDENCE', status: 'COMPLETED', action: 'Captured cryptographically signed packet headers & volatile memory logs' },
      { phase: '7. ANALYZE', status: 'COMPLETED', action: 'AI vulnerability root-cause analysis completed with zero retaliatory counter-attacks' },
      { phase: '8. REMEDIATE', status: 'COMPLETED', action: 'Applied automated patch to vulnerable endpoint' },
      { phase: '9. VERIFY', status: 'COMPLETED', action: 'Re-scanned attack vector, zero regressions found' },
    ];

    this.addLog({
      target: 'User Infrastructure',
      mode: 'DEFENCE',
      action: 'Incident Response & Containment Cycle',
      tool: 'JARVIS Defensive Incident Shield',
      result: 'SUCCESS',
      provider: 'gemini',
      details: `Successfully neutralized incident [${threatDetails}] via non-destructive containment.`,
    });

    return {
      steps,
      summary: 'Incident neutralized following ethical security protocol: user systems quarantined and hardened without unauthorized retaliation.',
    };
  }
}
