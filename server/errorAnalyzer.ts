/**
 * ULTRON Error Classification & Recovery Engine
 * 
 * Classifies tool & execution failures:
 * - AUTH_ERROR
 * - API_ERROR
 * - NETWORK_ERROR
 * - TIMEOUT
 * - FILE_NOT_FOUND
 * - PERMISSION_ERROR
 * - SYNTAX_ERROR
 * - BUILD_ERROR
 * - DEPENDENCY_ERROR
 * - TOOL_UNAVAILABLE
 * - UNKNOWN_ERROR
 */

export type UltronErrorType =
  | 'AUTH_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'FILE_NOT_FOUND'
  | 'PERMISSION_ERROR'
  | 'SYNTAX_ERROR'
  | 'BUILD_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'TOOL_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export interface ClassifiedError {
  type: UltronErrorType;
  message: string;
  originalError: string;
  isRecoverable: boolean;
  suggestedAction: string;
  recoveryStrategy?: 'RETRY_WITH_BACKOFF' | 'FALLBACK_PROVIDER' | 'INSTALL_DEPENDENCY' | 'AUTO_FIX_SYNTAX' | 'PROMPT_USER_PERMISSION' | 'FAIL_HONESTLY';
}

export class ErrorAnalyzer {
  private static instance: ErrorAnalyzer;

  private constructor() {}

  public static getInstance(): ErrorAnalyzer {
    if (!ErrorAnalyzer.instance) {
      ErrorAnalyzer.instance = new ErrorAnalyzer();
    }
    return ErrorAnalyzer.instance;
  }

  public analyze(err: unknown, context?: { toolName?: string; command?: string; filePath?: string }): ClassifiedError {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const lower = rawMsg.toLowerCase();

    // 1. Permission errors
    if (lower.includes('permission denied') || lower.includes('eacces') || lower.includes('unauthorized') || lower.includes('level 3')) {
      return {
        type: 'PERMISSION_ERROR',
        message: `Operation permission denied: ${rawMsg}`,
        originalError: rawMsg,
        isRecoverable: false,
        suggestedAction: 'Request explicit user authorization for Level 2/3 sensitive operations.',
        recoveryStrategy: 'PROMPT_USER_PERMISSION',
      };
    }

    // 2. Auth / API Key missing
    if (lower.includes('api_key') || lower.includes('unauthenticated') || lower.includes('invalid api key')) {
      return {
        type: 'AUTH_ERROR',
        message: `Authentication or API key error: ${rawMsg}`,
        originalError: rawMsg,
        isRecoverable: true,
        suggestedAction: 'Check environment API key variables in .env or switch to local offline provider.',
        recoveryStrategy: 'FALLBACK_PROVIDER',
      };
    }

    // 3. File not found
    if (lower.includes('enoent') || lower.includes('file not found') || lower.includes('does not exist')) {
      return {
        type: 'FILE_NOT_FOUND',
        message: `File or path not found: ${context?.filePath || rawMsg}`,
        originalError: rawMsg,
        isRecoverable: true,
        suggestedAction: 'Verify file path inside /projects or /sandbox, or initialize file with create_file.',
        recoveryStrategy: 'RETRY_WITH_BACKOFF',
      };
    }

    // 4. Missing dependency
    if (lower.includes('cannot find module') || lower.includes('modulenotfounderror') || lower.includes('no module named')) {
      const match = rawMsg.match(/cannot find module '([^']+)'|no module named '([^']+)'/i);
      const pkg = match ? match[1] || match[2] : 'unknown-package';
      return {
        type: 'DEPENDENCY_ERROR',
        message: `Missing dependency detected: ${pkg}`,
        originalError: rawMsg,
        isRecoverable: true,
        suggestedAction: `Install dependency '${pkg}' into the project workspace.`,
        recoveryStrategy: 'INSTALL_DEPENDENCY',
      };
    }

    // 5. Syntax or Parse Error
    if (lower.includes('syntaxerror') || lower.includes('unexpected token') || lower.includes('indentationerror')) {
      return {
        type: 'SYNTAX_ERROR',
        message: `Code syntax error detected: ${rawMsg}`,
        originalError: rawMsg,
        isRecoverable: true,
        suggestedAction: 'Auto-correct AST or fix syntax indentation and test in sandbox.',
        recoveryStrategy: 'AUTO_FIX_SYNTAX',
      };
    }

    // 6. Build / Compilation Error
    if (lower.includes('build failed') || lower.includes('tsc error') || lower.includes('compilation error')) {
      return {
        type: 'BUILD_ERROR',
        message: `Build compilation failure: ${rawMsg}`,
        originalError: rawMsg,
        isRecoverable: true,
        suggestedAction: 'Inspect compiler output and repair type or import mismatches.',
        recoveryStrategy: 'AUTO_FIX_SYNTAX',
      };
    }

    // 7. Timeout
    if (lower.includes('timed out') || lower.includes('timeout') || lower.includes('etimedout')) {
      return {
        type: 'TIMEOUT',
        message: `Operation timed out: ${rawMsg}`,
        originalError: rawMsg,
        isRecoverable: true,
        suggestedAction: 'Retry execution with higher timeout limit or optimized sub-task.',
        recoveryStrategy: 'RETRY_WITH_BACKOFF',
      };
    }

    // 8. Network or connectivity
    if (lower.includes('enotfound') || lower.includes('econnrefused') || lower.includes('fetch failed')) {
      return {
        type: 'NETWORK_ERROR',
        message: `Network communication error: ${rawMsg}`,
        originalError: rawMsg,
        isRecoverable: true,
        suggestedAction: 'Check network connectivity or use cached offline intelligence.',
        recoveryStrategy: 'RETRY_WITH_BACKOFF',
      };
    }

    // 9. Tool unavailable
    if (lower.includes('unavailable') || lower.includes('not configured') || lower.includes('not supported in runtime')) {
      return {
        type: 'TOOL_UNAVAILABLE',
        message: `Tool runtime capability unavailable: ${rawMsg}`,
        originalError: rawMsg,
        isRecoverable: false,
        suggestedAction: 'Report capability limitation honestly without fake simulation.',
        recoveryStrategy: 'FAIL_HONESTLY',
      };
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: rawMsg,
      originalError: rawMsg,
      isRecoverable: false,
      suggestedAction: 'Review execution trace and log details.',
      recoveryStrategy: 'FAIL_HONESTLY',
    };
  }
}
