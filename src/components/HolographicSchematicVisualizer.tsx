import React, { useState, useEffect } from 'react';
import {
  HologramScene,
  HologramComponent,
  HologramLayer,
  HologramColorMapping,
  HologramDataCategory,
} from '../types/hologram';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sliders,
  Cpu,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Box,
  CheckCircle,
  Palette,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  Activity,
} from 'lucide-react';
import {
  DISTINCT_VIBRANT_PALETTE,
  LAYER_COLOR_MAP,
  MATERIAL_COLOR_MAP,
  HologramColorScheme,
  getComponentColor,
} from './HologramStage';

interface HolographicSchematicVisualizerProps {
  scene: HologramScene;
  colorMapping?: HologramColorMapping | Record<string, string>;
  colorCategory?: HologramDataCategory;
  onComponentSelect?: (component: HologramComponent) => void;
  onExplodeChange?: (factor: number) => void;
  onToggleLayer?: (layer: HologramLayer) => void;
  onResetView?: () => void;
  className?: string;
  errorMessage?: string | null;
  onSwitchTo3D?: () => void;
}

export const HolographicSchematicVisualizer: React.FC<HolographicSchematicVisualizerProps> = ({
  scene,
  colorMapping,
  colorCategory,
  onComponentSelect,
  onExplodeChange,
  onToggleLayer,
  onResetView,
  className = '',
  errorMessage,
  onSwitchTo3D,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [colorScheme, setColorScheme] = useState<HologramColorScheme>(
    colorCategory || (colorMapping && typeof colorMapping === 'object' && 'category' in colorMapping && colorMapping.category ? (colorMapping.category as HologramDataCategory) : 'DISTINCT')
  );
  const [showColorLegend, setShowColorLegend] = useState(false);

  useEffect(() => {
    if (colorCategory) {
      setColorScheme(colorCategory);
    } else if (colorMapping && typeof colorMapping === 'object' && 'category' in colorMapping && colorMapping.category) {
      setColorScheme(colorMapping.category as HologramDataCategory);
    }
  }, [colorCategory, colorMapping]);
  const [selectedComp, setSelectedComp] = useState<HologramComponent | null>(
    scene.components.find((c) => c.id === scene.selectedComponentId) || scene.components[0] || null
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, prev + 0.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.4, prev - 0.2));
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    if (onResetView) onResetView();
  };

  // Convert 3D position into 2D Isometric schematic coordinates
  const projectIso = (
    pos: [number, number, number],
    explodedOffset: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1]
  ) => {
    const factor = scene.explodedFactor || 0;
    const px = (pos[0] + (explodedOffset[0] || 0) * factor * 1.5) * 45;
    const py = (pos[1] + (explodedOffset[1] || 0) * factor * 1.5) * 45;
    const pz = (pos[2] + (explodedOffset[2] || 0) * factor * 1.5) * 45;

    // Standard Isometric 30-degree projection
    const isoX = (px - pz) * Math.cos(Math.PI / 6);
    const isoY = (px + pz) * Math.sin(Math.PI / 6) - py;

    const width = Math.max(24, Math.abs(scale[0] || 1) * 36);
    const height = Math.max(16, Math.abs(scale[1] || 1) * 28);
    const depth = Math.max(20, Math.abs(scale[2] || 1) * 32);

    return { x: isoX, y: isoY, width, height, depth };
  };

  // Filter visible components based on layer matrix
  const visibleComponents = scene.components.filter((c) => {
    if (scene.activeLayers && scene.activeLayers[c.layer] === false) return false;
    return c.visible !== false;
  });

  const layerColors: Record<HologramLayer, string> = {
    CORE: '#38bdf8',
    ELECTRONICS: '#10b981',
    MECHANICAL: '#06b6d4',
    COOLING: '#f59e0b',
    STRUCTURAL: '#64748b',
    TRACES: '#a855f7',
    CASING: '#0284c7',
  };

  return (
    <div
      id="hologram-schematic-fallback"
      className={`relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/40 bg-neutral-950 flex flex-col select-none ${className}`}
    >
      {/* ERROR / NOTICE BANNER IF WEBGL HAD ISSUES */}
      {errorMessage && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-3 py-1.5 flex items-center justify-between text-xs font-mono text-amber-300 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{errorMessage} (Operating in 2D Isometric Schematic Mode)</span>
          </div>
          {onSwitchTo3D && (
            <button
              onClick={onSwitchTo3D}
              className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] transition-all"
            >
              Retry 3D WebGL
            </button>
          )}
        </div>
      )}

      {/* TOP OVERLAY: Schematic Title, Telemetry & View Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-3 py-1.5 pointer-events-auto shadow-lg shadow-black/50">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wide">
                {scene.title}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SCHEMATIC MATRIX
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              {visibleComponents.length} Sub-Assemblies | Isometric Technical Vector Grid
            </p>
          </div>
        </div>

        {/* View & Mode Controls */}
        <div className="flex items-center gap-1.5 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-xl p-1 pointer-events-auto shadow-lg shadow-black/50">
          {/* Color Scheme Picker */}
          <div className="flex items-center bg-neutral-900/80 rounded-lg p-0.5 border border-neutral-800">
            <button
              onClick={() => setColorScheme('DISTINCT')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'DISTINCT'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Multi-Color Mode: Each component has a distinct color"
            >
              <Palette className="w-3 h-3" />
              <span>MULTI-COLOR</span>
            </button>
            <button
              onClick={() => setColorScheme('LAYER')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'LAYER'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Layer Color Mode"
            >
              <Layers className="w-3 h-3" />
              <span>BY LAYER</span>
            </button>
            <button
              onClick={() => setColorScheme('MATERIAL')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'MATERIAL'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Realistic Material Mode"
            >
              <Box className="w-3 h-3" />
              <span>MATERIAL</span>
            </button>
            <button
              onClick={() => setColorScheme('TEMPERATURE')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'TEMPERATURE'
                  ? 'bg-red-500 text-white font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Thermal Profile Mode"
            >
              <Flame className="w-3 h-3" />
              <span>THERMAL</span>
            </button>
            <button
              onClick={() => setColorScheme('POWER_STATUS')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'POWER_STATUS'
                  ? 'bg-yellow-400 text-black font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Power & Signal Rails Mode"
            >
              <Zap className="w-3 h-3" />
              <span>POWER</span>
            </button>
            <button
              onClick={() => setColorScheme('SUBSYSTEM')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'SUBSYSTEM'
                  ? 'bg-pink-500 text-white font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Subsystem Architecture"
            >
              <Activity className="w-3 h-3" />
              <span>SUBSYSTEM</span>
            </button>
          </div>

          <div className="w-[1px] h-4 bg-neutral-800" />

          {/* Toggle Color Key */}
          <button
            onClick={() => setShowColorLegend(!showColorLegend)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all border ${
              showColorLegend
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                : 'text-neutral-300 hover:bg-neutral-800 border-neutral-800'
            }`}
            title="Toggle Color Key"
          >
            <div className="flex -space-x-1 items-center">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <span>COLOR KEY</span>
            {showColorLegend ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="w-[1px] h-4 bg-neutral-800" />

          {onSwitchTo3D && (
            <button
              onClick={onSwitchTo3D}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-cyan-400 hover:bg-cyan-950/50 hover:text-white border border-cyan-500/30 flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D WEBGL</span>
            </button>
          )}
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
            title="Reset Pan & Zoom"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FLOATING INTERACTIVE COLOR LEGEND HUD IN SCHEMATIC */}
      {showColorLegend && (
        <div className="absolute top-16 right-3 bg-neutral-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-3 max-w-xs w-72 pointer-events-auto z-20 shadow-2xl shadow-black/80 animate-fade-in max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Color Key / রঙের বিবরণী</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-300 border border-cyan-500/30">
              {colorScheme}
            </span>
          </div>

          <p className="text-[10px] text-neutral-400 font-mono mb-2">
            Click any part to inspect in schematic:
          </p>

          <div className="overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
            {scene.components.map((comp, idx) => {
              const info = getComponentColor(comp, idx, colorScheme, colorMapping);
              const isSelected = selectedComp?.id === comp.id;

              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    setSelectedComp(comp);
                    if (onComponentSelect) onComponentSelect(comp);
                  }}
                  className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between gap-2 text-xs font-mono transition-all border ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_6px_currentColor]"
                      style={{ backgroundColor: info.color, color: info.color }}
                    />
                    <div className="truncate">
                      <div className="font-semibold truncate text-[11px]">{comp.name}</div>
                      <div className="text-[9px] text-neutral-400">{info.label || `${comp.shape} • ${comp.materialType}`}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-300 flex-shrink-0">
                    {comp.layer}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* INTERACTIVE ISOMETRIC SVG SCHEMATIC CANVAS */}
      <div
        className="relative w-full flex-1 cursor-grab active:cursor-grabbing min-h-[380px] overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-neutral-950 to-neutral-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Cybernetic Hologram Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #06b6d4 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Projection Canvas */}
        <svg
          className="w-full h-full"
          viewBox="-400 -300 800 600"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Holographic Glowing Filters */}
            <filter id="holoGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Transform Group for Pan and Zoom */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* 1. Holographic Floor Grid Base */}
            <g opacity="0.35">
              {[-180, -120, -60, 0, 60, 120, 180].map((offset, i) => (
                <line
                  key={`h-${i}`}
                  x1={-250 + offset}
                  y1={140 + offset * 0.5}
                  x2={250 + offset}
                  y2={-140 + offset * 0.5}
                  stroke="#06b6d4"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}
              {[-180, -120, -60, 0, 60, 120, 180].map((offset, i) => (
                <line
                  key={`v-${i}`}
                  x1={-250 + offset}
                  y1={-140 + offset * 0.5}
                  x2={250 + offset}
                  y2={140 + offset * 0.5}
                  stroke="#06b6d4"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}
              {/* Pedestal concentric rings */}
              <ellipse
                cx="0"
                cy="100"
                rx="200"
                ry="80"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <ellipse
                cx="0"
                cy="100"
                rx="140"
                ry="55"
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.5"
              />
              <ellipse
                cx="0"
                cy="100"
                rx="80"
                ry="30"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />
            </g>

            {/* 2. Connections & Data Bus Lines */}
            {scene.connections &&
              scene.connections.map((conn) => {
                const fromComp = scene.components.find((c) => c.id === conn.fromComponentId);
                const toComp = scene.components.find((c) => c.id === conn.toComponentId);
                if (!fromComp || !toComp) return null;

                const p1 = projectIso(fromComp.position, fromComp.explodedOffset);
                const p2 = projectIso(toComp.position, toComp.explodedOffset);

                return (
                  <g key={conn.id}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={conn.color || '#38bdf8'}
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      filter="url(#holoGlow)"
                      opacity="0.8"
                    />
                    <circle
                      cx={(p1.x + p2.x) / 2}
                      cy={(p1.y + p2.y) / 2}
                      r="3"
                      fill={conn.color || '#38bdf8'}
                      filter="url(#holoGlow)"
                    />
                  </g>
                );
              })}

            {/* 3. Render 2D Isometric Assembly Blocks */}
            {visibleComponents.map((comp, idx) => {
              const { x, y, width, height, depth } = projectIso(
                comp.position,
                comp.explodedOffset,
                comp.scale
              );
              const isSelected = selectedComp?.id === comp.id || scene.selectedComponentId === comp.id;
              const colorInfo = getComponentColor(comp, idx, colorScheme, colorMapping);
              const col = colorInfo.color;

              // Isometric Box coordinates
              const topFace = `${x},${y - height / 2 - depth * 0.4} ${x + width / 2},${y - height / 2} ${x},${y - height / 2 + depth * 0.4} ${x - width / 2},${y - height / 2}`;
              const leftFace = `${x - width / 2},${y - height / 2} ${x},${y - height / 2 + depth * 0.4} ${x},${y + height / 2 + depth * 0.4} ${x - width / 2},${y + height / 2}`;
              const rightFace = `${x},${y - height / 2 + depth * 0.4} ${x + width / 2},${y - height / 2} ${x + width / 2},${y + height / 2} ${x},${y + height / 2 + depth * 0.4}`;

              return (
                <g
                  key={comp.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedComp(comp);
                    if (onComponentSelect) onComponentSelect(comp);
                  }}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  {/* Glowing Reticle Box around selected element */}
                  {isSelected && (
                    <g filter="url(#laserGlow)">
                      <rect
                        x={x - width * 0.8}
                        y={y - height * 1.2}
                        width={width * 1.6}
                        height={height * 2.4}
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        rx="8"
                      />
                      <circle cx={x} cy={y} r={width * 0.9} fill="none" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5" />
                    </g>
                  )}

                  {/* Isometric Top Face */}
                  <polygon
                    points={topFace}
                    fill={col}
                    fillOpacity={isSelected ? '0.85' : '0.55'}
                    stroke={isSelected ? '#ffffff' : col}
                    strokeWidth={isSelected ? '2' : '1.2'}
                  />

                  {/* Isometric Left Face */}
                  <polygon
                    points={leftFace}
                    fill={col}
                    fillOpacity={isSelected ? '0.7' : '0.4'}
                    stroke={isSelected ? '#ffffff' : col}
                    strokeWidth={isSelected ? '2' : '1.2'}
                  />

                  {/* Isometric Right Face */}
                  <polygon
                    points={rightFace}
                    fill={col}
                    fillOpacity={isSelected ? '0.5' : '0.25'}
                    stroke={isSelected ? '#ffffff' : col}
                    strokeWidth={isSelected ? '2' : '1.2'}
                  />

                  {/* Component Center Hologram Node Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={isSelected ? '#ffffff' : col}
                    filter="url(#holoGlow)"
                  />

                  {/* Schematic Callout Label */}
                  <g transform={`translate(${x + width * 0.6}, ${y - height * 0.4})`}>
                    <line
                      x1="0"
                      y1="0"
                      x2="25"
                      y2="-15"
                      stroke={isSelected ? '#22d3ee' : '#64748b'}
                      strokeWidth="1"
                    />
                    <line
                      x1="25"
                      y1="-15"
                      x2="90"
                      y2="-15"
                      stroke={isSelected ? '#22d3ee' : '#64748b'}
                      strokeWidth="1"
                    />
                    <rect
                      x="25"
                      y="-26"
                      width="75"
                      height="18"
                      fill="#020617"
                      fillOpacity="0.85"
                      stroke={isSelected ? '#22d3ee' : '#334155'}
                      strokeWidth="1"
                      rx="4"
                    />
                    <text
                      x="30"
                      y="-14"
                      fill={isSelected ? '#ffffff' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {comp.name.slice(0, 12)}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* BOTTOM TOOLBAR: Exploded View Slider & Telemetry */}
      <div className="border-t border-cyan-500/20 bg-neutral-950/90 backdrop-blur-md px-2.5 sm:px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-10">
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 min-w-0">
          <span className="text-[10.5px] sm:text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1 shrink-0">
            <Sliders className="w-3.5 h-3.5" />
            EXPLODE: {Math.round((scene.explodedFactor || 0) * 100)}%
          </span>
          <input
            id="slider-schematic-explode"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scene.explodedFactor || 0}
            onChange={(e) => onExplodeChange && onExplodeChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-neutral-800 rounded-lg cursor-pointer h-1.5 min-w-0"
          />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
          <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            {scene.conceptType}
          </span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
