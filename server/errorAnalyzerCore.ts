/**
 * ULTRON Core Error Analyzer & Self-Correction Engine
 * 
 * 14 Canonical Error Classifications:
 * - AUTH_ERROR
 * - API_ERROR
 * - NETWORK_ERROR
 * - TIMEOUT
 * - FILE_NOT_FOUND
 * - PERMISSION_ERROR
 * - SYNTAX_ERROR
 * - BUILD_ERROR
 * - DEPENDENCY_ERROR
 * - RUNTIME_ERROR
 * - TOOL_UNAVAILABLE
 * - RUNTIME_UNAVAILABLE
 * - VERIFICATION_FAILED
 * - UNKNOWN_ERROR
 * 
 * Self-Correction & Bounded Recovery:
 * Limits maximum retries (default 3) to prevent infinite loops.
 */

import {
  ErrorClassification,
  ErrorAnalysis,
  RecoveryStrategy,
} from './types.js';

export class ErrorAnalyzerCore {
  private static instance: ErrorAnalyzerCore;
  private errorLog: ErrorAnalysis[] = [];

  private constructor() {}

  public static getInstance(): ErrorAnalyzerCore {
    if (!ErrorAnalyzerCore.instance) {
      ErrorAnalyzerCore.instance = new ErrorAnalyzerCore();
    }
    return ErrorAnalyzerCore.instance;
  }

