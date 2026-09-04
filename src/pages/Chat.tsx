import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Mic,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Loader2,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Zap,
  CornerDownRight,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { ChatMessage, ProviderId, OrbState } from '../types/jarvis';
import { findAlternativeCommand, CommandSuggestion } from '../lib/commandSuggestions';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachments?: any[]) => void;
  isLoading: boolean;
  orbState: OrbState;
  onVoiceClick: () => void;
  selectedProvider: ProviderId;
  onSelectProvider: (p: ProviderId) => void;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  orbState,
  onVoiceClick,
  selectedProvider,
  onSelectProvider,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; type: 'image' | 'code' | 'doc'; content: string }[]>([]);
  const [liveSuggestion, setLiveSuggestion] = useState<CommandSuggestion | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Live input suggestion detector for high-confidence alternative commands
  useEffect(() => {
    if (!inputText.trim() || inputText.length < 3) {
      setLiveSuggestion(null);
      return;
    }

    const suggestion = findAlternativeCommand(inputText);
    // Don't show suggestion if input is identical to suggested command
    if (suggestion && suggestion.suggestedCommand.toLowerCase() !== inputText.trim().toLowerCase()) {
      setLiveSuggestion(suggestion);
    } else {
      setLiveSuggestion(null);
    }
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputText, attachments.length > 0 ? attachments : undefined);
    setInputText('');
    setAttachments([]);
    setLiveSuggestion(null);
  };

  const handleApplySuggestion = (suggestedCommand: string, autoRun = true) => {
    if (autoRun) {
      onSendMessage(suggestedCommand);
      setInputText('');
      setLiveSuggestion(null);
    } else {
      setInputText(suggestedCommand);
      setLiveSuggestion(null);
      inputRef.current?.focus();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateAttachment = (type: 'image' | 'code' | 'doc') => {
    if (type === 'image') {
      setAttachments((prev) => [
        ...prev,
        {
          name: 'quantum_drone_concept.png',
          type: 'image',
          content: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        },
      ]);
    } else if (type === 'code') {
      setAttachments((prev) => [
        ...prev,
        {
          name: 'spatial_matrix.ts',
          type: 'code',
          content: '// Spatial KD-Tree Matrix Vector Node\nexport class SpatialEngine {}',
        },
      ]);
    } else {
      setAttachments((prev) => [
        ...prev,
        {
          name: 'jarvis_spec_v5.pdf',
          type: 'doc',
          content: 'JARVIS Deep Analysis Cognitive Super Brain Architecture Spec',
        },
      ]);
    }
  };

  const QUICK_PROMPTS = [
    { label: '⚛️ 3D Arc Reactor', cmd: 'Build 3D holographic Iron Man Arc Reactor' },
    { label: '🛸 3D Quantum Drone', cmd: 'Build 3D Quantum Drone' },
    { label: '🛡️ JARVIS Security', cmd: 'JARVIS MODE' },
    { label: '🎵 YouTube Playback', cmd: 'YouTube e gan chalao' },
    { label: '📊 System Diagnostics', cmd: 'Run full system diagnostics and latency audit' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] animate-in fade-in duration-300 min-w-0 overflow-x-hidden">
      {/* Top Chat Bar: Provider Selector & Category Indicator */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-mono text-xs font-semibold text-white truncate">JARVIS CONVERSATION MATRIX</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 shrink-0">
            DEEP COGNITIVE CORE
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">Provider:</span>
          <select
            value={selectedProvider}
            onChange={(e) => onSelectProvider(e.target.value as ProviderId)}
            className="text-xs font-mono bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
          >
            <option value="gemini">Google Gemini 3.7 & 3.1</option>
            <option value="replit">Replit Agent Coder</option>
            <option value="openrouter">OpenRouter (Claude/DeepSeek)</option>
            <option value="huggingface">Hugging Face Qwen</option>
            <option value="ollama">Ollama Local AI</option>
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 min-w-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 sm:gap-3 max-w-3xl min-w-0 ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold border ${
                msg.role === 'user'
                  ? 'bg-neutral-800 border-neutral-700 text-white'
                  : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-3 sm:p-4 space-y-3 border text-sm leading-relaxed min-w-0 max-w-[calc(100vw-4.5rem)] sm:max-w-2xl break-words overflow-x-hidden ${
                msg.role === 'user'
                  ? 'bg-cyan-950/30 border-cyan-500/30 text-white rounded-tr-none'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-200 rounded-tl-none shadow-lg'
              }`}
            >
              {/* Attachments if any */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-800">
                  {msg.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-cyan-400 max-w-full truncate"
                    >
                      {att.type === 'image' ? (
                        <ImageIcon className="w-3 h-3 shrink-0" />
                      ) : (
                        <FileText className="w-3 h-3 shrink-0" />
                      )}
                      <span className="truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Content */}
              <div className="markdown-body font-sans prose prose-invert max-w-none text-xs sm:text-sm break-words overflow-hidden">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* "Did you mean?" High-Confidence Suggestion UI Element */}
              {msg.didYouMean && msg.didYouMean.suggestedCommand && (
                <div
                  id={`suggestion-${msg.id}`}
                  className="mt-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-950/70 via-neutral-900/90 to-purple-950/60 border border-cyan-500/40 shadow-sm space-y-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span className="font-bold uppercase tracking-wide text-[11px]">Did you mean:</span>
                      {msg.didYouMean.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-950/80 border border-cyan-800/80 text-cyan-400">
                          {msg.didYouMean.category}
                        </span>
                      )}
                    </div>
                    {msg.didYouMean.confidence && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                        {Math.round(msg.didYouMean.confidence * 100)}% match
                      </span>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm font-semibold text-white bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80 font-mono text-cyan-200">
                    "{msg.didYouMean.suggestedCommand}"
                  </div>

                  {msg.didYouMean.explanation && (
                    <p className="text-[11px] text-neutral-400 font-sans leading-normal">
                      {msg.didYouMean.explanation}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id={`btn-run-suggest-${msg.id}`}
                      onClick={() => handleApplySuggestion(msg.didYouMean!.suggestedCommand, true)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>Run Command</span>
                    </button>

                    <button
                      id={`btn-edit-suggest-${msg.id}`}
                      onClick={() => handleApplySuggestion(msg.didYouMean!.suggestedCommand, false)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 border border-neutral-700"
                      title="Edit command in input field"
                    >
                      <CornerDownRight className="w-3 h-3 text-neutral-400" />
                      <span>Insert</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Meta & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[10px] font-mono text-neutral-500">
                <div className="flex items-center gap-2">
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  {msg.providerUsed && (
                    <span className="text-cyan-400 bg-neutral-950 px-1.5 py-0.2 rounded border border-neutral-800 uppercase">
                      {msg.providerUsed}
                    </span>
                  )}
                  {msg.taskId && (
                    <span className="text-purple-400 bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-800/60">
                      {msg.taskId}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(msg.content, msg.id)}
                  className="text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-cyan-400 flex items-center gap-2">
              <span>JARVIS is reasoning & executing task checkpoints...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Live Alternative Suggestion Area */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-lg space-y-2">
        {/* Real-time typing "Did you mean?" popup chip */}
        {liveSuggestion && (
          <div
            id="live-typing-suggestion-banner"
            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gradient-to-r from-cyan-950/80 to-purple-950/70 border border-cyan-500/50 text-xs shadow-md animate-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
              <div className="truncate font-sans text-neutral-300">
                <span className="text-cyan-300 font-mono font-semibold mr-1.5 text-[11px]">Did you mean:</span>
                <span className="font-semibold text-white">"{liveSuggestion.suggestedCommand}"</span>
                <span className="text-neutral-400 text-[11px] ml-2 hidden sm:inline font-mono">
                  ({liveSuggestion.category} · {Math.round(liveSuggestion.confidence * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                id="live-suggest-run-btn"
                type="button"
                onClick={() => handleApplySuggestion(liveSuggestion.suggestedCommand, true)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-[11px] font-mono flex items-center gap-1 transition-colors shadow-sm"
              >
                <Zap className="w-3 h-3 fill-black" />
                <span>Run</span>
              </button>
              <button
                id="live-suggest-apply-btn"
                type="button"
                onClick={() => handleApplySuggestion(liveSuggestion.suggestedCommand, false)}
                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-mono transition-colors"
                title="Fill in input"
              >
                <span>Tab / Insert</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick prompt suggestions row when input is empty */}
        {inputText.length === 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono text-neutral-400">
            <span className="flex-shrink-0 text-[10px] text-neutral-500 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>Try:</span>
            </span>
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplySuggestion(qp.cmd, true)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/40 text-neutral-300 hover:text-cyan-300 transition-colors whitespace-nowrap"
              >
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {/* Attachment preview tags */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-300"
              >
                <span>{att.name}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-rose-400 hover:text-rose-300 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Quick Attachment Dropdown/Button */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              id="chat-attach-code-btn"
              type="button"
              onClick={() => handleSimulateAttachment('code')}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
              title="Attach Code"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              id="chat-attach-image-btn"
              type="button"
              onClick={() => handleSimulateAttachment('image')}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
              title="Attach Image"
            >
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <input
            id="chat-user-input"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              // Pressing Tab applies the live suggestion if available
              if (e.key === 'Tab' && liveSuggestion) {
                e.preventDefault();
                handleApplySuggestion(liveSuggestion.suggestedCommand, false);
              }
            }}
            placeholder="Instruct JARVIS in English, Bangla, or Banglish..."
            className="flex-1 min-w-0 bg-neutral-900 border border-neutral-800 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
            disabled={isLoading}
          />

          <button
            id="chat-voice-toggle-btn"
            type="button"
            onClick={onVoiceClick}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all shrink-0 ${
              orbState === 'LISTENING'
                ? 'border-sky-400 bg-sky-400 text-black animate-pulse'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/40'
            }`}
            title="Toggle Voice"
          >
            <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            id="chat-send-btn"
            type="submit"
            disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">SEND</span>
          </button>
        </form>
      </div>
    </div>
  );
};
