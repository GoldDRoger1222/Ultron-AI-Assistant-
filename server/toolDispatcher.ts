import { FileSystemManager } from './vfsFileSystemManager.js';
import { CodeSandbox } from './codeSandbox.js';
import { InternetIntelligenceEngine } from './internetIntelligence.js';
import { SecuritySentinelEngine } from './securitySentinel.js';
import { PermissionEngine } from './permissions.js';

export interface ToolCallRequest {
  tool: string;
  arguments: Record<string, any>;
  callId?: string;
  requester?: string;
}

export interface ToolExecutionResponse<T = any> {
  success: boolean;
  tool: string;
  callId?: string;
  result?: T;
  stdout?: string;
  stderr?: string;
  error?: string;
  executionTimeMs: number;
  securityViolation?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: 'FILE_MANAGER' | 'CODE_RUNNER' | 'WEB_SEARCH' | 'SYSTEM';
  permissionLevel: number; // 1: Read/Safe, 2: Write/Execute, 3: Destructive
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; required?: boolean }>;
    required: string[];
  };
}

/**
 * ULTRON Tool Dispatcher & Tool Bridge
 * Architecture:
 *   AI / LLM Core -> Intent Router -> Agent Orchestrator -> Tool Dispatcher
 *                                                                │
 *               ┌────────────────────────┬───────────────────────┴───────────────────────┐
 *               ↓                        ↓                                               ↓
 *       File System Manager         Code Runner                                     Web / Search
 *        (ULTRON VFS)              (Code Sandbox)                                    (Internet)
 */
export class ToolDispatcher {
  private static instance: ToolDispatcher;
  private vfs: FileSystemManager;
  private sandbox: CodeSandbox;
  private toolsCatalog: Map<string, ToolDefinition> = new Map();

  private constructor() {
    this.vfs = FileSystemManager.getInstance();
    this.sandbox = CodeSandbox.getInstance();
    this.registerToolDefinitions();
  }

  public static getInstance(): ToolDispatcher {
    if (!ToolDispatcher.instance) {
      ToolDispatcher.instance = new ToolDispatcher();
    }
    return ToolDispatcher.instance;
  }