  public analyze(err: unknown, context?: { target?: string; tool?: string; attempt?: number }): ErrorAnalysis {
    const rawMsg = err instanceof Error ? err.message : String(err || '');
    const msgLower = rawMsg.toLowerCase();

    let type: ErrorClassification = 'UNKNOWN_ERROR';
    let recoverable = false;
    let suggestedAction = 'Inspect system logs and retry with corrected parameters.';
    let recommendedRetryStrategy: ErrorAnalysis['recommendedRetryStrategy'] = 'ASK_USER';
    let safeFixPrompt: string | undefined;

    // 1. AUTH / API KEY ERRORS
    if (msgLower.includes('api_key') || msgLower.includes('unauthorized') || msgLower.includes('auth') || msgLower.includes('forbidden') || msgLower.includes('401') || msgLower.includes('403')) {
      type = 'AUTH_ERROR';
      recoverable = false;
      suggestedAction = 'Check that valid API keys or authentication credentials are provided in the environment.';
      recommendedRetryStrategy = 'FALLBACK_PROVIDER';
    }
    // 2. TIMEOUT
    else if (msgLower.includes('timeout') || msgLower.includes('timed out') || msgLower.includes('deadline_exceeded') || msgLower.includes('err_script_execution_timeout')) {
      type = 'TIMEOUT';
      recoverable = true;
      suggestedAction = 'Increase execution timeout or decompose task into smaller sub-tasks.';
      recommendedRetryStrategy = 'BACKOFF';
      safeFixPrompt = 'The previous execution timed out. Please simplify logic or optimize operations.';
    }
    // 3. FILE NOT FOUND
    else if (msgLower.includes('enoent') || msgLower.includes('file not found') || msgLower.includes('no such file') || msgLower.includes('not found')) {
      type = 'FILE_NOT_FOUND';
      recoverable = true;
      suggestedAction = 'Create the missing file or verify the correct relative path in VFS /projects.';
      recommendedRetryStrategy = 'IMMEDIATE';
      safeFixPrompt = `Target file "${context?.target || 'file'}" was not found. Scaffold the missing file first before accessing.`;
    }
    // 4. PERMISSION / SECURITY ERROR
    else if (msgLower.includes('permission') || msgLower.includes('security violation') || msgLower.includes('blocked') || msgLower.includes('unauthorized token')) {
      type = 'PERMISSION_ERROR';
      recoverable = false;
      suggestedAction = 'Operation requires higher permission level or violated sandbox security policy.';
      recommendedRetryStrategy = 'ASK_USER';
    }
    // 5. SYNTAX ERROR
    else if (msgLower.includes('syntaxerror') || msgLower.includes('unexpected token') || msgLower.includes('invalid syntax') || msgLower.includes('parse error')) {
      type = 'SYNTAX_ERROR';
      recoverable = true;
      suggestedAction = 'Fix code syntax error and re-evaluate.';
      recommendedRetryStrategy = 'IMMEDIATE';
      safeFixPrompt = `A syntax error occurred: "${rawMsg}". Fix the code syntax and ensure brackets and keywords are valid.`;
    }
    // 6. DEPENDENCY / MODULE NOT FOUND
    else if (msgLower.includes('cannot find module') || msgLower.includes('module not found') || msgLower.includes('importerror') || msgLower.includes('modulenotfounderror')) {
      type = 'DEPENDENCY_ERROR';
      recoverable = true;
      suggestedAction = 'Install the missing module or import from internal VFS sandbox files.';
      recommendedRetryStrategy = 'IMMEDIATE';
      safeFixPrompt = `Missing dependency detected: "${rawMsg}". Ensure the required module is bundled or implemented inline.`;
    }
    // 7. RUNTIME UNAVAILABLE
    else if (msgLower.includes('runtime unavailable') || msgLower.includes('compiler') || msgLower.includes('not installed')) {
      type = 'RUNTIME_UNAVAILABLE';
      recoverable = false;
      suggestedAction = 'Target compiler or language runtime is not installed in the container environment.';
      recommendedRetryStrategy = 'FALLBACK_TOOL';
    }
    // 8. TOOL UNAVAILABLE
    else if (msgLower.includes('tool unavailable') || msgLower.includes('tool not found')) {
      type = 'TOOL_UNAVAILABLE';
      recoverable = false;
      suggestedAction = 'Selected tool is not registered or unavailable in this environment.';
      recommendedRetryStrategy = 'FALLBACK_TOOL';
    }
    // 9. VERIFICATION FAILED
    else if (msgLower.includes('verification failed') || msgLower.includes('unverified') || msgLower.includes('checksum mismatch')) {
      type = 'VERIFICATION_FAILED';
      recoverable = true;
      suggestedAction = 'The generated artifact failed verification read-back. Inspect output and regenerate.';
      recommendedRetryStrategy = 'IMMEDIATE';
      safeFixPrompt = 'Verification failed because the resulting file or state did not match expected output.';
    }
    // 10. NETWORK ERROR
    else if (msgLower.includes('fetch failed') || msgLower.includes('econnrefused') || msgLower.includes('network') || msgLower.includes('502') || msgLower.includes('503')) {
      type = 'NETWORK_ERROR';
      recoverable = true;
      suggestedAction = 'Network connection failed. Retry with exponential backoff.';
      recommendedRetryStrategy = 'BACKOFF';
    }
    // 11. GENERAL RUNTIME ERROR
    else if (msgLower.includes('typeerror') || msgLower.includes('referenceerror') || msgLower.includes('runtime') || msgLower.includes('exit code 1')) {
      type = 'RUNTIME_ERROR';
      recoverable = true;
      suggestedAction = 'Inspect runtime traceback and patch the failing code line.';
      recommendedRetryStrategy = 'IMMEDIATE';
      safeFixPrompt = `Runtime exception: "${rawMsg}". Debug the error and patch the variables or function arguments.`;
    }

    const analysis: ErrorAnalysis = {
      type,
      message: rawMsg,
      recoverable,
      suggestedAction,
      recommendedRetryStrategy,
      safeFixPrompt,
      originalError: err,
    };

    this.errorLog.push(analysis);
    if (this.errorLog.length > 100) this.errorLog.shift();

    return analysis;
  }

  public getRecentErrors(limit = 10): ErrorAnalysis[] {
    return this.errorLog.slice(-limit);
  }
}
