/**
 * ULTRON Evidence-Based Verification Engine
 * 
 * Strict Mandate:
 * ULTRON must NEVER say "Done" unless the requested action has actually been verified
 * with tangible cryptographic/filesystem/execution evidence.
 */

import { FileSystemManager } from './vfsFileSystemManager.js';
import { CodeSandbox } from './codeSandbox.js';

export interface VerificationEvidence {
  verified: boolean;
  action: string;
  target: string;
  evidenceType: 'FILE_EXISTS_AND_MATCHES' | 'CODE_EXEC_SUCCESS' | 'TEST_SUITE_PASSED' | 'WEB_RESULTS_VALIDATED' | 'UNAVAILABLE_LIMITATION_REPORTED';
  details: string;
  dataSnippet?: string;
  timestamp: string;
}

export class EvidenceVerifier {
  private static instance: EvidenceVerifier;

  private constructor() {}

  public static getInstance(): EvidenceVerifier {
    if (!EvidenceVerifier.instance) {
      EvidenceVerifier.instance = new EvidenceVerifier();
    }
    return EvidenceVerifier.instance;
  }

  /**
   * Verifies file creation by checking existence and verifying content match
   */
  public async verifyFileCreation(filePath: string, expectedContent?: string): Promise<VerificationEvidence> {
    const vfs = FileSystemManager.getInstance();
    const readRes = await vfs.readFile(filePath);

    if (!readRes.success || !readRes.data) {
      return {
        verified: false,
        action: 'create_file',
        target: filePath,
        evidenceType: 'FILE_EXISTS_AND_MATCHES',
        details: `Verification failed: File ${filePath} was not found in VFS filesystem after creation attempt. Error: ${readRes.error || readRes.message}`,
        timestamp: new Date().toISOString(),
      };
    }

    const content = readRes.data.content || '';
    if (expectedContent && expectedContent.trim().length > 0) {
      const match = content.includes(expectedContent.trim().slice(0, 50));
      if (!match) {
        return {
          verified: false,
          action: 'create_file',
          target: filePath,
          evidenceType: 'FILE_EXISTS_AND_MATCHES',
          details: `Verification warning: File ${filePath} exists, but content did not match expected payload.`,
          dataSnippet: content.slice(0, 100),
          timestamp: new Date().toISOString(),
        };
      }
    }

    return {
      verified: true,
      action: 'create_file',
      target: filePath,
      evidenceType: 'FILE_EXISTS_AND_MATCHES',
      details: `Verified file ${filePath} (${content.length} bytes) exists in secure VFS storage.`,
      dataSnippet: content.slice(0, 200),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verifies code execution output and return code
   */
  public async verifyCodeExecution(code: string, language = 'javascript'): Promise<VerificationEvidence> {
    const sandbox = CodeSandbox.getInstance();
    const res = await sandbox.runCode(code, language, { timeoutMs: 4000 });

    if (res.exitCode !== 0 || res.status !== 'SUCCESS') {
      return {
        verified: false,
        action: 'run_code',
        target: language,
        evidenceType: 'CODE_EXEC_SUCCESS',
        details: `Execution failed with error: ${res.error || res.stderr || 'Non-zero exit'}`,
        dataSnippet: res.stderr,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      verified: true,
      action: 'run_code',
      target: language,
      evidenceType: 'CODE_EXEC_SUCCESS',
      details: `Execution succeeded in ${res.durationMs}ms with exit code 0.`,
      dataSnippet: res.stdout,
      timestamp: new Date().toISOString(),
    };
  }
}
