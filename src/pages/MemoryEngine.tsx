import React, { useState, useEffect } from 'react';
import {
  Brain,
  Database,
  Search,
  Plus,
  Trash2,
  Sparkles,
  GitGraph,
  Share2,
  Code,
  Bug,
  Layers,
  FileText,
  CheckCircle2,
  Tag,
  RefreshCw,
  Sliders,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import {
  VectorMemoryDocument,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
  UserPreferencesProfile,
} from '../types/jarvis';

export const MemoryEngine: React.FC = () => {
  const [documents, setDocuments] = useState<VectorMemoryDocument[]>([]);
  const [userProfile, setUserProfile] = useState<UserPreferencesProfile | null>(null);
  const [graphNodes, setGraphNodes] = useState<KnowledgeGraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<KnowledgeGraphEdge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VectorMemoryDocument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeView, setActiveView] = useState<'VECTOR_DOCS' | 'KNOWLEDGE_GRAPH' | 'USER_PREFERENCES' | 'STRATEGIC_WEIGHTS'>('VECTOR_DOCS');

  // Strategic Learning Weights State
  const [techWeight, setTechWeight] = useState(75);
  const [personalWeight, setPersonalWeight] = useState(25);
  const [banglishNuance, setBanglishNuance] = useState(90);
  const [proactiveFrequency, setProactiveFrequency] = useState<'HIGH' | 'BALANCED' | 'LOW'>('BALANCED');
  const [activePersona, setActivePersona] = useState<'SUPER_BRAIN_ANALYTICAL' | 'PERSONAL_COMPANION' | 'HYBRID_INTELLIGENCE'>('HYBRID_INTELLIGENCE');
  const [isSavingWeights, setIsSavingWeights] = useState(false);
  const [vaultData, setVaultData] = useState<any>(null);

  // Form modal
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<VectorMemoryDocument['category']>('CODE_SNIPPET');
  const [newTags, setNewTags] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMemoryData();
    loadLearningWeights();
  }, []);

  const loadLearningWeights = async () => {
    try {
      const res = await apiFetch<{ weights: any }>('/api/memory/learning-weights');
      if (res.weights) {
        setTechWeight(res.weights.technicalWeight || 75);
        setPersonalWeight(res.weights.personalAssistantWeight || 25);
        setBanglishNuance(res.weights.banglishNuanceLevel || 90);
        setProactiveFrequency(res.weights.proactiveSuggestionFrequency || 'BALANCED');
        setActivePersona(res.weights.activePersona || 'HYBRID_INTELLIGENCE');
      }
    } catch (e) {
      console.warn('Failed to load learning weights', e);
    }
  };

  const handleSaveLearningWeights = async () => {
    setIsSavingWeights(true);
    try {
      await apiFetch('/api/memory/learning-weights', {
        method: 'POST',
        body: JSON.stringify({
          technicalWeight: techWeight,
          personalAssistantWeight: personalWeight,
          banglishNuanceLevel: banglishNuance,
          proactiveSuggestionFrequency: proactiveFrequency,
          activePersona,
        }),
      });
      showToast('Strategic Learning Weights updated & encrypted in memory.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingWeights(false);
    }
  };

  const handleExportVault = async () => {
    try {
      const res = await apiFetch<{ vault: any }>('/api/memory/vault-export');
      setVaultData(res.vault);
      showToast(`Encrypted Vault Exported (${res.vault.totalDocuments} docs, ${res.vault.totalNodes} graph nodes).`);
    } catch (e) {
      console.error('Failed to export vault', e);
    }
  };

  const loadMemoryData = async () => {
    try {
      const docsRes = await apiFetch<{ documents: VectorMemoryDocument[] }>('/api/memory/documents');
      if (docsRes.documents) setDocuments(docsRes.documents);

      const profRes = await apiFetch<{ profile: UserPreferencesProfile }>('/api/memory/profile');
      if (profRes.profile) setUserProfile(profRes.profile);

      const graphRes = await apiFetch<{ nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] }>('/api/memory/graph');
      if (graphRes.nodes) {
        setGraphNodes(graphRes.nodes);
        setGraphEdges(graphRes.edges || []);
      }
    } catch (err) {
      console.error('Failed to load memory data', err);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await apiFetch<{ results: VectorMemoryDocument[] }>(
        `/api/memory/search?q=${encodeURIComponent(searchQuery.trim())}&limit=8`
      );
      setSearchResults(res.results || []);
    } catch (err) {
      console.error('Semantic search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const tagsArray = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await apiFetch<{ document: VectorMemoryDocument }>('/api/memory/documents', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory,
          tags: tagsArray,
        }),
      });

      if (res.document) {
        setDocuments([res.document, ...documents]);
        setShowAddDoc(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        showToast('Document indexed into Vector Database with 32-dim Embedding!');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await apiFetch(`/api/memory/documents/${id}`, { method: 'DELETE' });
      setDocuments(documents.filter((d) => d.id !== id));
      setSearchResults(searchResults.filter((d) => d.id !== id));
      showToast('Document removed from vector memory.');
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getCategoryIcon = (cat: VectorMemoryDocument['category']) => {
    switch (cat) {
      case 'CODE_SNIPPET':
        return <Code className="w-4 h-4 text-cyan-400" />;
      case 'BUG_FIX':
        return <Bug className="w-4 h-4 text-rose-400" />;
      case 'ARCHITECTURE':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'USER_PREFERENCE':
        return <Sliders className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-emerald-400" />;
    }
  };

  const displayedDocs = searchQuery.trim() ? searchResults : documents;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div
          id="memory-toast-notice"
          className="fixed bottom-20 right-4 z-50 bg-neutral-900 border border-cyan-500 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce font-mono text-xs"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER & HERO */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-purple-400 font-semibold uppercase tracking-wider">
                Long-Term Memory & Vector DB Integration
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-mono tracking-tight">
              Persistent Vector Database & Knowledge Graph
            </h1>
            <p className="text-sm text-neutral-400 font-mono mt-1 max-w-2xl">
              Cross-session memory persistence: Remembers your coding style, architecture habits, past resolved bugs, and recalls technical documents via high-dimensional Cosine Vector search.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Total Vectors</span>
              <span className="text-lg font-mono font-bold text-cyan-400">{documents.length}</span>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Graph Nodes</span>
              <span className="text-lg font-mono font-bold text-purple-400">{graphNodes.length}</span>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Learned Rules</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                {userProfile?.totalLearnedPatterns || 24}
              </span>
            </div>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-6 border-t border-neutral-800/80 pt-4">
          <button
            id="tab-vector-docs"
            onClick={() => setActiveView('VECTOR_DOCS')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeView === 'VECTOR_DOCS'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            VECTOR DOCUMENTS & SEARCH ({documents.length})
          </button>
          <button
            id="tab-knowledge-graph"
            onClick={() => setActiveView('KNOWLEDGE_GRAPH')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeView === 'KNOWLEDGE_GRAPH'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <GitGraph className="w-3.5 h-3.5" />
            KNOWLEDGE GRAPH ({graphNodes.length} Nodes)
          </button>
          <button
            id="tab-user-preferences"
            onClick={() => setActiveView('USER_PREFERENCES')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeView === 'USER_PREFERENCES'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            USER STYLE & PROFILE
          </button>
          <button
            id="tab-strategic-weights"
            onClick={() => setActiveView('STRATEGIC_WEIGHTS')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeView === 'STRATEGIC_WEIGHTS'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            STRATEGIC EVOLUTION & WEIGHTS
          </button>
        </div>
      </div>

      {/* VIEW 1: VECTOR DOCUMENTS & SEMANTIC SEARCH */}
      {activeView === 'VECTOR_DOCS' && (
        <div className="space-y-4">
          {/* Search bar & Add Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Semantic Vector Search (e.g. 'Raft consensus', 'useEffect bug', 'OWASP rules')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                SEARCH VECTORS
              </button>
            </form>

            <button
              onClick={() => setShowAddDoc(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              ADD MEMORY DOCUMENT
            </button>
          </div>

          {/* Quick Filter Tag Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500 text-[11px]">Quick Semantic Queries:</span>
            {['React memory leak bug', 'OWASP top 10 rules', 'Bangla distributed systems', 'Recursive sandbox'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  setTimeout(() => handleSearch(), 50);
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 text-neutral-300 text-[11px] transition-colors"
              >
                🔍 "{tag}"
              </button>
            ))}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-[11px] text-rose-400 hover:underline ml-2"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Add Document Form Modal */}
          {showAddDoc && (
            <form
              onSubmit={handleCreateDocument}
              className="bg-neutral-900 border border-purple-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  Index New Vector Document
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddDoc(false)}
                  className="text-xs font-mono text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Document Title (e.g. Dockerfile Optimization Guideline)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="CODE_SNIPPET">Code Snippet</option>
                  <option value="BUG_FIX">Bug Fix & Resolution</option>
                  <option value="ARCHITECTURE">Architecture Pattern</option>
                  <option value="USER_PREFERENCE">User Specific Rule</option>
                  <option value="DOCS">Technical Docs</option>
                </select>
              </div>

              <textarea
                rows={4}
                placeholder="Content, code snippet, bug stack trace, or solution summary..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />

              <input
                type="text"
                placeholder="Comma separated tags (e.g. docker, caching, microservices)..."
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl transition-all"
                >
                  Compute Embedding & Index
                </button>
              </div>
            </form>
          )}

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/40 rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(doc.category)}
                      <span className="text-xs font-mono font-bold text-white">{doc.title}</span>
                    </div>
                    {doc.similarityScore !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shrink-0">
                        Match: {Math.round(doc.similarityScore * 100)}%
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-mono text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 whitespace-pre-wrap line-clamp-4">
                    {doc.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: KNOWLEDGE GRAPH */}
      {activeView === 'KNOWLEDGE_GRAPH' && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <GitGraph className="w-4 h-4 text-purple-400" />
                User-Specific Semantic Knowledge Graph
              </h3>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                Active conceptual entities and dynamic relational edges learned across user sessions.
              </p>
            </div>
            <button
              onClick={loadMemoryData}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Graph
            </button>
          </div>

          {/* Graph Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {graphNodes.map((node) => (
              <div
                key={node.id}
                className="bg-neutral-950 border border-purple-500/20 hover:border-purple-500/50 rounded-xl p-4 space-y-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white group-hover:text-purple-300">
                    {node.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {node.category}
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-400">{node.details}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                  <span>Weight: {node.weight}/10</span>
                  <span>ID: {node.id}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Relational Edges */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-mono font-bold text-neutral-300 block mb-2">
              ACTIVE GRAPH EDGES (RELATIONSHIPS):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {graphEdges.map((edge) => (
                <div
                  key={edge.id}
                  className="p-2.5 bg-neutral-900 border border-neutral-800/80 rounded-lg flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-cyan-400 font-bold">{edge.source}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                    --[{edge.relation}]--&gt;
                  </span>
                  <span className="text-emerald-400 font-bold">{edge.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: USER PREFERENCES & CODING PROFILE */}
      {activeView === 'USER_PREFERENCES' && userProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coding Style */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              PREFERRED CODING STYLE
            </h3>
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-cyan-300">
              {userProfile.preferredCodingStyle}
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-neutral-300 block mb-2">
                Learned Architectural Habits:
              </span>
              <ul className="space-y-1.5">
                {userProfile.architectureHabits.map((habit, i) => (
                  <li key={i} className="text-xs font-mono text-neutral-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{habit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-neutral-300 block mb-2">
                Custom Autonomous Directives:
              </span>
              <ul className="space-y-1.5">
                {userProfile.customDirectives.map((dir, i) => (
                  <li key={i} className="text-xs font-mono text-neutral-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{dir}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tech Stack Preferences */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              TECH STACK PREFERENCES (CROSS-SESSION)
            </h3>

            <div className="space-y-3">
              {Object.entries(userProfile.techStackPreferences).map(([layer, items]) => (
                <div key={layer} className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-1.5">
                    {layer}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-900 border border-neutral-700 text-white font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: STRATEGIC INQUIRY & LEARNING WEIGHTS CALIBRATION */}
      {activeView === 'STRATEGIC_WEIGHTS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 & 2: Interactive Role Balancer & Strategic Direction */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      STRATEGIC INQUIRY: COGNITIVE WEIGHTS & ROLE ALLOCATION
                    </h3>
                    <p className="text-xs font-mono text-neutral-400 mt-1">
                      Calibrate ULTRON's identity balance between Technical Analytical Core vs Personal Daily Life Companion.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">
                    LIVE CALIBRATION
                  </span>
                </div>

                {/* Persona Mode Select */}
                <div className="space-y-3">
                  <label className="text-xs font-mono font-bold text-neutral-300">
                    PRIMARY OPERATIONAL PERSONA:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePersona('SUPER_BRAIN_ANALYTICAL');
                        setTechWeight(90);
                        setPersonalWeight(10);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        activePersona === 'SUPER_BRAIN_ANALYTICAL'
                          ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-lg'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-cyan-400">Technical & Analytical</span>
                        <Cpu className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 mt-1">
                        90% Code, Architecture, Bug Fixing, Security SAST, Deep Verification.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePersona('HYBRID_INTELLIGENCE');
                        setTechWeight(70);
                        setPersonalWeight(30);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        activePersona === 'HYBRID_INTELLIGENCE'
                          ? 'border-purple-500 bg-purple-950/40 text-white shadow-lg'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-purple-300">Hybrid Intelligence</span>
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 mt-1">
                        70% Tech Architecture + 30% Daily Workflow, Spotify, WhatsApp, Calls.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePersona('PERSONAL_COMPANION');
                        setTechWeight(35);
                        setPersonalWeight(65);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        activePersona === 'PERSONAL_COMPANION'
                          ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-lg'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400">Personal Companion</span>
                        <Brain className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 mt-1">
                        65% Daily Life, Emotional Tone, Banglish Conversation, Reminders, Scheduling.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Weight Sliders */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-cyan-300 font-bold">Technical / Analytical Weight:</span>
                      <span className="text-white font-bold">{techWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={techWeight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setTechWeight(val);
                        setPersonalWeight(100 - val);
                      }}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-purple-300 font-bold">Personal Life Assistant Weight:</span>
                      <span className="text-white font-bold">{personalWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      value={personalWeight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setPersonalWeight(val);
                        setTechWeight(100 - val);
                      }}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-emerald-300 font-bold">Banglish Nuance & Slang Decoding Level:</span>
                      <span className="text-white font-bold">{banglishNuance}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={banglishNuance}
                      onChange={(e) => setBanglishNuance(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                </div>

                {/* Proactive Suggestion Loops Setting */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <label className="text-xs font-mono font-bold text-neutral-300">
                    AUTONOMOUS AGENTIC PROACTIVE SUGGESTIONS:
                  </label>
                  <div className="flex gap-2">
                    {(['HIGH', 'BALANCED', 'LOW'] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setProactiveFrequency(freq)}
                        className={`flex-1 py-2 text-xs font-mono rounded-xl border transition-all ${
                          proactiveFrequency === freq
                            ? 'bg-neutral-800 border-cyan-500 text-white font-bold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveLearningWeights}
                    disabled={isSavingWeights}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl text-xs font-mono font-bold hover:brightness-110 flex items-center gap-2 shadow-lg shadow-cyan-900/30"
                  >
                    {isSavingWeights ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        UPDATING WEIGHTS...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        COMMIT STRATEGIC WEIGHTS
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Encrypted Lifetime Memory Vault */}
            <div className="space-y-6">
              <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  ENCRYPTED LIFETIME VAULT
                </h3>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Export complete encrypted vector memory snapshot containing all learned personal preferences, past bugs, and architectural habits.
                </p>

                <button
                  type="button"
                  onClick={handleExportVault}
                  className="w-full py-3 bg-neutral-950 border border-purple-500/40 hover:border-purple-500 text-purple-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all hover:bg-purple-950/20"
                >
                  <Share2 className="w-4 h-4 text-purple-400" />
                  EXPORT ENCRYPTED MEMORY VAULT
                </button>

                {vaultData && (
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-neutral-400">
                      <span>Checksum:</span>
                      <span className="text-cyan-400 font-bold">{vaultData.checksum}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Total Documents:</span>
                      <span className="text-white font-bold">{vaultData.totalDocuments}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Knowledge Nodes:</span>
                      <span className="text-white font-bold">{vaultData.totalNodes}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[10px] text-neutral-500 block mb-1">Encrypted Payload Preview:</span>
                      <div className="p-2 bg-neutral-900 rounded border border-neutral-800 text-[10px] text-neutral-400 truncate">
                        {vaultData.encryptedBlob.slice(0, 80)}...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
