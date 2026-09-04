import { PermissionLevel } from '../src/types/jarvis.js';

export interface ActionApprovalRequest {
  id: string;
  actionType: string;
  target: string;
  description: string;
  requiredLevel: PermissionLevel;
  parameters?: Record<string, any>;
  isDangerous: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  decidedAt?: string;
}

export class PermissionEngine {
  private static instance: PermissionEngine;
  private currentGlobalLevel: PermissionLevel = 2; // Level 2: Execute normal actions by default
  private pendingApprovals: Map<string, ActionApprovalRequest> = new Map();
  private sensitiveActionsList = [
    'DELETE_FILE',
    'PURCHASE',
    'SEND_MESSAGE',
    'MODIFY_SECURITY_SETTINGS',
    'LOCKDOWN_TOGGLE',
    'EXECUTE_DESTRUCTIVE_SCRIPT',
    'TERMINATE_SYSTEM_PROCESS',
    'WIPE_PROJECT_MEMORY',
    'DROP_DATABASE',
  ];

  private constructor() {}

  public static getInstance(): PermissionEngine {
    if (!PermissionEngine.instance) {
      PermissionEngine.instance = new PermissionEngine();
    }
    return PermissionEngine.instance;
  }

  public getGlobalLevel(): PermissionLevel {
    return this.currentGlobalLevel;
  }

  public setGlobalLevel(level: PermissionLevel): void {
    this.currentGlobalLevel = level;
  }

  public isActionSensitive(actionType: string): boolean {
    return this.sensitiveActionsList.some(
      (sens) => sens.toLowerCase() === actionType.toLowerCase() || actionType.toLowerCase().includes('delete')
    );
  }

  public checkPermission(actionType: string, target: string, requestedLevel: PermissionLevel = 2): {
    allowed: boolean;
    requiresConfirmation: boolean;
    reason: string;
    approvalId?: string;
  } {
    const isSensitive = this.isActionSensitive(actionType) || requestedLevel >= 3;

    // Level 0: Observe only
    if (this.currentGlobalLevel === 0) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: 'Permission Level 0 (Observe Only) is active. No execution permitted.',
      };
    }

    // Level 1: Suggest only
    if (this.currentGlobalLevel === 1) {
      return {
        allowed: false,
        requiresConfirmation: true,
        reason: 'Permission Level 1 (Suggest Only) is active. Action can only be recommended, not executed automatically.',
      };
    }

    // Sensitive actions ALWAYS require Level 3 confirmation
    if (isSensitive) {
      const approval = this.createApprovalRequest(actionType, target, `Sensitive operation on ${target} requires manual confirmation`, 3, true);
      return {
        allowed: false,
        requiresConfirmation: true,
        reason: `Sensitive action "${actionType}" requires explicit user confirmation (Level 3 constraint).`,
        approvalId: approval.id,
      };
    }

    // Normal actions allowed under Level 2+
    return {
      allowed: true,
      requiresConfirmation: false,
      reason: `Action permitted under current Level ${this.currentGlobalLevel}.`,
    };
  }

  public createApprovalRequest(
    actionType: string,
    target: string,
    description: string,
    requiredLevel: PermissionLevel = 3,
    isDangerous = false,
    parameters?: Record<string, any>
  ): ActionApprovalRequest {
    const id = `APPR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const req: ActionApprovalRequest = {
      id,
      actionType,
      target,
      description,
      requiredLevel,
      parameters,
      isDangerous,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };
    this.pendingApprovals.set(id, req);
    return req;
  }

  public resolveApproval(id: string, approved: boolean): boolean {
    const req = this.pendingApprovals.get(id);
    if (!req) return false;
    req.status = approved ? 'APPROVED' : 'REJECTED';
    req.decidedAt = new Date().toISOString();
    return true;
  }

  public getPendingApprovals(): ActionApprovalRequest[] {
    return Array.from(this.pendingApprovals.values()).filter((a) => a.status === 'PENDING');
  }

  public getAllApprovals(): ActionApprovalRequest[] {
    return Array.from(this.pendingApprovals.values()).sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }
}
