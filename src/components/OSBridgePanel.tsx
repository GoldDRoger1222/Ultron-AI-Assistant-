import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Folder,
  FileCode,
  Cpu,
  Activity,
  HardDrive,
  Wifi,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Layers,
  Zap,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export interface VirtualFileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  updatedAt: string;
  extension?: string;
}

export interface TerminalExecutionResult {
  command: string;
  output: string;
  exitCode: number;
  executionTimeMs: number;
  timestamp: string;
}

export interface SystemHardwareTelemetry {
  cpuUsagePercent: number;
  ramUsagePercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  gpuUsagePercent: number;
  gpuTempCelsius: number;
  diskUsagePercent: number;
  activeProcesses: number;
  networkLatencyMs: number;
  ipcSocketStatus: 'CONNECTED' | 'STANDBY' | 'DISCONNECTED';
  uptimeSeconds: number;
}

export const OSBridgePanel: React.FC = () => {
  const [telemetry, setTelemetry] = useState<SystemHardwareTelemetry | null>(null);
  const [files, setFiles] = useState<VirtualFileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/workspace');
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<TerminalExecutionResult[]>([]);
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'FILES' | 'TERMINAL' | 'TELEMETRY'>('TERMINAL');

  useEffect(() => {
    fetchTelemetry();
    fetchFiles(currentPath);
    fetchTerminalHistory();

    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await apiFetch<{ telemetry: SystemHardwareTelemetry }>('/api/os/telemetry');
      if (res.telemetry) setTelemetry(res.telemetry);
    } catch (e) {
      console.warn('Telemetry fetch error', e);
    }
  };

  const fetchFiles = async (dirPath: string) => {
    try {
      const res = await apiFetch<{ files: VirtualFileItem[]; currentDir: string }>(
        `/api/os/files?path=${encodeURIComponent(dirPath)}`
      );
      if (res.files) {
        setFiles(res.files);
        setCurrentPath(dirPath);
      }
    } catch (e) {
      console.warn('Files fetch error', e);
    }
  };

  const fetchTerminalHistory = async () => {
    try {
      const res = await apiFetch<{ history: TerminalExecutionResult[] }>('/api/os/terminal/history');
      if (res.history) setTerminalHistory(res.history);
    } catch (e) {
      console.warn('Terminal history error', e);
    }
  };

  const handleRunCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || isExecutingCmd) return;

    const cmd = terminalInput.trim();
    setTerminalInput('');
    setIsExecutingCmd(true);

    try {
      const res = await apiFetch<{ result: TerminalExecutionResult }>('/api/os/terminal', {
        method: 'POST',
        body: JSON.stringify({ command: cmd }),
      });
      if (res.result) {
        setTerminalHistory((prev) => [res.result, ...prev]);
        if (cmd.startsWith('cat ') || cmd.startsWith('ls')) {
          fetchFiles(currentPath);
        }
      }
    } catch (e) {
      console.error('Command execution failed', e);
    } finally {
      setIsExecutingCmd(false);
    }
  };

  const handleReadFile = async (filePath: string) => {
    try {
      const res = await apiFetch<{ content: string; updatedAt: string }>('/api/os/files/read', {
        method: 'POST',
        body: JSON.stringify({ filePath }),
      });
      if (res.content !== undefined) {
        setSelectedFile({ path: filePath, content: res.content });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* OS TELEMETRY BANNER */}
      {telemetry && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">CPU Load</span>
              <span className="text-sm font-mono font-bold text-white">{telemetry.cpuUsagePercent}%</span>
              <span className="text-[10px] font-mono text-cyan-400 block">16-Core vCPU</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">RAM Used</span>
              <span className="text-sm font-mono font-bold text-white">
                {telemetry.ramUsedGb} / {telemetry.ramTotalGb} GB
              </span>
              <span className="text-[10px] font-mono text-purple-400 block">{telemetry.ramUsagePercent}%</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">NPU / GPU</span>
              <span className="text-sm font-mono font-bold text-white">{telemetry.gpuUsagePercent}%</span>
              <span className="text-[10px] font-mono text-emerald-400 block">{telemetry.gpuTempCelsius}°C</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Virtual Disk</span>
              <span className="text-sm font-mono font-bold text-white">{telemetry.diskUsagePercent}%</span>
              <span className="text-[10px] font-mono text-amber-400 block">/workspace SSD</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">IPC Latency</span>
              <span className="text-sm font-mono font-bold text-white">{telemetry.networkLatencyMs}ms</span>
              <span className="text-[10px] font-mono text-sky-400 block">{telemetry.ipcSocketStatus}</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Processes</span>
              <span className="text-sm font-mono font-bold text-white">{telemetry.activeProcesses}</span>
              <span className="text-[10px] font-mono text-rose-400 block">Daemon: 0.0.0.0</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TABS */}
      <div className="flex gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveSubTab('TERMINAL')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'TERMINAL'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-900/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          PC NATIVE TERMINAL ({terminalHistory.length})
        </button>
        <button
          onClick={() => setActiveSubTab('FILES')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'FILES'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Folder className="w-4 h-4" />
          VIRTUAL FILE SYSTEM ({files.length})
        </button>
      </div>

      {/* VIEW: TERMINAL */}
      {activeSubTab === 'TERMINAL' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 font-mono space-y-4 shadow-2xl">
          {/* Quick command buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-neutral-500 py-1">Quick Commands:</span>
            {['npm test', 'git status', 'ls -la', 'ps aux', 'cat /workspace/package.json'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setTerminalInput(cmd);
                }}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-neutral-700 rounded-lg transition-colors"
              >
                ${cmd}
              </button>
            ))}
          </div>

          {/* Terminal output box */}
          <div className="bg-black/90 border border-neutral-800/80 rounded-xl p-4 h-96 overflow-y-auto space-y-4 text-xs font-mono">
            {terminalHistory.map((item, idx) => (
              <div key={idx} className="space-y-1.5 border-b border-neutral-900 pb-3">
                <div className="flex items-center justify-between text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">ultron@super-brain:~$</span>
                    <span className="text-white font-bold">{item.command}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">{item.executionTimeMs}ms</span>
                </div>
                <pre className="text-neutral-300 whitespace-pre-wrap pl-4 border-l-2 border-cyan-500/30">
                  {item.output}
                </pre>
              </div>
            ))}
            {terminalHistory.length === 0 && (
              <div className="text-neutral-500 text-center pt-20">
                Type any command below (e.g. <code className="text-cyan-400">git status</code>,{' '}
                <code className="text-cyan-400">npm test</code>, <code className="text-cyan-400">ls</code>) to execute
                in ULTRON OS Sandbox.
              </div>
            )}
          </div>

          {/* Terminal prompt input */}
          <form onSubmit={handleRunCommand} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-xs">
                $
              </span>
              <input
                type="text"
                placeholder="Enter shell command (e.g., 'git status', 'npm test', 'ls', 'cat /workspace/src/App.tsx')..."
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                disabled={isExecutingCmd}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-cyan-500 rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono text-white focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isExecutingCmd || !terminalInput.trim()}
              className="px-5 py-2.5 bg-cyan-500 text-black font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-cyan-400 disabled:opacity-50 transition-colors shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              EXECUTE
            </button>
          </form>
        </div>
      )}

      {/* VIEW: VIRTUAL FILE SYSTEM */}
      {activeSubTab === 'FILES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* File list */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Folder className="w-4 h-4 text-purple-400" />
                {currentPath}
              </span>
              <button
                onClick={() => fetchFiles(currentPath)}
                className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.path}
                  onClick={() => {
                    if (file.type === 'file') handleReadFile(file.path);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedFile?.path === file.path
                      ? 'border-purple-500 bg-purple-950/30 text-white'
                      : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {file.type === 'directory' ? (
                      <Folder className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <span className="text-xs font-mono truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {file.sizeBytes !== undefined ? `${file.sizeBytes}B` : 'DIR'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* File Viewer / Editor */}
          <div className="lg:col-span-2 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                {selectedFile ? selectedFile.path : 'Select a file to inspect'}
              </span>
            </div>

            {selectedFile ? (
              <pre className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs font-mono text-cyan-300 h-96 overflow-auto">
                {selectedFile.content}
              </pre>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-neutral-500 text-xs font-mono">
                <FileCode className="w-10 h-10 text-neutral-700 mb-2" />
                Click on any file in the workspace directory to preview its contents.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
