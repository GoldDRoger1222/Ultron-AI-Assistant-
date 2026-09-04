import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Clock,
  FileCode,
  Package,
  Play,
  Pause,
  XCircle,
} from 'lucide-react';
import { JarvisTask, TaskCheckpoint, ProviderId } from '../types/jarvis';

interface TasksProps {
  tasks: JarvisTask[];
  onRefreshTasks: () => void;
  onFailoverTask: (taskId: string, newProvider: ProviderId) => void;
  onResumeTask: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
}

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  onRefreshTasks,
  onFailoverTask,
  onResumeTask,
  onCancelTask,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'>('ALL');

  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [tasks, selectedTaskId]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'PLANNING' || t.status === 'QUEUED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    if (filter === 'FAILED') return t.status === 'FAILED' || t.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-cyan-400" />
            <span>JARVIS TASK MANAGER & CONTINUITY</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            One user command = One persistent task. Automatic checkpoints & state preservation across AI provider failovers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-xs font-mono">
          {(['ALL', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === f
                  ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Task List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
            <span>Tasks ({filteredTasks.length})</span>
            <button onClick={onRefreshTasks} className="hover:text-cyan-400 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedTaskId === t.id
                    ? 'border-cyan-500 bg-cyan-950/30 shadow-lg'
                    : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] text-cyan-400 font-bold">{t.id}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.2 rounded border ${
                      t.status === 'COMPLETED'
                        ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-400'
                        : t.status === 'IN_PROGRESS' || t.status === 'PLANNING'
                        ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300 animate-pulse'
                        : 'border-neutral-700 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-xs font-medium text-white line-clamp-2 mb-2">
                  {t.originalCommand}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-2 border-t border-neutral-800/80">
                  <span className="capitalize text-neutral-400">
                    AI: <strong className="text-cyan-400">{t.currentProvider}</strong>
                  </span>
                  <span>{t.checkpoints?.length || 0} Checkpoints</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Task Deep Dive, Stepper & Checkpoints */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTask ? (
            <>
              {/* Task Header Card */}
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedTask.id}</span>
                    <h2 className="text-base font-semibold text-white mt-0.5">
                      {selectedTask.originalCommand}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTask.status !== 'COMPLETED' && (
                      <button
                        onClick={() => onFailoverTask(selectedTask.id, 'gemini')}
                        className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500 text-amber-300 text-xs font-mono hover:bg-amber-500 hover:text-black transition-colors"
                      >
                        Failover to Gemini
                      </button>
                    )}
                    {selectedTask.status === 'PAUSED' && (
                      <button
                        onClick={() => onResumeTask(selectedTask.id)}
                        className="p-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500 hover:bg-emerald-500 hover:text-black"
                        title="Resume Task"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">CATEGORY</span>
                    <span className="text-cyan-400 font-bold">{selectedTask.category}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">CURRENT PROVIDER</span>
                    <span className="text-white font-bold capitalize">{selectedTask.currentProvider}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">PRIORITY</span>
                    <span className="text-amber-400 font-bold">{selectedTask.priority}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">PROGRESS</span>
                    <span className="text-emerald-400 font-bold">{selectedTask.progressPercent}%</span>
                  </div>
                </div>

                {/* Step Execution Timeline */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Autonomous Execution Steps</span>
                  </h4>

                  <div className="space-y-2">
                    {(selectedTask.steps || []).map((step, idx) => (
                      <div
                        key={step.id || idx}
                        className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-3 ${
                          step.status === 'COMPLETED'
                            ? 'border-emerald-500/30 bg-emerald-950/20 text-neutral-300'
                            : step.status === 'IN_PROGRESS'
                            ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300 animate-pulse'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-500'
                        }`}
                      >
                        <div className="mt-0.5">
                          {step.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-neutral-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{step.name}</span>
                            <span className="text-[10px] text-neutral-500 uppercase">{step.status}</span>
                          </div>
                          {step.output && (
                            <p className="text-[11px] text-neutral-400 mt-1 font-sans">{step.output}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkpoints & Failover Preservation */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <h4 className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span>Checkpoints & Context Transfer Snapshots ({selectedTask.checkpoints?.length || 0})</span>
                  </h4>

                  {(selectedTask.checkpoints?.length ?? 0) > 0 ? (
                    <div className="space-y-2">
                      {(selectedTask.checkpoints || []).map((cp) => (
                        <div
                          key={cp.id}
                          className="p-3 rounded-xl bg-neutral-950 border border-purple-500/30 text-xs font-mono space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-purple-400 font-bold">{cp.id}</span>
                            <span className="text-[10px] text-neutral-500">
                              {new Date(cp.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-neutral-300 text-[11px] font-sans">{cp.summary}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] text-neutral-400 pt-1">
                            <span className="text-cyan-400">Captured by: {cp.provider}</span>
                            {cp.changedFiles && cp.changedFiles.length > 0 && (
                              <span className="text-neutral-400">
                                Files: {cp.changedFiles.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 font-mono italic">
                      No failover checkpoints captured yet.
                    </p>
                  )}
                </div>

                {/* Provider Failover Trace History */}
                {selectedTask.providerHistory && selectedTask.providerHistory.length > 0 && (
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1.5">
                    <h5 className="text-[11px] font-bold text-neutral-400">Provider Orchestration Trace</h5>
                    <div className="space-y-1">
                      {(selectedTask.providerHistory || []).map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>
                            {h.provider.toUpperCase()} → {h.role}
                          </span>
                          <span
                            className={
                              h.status === 'SUCCESS'
                                ? 'text-emerald-400'
                                : h.status === 'LIMIT_REACHED'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {h.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 border border-neutral-800 rounded-2xl bg-neutral-900/30 text-center space-y-2">
              <ListTodo className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm font-mono text-neutral-400">Select a task to inspect checkpoints.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
