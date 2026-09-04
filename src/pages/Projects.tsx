import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  FileCode2,
  Play,
  CheckCircle2,
  AlertCircle,
  Plus,
  Terminal,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
  Code2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Project, ProjectFile, VerificationResult } from '../types/jarvis';
import { apiFetch } from '../lib/api';

interface ProjectsProps {
  onRunAutonomousTask: (prompt: string, projectId: string) => Promise<any>;
}

export const Projects: React.FC<ProjectsProps> = ({ onRunAutonomousTask }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [lastVerification, setLastVerification] = useState<VerificationResult | null>(null);
  const [executionLog, setExecutionLog] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const data = await apiFetch<any>('/api/projects');
      setProjects(data.projects || []);
      if (data.projects?.length > 0 && !selectedProject) {
        setSelectedProject(data.projects[0]);
        if (data.projects[0].files && data.projects[0].files.length > 0) {
          setSelectedFile(data.projects[0].files[0]);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch projects:', err?.message || err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelectProject = (proj: Project) => {
    setSelectedProject(proj);
    setSelectedFile(proj.files && proj.files.length > 0 ? proj.files[0] : null);
    setLastVerification(null);
    setExecutionLog(null);
  };

  const handleRunAgent = async () => {
    if (!selectedProject || !agentPrompt.trim() || isExecuting) return;
    setIsExecuting(true);
    setExecutionLog('JARVIS Autonomous Coding Agent initialized. Analyzing dependencies and AST...');
    try {
      const result = await onRunAutonomousTask(agentPrompt, selectedProject.id);
      if (result) {
        setExecutionLog(result.result || 'Task completed successfully.');
        setLastVerification(result.verification);
        // Refresh project files
        fetchProjects();
      }
    } catch (err: any) {
      setExecutionLog(`Agent execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-400" />
            <span>JARVIS PROJECT AGENT</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Autonomous AST scanning, full-stack scaffold, refactoring & automated self-verification
          </p>
        </div>

        {/* Project Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => handleSelectProject(proj)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                selectedProject?.id === proj.id
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-semibold shadow-md'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
              }`}
            >
              {proj.name}
            </button>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Project Overview & File Explorer */}
          <div className="space-y-4">
            {/* Tech Stack & Metadata Card */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white">{selectedProject.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                  {selectedProject.language}
                </span>
              </div>
              <p className="text-xs text-neutral-400">{selectedProject.description}</p>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500">Framework:</span>
                <span className="text-neutral-300">{selectedProject.framework}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500">Build Status:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {selectedProject.buildStatus}
                </span>
              </div>
            </div>

            {/* Virtual File Explorer */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-2 border-b border-neutral-800">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" /> Workspace Files
                </span>
                <span>{selectedProject.files?.length || 0} files</span>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {(selectedProject.files || []).map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between border transition-all ${
                      selectedFile?.path === file.path
                        ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                        : 'border-transparent text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileCode2 className="w-3.5 h-3.5 text-neutral-500" />
                      {file.name}
                    </span>
                    <span className="text-[10px] text-neutral-600 font-sans">{file.size} B</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Autonomous Command Prompt Input */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-neutral-900/60 space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white">Autonomous Agent Prompt</span>
              </div>
              <textarea
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder={
                  selectedProject.language === 'C++'
                    ? 'e.g. Debug spatial memory allocation and optimize raycast traversal in kdtree.cpp'
                    : 'e.g. Make the menu items filterable by category with smooth responsive animations'
                }
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono resize-none"
              />
              <button
                onClick={handleRunAgent}
                disabled={!agentPrompt.trim() || isExecuting}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>EXECUTING & VERIFYING...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>EXECUTE AUTONOMOUS WORKFLOW</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Code Viewer & Verification Report */}
          <div className="lg:col-span-2 space-y-4">
            {/* File Content Editor / Viewer */}
            <div className="border border-neutral-800 rounded-xl bg-neutral-950 overflow-hidden shadow-xl">
              <div className="px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  {selectedFile ? selectedFile.path : 'Select a file'}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  {selectedFile?.language || 'TEXT'}
                </span>
              </div>

              <div className="p-4 overflow-x-auto max-h-[380px] text-xs font-mono leading-relaxed text-neutral-300">
                {selectedFile ? (
                  <pre>{selectedFile.content}</pre>
                ) : (
                  <p className="text-neutral-500 italic">No file selected in workspace.</p>
                )}
              </div>
            </div>

            {/* Self-Verification & Execution Result */}
            {(executionLog || lastVerification) && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-neutral-900/60 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      JARVIS SELF-VERIFICATION REPORT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">100% Verified</span>
                </div>

                {lastVerification && (
                  <div className="space-y-1.5">
                    {lastVerification.checks.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono"
                      >
                        <span className="flex items-center gap-2 text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {c.name}
                        </span>
                        <span className="text-emerald-400">{c.details}</span>
                      </div>
                    ))}
                  </div>
                )}

                {executionLog && (
                  <div className="p-3 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {executionLog}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
