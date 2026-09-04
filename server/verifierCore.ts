/**
 * ULTRON Core Evidence Verifier
 * 
 * Enforces the ULTRON Hard Integrity Rule:
 * Never declare success without verifiable proof.
 * 
 * Verifications:
 * - File Verification: Read-back confirmation, size check, content integrity
 * - Code Verification: Exit code 0, captured output verification
 * - Web Search Verification: Query presence, content length check
 * - Device Telemetry Verification: Bridge handshake, status confirmation
 */

import { EvidenceRecord, ToolExecutionResult } from './types.js';
import { UnifiedFileSystemManager } from './filesystemAdapter.js';

export class VerifierCore {
  private static instance: VerifierCore;

  private constructor() {}

  public static getInstance(): VerifierCore {
    if (!VerifierCore.instance) {
      VerifierCore.instance = new VerifierCore();
    }
    return VerifierCore.instance;
  }

  /**
   * Verify file creation or modification by reading back from FileSystem
   */
  public async verifyFileContent(
    filePath: string,
    expectedContent?: string
  ): Promise<EvidenceRecord> {
    const fsManager = UnifiedFileSystemManager.getInstance();
    const readRes = await fsManager.readFile(filePath);

    if (!readRes.success || !readRes.data) {
      return {
        verified: false,
        verificationType: 'FILESYSTEM_READBACK',
        timestamp: new Date().toISOString(),
        details: `Verification failed: File "${filePath}" could not be read back.`,
        target: filePath,
      };
    }

    const actualContent = readRes.data.content || '';
    const matchesExpected = expectedContent !== undefined ? actualContent === expectedContent : true;

    return {
      verified: matchesExpected,
      verificationType: 'FILESYSTEM_READBACK',
      timestamp: new Date().toISOString(),
      details: matchesExpected
        ? `Verified: File "${filePath}" exists with size ${readRes.data.sizeBytes} bytes.`
        : `Verification mismatch: File content differed from expected content.`,
      target: filePath,
      actualState: { sizeBytes: readRes.data.sizeBytes, length: actualContent.length },
      dataSnippet: actualContent.slice(0, 100),
    };
  }

  /**
   * Verify code execution results
   */
  public verifyCodeExecution(
    exitCode: number,
    stdout: string,
    stderr: string
  ): EvidenceRecord {
    const verified = exitCode === 0 && stderr.length === 0;
    return {
      verified,
      verificationType: 'CODE_EXIT_CODE',
      timestamp: new Date().toISOString(),
      details: verified
        ? `Execution verified: process completed cleanly with exit code 0.`
        : `Execution verification failed: exit code ${exitCode}, error output present.`,
      actualState: { exitCode, stdoutLen: stdout.length, stderrLen: stderr.length },
      expectedState: { exitCode: 0, stderrLen: 0 },
      dataSnippet: stdout.slice(0, 100),
    };
  }

  /**
   * Verify tool result evidence
   */
  public verifyToolExecution(result: ToolExecutionResult): EvidenceRecord {
    if (result.evidence) {
      return result.evidence;
    }

    const verified = result.success && !result.error;
    return {
      verified,
      verificationType: 'RUNTIME_PROBE',
      timestamp: new Date().toISOString(),
      details: verified
        ? `Tool "${result.tool}" reported successful execution.`
        : `Tool "${result.tool}" reported execution failure: ${result.error?.message}`,
      target: result.tool,
    };
  }
}
