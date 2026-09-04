import React, { useEffect, useRef } from 'react';
import { OrbState } from '../types/jarvis';

interface JarvisOrbProps {
  state: OrbState;
  audioLevel?: number;
  size?: number;
  onClick?: () => void;
}

export const JarvisOrb: React.FC<JarvisOrbProps> = ({
  state,
  audioLevel = 0,
  size = 260,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // State color mapping
  const getColorScheme = (st: OrbState) => {
    switch (st) {
      case 'WAKE':
      case 'STANDBY':
        return { primary: '#38bdf8', secondary: '#0284c7', glow: 'rgba(56, 189, 248, 0.35)' }; // Standby Sky
      case 'LISTENING':
        return { primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6, 182, 212, 0.45)' }; // Active Cyan
      case 'ANALYZING':
        return { primary: '#a855f7', secondary: '#7e22ce', glow: 'rgba(168, 85, 247, 0.5)' }; // Deep Cognitive Purple
      case 'WORKING':
      case 'EXECUTING':
        return { primary: '#10b981', secondary: '#047857', glow: 'rgba(16, 185, 129, 0.45)' }; // Emerald Engine
      case 'AI_SWITCHING':
        return { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.55)' }; // Shifting Amber
      case 'THINKING':
        return { primary: '#c084fc', secondary: '#9333ea', glow: 'rgba(192, 132, 252, 0.4)' }; // Purple
      case 'SPEAKING':
        return { primary: '#fbbf24', secondary: '#b45309', glow: 'rgba(251, 191, 36, 0.45)' }; // Gold/Amber
      case 'COMPLETE':
        return { primary: '#22c55e', secondary: '#15803d', glow: 'rgba(34, 197, 94, 0.4)' }; // Green
      case 'SECURITY_MODE':
        return { primary: '#f43f5e', secondary: '#e11d48', glow: 'rgba(244, 63, 94, 0.5)' }; // Crimson Red
      case 'ERROR':
        return { primary: '#ef4444', secondary: '#b91c1c', glow: 'rgba(239, 68, 68, 0.5)' };
      default: // IDLE
        return { primary: '#06b6d4', secondary: '#0e7490', glow: 'rgba(6, 182, 212, 0.35)' }; // Cyan
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = (canvas.width / 2) * 0.55;

      const colors = getColorScheme(state);
      const amp = Math.max(0.05, audioLevel * 1.5);

      rotation += state === 'THINKING' ? 0.04 : 0.015;
      pulse += 0.03;

      // 1. Radial ambient background glow
      const bgGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.8);
      bgGlow.addColorStop(0, colors.glow);
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Orbit Rings with tick segments
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * (1.15 + amp * 0.2), 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-rotation * 2);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 30, 5, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * (1.3 + Math.sin(pulse) * 0.05), 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // 3. Middle Dynamic Acoustic Wave Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      const points = 32;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave = Math.sin(angle * 6 + pulse * 2) * (amp * 16) + Math.cos(angle * 3 - pulse) * 4;
        const r = radius + wave;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();

      // 4. Central Glowing Core Sphere
      const coreGrad = ctx.createRadialGradient(
        centerX - radius * 0.2,
        centerY - radius * 0.2,
        radius * 0.05,
        centerX,
        centerY,
        radius * 0.8
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, colors.primary);
      coreGrad.addColorStop(0.8, colors.secondary);
      coreGrad.addColorStop(1, 'rgba(10, 15, 30, 0.9)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      const coreRadius = radius * (0.7 + Math.sin(pulse * 1.5) * 0.04 + amp * 0.15);
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Core Hexagon / Reticle Overlay
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-rotation * 0.8);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const hx = Math.cos(a) * (radius * 0.4);
        const hy = Math.sin(a) * (radius * 0.4);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, audioLevel]);

  return (
    <div
      id="jarvis-orb-container"
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group transition-transform duration-300 hover:scale-105 active:scale-95"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        style={{ width: size, height: size }}
        className="drop-shadow-2xl"
      />
      {/* State badge indicator */}
      <div
        id="jarvis-orb-badge"
        className="absolute bottom-2 px-3 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase border border-cyan-500/30 bg-neutral-950/80 backdrop-blur-md shadow-lg"
      >
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
            state === 'SECURITY_MODE'
              ? 'bg-rose-500 animate-ping'
              : state === 'LISTENING'
              ? 'bg-sky-400 animate-pulse'
              : state === 'SPEAKING'
              ? 'bg-amber-400 animate-bounce'
              : state === 'THINKING'
              ? 'bg-purple-400 animate-pulse'
              : 'bg-cyan-400'
          }`}
        />
        {state.replace('_', ' ')}
      </div>
    </div>
  );
};
