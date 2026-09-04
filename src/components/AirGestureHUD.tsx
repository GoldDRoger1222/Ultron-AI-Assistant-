import React, { useEffect, useRef, useState } from 'react';
import {
  AirGestureTracker,
  HandMotionState,
  AirGestureCallbacks,
  HAND_CONNECTIONS,
  HandLandmarkPoint,
} from '../lib/airGestureTracker';
import {
  Sparkles,
  Zap,
  RotateCw,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  VolumeX,
  Activity,
  AlertCircle,
  HelpCircle,
  Video,
  VideoOff,
  Hand,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AirGestureHUDProps {
  isActive: boolean;
  onToggle: () => void;
  onRotate?: (deltaYaw: number, deltaPitch: number) => void;
  onExplodeChange?: (factorChange: number) => void;
  onZoomChange?: (deltaZoom: number) => void;
  onNextModel?: () => void;
  onFireAction?: () => void;
  className?: string;
}

export const AirGestureHUD: React.FC<AirGestureHUDProps> = ({
  isActive,
  onToggle,
  onRotate,
  onExplodeChange,
  onZoomChange,
  onNextModel,
  onFireAction,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<AirGestureTracker | null>(null);

  const [motionState, setMotionState] = useState<HandMotionState>({
    isActive: false,
    isAiReady: false,
    handDetected: false,
    x: 0.5,
    y: 0.5,
    rawX: 0.5,
    rawY: 0.5,
    deltaX: 0,
    deltaY: 0,
    pinchDistance: 1,
    gesture: 'IDLE',
    gestureConfidence: 0,
    lastGestureLabel: 'Air Sensor Standby',
    gestureBangla: 'সেন্সর প্রস্তুত হচ্ছে... (Initializing AI Vision)',
    fps: 60,
    landmarks: null,
    fingerStates: {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    },
  });

  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [recentGestureLabel, setRecentGestureLabel] = useState<string>('AI Hand Sensor Ready');
  const [recentGestureBangla, setRecentGestureBangla] = useState<string>('ক্যামেরার সামনে হাত রাখুন');

  // Initialize and attach tracker
  useEffect(() => {
    if (!trackerRef.current) {
      trackerRef.current = new AirGestureTracker();
    }

    const callbacks: AirGestureCallbacks = {
      onMotion: (state) => {
        setMotionState({ ...state });
      },
      onRotate: (yaw, pitch) => {
        onRotate?.(yaw, pitch);
      },
      onExplodeChange: (fac) => {
        onExplodeChange?.(fac);
      },
      onZoomChange: (zoom) => {
        onZoomChange?.(zoom);
      },
      onNextModel: () => {
        onNextModel?.();
      },
      onFireAction: () => {
        onFireAction?.();
      },
      onGestureTriggered: (gesture, bangla) => {
        setRecentGestureBangla(bangla);
        setRecentGestureLabel(gesture);
      },
    };

    trackerRef.current.setCallbacks(callbacks);

    if (isActive) {
      setPermissionError(null);
      trackerRef.current
        .startTracking(videoRef.current || undefined)
        .then(() => {
          setRecentGestureBangla('ক্যামেরার সামনে হাত আনুন');
        })
        .catch((err) => {
          console.error('Camera tracking error:', err);
          setPermissionError('ক্যামেরা পারমিশন দিন (Please Allow Camera Access)');
        });
    } else {
      trackerRef.current.stopTracking();
      setRecentGestureBangla('সেন্সর বন্ধ (Sensor Offline)');
    }

    return () => {
      if (trackerRef.current) {
        trackerRef.current.stopTracking();
      }
    };
  }, [isActive, onRotate, onExplodeChange, onZoomChange, onNextModel, onFireAction]);

  // Render 21-Point Cybernetic Holographic Skeleton on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!motionState.handDetected || !motionState.landmarks) {
      // Draw idle radar sweep
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 28, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    const lm = motionState.landmarks;

    // Draw Cybernetic Bone Links
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 6;

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = lm[startIdx];
      const p2 = lm[endIdx];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    }

    // Draw Holographic Keypoint Joints
    for (let i = 0; i < lm.length; i++) {
      const pt = lm[i];
      const isFingertip = [4, 8, 12, 16, 20].includes(i);
      const radius = isFingertip ? 3.5 : 2;

      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, radius, 0, Math.PI * 2);

      if (isFingertip) {
        ctx.fillStyle = '#f59e0b'; // Amber glow for fingertips
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = '#22d3ee'; // Cyan glow for joints
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 4;
      }
      ctx.fill();
    }

    // Draw Palm Target Ring
    const palm = lm[0];
    if (palm) {
      ctx.beginPath();
      ctx.arc(palm.x * w, palm.y * h, 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [motionState.landmarks, motionState.handDetected]);

  if (!isActive && !permissionError) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-24 right-2 sm:bottom-6 sm:right-6 max-w-[calc(100vw-1rem)] z-50 transition-all font-mono text-xs ${className}`}
    >
      {/* Hidden Offscreen Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`fixed -top-[9999px] -left-[9999px] pointer-events-none opacity-0 ${
          showCameraPreview
            ? '!static !w-44 sm:!w-48 !h-32 sm:!h-36 !opacity-100 object-cover rounded-2xl border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-2 max-w-full'
            : ''
        }`}
      />

      {/* Permission Error Card */}
      {permissionError ? (
        <div className="w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-neutral-950/95 backdrop-blur-xl border-2 border-rose-500/80 rounded-2xl p-4 shadow-[0_0_30px_rgba(244,63,94,0.4)] text-center space-y-2.5">
          <AlertCircle className="w-7 h-7 text-rose-400 mx-auto animate-bounce" />
          <p className="text-rose-200 text-xs font-bold">{permissionError}</p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={onToggle}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-all cursor-pointer"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      ) : (
        /* Holographic Floating HUD Pill */
        <div className="flex flex-col items-end gap-2 select-none max-w-full">
          {/* Quick Interactive Gesture Guide Popover */}
          {isGuideOpen && (
            <div className="w-[calc(100vw-2rem)] max-w-xs sm:w-84 p-4 bg-neutral-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] text-[11px] space-y-2.5 text-neutral-300">
              <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/30">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                  <Hand className="w-4 h-4 text-cyan-400" />
                  <span>AI Hand Gesture কমান্ড গাইড:</span>
                </div>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 text-[10.5px]">
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
                  <span className="text-lg">🖐️</span>
                  <div>
                    <strong className="text-white">খোলা হাত (Open Palm):</strong>
                    <p className="text-neutral-400 text-[10px]">সব আঙুল ছড়ালে ৩ডি পার্টস বিস্ফোরিত হবে (Explode View)।</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
                  <span className="text-lg">✊</span>
                  <div>
                    <strong className="text-white">মুঠো করা হাত (Closed Fist):</strong>
                    <p className="text-neutral-400 text-[10px]">হাত মুঠো করলে সব পার্টস একসাথে জোড়া লাগবে (Assemble)।</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
                  <span className="text-lg">☝️</span>
                  <div>
                    <strong className="text-white">তর্জনী আঙুল (Pointing Index):</strong>
                    <p className="text-neutral-400 text-[10px]">আঙুল ডানে/বামে/উপরে/নিচে নাড়ালে ৩ডি মডেল ৩৬০° স্মুথলি ঘুরবে।</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
                  <span className="text-lg">🤏</span>
                  <div>
                    <strong className="text-white">পিঞ্চ গ্র্যাব (Pinch Zoom):</strong>
                    <p className="text-neutral-400 text-[10px]">বুড়ো ও তর্জনী আঙুল কাছে এনে হাত উপরে-নিচে নিয়ে জুম ইন/আউট করুন।</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
                  <span className="text-lg">✌️</span>
                  <div>
                    <strong className="text-white">ভি সাইন / থাম্বস আপ (Peace / Like):</strong>
                    <p className="text-neutral-400 text-[10px]">পরবর্তী ৩ডি মডেল বা স্কিম্যাটিক লোড হবে।</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
                  <span className="text-lg">🤘</span>
                  <div>
                    <strong className="text-white">রক অন (Rock On Sign):</strong>
                    <p className="text-neutral-400 text-[10px]">৩৬০° টার্বো স্পিন এবং অটো-অরবিট সক্রিয় হবে।</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20">
                  <span className="text-lg">🤙</span>
                  <div>
                    <strong className="text-white">শাকা সাইন (Call / Shaka):</strong>
                    <p className="text-neutral-400 text-[10px]">ওয়্যারফ্রেম ও কম্পোনেন্ট লেয়ার টগল হবে।</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Floating Stark Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-950/92 backdrop-blur-xl border border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-1.5 pr-2.5 sm:pr-3 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all max-w-full min-w-0">
            {/* Live Holographic Hand Landmark Mini Radar */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center overflow-hidden shrink-0">
              <canvas
                ref={canvasRef}
                width={80}
                height={80}
                className="w-full h-full object-contain pointer-events-none"
              />
              {!motionState.handDetected && (
                <Hand className="absolute w-4 h-4 text-cyan-400/40 animate-pulse pointer-events-none" />
              )}
            </div>

            {/* Live Status & Detected Gesture */}
            <div className="flex flex-col text-left pr-1 min-w-0 sm:min-w-[140px] max-w-[140px] sm:max-w-[200px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    motionState.handDetected
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                      : 'bg-amber-400/60 animate-ping'
                  }`}
                />
                <span className="font-bold text-white text-[9.5px] sm:text-[10px] tracking-wide truncate">
                  {motionState.handDetected ? 'HAND LOCKED' : 'SEARCHING...'}
                </span>
                <span className="text-[9px] text-cyan-400/70 ml-auto font-mono hidden xs:inline">
                  {motionState.fps || 60}FPS
                </span>
              </div>
              <span className="text-[9.5px] sm:text-[10px] text-cyan-300 font-semibold truncate">
                {motionState.gestureBangla || recentGestureBangla}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 pl-1 sm:pl-1.5 border-l border-white/10 shrink-0">
              {/* Peek Camera Feed */}
              <button
                onClick={() => setShowCameraPreview(!showCameraPreview)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showCameraPreview
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-neutral-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                }`}
                title={showCameraPreview ? 'Hide Camera' : 'Show Camera Preview'}
              >
                {showCameraPreview ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </button>

              {/* Guide */}
              <button
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isGuideOpen
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-neutral-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                }`}
                title="Hand Gesture Guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer ml-0.5"
                title="Turn Off Air Gesture"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