  private registerToolDefinitions() {
    const definitions: ToolDefinition[] = [
      // 1. File System Manager Tools (VFS)
      {
        name: 'create_file',
        description: 'Creates a new file in the ULTRON VFS (/projects, /temp, /sandbox) with content.',
        category: 'FILE_MANAGER',
        permissionLevel: 2,
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'VFS Path starting with /projects, /temp, or /sandbox', required: true },
            content: { type: 'string', description: 'Initial file content string', required: true },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'read_file',
        description: 'Reads the contents of a file in the ULTRON VFS.',
        category: 'FILE_MANAGER',
        permissionLevel: 1,
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'VFS Path to read', required: true },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Overwrites or creates a file in the ULTRON VFS.',
        category: 'FILE_MANAGER',
        permissionLevel: 2,
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'VFS Path to write', required: true },
            content: { type: 'string', description: 'New file content', required: true },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'edit_file',
        description: 'Replaces specific target text or edits a file in the ULTRON VFS.',
        category: 'FILE_MANAGER',
        permissionLevel: 2,
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'VFS Path of the file', required: true },
            old_content: { type: 'string', description: 'Target substring to replace (or empty for full replace)' },
            new_content: { type: 'string', description: 'Replacement content', required: true },
          },
          required: ['path', 'new_content'],
        },
      },
      {
        name: 'list_files',
        description: 'Lists all files and directories in a VFS folder (/projects, /temp, /sandbox).',
        category: 'FILE_MANAGER',
        permissionLevel: 1,
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Directory path (defaults to /projects)' },
            recursive: { type: 'boolean', description: 'Whether to list recursively (defaults to true)' },
          },
          required: [],
        },
      },
      {
        name: 'delete_file',
        description: 'Deletes a file or subfolder in the ULTRON VFS. Root partitions cannot be deleted.',
        category: 'FILE_MANAGER',
        permissionLevel: 3,
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'VFS Path to delete', required: true },
          },
          required: ['path'],
        },
      },

      // 2. Code Runner Tools (Sandbox)
      {
        name: 'run_code',
        description: 'Executes JavaScript, TypeScript, Python, or shell code in the isolated ULTRON Sandbox.',
        category: 'CODE_RUNNER',
        permissionLevel: 2,
        parameters: {
          type: 'object',
          properties: {
            language: { type: 'string', description: 'Language: javascript, typescript, python, or bash' },
            code: { type: 'string', description: 'Source code or command to execute', required: true },
            timeoutMs: { type: 'number', description: 'Optional execution timeout (default 5000ms)' },
          },
          required: ['code'],
        },
      },
      {
        name: 'run_test',
        description: 'Runs automated unit test assertions against source code in the Sandbox runtime.',
        category: 'CODE_RUNNER',
        permissionLevel: 2,
        parameters: {
          type: 'object',
          properties: {
            language: { type: 'string', description: 'Language: javascript or typescript' },
            code: { type: 'string', description: 'Source code defining functions or classes', required: true },
            test_code: { type: 'string', description: 'Test assertions code utilizing assert(condition, message)', required: true },
          },
          required: ['code', 'test_code'],
        },
      },
      {
        name: 'get_output',
        description: 'Retrieves stdout from the last or specified sandbox execution.',
        category: 'CODE_RUNNER',
        permissionLevel: 1,
        parameters: {
          type: 'object',
          properties: {
            executionId: { type: 'string', description: 'Optional execution ID' },
          },
          required: [],
        },
      },
      {
        name: 'get_error',
        description: 'Retrieves stderr or error message from the last or specified sandbox execution.',
        category: 'CODE_RUNNER',
        permissionLevel: 1,
        parameters: {
          type: 'object',
          properties: {
            executionId: { type: 'string', description: 'Optional execution ID' },
          },
          required: [],
        },
      },

      // 3. Web & Search Tools (Internet)
      {
        name: 'web_search',
        description: 'Searches real-time internet sources for documentation, APIs, and latest facts.',
        category: 'WEB_SEARCH',
        permissionLevel: 1,
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search keywords or question', required: true },
          },
          required: ['query'],
        },
      },
    ];

    for (const tool of definitions) {
      this.toolsCatalog.set(tool.name, tool);
    }
  }

  /**
   * Retrieves full catalog of available tools with parameter signatures
   */
  public getCatalog(): ToolDefinition[] {
    return Array.from(this.toolsCatalog.values());
  }

  /**
   * Dispatch and execute a single tool call from LLM
   */
  public async dispatchTool(call: ToolCallRequest): Promise<ToolExecutionResponse> {
    const start = Date.now();
    const toolName = (call.tool || '').trim();
    const args = call.arguments || {};

    const toolDef = this.toolsCatalog.get(toolName);
    if (!toolDef) {
      return {
        success: false,
        tool: toolName,
        callId: call.callId,
        error: `Unknown tool: "${toolName}". Available tools: ${Array.from(this.toolsCatalog.keys()).join(', ')}`,
        executionTimeMs: Date.now() - start,
      };
    }

    try {
      switch (toolName) {
        // --- VFS File Manager ---
        case 'create_file': {
          const filePath = args.path || args.filePath || '';
          const content = args.content !== undefined ? String(args.content) : '';
          const res = this.vfs.create_file(filePath, content);
          return {
            success: res.success,
            tool: toolName,
            callId: call.callId,
            result: res.data || res.message,
            error: res.error,
            securityViolation: res.securityViolation,
            executionTimeMs: Date.now() - start,
          };
        }

        case 'read_file': {
          const filePath = args.path || args.filePath || '';
          const res = this.vfs.read_file(filePath);
          return {
            success: res.success,
            tool: toolName,
            callId: call.callId,
            result: res.data,
            error: res.error,
            securityViolation: res.securityViolation,
            executionTimeMs: Date.now() - start,
          };
        }

        case 'write_file': {
          const filePath = args.path || args.filePath || '';
          const content = args.content !== undefined ? String(args.content) : '';
          const res = this.vfs.write_file(filePath, content);
          return {
            success: res.success,
            tool: toolName,
            callId: call.callId,
            result: res.data || res.message,
            error: res.error,
            securityViolation: res.securityViolation,
            executionTimeMs: Date.now() - start,
          };
        }

        case 'edit_file': {
          const filePath = args.path || args.filePath || '';
          const oldContent = args.old_content || args.oldContent || args.targetContent || '';
          const newContent = args.new_content || args.newContent || args.replacementContent || '';
          const res = this.vfs.edit_file(filePath, oldContent, newContent);
          return {
            success: res.success,
            tool: toolName,
            callId: call.callId,
            result: res.data || res.message,
            error: res.error,
            securityViolation: res.securityViolation,
            executionTimeMs: Date.now() - start,
          };
        }

        case 'list_files': {
          const dirPath = args.path || args.dirPath || '/projects';
          const recursive = args.recursive !== undefined ? Boolean(args.recursive) : true;
          const res = this.vfs.list_files(dirPath, recursive);
          return {
            success: res.success,
            tool: toolName,
            callId: call.callId,
            result: res.data,
            error: res.error,
            securityViolation: res.securityViolation,
            executionTimeMs: Date.now() - start,
          };
        }

        case 'delete_file': {
          const filePath = args.path || args.filePath || '';
          const res = this.vfs.delete_file(filePath);
          return {
            success: res.success,
            tool: toolName,
            callId: call.callId,
            result: res.data || res.message,
            error: res.error,
            securityViolation: res.securityViolation,
            executionTimeMs: Date.now() - start,
          };
        }

        // --- Sandbox Code Runner ---
        case 'run_code': {
          const language = args.language || 'javascript';
          const code = args.code || '';
          const timeoutMs = args.timeoutMs || 5000;
          const execRes = await this.sandbox.run_code(language, code, { timeoutMs });
          return {
            success: execRes.status === 'SUCCESS',
            tool: toolName,
            callId: call.callId,
            stdout: execRes.stdout,
            stderr: execRes.stderr,
            result: {
              id: execRes.id,
              exitCode: execRes.exitCode,
              durationMs: execRes.durationMs,
              status: execRes.status,
            },
            error: execRes.error,
            securityViolation: execRes.status === 'SECURITY_BLOCKED',
            executionTimeMs: Date.now() - start,
          };
        }

        case 'run_test': {
          const language = args.language || 'javascript';
          const code = args.code || '';
          const testCode = args.test_code || args.testCode || '';
          const testRes = await this.sandbox.run_test(language, code, testCode);
          return {
            success: testRes.passed,
            tool: toolName,
            callId: call.callId,
            stdout: testRes.stdout,
            stderr: testRes.stderr,
            result: testRes,
            error: !testRes.passed ? `${testRes.failedTests} tests failed` : undefined,
            executionTimeMs: Date.now() - start,
          };
        }

        case 'get_output': {
          const executionId = args.executionId;
          const output = this.sandbox.get_output(executionId);
          return {
            success: true,
            tool: toolName,
            callId: call.callId,
            stdout: output,
            result: output,
            executionTimeMs: Date.now() - start,
          };
        }

        case 'get_error': {
          const executionId = args.executionId;
          const errorMsg = this.sandbox.get_error(executionId);
          return {
            success: true,
            tool: toolName,
            callId: call.callId,
            stderr: errorMsg || undefined,
            result: errorMsg,
            executionTimeMs: Date.now() - start,
          };
        }

        // --- Web Search & Internet ---
        case 'web_search': {
          const query = args.query || '';
          const net = InternetIntelligenceEngine.getInstance();
          const searchRes = await net.executeUniversalResearch(query);
          return {
            success: true,
            tool: toolName,
            callId: call.callId,
            result: {
              query,
              summary: searchRes.simpleSummary,
              analysis: searchRes.detailedAnalysis,
              sources: searchRes.sources,
            },
            executionTimeMs: Date.now() - start,
          };
        }

        default:
          return {
            success: false,
            tool: toolName,
            callId: call.callId,
            error: `Tool handler for "${toolName}" not implemented.`,
            executionTimeMs: Date.now() - start,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        tool: toolName,
        callId: call.callId,
        error: err.message || String(err),
        executionTimeMs: Date.now() - start,
      };
    }
  }
}
