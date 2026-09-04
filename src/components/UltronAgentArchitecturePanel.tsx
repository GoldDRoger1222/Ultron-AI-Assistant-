import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  FileCode,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  FolderTree,
  Terminal,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Code2,
  Clock,
  Send,
  Zap,
  Lock,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

interface VFSFileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  sizeBytes: number;
  updatedAt: string;
  extension?: string;
}

interface VFSTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes: number;
  updatedAt: string;
  children?: VFSTreeNode[];
}

interface SandboxRecord {
  id: string;
  language: string;
  code: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'SECURITY_BLOCKED';
  timestamp: string;
}

interface AgentLoopStep {
  id: string;
  stepNumber: number;
  type: 'PLAN' | 'TOOL_CALL' | 'RESULT' | 'ANALYZE' | 'TEST' | 'FIX' | 'COMPLETE';
  title: string;
  thought?: string;
  toolCall?: {
    tool: string;
    arguments: Record<string, any>;
  };
  toolResult?: any;
  testOutcome?: {
    passed: boolean;
    passedTests: number;
    failedTests: number;
    details: string;
  };
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
  durationMs?: number;
}

interface AgentLoopSession {
  id: string;
  userGoal: string;
  status: string;
  steps: AgentLoopStep[];
  filesCreated: string[];
  testsPassed: boolean;
  finalSummary: string;
  totalDurationMs: number;
}

