/**
 * ULTRON Core Permission Manager
 * 
 * Server-Side Authoritative Permission System:
 * - Level 0: Read-only operations (always allowed)
 * - Level 1: Standard sandboxed modifications (create file in VFS, run sandbox code)
 * - Level 2: Sensitive operations (delete file, external network, package installation)
 * - Level 3: Destructive/High-privilege actions (wipe directory, system termination)
 * 
 * Hard Security Directive:
 * Permissions are calculated and validated exclusively on the server.
 * Never trust client-supplied privilege claims.
 */

import { PermissionLevel, PermissionCheckResult } from './types.js';

export interface ActionApprovalRequest {
  id: string;
  actionName: string;
  requiredLevel: PermissionLevel;
  params: Record<string, unknown>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  timestamp: string;
  expiresAt: string;
  reason: string;
}

export class PermissionManager {
  private static instance: PermissionManager;
  private currentServerLevel: PermissionLevel = 1; // Default active level
  private pendingApprovals: Map<string, ActionApprovalRequest> = new Map();

  private constructor() {}

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  public getServerPermissionLevel(): PermissionLevel {
    return this.currentServerLevel;
  }

  public setServerPermissionLevel(level: PermissionLevel): void {
    this.currentServerLevel = level;
  }

  /**
   * Authoritative server-side permission evaluation
   */
  public evaluate(
    actionName: string,
    requiredLevel: PermissionLevel,
    context?: { autoApproveLevel?: PermissionLevel; isDangerous?: boolean }
  ): PermissionCheckResult {
    const effectiveLevel = Math.max(this.currentServerLevel, context?.autoApproveLevel ?? 0) as PermissionLevel;

    // Read-only (Level 0) always allowed
    if (requiredLevel === 0) {
      return {
        allowed: true,
        requiredLevel: 0,
        currentLevel: effectiveLevel,
        requiresConfirmation: false,
        reason: 'Read-only operation allowed.',
      };
    }

    // If active server level meets or exceeds required level
    if (effectiveLevel >= requiredLevel && requiredLevel < 3) {
      return {
        allowed: true,
        requiredLevel,
        currentLevel: effectiveLevel,
        requiresConfirmation: false,
        reason: `Operation permitted under authorization level ${effectiveLevel}.`,
      };
    }

    // Level 3 (Dangerous) or insufficient level requires explicit confirmation approval
    const approvalId = `APPR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const expires = new Date(now.getTime() + 5 * 60 * 1000); // 5 min expiry

    const approvalReq: ActionApprovalRequest = {
      id: approvalId,
      actionName,
      requiredLevel,
      params: {},
      status: 'PENDING',
      timestamp: now.toISOString(),
      expiresAt: expires.toISOString(),
      reason: `Action "${actionName}" requires Permission Level ${requiredLevel}, current is ${effectiveLevel}.`,
    };

    this.pendingApprovals.set(approvalId, approvalReq);

    return {
      allowed: false,
      requiredLevel,
      currentLevel: effectiveLevel,
      requiresConfirmation: true,
      approvalId,
      reason: `Action "${actionName}" requires explicit confirmation (Permission Level ${requiredLevel}).`,
    };
  }

  public approveAction(approvalId: string): boolean {
    const req = this.pendingApprovals.get(approvalId);
    if (!req || req.status !== 'PENDING') return false;
    req.status = 'APPROVED';
    return true;
  }

  public rejectAction(approvalId: string): boolean {
    const req = this.pendingApprovals.get(approvalId);
    if (!req || req.status !== 'PENDING') return false;
    req.status = 'REJECTED';
    return true;
  }

  public getPendingApprovals(): ActionApprovalRequest[] {
    const now = new Date().toISOString();
    return Array.from(this.pendingApprovals.values()).filter(
      (a) => a.status === 'PENDING' && a.expiresAt > now
    );
  }
}
