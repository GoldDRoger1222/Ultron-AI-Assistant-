import React, { useState, useEffect } from 'react';
import {
  Brain,
  MessageSquare,
  Code2,
  Globe,
  Eye,
  Smartphone,
  Terminal,
  Cpu,
  Database,
  Activity,
  ShieldAlert,
  GitFork,
  CheckCircle2,
  Play,
  RotateCw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export interface UltronAgent {
  id: string;
  name: string;
  codename: string;
  role: string;
  description: string;
  specialization: string[];
  status: 'ACTIVE' | 'IDLE' | 'STANDBY' | 'EXECUTING';
  assignedModel: string;
  color: string;
}

export const AgentMatrixPanel: React.FC = () => {
  const [agents, setAgents] = useState<UltronAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<UltronAgent | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await apiFetch<{ agents: UltronAgent[] }>('/api/agents');
      if (data.agents) {
        setAgents(data.agents);
        if (!selectedAgent && data.agents.length > 0) {
          setSelectedAgent(data.agents[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load agents matrix', e);
    }
  };

  const handleInvoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !testPrompt.trim() || isExecuting) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const res = await apiFetch<any>(`/api/agents/${selectedAgent.id}/invoke`, {
        method: 'POST',
        body: JSON.stringify({ prompt: testPrompt.trim() }),
      });
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({ error: err.message || 'Execution failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'agent_conversation':
        return <MessageSquare className="w-5 h-5 text-sky-400" />;
      case 'agent_coding':
        return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'agent_research':
        return <Globe className="w-5 h-5 text-purple-400" />;
      case 'agent_vision':
        return <Eye className="w-5 h-5 text-pink-400" />;
      case 'agent_device':
        return <Smartphone className="w-5 h-5 text-amber-400" />;
      case 'agent_computer':
        return <Terminal className="w-5 h-5 text-cyan-400" />;
      case 'agent_automation':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'agent_memory':
        return <Database className="w-5 h-5 text-teal-400" />;
      case 'agent_system_monitor':
        return <Activity className="w-5 h-5 text-green-400" />;
      case 'agent_security':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'agent_planning':
        return <GitFork className="w-5 h-5 text-fuchsia-400" />;
      case 'agent_verification':
        return <CheckCircle2 className="w-5 h-5 text-yellow-400" />;
      default:
        return <Brain className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-mono font-bold text-white tracking-wider flex items-center gap-2">
                <span>12-AGENT AUTONOMOUS MATRIX</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ALL ONLINE
                </span>
              </h2>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                Specialized sub-agent orchestrator: Conversation, Coding, Research, Optics, OS Control, and Defense.
              </p>
            </div>
          </div>
        </div>

        {/* 12-Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-4">
          {agents.map((ag) => {
            const isSelected = selectedAgent?.id === ag.id;
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => {
                  setSelectedAgent(ag);
                  setExecutionResult(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                    : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                      {getAgentIcon(ag.id)}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400">
                      {ag.codename}
                    </span>
                  </div>

                  <h3 className="text-xs font-mono font-bold text-white">{ag.name}</h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                    {ag.role}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>Model: {ag.assignedModel.split('-')[0]}</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Playground / Direct Invocation Console */}
      {selectedAgent && (
        <div className="bg-neutral-950 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700">
                {getAgentIcon(selectedAgent.id)}
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <span>{selectedAgent.name}</span>
                  <span className="text-xs font-normal text-cyan-400 font-mono">
                    [{selectedAgent.codename}]
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">{selectedAgent.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedAgent.specialization.map((spec, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleInvoke} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder={`Dispatch custom task to ${selectedAgent.name} (e.g. "${selectedAgent.specialization[0]} task")...`}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors pr-28"
              />
              <button
                type="submit"
                disabled={isExecuting || !testPrompt.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>RUNNING</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>DISPATCH</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results Output */}
          {executionResult && (
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-mono space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Agent Result ({executionResult.modelUsed || 'Gemini'})
                </span>
                <span className="text-[10px] text-neutral-500">{executionResult.timestamp}</span>
              </div>
              <div className="text-neutral-200 font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto pr-2">
                {executionResult.response || executionResult.error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
