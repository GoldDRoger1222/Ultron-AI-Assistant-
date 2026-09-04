import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  Radio,
  Cpu,
  Eye,
  Layers,
  Wrench,
  RotateCw,
  Sliders,
  Volume2,
  Terminal,
  Activity,
  Maximize2,
  Minimize2,
  CheckCircle,
  AlertTriangle,
  Flame,
  Camera,
  Play,
  Pause,
  RefreshCw,
  Compass,
  Globe,
  HardHat,
  Wifi,
  Brain,
  Award,
} from 'lucide-react';
import * as THREE from 'three';
import { OrbState } from '../types/jarvis';
import { AirGestureHUD } from './AirGestureHUD';

export interface StarkProtocol {
  id: string;
  name: string;
  code: string;
  category: 'ARMOR_SUITE' | 'DEFENSE_SECURITY' | 'LAB_AUTOMATION' | 'ENERGY_GRID' | 'QUANTUM_COMPUTE';
  description: string;
  voicePhrase: string;
  status: 'ACTIVE' | 'STANDBY' | 'ENGAGED' | 'LOCKED';
  powerRequiredMW: number;
  armorModel: string;
  details: string[];
}

export const STARK_PROTOCOLS: StarkProtocol[] = [
  {
    id: 'PROTO_HOUSE_PARTY',
    name: 'House Party Protocol',
    code: 'CLEAN_SLATE_ACT_85',
    category: 'ARMOR_SUITE',
    description: 'Deploys and synchronizes all Iron Legion & Mark autonomous armors via orbital satellite relay.',
    voicePhrase: 'Jarvis, execute House Party Protocol',
    status: 'STANDBY',
    powerRequiredMW: 850,
    armorModel: 'Mark 1 - Mark 85 All Legion',
    details: [
      'Satellite uplink: Veronica Orbital Station',
      'Deploying Mark 42, 44 (Hulkbuster), Mark 50 (Nanotech), Mark 85',
      'AI Formation: Autonomous swarm defense matrix',
    ],
  },
  {
    id: 'PROTO_HULKBUSTER_VERONICA',
    name: 'Veronica Orbital Armor Assembly',
    code: 'CODE_HEAVY_ASSAULT_44',
    category: 'ARMOR_SUITE',
    description: 'Calls the low-Earth orbit Veronica satellite capsule to deploy modular heavy armor plates.',
    voicePhrase: 'Veronica, send backup armor',
    status: 'STANDBY',
    powerRequiredMW: 1200,
    armorModel: 'Mark 44 Hulkbuster Exo-Chassis',
    details: [
      'Orbital trajectory calculated: 450 km LEO',
      'Drop capsule ETA: 42 seconds',
      'Arc reactor coupling: Dual high-output Repulsor core',
    ],
  },
  {
    id: 'PROTO_NANOTECH_RECONFIGURATION',
    name: 'Nanotech Instant Weaponry & Shielding',
    code: 'NANO_FLEET_MK50',
    category: 'ARMOR_SUITE',
    description: 'Instant morphing of gold-titanium nanoparticle matrix into energy blades, beam cannons, and shields.',
    voicePhrase: 'Deploy energy blade and nanotech shield',
    status: 'ACTIVE',
    powerRequiredMW: 420,
    armorModel: 'Mark 50 & Mark 85 Nanotech',
    details: [
      'Nanite particle density: 10^14 particles/cm³',
      'Morph latency: 85 milliseconds',
      'Thermal threshold: 8,500 °C dissipation',
    ],
  },
  {
    id: 'PROTO_AIR_GESTURE_HOLO',
    name: 'Air-Gesture Spatial Lab Telemetry',
    code: 'SPATIAL_AIR_TOUCH_V4',
    category: 'LAB_AUTOMATION',
    description: 'Optical camera hand-tracking enabling mid-air pinch, swipe, explode, and throw 3D holograms.',
    voicePhrase: 'Jarvis, project schematic in mid-air',
    status: 'ACTIVE',
    powerRequiredMW: 180,
    armorModel: 'Stark Malibu Workshop Matrix',
    details: [
      'Webcam & Leap optical hand estimation',
      'Pinch-to-zoom & Swipe-to-rotate in 3D WebGL',
      'Voice-guided audio response confirmation',
    ],
  },
  {
    id: 'PROTO_NEW_ELEMENT_SYNTHESIS',
    name: 'Badassium / New Element Synthesis',
    code: 'PARTICLE_COLLIDER_SYNTH_06',
    category: 'QUANTUM_COMPUTE',
    description: 'Calculates quantum valence structure for clean palladium-replacement vibrational energy core.',
    voicePhrase: 'Jarvis, synthesize Howard Stark’s element',
    status: 'ENGAGED',
    powerRequiredMW: 2400,
    armorModel: 'Vibranium Arc Reactor Mark VI',
    details: [
      'Prism laser alignment: 100% focused',
      'Molecular lattice: Hexagonal Hyper-Density',
      'Toxicity levels: 0.00% clean output',
    ],
  },
  {
    id: 'PROTO_SENTRY_SURVEILLANCE',
    name: 'Global Threat Matrix & Sentry Protocol',
    code: 'GLOBAL_SENTRY_AEGIS',
    category: 'DEFENSE_SECURITY',
    description: 'Full perimeter thermal radar, facial identification, cyber intrusion neutralization, and sonic deterrents.',
    voicePhrase: 'Jarvis, lock down the perimeter',
    status: 'ACTIVE',
    powerRequiredMW: 320,
    armorModel: 'Aegis Security Firewall',
    details: [
      'Facial ID matching against 50M global records',
      'Repulsor auto-target lock ready',
      'Sonic frequency deterrent: 22.4 kHz',
    ],
  },
];