export const UltronAgentArchitecturePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LOOP' | 'VFS' | 'SANDBOX' | 'TOOL_BRIDGE'>('LOOP');

  // Agent Loop State
  const [goalInput, setGoalInput] = useState('Create a safe token generator in VFS and test with 4 unit assertions');
  const [isRunningLoop, setIsRunningLoop] = useState(false);
  const [currentSession, setCurrentSession] = useState<AgentLoopSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<AgentLoopSession[]>([]);

  // VFS State
  const [vfsTree, setVfsTree] = useState<VFSTreeNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('/projects/calculator.js');
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [editContentBuffer, setEditContentBuffer] = useState('');
  const [newFilePath, setNewFilePath] = useState('/projects/new_module.js');
  const [newFileContent, setNewFileContent] = useState('// New module\n');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '/projects': true,
    '/sandbox': true,
    '/temp': true,
  });

  // Sandbox State
  const [sandboxLang, setSandboxLang] = useState('javascript');
  const [sandboxCode, setSandboxCode] = useState(`// ULTRON Code Sandbox Test
function calculateFactorial(n) {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1);
}

console.log("Factorial(5) =", calculateFactorial(5));
console.log("Factorial(7) =", calculateFactorial(7));
`);
  const [sandboxTestCode, setSandboxTestCode] = useState(`// Unit Test Assertions
assert(calculateFactorial(5) === 120, "5! should equal 120");
assert(calculateFactorial(1) === 1, "1! should equal 1");
assert(calculateFactorial(0) === 1, "0! should equal 1");
`);
  const [isRunningSandbox, setIsRunningSandbox] = useState(false);
  const [sandboxOutput, setSandboxOutput] = useState<any>(null);
  const [sandboxHistory, setSandboxHistory] = useState<SandboxRecord[]>([]);

  // Tool Bridge State
  const [toolCatalog, setToolCatalog] = useState<any[]>([]);
  const [customToolJson, setCustomToolJson] = useState(`{
  "tool": "create_file",
  "arguments": {
    "path": "/projects/demo_script.js",
    "content": "console.log('ULTRON tool dispatched successfully!');"
  }
}`);
  const [isDispatchingTool, setIsDispatchingTool] = useState(false);
  const [toolDispatchResult, setToolDispatchResult] = useState<any>(null);

  useEffect(() => {
    fetchVfsTree();
    fetchReadFile('/projects/calculator.js');
    fetchToolCatalog();
    fetchSandboxHistory();
    fetchAgentHistory();
  }, []);

  const fetchVfsTree = async () => {
    try {
      const res = await apiFetch<any>('/api/ultron/vfs/tree');
      if (res?.tree) setVfsTree(res.tree);
    } catch (err) {
      console.error('Failed to load VFS tree:', err);
    }
  };

  const fetchReadFile = async (path: string) => {
    try {
      const res = await apiFetch<any>(`/api/ultron/vfs/file?path=${encodeURIComponent(path)}`);
      if (res?.data) {
        setSelectedFilePath(path);
        setSelectedFileContent(res.data.content || '');
        setEditContentBuffer(res.data.content || '');
        setIsEditingFile(false);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  const handleSaveFileEdit = async () => {
    try {
      const res = await apiFetch<any>('/api/ultron/vfs/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFilePath,
          content: editContentBuffer,
        }),
      });
      if (res?.success) {
        setSelectedFileContent(editContentBuffer);
        setIsEditingFile(false);
        fetchVfsTree();
      }
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  const handleCreateNewFile = async () => {
    try {
      const res = await apiFetch<any>('/api/ultron/vfs/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: newFilePath,
          content: newFileContent,
        }),
      });
      if (res?.success) {
        setIsCreatingFile(false);
        fetchVfsTree();
        fetchReadFile(newFilePath);
      } else {
        alert(res?.message || 'Failed to create file');
      }
    } catch (err: any) {
      alert('Security or validation error: ' + err.message);
    }
  };

  const handleDeleteFile = async (path: string) => {
    if (!confirm(`Are you sure you want to delete "${path}" from VFS?`)) return;
    try {
      const res = await apiFetch<any>(`/api/ultron/vfs/file?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });
      if (res?.success) {
        fetchVfsTree();
        if (selectedFilePath === path) {
          setSelectedFilePath('/projects/calculator.js');
          fetchReadFile('/projects/calculator.js');
        }
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const fetchToolCatalog = async () => {
    try {
      const res = await apiFetch<any>('/api/ultron/tools/catalog');
      if (res?.tools) setToolCatalog(res.tools);
    } catch (err) {
      console.error('Failed to load tool catalog:', err);
    }
  };

  const fetchSandboxHistory = async () => {
    try {
      const res = await apiFetch<any>('/api/ultron/sandbox/history');
      if (res?.history) setSandboxHistory(res.history);
    } catch (err) {
      console.error('Failed to load sandbox history:', err);
    }
  };

  const fetchAgentHistory = async () => {
    try {
      const res = await apiFetch<any>('/api/ultron/agent-loop/history');
      if (res?.history && res.history.length > 0) {
        setSessionHistory(res.history);
        if (!currentSession) setCurrentSession(res.history[0]);
      }
    } catch (err) {
      console.error('Failed to load agent history:', err);
    }
  };

  const handleRunAgentLoop = async () => {
    if (!goalInput.trim()) return;
    setIsRunningLoop(true);
    try {
      const res = await apiFetch<any>('/api/ultron/agent-loop/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalInput, maxIterations: 6 }),
      });
      if (res?.session) {
        setCurrentSession(res.session);
        fetchAgentHistory();
        fetchVfsTree();
      }
    } catch (err: any) {
      alert('Agent loop error: ' + err.message);
    } finally {
      setIsRunningLoop(false);
    }
  };

  const handleRunSandboxCode = async () => {
    setIsRunningSandbox(true);
    try {
      const res = await apiFetch<any>('/api/ultron/sandbox/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: sandboxLang,
          code: sandboxCode,
        }),
      });
      setSandboxOutput(res?.result);
      fetchSandboxHistory();
    } catch (err: any) {
      setSandboxOutput({ error: err.message, status: 'ERROR' });
    } finally {
      setIsRunningSandbox(false);
    }
  };

  const handleRunSandboxTests = async () => {
    setIsRunningSandbox(true);
    try {
      const res = await apiFetch<any>('/api/ultron/sandbox/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: sandboxLang,
          code: sandboxCode,
          test_code: sandboxTestCode,
        }),
      });
      setSandboxOutput(res?.result);
    } catch (err: any) {
      setSandboxOutput({ error: err.message, status: 'ERROR' });
    } finally {
      setIsRunningSandbox(false);
    }
  };

  const handleDispatchCustomTool = async () => {
    setIsDispatchingTool(true);
    try {
      const parsed = JSON.parse(customToolJson);
      const res = await apiFetch<any>('/api/ultron/tools/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      setToolDispatchResult(res);
      fetchVfsTree();
    } catch (err: any) {
      setToolDispatchResult({ success: false, error: err.message });
    } finally {
      setIsDispatchingTool(false);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTreeNodes = (nodes: VFSTreeNode[]) => {
    return (
      <div className="space-y-1 pl-2">
        {nodes.map(node => {
          const isDir = node.type === 'directory';
          const isExpanded = expandedFolders[node.path];
          const isSelected = selectedFilePath === node.path;

          return (
            <div key={node.path}>
              <div
                onClick={() => {
                  if (isDir) toggleFolder(node.path);
                  else fetchReadFile(node.path);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isDir ? (
                    <>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                      <Folder className="w-3.5 h-3.5 text-amber-400" />
                    </>
                  ) : (
                    <>
                      <span className="w-3.5" />
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    </>
                  )}
                  <span className="truncate">{node.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!isDir && (
                    <>
                      <span className="text-[10px] text-neutral-500">{node.sizeBytes}B</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(node.path);
                        }}
                        className="text-neutral-500 hover:text-rose-400 p-0.5 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isDir && isExpanded && node.children && (
                <div className="ml-2 border-l border-neutral-800">
                  {renderTreeNodes(node.children)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Architecture Pipeline Diagram */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">ULTRON 4-Tier Autonomous Engine</h1>
                <p className="text-xs text-neutral-400">LLM Core → Intent Router → Agent Orchestrator → Tool Dispatcher → (VFS / Sandbox / Internet)</p>
              </div>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              VFS Isolation: ACTIVE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Lock className="w-3.5 h-3.5" />
              Root Access: BLOCKED
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Zap className="w-3.5 h-3.5" />
              Self-Correction: READY
            </span>
          </div>
        </div>

        {/* Visual Architecture Schematic Box */}
        <div className="mt-5 p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-xl overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] text-xs font-mono">
            <div className="px-3 py-2 bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 rounded-lg text-center shadow">
              <div className="font-bold">ULTRON</div>
              <div className="text-[10px] text-cyan-400/70">Master Core</div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500" />
            <div className="px-3 py-2 bg-purple-950/40 border border-purple-500/40 text-purple-300 rounded-lg text-center shadow">
              <div className="font-bold">AI / LLM CORE</div>
              <div className="text-[10px] text-purple-400/70">gemini-3.7-flash</div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500" />
            <div className="px-3 py-2 bg-blue-950/40 border border-blue-500/40 text-blue-300 rounded-lg text-center shadow">
              <div className="font-bold">Intent Router</div>
              <div className="text-[10px] text-blue-400/70">Semantic Classifier</div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500" />
            <div className="px-3 py-2 bg-amber-950/40 border border-amber-500/40 text-amber-300 rounded-lg text-center shadow">
              <div className="font-bold">Orchestrator</div>
              <div className="text-[10px] text-amber-400/70">Agentic Loop</div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500" />
            <div className="px-3 py-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-center shadow">
              <div className="font-bold">Tool Dispatcher</div>
              <div className="text-[10px] text-emerald-400/70">Safe Bridge</div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-800/80 grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="p-2 bg-neutral-900/60 border border-neutral-800 rounded-lg">
              <span className="text-cyan-400 font-semibold">1. File Manager</span>
              <div className="text-[11px] text-neutral-400 mt-0.5">ULTRON VFS (/projects, /temp, /sandbox)</div>
            </div>
            <div className="p-2 bg-neutral-900/60 border border-neutral-800 rounded-lg">
              <span className="text-purple-400 font-semibold">2. Code Runner</span>
              <div className="text-[11px] text-neutral-400 mt-0.5">Isolated VM Sandbox + Unit Test Harness</div>
            </div>
            <div className="p-2 bg-neutral-900/60 border border-neutral-800 rounded-lg">
              <span className="text-emerald-400 font-semibold">3. Web / Search</span>
              <div className="text-[11px] text-neutral-400 mt-0.5">Real-time Internet Grounding & API</div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-5 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('LOOP')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'LOOP'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous Agent Loop (PLAN → ACT → TEST → FIX)
          </button>

          <button
            onClick={() => setActiveTab('VFS')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'VFS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            ULTRON VFS (Virtual File System)
          </button>

          <button
            onClick={() => setActiveTab('SANDBOX')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'SANDBOX'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Code Sandbox & Test Runner
          </button>

          <button
            onClick={() => setActiveTab('TOOL_BRIDGE')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'TOOL_BRIDGE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Tool Dispatcher & Bridge
          </button>
        </div>
      </div>

      {/* 2. TAB 1: AUTONOMOUS AGENT LOOP */}
      {activeTab === 'LOOP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input & Trigger */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Trigger Autonomous Loop
              </h2>

              <p className="text-xs text-neutral-400 leading-relaxed">
                ULTRON will autonomously plan, write files to VFS, execute tools, run unit tests in the Sandbox, and recursively self-correct if any tests fail.
              </p>

              <div>
                <label className="text-xs text-neutral-300 font-medium mb-1.5 block">Goal / Objective</label>
                <textarea
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  rows={4}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. Build an RSA key validation algorithm in /projects/crypto.js and verify with unit tests"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-neutral-400 font-medium">Quick Goal Presets:</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setGoalInput('Create an encryption module with AES-like XOR cipher and test roundtrip in sandbox')}
                    className="text-left text-[11px] px-2.5 py-1.5 bg-neutral-950/60 border border-neutral-800 rounded-lg text-neutral-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                  >
                    ⚡ Encryption & Decryption module with unit tests
                  </button>
                  <button
                    onClick={() => setGoalInput('Write a string tokenizer parser for math expressions and verify with 5 assertions')}
                    className="text-left text-[11px] px-2.5 py-1.5 bg-neutral-950/60 border border-neutral-800 rounded-lg text-neutral-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                  >
                    ⚡ Math expression tokenizer with unit test suite
                  </button>
                  <button
                    onClick={() => setGoalInput('Build a stateful LRU Cache in /projects/lruCache.js and test evictions')}
                    className="text-left text-[11px] px-2.5 py-1.5 bg-neutral-950/60 border border-neutral-800 rounded-lg text-neutral-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                  >
                    ⚡ LRU Cache module with eviction assertion tests
                  </button>
                </div>
              </div>

              <button
                onClick={handleRunAgentLoop}
                disabled={isRunningLoop || !goalInput.trim()}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRunningLoop ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Autonomous Loop...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Agent Loop (PLAN → ACT → TEST)
                  </>
                )}
              </button>
            </div>

            {/* Loop History */}
            {sessionHistory.length > 0 && (
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-semibold text-neutral-300">Previous Autonomous Sessions</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {sessionHistory.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setCurrentSession(s)}
                      className={`p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        currentSession?.id === s.id
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                          : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-medium truncate">{s.userGoal}</div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                        <span>{s.steps?.length || 0} steps</span>
                        <span className={s.testsPassed ? 'text-emerald-400' : 'text-neutral-400'}>
                          {s.testsPassed ? 'Tests Passed' : s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Loop Stepper & Breakdown */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Autonomous Agent Loop Execution Trace</h3>
                  <p className="text-xs text-neutral-400">
                    {currentSession ? `Session: ${currentSession.id} (${currentSession.status})` : 'No active session. Trigger a goal above.'}
                  </p>
                </div>
                {currentSession && (
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                    currentSession.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : currentSession.status === 'FAILED'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  }`}>
                    {currentSession.status}
                  </span>
                )}
              </div>

              {/* Loop Stepper Timeline */}
              {currentSession ? (
                <div className="space-y-3">
                  {currentSession.steps.map((step, idx) => {
                    const isSuccess = step.status === 'SUCCESS';
                    const isFailed = step.status === 'FAILED';

                    return (
                      <div
                        key={step.id || idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isSuccess
                            ? 'bg-neutral-950/60 border-neutral-800'
                            : isFailed
                            ? 'bg-rose-950/20 border-rose-800/40'
                            : 'bg-cyan-950/20 border-cyan-800/40 animate-pulse'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                              {step.stepNumber}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                              {step.type}
                            </span>
                            <span className="text-xs font-medium text-white">{step.title}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {step.durationMs && (
                              <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {step.durationMs}ms
                              </span>
                            )}
                            {isSuccess ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : isFailed ? (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            ) : (
                              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                            )}
                          </div>
                        </div>

                        {/* Thought / Analysis */}
                        {step.thought && (
                          <div className="text-xs text-neutral-300 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 mb-2 font-mono">
                            <span className="text-cyan-400 font-semibold">Thought:</span> {step.thought}
                          </div>
                        )}

                        {/* Tool Call Payload */}
                        {step.toolCall && (
                          <div className="text-xs bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-mono mb-2">
                            <span className="text-amber-400">Tool:</span> {step.toolCall.tool}
                            <pre className="mt-1 text-[11px] text-neutral-400 overflow-x-auto">
                              {JSON.stringify(step.toolCall.arguments, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Test Outcome */}
                        {step.testOutcome && (
                          <div className="text-xs bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-mono">
                            <div className="flex items-center justify-between mb-1">
                              <span className={step.testOutcome.passed ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                {step.testOutcome.passed ? '✓ All Tests Passed' : '✗ Tests Failed - Triggering Self-Correction'}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                Passed: {step.testOutcome.passedTests} | Failed: {step.testOutcome.failedTests}
                              </span>
                            </div>
                            <pre className="text-[10px] text-neutral-400 overflow-x-auto whitespace-pre-wrap">
                              {step.testOutcome.details}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Final Summary Card */}
                  {currentSession.finalSummary && (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono text-emerald-200">
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        Execution Finished & Verified in Isolated Sandbox
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px]">{currentSession.finalSummary}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl">
                  <Sparkles className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Ready to execute autonomous agent loop.</p>
                  <p className="text-[11px] text-neutral-500 mt-1">Select a preset or enter a goal and click &quot;Start Agent Loop&quot;.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: VFS (VIRTUAL FILE SYSTEM EXPLORER) */}
      {activeTab === 'VFS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: VFS Tree Explorer */}
          <div className="lg:col-span-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">VFS Partitions</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCreatingFile(!isCreatingFile)}
                  className="p-1 text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 rounded"
                  title="New File"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={fetchVfsTree}
                  className="p-1 text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 rounded"
                  title="Refresh Tree"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Create File Modal / Drawer */}
            {isCreatingFile && (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-cyan-300">Create New VFS File</span>
                <input
                  value={newFilePath}
                  onChange={e => setNewFilePath(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  placeholder="/projects/filename.js"
                />
                <textarea
                  value={newFileContent}
                  onChange={e => setNewFileContent(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Initial content..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreatingFile(false)}
                    className="px-2.5 py-1 rounded text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNewFile}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {/* Tree Navigation */}
            <div className="max-h-[500px] overflow-y-auto pr-1">
              {renderTreeNodes(vfsTree)}
            </div>

            {/* Security Boundary Notice */}
            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                VFS Security Enforcement
              </div>
              <p>Operations are strictly sandboxed inside <code>/projects</code>, <code>/temp</code>, and <code>/sandbox</code>. Host root <code>/etc</code>, <code>.env</code>, or shell escape is denied.</p>
            </div>
          </div>

          {/* Right: File Viewer / Editor */}
          <div className="lg:col-span-8 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-semibold text-white">{selectedFilePath}</span>
              </div>

              <div className="flex items-center gap-2">
                {isEditingFile ? (
                  <>
                    <button
                      onClick={() => setIsEditingFile(false)}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveFileEdit}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditContentBuffer(selectedFileContent);
                      setIsEditingFile(true);
                    }}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    Edit File
                  </button>
                )}
              </div>
            </div>

            {/* Code / Text Area */}
            {isEditingFile ? (
              <textarea
                value={editContentBuffer}
                onChange={e => setEditContentBuffer(e.target.value)}
                rows={18}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            ) : (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 overflow-x-auto max-h-[500px]">
                <pre className="whitespace-pre">{selectedFileContent || '// File is empty'}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 3: CODE SANDBOX RUNNER */}
      {activeTab === 'SANDBOX' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Code & Test Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  Isolated Sandbox Code
                </h3>

                <select
                  value={sandboxLang}
                  onChange={e => setSandboxLang(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none"
                >
                  <option value="javascript">JavaScript (Node VM)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3.12</option>
                  <option value="bash">VFS Bash Shell</option>
                </select>
              </div>

              <textarea
                value={sandboxCode}
                onChange={e => setSandboxCode(e.target.value)}
                rows={8}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                placeholder="Enter code to execute..."
              />

              <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Unit Test Assertions
              </h4>

              <textarea
                value={sandboxTestCode}
                onChange={e => setSandboxTestCode(e.target.value)}
                rows={5}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
                placeholder="assert(condition, 'test label');"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunSandboxCode}
                  disabled={isRunningSandbox}
                  className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isRunningSandbox ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Run Code Only
                </button>

                <button
                  onClick={handleRunSandboxTests}
                  disabled={isRunningSandbox}
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isRunningSandbox ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Run Full Test Suite
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Terminal & Output */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Sandbox Execution Console
                </h3>
                {sandboxOutput && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    sandboxOutput.status === 'SUCCESS' || sandboxOutput.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {sandboxOutput.status || (sandboxOutput.passed ? 'PASSED' : 'FAILED')}
                  </span>
                )}
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-mono text-xs min-h-[220px] max-h-[300px] overflow-y-auto space-y-2">
                {sandboxOutput ? (
                  <>
                    {sandboxOutput.stdout && (
                      <div>
                        <span className="text-[10px] text-neutral-500">[STDOUT]</span>
                        <pre className="text-emerald-400 whitespace-pre-wrap mt-0.5">{sandboxOutput.stdout}</pre>
                      </div>
                    )}
                    {sandboxOutput.stderr && (
                      <div>
                        <span className="text-[10px] text-neutral-500">[STDERR]</span>
                        <pre className="text-rose-400 whitespace-pre-wrap mt-0.5">{sandboxOutput.stderr}</pre>
                      </div>
                    )}
                    {sandboxOutput.durationMs && (
                      <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800">
                        Execution Time: {sandboxOutput.durationMs}ms
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-neutral-600 text-center pt-16">No execution output yet. Click &quot;Run Code&quot; or &quot;Run Test Suite&quot;.</div>
                )}
              </div>
            </div>

            {/* Sandbox History */}
            {sandboxHistory.length > 0 && (
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-semibold text-neutral-300">Past Sandbox Runs</span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {sandboxHistory.map(rec => (
                    <div
                      key={rec.id}
                      className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono flex items-center justify-between text-neutral-400"
                    >
                      <span className="truncate">{rec.id} ({rec.language})</span>
                      <span className={rec.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>{rec.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 4: TOOL DISPATCHER & BRIDGE */}
      {activeTab === 'TOOL_BRIDGE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: JSON Tool Caller */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  LLM Tool Bridge Dispatcher
                </h3>
                <span className="text-[11px] text-neutral-400">JSON Protocol</span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                When ULTRON LLM generates tool calls, the backend dispatches them to the appropriate File System Manager, Code Runner, or Web Search service.
              </p>

              <textarea
                value={customToolJson}
                onChange={e => setCustomToolJson(e.target.value)}
                rows={8}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500 leading-relaxed"
              />

              <button
                onClick={handleDispatchCustomTool}
                disabled={isDispatchingTool}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDispatchingTool ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Dispatching Tool...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Tool Call
                  </>
                )}
              </button>

              {/* Tool Execution Result */}
              {toolDispatchResult && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Result Status:</span>
                    <span className={toolDispatchResult.success ? 'text-emerald-400' : 'text-rose-400'}>
                      {toolDispatchResult.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                  <pre className="text-[11px] text-neutral-300 overflow-x-auto whitespace-pre-wrap pt-2 border-t border-neutral-800">
                    {JSON.stringify(toolDispatchResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right: Available Tools Catalog */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Active Tool Catalog ({toolCatalog.length} Tools)
              </h3>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {toolCatalog.map(tool => (
                  <div
                    key={tool.name}
                    className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300">{tool.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400">
                        {tool.category} (Perm Lvl: {tool.permissionLevel})
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">{tool.description}</p>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1">
                      Required args: {tool.parameters?.required?.join(', ') || 'none'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
