import path from 'path';

export interface VFSFileNode {
  name: string;
  path: string; // e.g. "/projects/app.js"
  type: 'file' | 'directory';
  content?: string;
  sizeBytes: number;
  updatedAt: string;
  createdAt: string;
  extension?: string;
  isReadOnly?: boolean;
}

export interface VFSResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  securityViolation?: boolean;
}

export interface VFSTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes: number;
  updatedAt: string;
  children?: VFSTreeNode[];
}

export interface VFSStat {
  exists: boolean;
  type?: 'file' | 'directory';
  sizeBytes?: number;
  updatedAt?: string;
  createdAt?: string;
  path?: string;
}

/**
 * ULTRON Virtual File System (VFS)
 * Strict Isolated Sandbox Root:
 *   ├── projects/   (User & Autonomous AI build workspaces)
 *   ├── temp/       (Temporary scratchpad & transient files)
 *   └── sandbox/    (Execution artifacts & runtime test outputs)
 * 
 * Strict Security Guarantees:
 * ❌ No access to host OS root (/etc, /sys, /proc, /root, /home, etc.)
 * ❌ No path traversal (../) out of VFS root
 * ❌ No reading secret files (.env, id_rsa, credentials, auth tokens)
 * ❌ No unpermitted destructive bulk operations
 */
export class FileSystemManager {
  private static instance: FileSystemManager;
  private storage: Map<string, VFSFileNode> = new Map();

  // Permitted root partitions
  private readonly ALLOWED_ROOTS = ['/projects', '/temp', '/sandbox'];

  // Forbidden substrings / sensitive patterns
  private readonly FORBIDDEN_PATTERNS = [
    '/etc',
    '/proc',
    '/sys',
    '/root',
    '/home',
    '/bin',
    '/sbin',
    '/usr',
    '/dev',
    '.env',
    'id_rsa',
    'id_ed25519',
    '.ssh',
    'aws_credentials',
    'serviceAccountKey',
    'node_modules',
  ];

  private constructor() {
    this.seedDefaultFileSystem();
  }