interface StarkJarvisLabProps {
  orbState: OrbState;
  onVoiceCommand?: (text: string) => void;
  onExecuteProtocol?: (protocol: StarkProtocol) => void;
}

export const StarkJarvisLab: React.FC<StarkJarvisLabProps> = ({
  orbState,
  onVoiceCommand,
  onExecuteProtocol,
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<StarkProtocol>(STARK_PROTOCOLS[0]);
  const [activeProtocols, setActiveProtocols] = useState<Record<string, boolean>>({
    PROTO_NANOTECH_RECONFIGURATION: true,
    PROTO_AIR_GESTURE_HOLO: true,
    PROTO_SENTRY_SURVEILLANCE: true,
  });

  // Iron Man Mark Armor Interactive 3D Hologram Stage
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentArmorView, setCurrentArmorView] = useState<'MARK_85' | 'HULKBUSTER' | 'ARC_CORE' | 'NANOTECH_BLADE'>('MARK_85');
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [explodeValue, setExplodeValue] = useState<number>(0);
  const [isXRay, setIsXRay] = useState<boolean>(false);
  const [gestureModeActive, setGestureModeActive] = useState<boolean>(false);
  const [gestureStatus, setGestureStatus] = useState<string>('Air-Gesture Sensor Ready (Webcam AI)');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Live Suit Telemetry States
  const [repulsorCharge, setRepulsorCharge] = useState<number>(100);
  const [arcPowerOutputGW, setArcPowerOutputGW] = useState<number>(8.42);
  const [suitIntegrity, setSuitIntegrity] = useState<number>(100);
  const [activeLog, setActiveLog] = useState<string[]>([
    'JARVIS Kernel v9.4.2 Stark Core initialized.',
    'Arc Reactor Palladium/Vibranium core output stable at 8.42 GW.',
    'Orbital uplink connected to Veronica Satellite relay.',
    'Air-Gesture spatial hand tracking calibrated.',
  ]);

  const addLog = (text: string) => {
    setActiveLog((prev) => [text, ...prev.slice(0, 8)]);
  };

  const handleToggleProtocol = (proto: StarkProtocol) => {
    const isNowActive = !activeProtocols[proto.id];
    setActiveProtocols((prev) => ({ ...prev, [proto.id]: isNowActive }));
    addLog(`Protocol [${proto.name}] ${isNowActive ? 'ENGAGED & EXECUTING' : 'STANDBY'}`);
    if (onExecuteProtocol) onExecuteProtocol(proto);
  };

  // Three.js Stark 3D Model Scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const armorGroupRef = useRef<THREE.Group | null>(null);
  const animRef = useRef<number | null>(null);

  // User manual & Air Gesture interactive rotation and zoom
  const userRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Setup WebGL 3D Stark Armor Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Mouse / Touch Drag Orbit
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      userRotationRef.current.y += dx * 0.01;
      userRotationRef.current.x += dy * 0.01;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Lighting
    const ambLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 2.0);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // Build Armor 3D Geometry
    const armorGroup = new THREE.Group();
    armorGroupRef.current = armorGroup;
    scene.add(armorGroup);

    // --- MARK 85 SUIT HEAD & TORSO BUILDER ---
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.18,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
    });

    const crimsonMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x991b1b,
      emissiveIntensity: 0.2,
    });

    const arcGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    // Torso Chest Plate
    const chestGeo = new THREE.CylinderGeometry(1.8, 1.3, 2.4, 8);
    const chestMesh = new THREE.Mesh(chestGeo, crimsonMat);
    chestMesh.position.set(0, 0.4, 0);
    armorGroup.add(chestMesh);

    // Arc Reactor Core In Chest
    const arcGeo = new THREE.OctahedronGeometry(0.55, 2);
    const arcMesh = new THREE.Mesh(arcGeo, arcGlowMat);
    arcMesh.position.set(0, 0.6, 1.4);
    armorGroup.add(arcMesh);

    // Shoulder Pauldrons
    const shoulderLGeo = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI);
    const shoulderL = new THREE.Mesh(shoulderLGeo, goldMat);
    shoulderL.rotation.z = Math.PI / 2;
    shoulderL.position.set(-2.3, 1.2, 0);
    armorGroup.add(shoulderL);

    const shoulderR = shoulderL.clone();
    shoulderR.position.set(2.3, 1.2, 0);
    shoulderR.rotation.z = -Math.PI / 2;
    armorGroup.add(shoulderR);

    // Helmet / Faceplate
    const helmetGroup = new THREE.Group();
    const skullGeo = new THREE.SphereGeometry(1.2, 20, 20);
    const skull = new THREE.Mesh(skullGeo, crimsonMat);
    skull.position.set(0, 2.6, 0);
    helmetGroup.add(skull);

    const faceplateGeo = new THREE.CylinderGeometry(0.9, 0.7, 1.4, 6);
    const faceplate = new THREE.Mesh(faceplateGeo, goldMat);
    faceplate.position.set(0, 2.4, 0.6);
    faceplate.rotation.x = 0.2;
    helmetGroup.add(faceplate);

    // Visor Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.1), eyeMat);
    eyeL.position.set(-0.35, 2.5, 1.2);
    eyeL.rotation.y = 0.15;
    helmetGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.1), eyeMat);
    eyeR.position.set(0.35, 2.5, 1.2);
    eyeR.rotation.y = -0.15;
    helmetGroup.add(eyeR);

    armorGroup.add(helmetGroup);

    // Holographic Flight Trajectory Rings
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(3.2 + i * 0.7, 0.04, 8, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.35 - i * 0.08,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1.2 + i * 0.3;
      armorGroup.add(ring);
    }

    // Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.015;
      if (armorGroupRef.current) {
        armorGroupRef.current.rotation.y = time * 0.2 + userRotationRef.current.y;
        armorGroupRef.current.rotation.x = userRotationRef.current.x;
        armorGroupRef.current.position.y = Math.sin(time * 2) * 0.15;
      }
      arcMesh.rotation.x += 0.02;
      arcMesh.rotation.z += 0.03;

      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [currentArmorView]);

  // Air Gesture Simulation via Webcam
  const toggleAirGestureCamera = () => {
    setIsCameraActive((prev) => {
      const next = !prev;
      setGestureModeActive(next);
      setGestureStatus(next ? 'হাত নাড়া সক্রিয় (Air Gestures Optical Tracking ON)' : 'Sensor Standby');
      addLog(next ? 'Air-Gesture Optical Tracking Engaged: Mid-Air Hand Movements Active' : 'Air-Gesture Tracking Closed');
      return next;
    });
  };

  const handleNextArmorModel = () => {
    const models: ('MARK_85' | 'HULKBUSTER' | 'ARC_CORE' | 'NANOTECH_BLADE')[] = [
      'MARK_85',
      'HULKBUSTER',
      'ARC_CORE',
      'NANOTECH_BLADE',
    ];
    const currentIndex = models.indexOf(currentArmorView);
    const nextModel = models[(currentIndex + 1) % models.length];
    setCurrentArmorView(nextModel);
    addLog(`Air Gesture Wave: Switched Armor to [${nextModel}]`);
  };

  const handleFireRepulsor = () => {
    if (repulsorCharge <= 10) return;
    setRepulsorCharge((prev) => Math.max(0, prev - 25));
    addLog('REPULSOR BLAST FIRED: 2.4 Mega-Joules Discharge.');
    setTimeout(() => {
      setRepulsorCharge(100);
      addLog('Repulsor Capacitor Recharged to 100%.');
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. STARK TOP COMMAND BANNER */}
      <div className="bg-gradient-to-r from-neutral-950 via-red-950/30 to-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/50 text-[10px] font-mono font-bold">
              STARK LAB PROTOTYPE OS
            </span>
            <span className="text-xs font-mono text-neutral-400">ARC REACTOR #MK85-STARK</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
            <span>JARVIS STARK SUITE & PROTOCOLS</span>
          </h2>
          <p className="text-xs font-mono text-neutral-300">
            Full Iron Man Level Autonomy: Orbital Armor Drops, Nanotech Reconfiguration, Air Gestures & Global Threat Matrix.
          </p>
        </div>

        {/* Real-time Vital Metrics */}
        <div className="flex items-center gap-3 font-mono">
          <div className="bg-neutral-900/90 border border-amber-500/30 rounded-xl px-3 py-2 text-center">
            <span className="text-[9px] text-neutral-400 block">ARC REACTOR OUTPUT</span>
            <span className="text-sm font-bold text-amber-300">{arcPowerOutputGW} GW</span>
          </div>
          <div className="bg-neutral-900/90 border border-cyan-500/30 rounded-xl px-3 py-2 text-center">
            <span className="text-[9px] text-neutral-400 block">REPULSOR POWER</span>
            <span className="text-sm font-bold text-cyan-300">{repulsorCharge}%</span>
          </div>
          <div className="bg-neutral-900/90 border border-emerald-500/30 rounded-xl px-3 py-2 text-center">
            <span className="text-[9px] text-neutral-400 block">ARMOR INTEGRITY</span>
            <span className="text-sm font-bold text-emerald-400">{suitIntegrity}%</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3D LAB & ARMOR SUITE MATRIX (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT (7 COLS): 3D SPATIAL ARMOR STAGE & AIR GESTURES */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative h-[480px] bg-neutral-950 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between">
            {/* 3D WebGL Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

            {/* TOP OVERLAY CONTROLS */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
              <div className="flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-1 rounded-xl">
                {(['MARK_85', 'HULKBUSTER', 'ARC_CORE', 'NANOTECH_BLADE'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setCurrentArmorView(m)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      currentArmorView === m
                        ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Air Gesture Toggle Button */}
              <button
                onClick={toggleAirGestureCamera}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  isCameraActive
                    ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isCameraActive ? 'STOP AIR GESTURE' : 'AIR GESTURE (বাতাসে হাত নেড়ে কন্ট্রোল)'}</span>
              </button>
            </div>

            {/* Real-time Optical Air Gesture HUD */}
            <AirGestureHUD
              isActive={isCameraActive}
              onToggle={toggleAirGestureCamera}
              onRotate={(yaw, pitch) => {
                userRotationRef.current.y += yaw * 0.4;
                userRotationRef.current.x = Math.max(-0.8, Math.min(0.8, userRotationRef.current.x + pitch * 0.3));
              }}
              onExplodeChange={(fac) => {
                setExplodeValue((prev) => Math.max(0, Math.min(1, prev + fac)));
                setIsExploded(true);
              }}
              onNextModel={handleNextArmorModel}
              onFireAction={handleFireRepulsor}
            />

            {/* BOTTOM HUD OVERLAY CONTROLS */}
            <div className="p-3 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFireRepulsor}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-95 transition-all"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>FIRE REPULSOR</span>
                </button>
                <button
                  onClick={() => setIsXRay(!isXRay)}
                  className={`px-3 py-1.5 rounded-xl border transition-all ${
                    isXRay ? 'bg-purple-600 text-white border-purple-400' : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                >
                  X-RAY DIAGNOSTICS
                </button>
              </div>

              <div className="text-[10px] text-neutral-400">
                <span>STATUS: </span>
                <span className="text-cyan-400 font-bold">{gestureStatus}</span>
              </div>
            </div>
          </div>

          {/* Quick Voice Phrases Bar */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-400">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>
                <strong className="text-white">Say to JARVIS:</strong> &quot;Veronica, send backup armor&quot; or &quot;Execute House Party Protocol&quot;
              </span>
            </div>
            <button
              onClick={() => onVoiceCommand?.('Jarvis, execute House Party Protocol')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[10px] font-bold"
            >
              Simulate Voice &rarr;
            </button>
          </div>
        </div>

        {/* RIGHT (5 COLS): STARK PROTOCOLS & AUTONOMOUS WEAPON MATRIX */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900/90 border border-cyan-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono font-bold text-white text-sm">STARK AUTONOMOUS PROTOCOLS</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                {Object.values(activeProtocols).filter(Boolean).length} / {STARK_PROTOCOLS.length} ENGAGED
              </span>
            </div>

            {/* Protocol List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {STARK_PROTOCOLS.map((proto) => {
                const isActive = activeProtocols[proto.id];
                const isSelected = selectedProtocol.id === proto.id;

                return (
                  <div
                    key={proto.id}
                    onClick={() => setSelectedProtocol(proto)}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-bold">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400 animate-ping' : 'bg-neutral-600'}`} />
                        <span>{proto.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleProtocol(proto);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${
                          isActive
                            ? 'bg-red-600 text-white border-red-500 shadow-sm'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                        }`}
                      >
                        {isActive ? 'ENGAGED' : 'ENGAGE'}
                      </button>
                    </div>

                    <p className="text-[11px] text-neutral-400 mb-2 leading-relaxed">{proto.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800/80 pt-1.5">
                      <span className="text-amber-400">POWER: {proto.powerRequiredMW} MW</span>
                      <span className="text-cyan-400 truncate max-w-[140px]">{proto.armorModel}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Protocol Details Box */}
            {selectedProtocol && (
              <div className="bg-neutral-950 border border-amber-500/30 rounded-xl p-3 space-y-1.5 text-xs font-mono">
                <div className="text-amber-300 font-bold flex items-center justify-between">
                  <span>[SPEC] {selectedProtocol.code}</span>
                  <span className="text-[10px] text-neutral-400">{selectedProtocol.category}</span>
                </div>
                <ul className="space-y-1 text-[11px] text-neutral-300">
                  {selectedProtocol.details.map((d, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="text-amber-400">&bull;</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* JARVIS Tactical Console Log */}
          <div className="bg-black/90 border border-cyan-500/30 rounded-2xl p-3 font-mono text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] border-b border-neutral-800 pb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>JARVIS TACTICAL STREAM</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto text-[10px] text-neutral-400 font-mono">
              {activeLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-500">&gt;</span>
                  <span className={idx === 0 ? 'text-white font-semibold' : ''}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