  public static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager();
    }
    return FileSystemManager.instance;
  }

  private seedDefaultFileSystem() {
    const now = new Date().toISOString();

    // 1. Root directories
    this.storage.set('/projects', {
      name: 'projects',
      path: '/projects',
      type: 'directory',
      sizeBytes: 4096,
      updatedAt: now,
      createdAt: now,
    });
    this.storage.set('/temp', {
      name: 'temp',
      path: '/temp',
      type: 'directory',
      sizeBytes: 4096,
      updatedAt: now,
      createdAt: now,
    });
    this.storage.set('/sandbox', {
      name: 'sandbox',
      path: '/sandbox',
      type: 'directory',
      sizeBytes: 4096,
      updatedAt: now,
      createdAt: now,
    });

    // 2. Starter workspace files in /projects
    this.storage.set('/projects/calculator.js', {
      name: 'calculator.js',
      path: '/projects/calculator.js',
      type: 'file',
      content: `// ULTRON Autonomous Calculator Module
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

module.exports = { add, subtract, multiply, divide };
`,
      sizeBytes: 295,
      updatedAt: now,
      createdAt: now,
      extension: 'js',
    });

    this.storage.set('/projects/calculator.test.js', {
      name: 'calculator.test.js',
      path: '/projects/calculator.test.js',
      type: 'file',
      content: `// Unit Tests for Calculator Module
const { add, subtract, multiply, divide } = require('./calculator.js');

function runTests() {
  const assert = (condition, msg) => {
    if (!condition) throw new Error("Test Failed: " + msg);
  };

  assert(add(2, 3) === 5, "2 + 3 should equal 5");
  assert(subtract(10, 4) === 6, "10 - 4 should equal 6");
  assert(multiply(3, 7) === 21, "3 * 7 should equal 21");
  assert(divide(15, 3) === 5, "15 / 3 should equal 5");
  console.log("All Calculator tests passed successfully!");
}

runTests();
`,
      sizeBytes: 520,
      updatedAt: now,
      createdAt: now,
      extension: 'js',
    });

    this.storage.set('/sandbox/welcome.txt', {
      name: 'welcome.txt',
      path: '/sandbox/welcome.txt',
      type: 'file',
      content: 'ULTRON Virtual File System & Code Sandbox active.\nRoot Confined: /projects, /temp, /sandbox\nHost System Protected: 100%',
      sizeBytes: 120,
      updatedAt: now,
      createdAt: now,
      extension: 'txt',
    });

    this.storage.set('/temp/scratchpad.json', {
      name: 'scratchpad.json',
      path: '/temp/scratchpad.json',
      type: 'file',
      content: '{\n  "status": "ready",\n  "activeSessions": 0\n}',
      sizeBytes: 42,
      updatedAt: now,
      createdAt: now,
      extension: 'json',
    });
  }

  /**
   * Sanitizes and validates path within ULTRON VFS boundary
   */
  public sanitizePath(rawPath: string): { valid: boolean; normalizedPath: string; error?: string } {
    if (!rawPath || typeof rawPath !== 'string') {
      return { valid: false, normalizedPath: '', error: 'Path is required' };
    }

    // Convert Windows backslashes and normalize
    let clean = rawPath.replace(/\\/g, '/').trim();

    // Ensure leading slash
    if (!clean.startsWith('/')) {
      clean = '/' + clean;
    }

    // Resolve dots without letting it escape
    const normalized = path.posix.normalize(clean);

    // Check for traversal out of root
    if (normalized.includes('..') || normalized === '/' || normalized === '.') {
      return {
        valid: false,
        normalizedPath: normalized,
        error: 'Security Violation: Path traversal outside ULTRON VFS root is strictly forbidden.',
      };
    }

    // Check against forbidden system paths
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (normalized.toLowerCase().includes(pattern.toLowerCase())) {
        return {
          valid: false,
          normalizedPath: normalized,
          error: `Security Violation: Access to "${pattern}" or host system resources is blocked.`,
        };
      }
    }

    // Must belong to one of the allowed roots
    const isAllowedRoot = this.ALLOWED_ROOTS.some(
      (root) => normalized === root || normalized.startsWith(`${root}/`)
    );

    if (!isAllowedRoot) {
      return {
        valid: false,
        normalizedPath: normalized,
        error: `Security Violation: Path "${normalized}" is outside allowed VFS partitions (/projects, /temp, /sandbox).`,
      };
    }

    return { valid: true, normalizedPath: normalized };
  }

  /**
   * 1. create_file(path, content)
   */
  public create_file(rawPath: string, content: string = ''): VFSResult<VFSFileNode> {
    const { valid, normalizedPath, error } = this.sanitizePath(rawPath);
    if (!valid) {
      return { success: false, message: error || 'Invalid path', error, securityViolation: true };
    }

    if (this.storage.has(normalizedPath)) {
      return {
        success: false,
        message: `File "${normalizedPath}" already exists. Use write_file() or edit_file() to modify.`,
        error: 'FILE_ALREADY_EXISTS',
      };
    }

    // Ensure parent directories exist
    this.ensureParentDirectories(normalizedPath);

    const filename = path.posix.basename(normalizedPath);
    const extension = filename.includes('.') ? filename.split('.').pop() : undefined;
    const now = new Date().toISOString();

    const node: VFSFileNode = {
      name: filename,
      path: normalizedPath,
      type: 'file',
      content,
      sizeBytes: Buffer.byteLength(content, 'utf8'),
      updatedAt: now,
      createdAt: now,
      extension,
    };

    this.storage.set(normalizedPath, node);

    return {
      success: true,
      message: `File "${normalizedPath}" created successfully (${node.sizeBytes} bytes).`,
      data: node,
    };
  }

  /**
   * 2. read_file(path)
   */
  public read_file(rawPath: string): VFSResult<{ path: string; content: string; sizeBytes: number; updatedAt: string }> {
    const { valid, normalizedPath, error } = this.sanitizePath(rawPath);
    if (!valid) {
      return { success: false, message: error || 'Invalid path', error, securityViolation: true };
    }

    const node = this.storage.get(normalizedPath);
    if (!node) {
      return {
        success: false,
        message: `File not found: "${normalizedPath}"`,
        error: 'FILE_NOT_FOUND',
      };
    }

    if (node.type === 'directory') {
      return {
        success: false,
        message: `Cannot read directory "${normalizedPath}". Use list_files() instead.`,
        error: 'IS_DIRECTORY',
      };
    }

    return {
      success: true,
      message: `Read ${node.sizeBytes} bytes from "${normalizedPath}".`,
      data: {
        path: node.path,
        content: node.content || '',
        sizeBytes: node.sizeBytes,
        updatedAt: node.updatedAt,
      },
    };
  }

  /**
   * 3. write_file(path, content)
   */
  public write_file(rawPath: string, content: string = ''): VFSResult<VFSFileNode> {
    const { valid, normalizedPath, error } = this.sanitizePath(rawPath);
    if (!valid) {
      return { success: false, message: error || 'Invalid path', error, securityViolation: true };
    }

    const existing = this.storage.get(normalizedPath);
    if (existing && existing.type === 'directory') {
      return {
        success: false,
        message: `Cannot overwrite directory "${normalizedPath}" as a file.`,
        error: 'IS_DIRECTORY',
      };
    }

    this.ensureParentDirectories(normalizedPath);

    const filename = path.posix.basename(normalizedPath);
    const extension = filename.includes('.') ? filename.split('.').pop() : undefined;
    const now = new Date().toISOString();

    const node: VFSFileNode = {
      name: filename,
      path: normalizedPath,
      type: 'file',
      content,
      sizeBytes: Buffer.byteLength(content, 'utf8'),
      updatedAt: now,
      createdAt: existing ? existing.createdAt : now,
      extension,
    };

    this.storage.set(normalizedPath, node);

    return {
      success: true,
      message: `File "${normalizedPath}" written successfully (${node.sizeBytes} bytes).`,
      data: node,
    };
  }

  /**
   * 4. edit_file(path, oldContentOrTarget, newContent)
   */
  public edit_file(rawPath: string, oldContentOrTarget: string, newContent: string): VFSResult<VFSFileNode> {
    const { valid, normalizedPath, error } = this.sanitizePath(rawPath);
    if (!valid) {
      return { success: false, message: error || 'Invalid path', error, securityViolation: true };
    }

    const node = this.storage.get(normalizedPath);
    if (!node || node.type !== 'file') {
      return {
        success: false,
        message: `File not found for edit: "${normalizedPath}"`,
        error: 'FILE_NOT_FOUND',
      };
    }

    const currentContent = node.content || '';

    // If target content is specified, replace that exact substring
    let updatedContent = '';
    if (oldContentOrTarget && currentContent.includes(oldContentOrTarget)) {
      updatedContent = currentContent.replace(oldContentOrTarget, newContent);
    } else if (!oldContentOrTarget) {
      // If no target string specified, replace whole content
      updatedContent = newContent;
    } else {
      return {
        success: false,
        message: `Target content block not found inside "${normalizedPath}".`,
        error: 'TARGET_CONTENT_NOT_FOUND',
      };
    }

    node.content = updatedContent;
    node.sizeBytes = Buffer.byteLength(updatedContent, 'utf8');
    node.updatedAt = new Date().toISOString();
    this.storage.set(normalizedPath, node);

    return {
      success: true,
      message: `File "${normalizedPath}" updated successfully (${node.sizeBytes} bytes).`,
      data: node,
    };
  }

  /**
   * 5. list_files(dirPath, recursive)
   */
  public list_files(rawPath: string = '/projects', recursive: boolean = true): VFSResult<VFSFileNode[]> {
    const { valid, normalizedPath, error } = this.sanitizePath(rawPath);
    if (!valid && rawPath !== '/' && rawPath !== '') {
      return { success: false, message: error || 'Invalid path', error, securityViolation: true };
    }

    const targetDir = valid ? normalizedPath : '/projects';
    const results: VFSFileNode[] = [];

    for (const [filePath, node] of this.storage.entries()) {
      if (filePath === targetDir) continue;

      if (filePath.startsWith(targetDir)) {
        if (!recursive) {
          const relative = filePath.slice(targetDir.length).replace(/^\//, '');
          if (relative.includes('/')) {
            // Nested deeper, skip in non-recursive
            continue;
          }
        }
        results.push(node);
      }
    }

    return {
      success: true,
      message: `Listed ${results.length} files/directories under "${targetDir}".`,
      data: results,
    };
  }

  /**
   * 6. delete_file(path)
   */
  public delete_file(rawPath: string): VFSResult<{ path: string; deleted: boolean }> {
    const { valid, normalizedPath, error } = this.sanitizePath(rawPath);
    if (!valid) {
      return { success: false, message: error || 'Invalid path', error, securityViolation: true };
    }

    // Guard against deleting root partitions
    if (this.ALLOWED_ROOTS.includes(normalizedPath)) {
      return {
        success: false,
        message: `Security Violation: Root partition "${normalizedPath}" cannot be deleted.`,
        error: 'CANNOT_DELETE_ROOT_PARTITION',
        securityViolation: true,
      };
    }

    const existing = this.storage.get(normalizedPath);
    if (!existing) {
      return {
        success: false,
        message: `File/directory not found: "${normalizedPath}"`,
        error: 'NOT_FOUND',
      };
    }

    // Delete node and any child nodes if directory
    this.storage.delete(normalizedPath);
    if (existing.type === 'directory') {
      for (const key of Array.from(this.storage.keys())) {
        if (key.startsWith(`${normalizedPath}/`)) {
          this.storage.delete(key);
        }
      }
    }

    return {
      success: true,
      message: `Deleted "${normalizedPath}" successfully.`,
      data: { path: normalizedPath, deleted: true },
    };
  }

  /**
   * Helper: ensure parent directories exist
   */
  private ensureParentDirectories(filePath: string) {
    const dir = path.posix.dirname(filePath);
    if (dir === '/' || dir === '.') return;

    if (!this.storage.has(dir)) {
      this.ensureParentDirectories(dir);
      const now = new Date().toISOString();
      this.storage.set(dir, {
        name: path.posix.basename(dir),
        path: dir,
        type: 'directory',
        sizeBytes: 4096,
        updatedAt: now,
        createdAt: now,
      });
    }
  }

  /**
   * Get Hierarchical VFS Tree
   */
  public get_tree(): VFSTreeNode[] {
    const rootNodes: VFSTreeNode[] = [];

    for (const rootPath of this.ALLOWED_ROOTS) {
      const rootNode: VFSTreeNode = {
        name: rootPath.replace('/', ''),
        path: rootPath,
        type: 'directory',
        sizeBytes: 4096,
        updatedAt: new Date().toISOString(),
        children: this.buildSubtree(rootPath),
      };
      rootNodes.push(rootNode);
    }

    return rootNodes;
  }

  private buildSubtree(parentPath: string): VFSTreeNode[] {
    const children: VFSTreeNode[] = [];
    const directChildren = new Set<string>();

    for (const [key, node] of this.storage.entries()) {
      if (key === parentPath) continue;
      if (key.startsWith(`${parentPath}/`)) {
        const sub = key.slice(parentPath.length + 1);
        const firstSegment = sub.split('/')[0];
        const childFullPath = `${parentPath}/${firstSegment}`;

        if (!directChildren.has(childFullPath)) {
          directChildren.add(childFullPath);
          const existingChildNode = this.storage.get(childFullPath);
          if (existingChildNode) {
            children.push({
              name: existingChildNode.name,
              path: existingChildNode.path,
              type: existingChildNode.type,
              sizeBytes: existingChildNode.sizeBytes,
              updatedAt: existingChildNode.updatedAt,
              children: existingChildNode.type === 'directory' ? this.buildSubtree(childFullPath) : undefined,
            });
          }
        }
      }
    }

    return children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  }

  /**
   * Stat file/directory
   */
  public stat(rawPath: string): VFSStat {
    const { valid, normalizedPath } = this.sanitizePath(rawPath);
    if (!valid) return { exists: false };

    const node = this.storage.get(normalizedPath);
    if (!node) return { exists: false };

    return {
      exists: true,
      type: node.type,
      sizeBytes: node.sizeBytes,
      updatedAt: node.updatedAt,
      createdAt: node.createdAt,
      path: node.path,
    };
  }

  // CamelCase Compatibility Aliases
  public createFile(rawPath: string, content = '') {
    return this.create_file(rawPath, content);
  }

  public readFile(rawPath: string) {
    return this.read_file(rawPath);
  }

  public writeFile(rawPath: string, content: string) {
    return this.write_file(rawPath, content);
  }

  public deleteFile(rawPath: string) {
    return this.delete_file(rawPath);
  }

  public listFiles(rawPath = '/projects', recursive = false) {
    return this.list_files(rawPath, recursive);
  }

  public editFile(rawPath: string, targetSubstring: string, replacement: string) {
    return this.edit_file(rawPath, targetSubstring, replacement);
  }

  public getDirectoryTree() {
    return this.get_tree();
  }
}
