import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  OrbState,
} from '../types/jarvis';
import {
  Sparkles,
  Layers,
  RotateCcw,
  Eye,
  Zap,
  Brain,
  Cpu,
  Compass,
  Maximize2,
  Volume2,
  Activity,
  Sliders,
  Shield,
  Radio,
  Minimize2,
  Check,
  Camera,
} from 'lucide-react';
import { AirGestureHUD } from './AirGestureHUD';

export type Jarvis3DModelType = 'ARC_REACTOR' | 'NEURAL_BRAIN' | 'QUANTUM_SPHERE' | 'CYBER_HELMET';

export type Jarvis3DColorTheme = 'CYAN_HOLO' | 'MARK85_GOLD_RED' | 'COGNITIVE_PURPLE' | 'MATRIX_EMERALD' | 'SECURITY_CRIMSON';

interface Jarvis3DCoreProps {
  orbState: OrbState;
  audioLevel?: number;
  onVoiceClick?: () => void;
  className?: string;
  height?: number | string;
  initialModelType?: Jarvis3DModelType;
  showControls?: boolean;
}

export const Jarvis3DCore: React.FC<Jarvis3DCoreProps> = ({
  orbState,
  audioLevel = 0,
  onVoiceClick,
  className = '',
  height = 420,
  initialModelType = 'ARC_REACTOR',
  showControls = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Visual Customization States
  const [modelType, setModelType] = useState<Jarvis3DModelType>(initialModelType);
  const [colorTheme, setColorTheme] = useState<Jarvis3DColorTheme>('CYAN_HOLO');
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isXRayMode, setIsXRayMode] = useState<boolean>(false);
  const [showHUDOverlay, setShowHUDOverlay] = useState<boolean>(true);
  const [isAirGestureActive, setIsAirGestureActive] = useState<boolean>(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Interactive Mouse / Touch Orbit References
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0 });
  const cameraDistanceRef = useRef<number>(14);
  const targetCameraDistanceRef = useRef<number>(14);

  // Dynamic Audio & State Animation References
  const audioLevelRef = useRef<number>(audioLevel);
  const orbStateRef = useRef<OrbState>(orbState);
  const explodeRef = useRef<number>(explodeFactor);
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  const isWireframeRef = useRef<boolean>(isWireframe);
  const isXRayRef = useRef<boolean>(isXRayMode);
  const colorThemeRef = useRef<Jarvis3DColorTheme>(colorTheme);

  // Dynamic Meshes registry for transformations
  const dynamicSubMeshesRef = useRef<{
    coils: THREE.Object3D[];
    rings: THREE.Object3D[];
    particles: THREE.Points | null;
    particlePositions: Float32Array | null;
    coreLight: THREE.PointLight | null;
    coreMesh: THREE.Mesh | null;
    soundwaveRings: THREE.Mesh[];
    neuralAxons: THREE.LineSegments | null;
  }>({
    coils: [],
    rings: [],
    particles: null,
    particlePositions: null,
    coreLight: null,
    coreMesh: null,
    soundwaveRings: [],
    neuralAxons: null,
  });

  // Sync state refs for requestAnimationFrame loops
  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    orbStateRef.current = orbState;
    // Auto shift theme in security mode
    if (orbState === 'SECURITY_MODE') {
      setColorTheme('SECURITY_CRIMSON');
    }
  }, [orbState]);

  useEffect(() => {
    explodeRef.current = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    isWireframeRef.current = isWireframe;
    if (mainGroupRef.current) {
      mainGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat) mat.wireframe = isWireframe;
        }
      });
    }
  }, [isWireframe]);

  useEffect(() => {
    isXRayRef.current = isXRayMode;
    if (mainGroupRef.current) {
      mainGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.opacity = isXRayMode ? 0.35 : 0.88;
            mat.transparent = true;
          }
        }
      });
    }
  }, [isXRayMode]);

  useEffect(() => {
    colorThemeRef.current = colorTheme;
  }, [colorTheme]);

  // Palette generator based on Theme & State
  const getColors = () => {
    const st = orbStateRef.current;
    if (st === 'SECURITY_MODE') {
      return {
        primary: 0xf43f5e,
        secondary: 0xbe123c,
        core: 0xff4d6d,
        glow: 0xff0044,
        ambient: 0x3b0712,
        accent: 0xfb7185,
      };
    }
    if (st === 'LISTENING') {
      return {
        primary: 0x38bdf8,
        secondary: 0x0284c7,
        core: 0x7dd3fc,
        glow: 0x00d2ff,
        ambient: 0x082f49,
        accent: 0xbae6fd,
      };
    }
    if (st === 'ANALYZING' || st === 'THINKING') {
      return {
        primary: 0xc084fc,
        secondary: 0x9333ea,
        core: 0xe9d5ff,
        glow: 0xa855f7,
        ambient: 0x3b0764,
        accent: 0xf3e8ff,
      };
    }
    if (st === 'SPEAKING') {
      return {
        primary: 0xfbbf24,
        secondary: 0xd97706,
        core: 0xfef08a,
        glow: 0xf59e0b,
        ambient: 0x451a03,
        accent: 0xffedd5,
      };
    }

    switch (colorTheme) {
      case 'MARK85_GOLD_RED':
        return {
          primary: 0xf59e0b,
          secondary: 0xd97706,
          core: 0xfef08a,
          glow: 0xef4444,
          ambient: 0x450a0a,
          accent: 0xf87171,
        };
      case 'COGNITIVE_PURPLE':
        return {
          primary: 0xa855f7,
          secondary: 0x7e22ce,
          core: 0xe9d5ff,
          glow: 0xc084fc,
          ambient: 0x2e1065,
          accent: 0xd8b4fe,
        };
      case 'MATRIX_EMERALD':
        return {
          primary: 0x10b981,
          secondary: 0x059669,
          core: 0xa7f3d0,
          glow: 0x34d399,
          ambient: 0x064e3b,
          accent: 0x6ee7b7,
        };
      case 'SECURITY_CRIMSON':
        return {
          primary: 0xf43f5e,
          secondary: 0xbe123c,
          core: 0xffa5b4,
          glow: 0xff0044,
          ambient: 0x4c0519,
          accent: 0xfb7185,
        };
      case 'CYAN_HOLO':
      default:
        return {
          primary: 0x06b6d4,
          secondary: 0x0284c7,
          core: 0xa5f3fc,
          glow: 0x22d3ee,
          ambient: 0x083344,
          accent: 0x38bdf8,
        };
    }
  };

  // Build the 3D Model Scene based on selected modelType
  const build3DScene = (scene: THREE.Scene, type: Jarvis3DModelType) => {
    // Clear existing children in group
    if (mainGroupRef.current) {
      scene.remove(mainGroupRef.current);
      mainGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });
    }

    const rootGroup = new THREE.Group();
    mainGroupRef.current = rootGroup;
    scene.add(rootGroup);

    const colors = getColors();
    const isWire = isWireframeRef.current;
    const isXRay = isXRayRef.current;

    dynamicSubMeshesRef.current = {
      coils: [],
      rings: [],
      particles: null,
      particlePositions: null,
      coreLight: null,
      coreMesh: null,
      soundwaveRings: [],
      neuralAxons: null,
    };

    // Shared glowing materials
    const makeGlowMaterial = (colorHex: number, opacity = 0.85, metal = 0.4, rough = 0.2) => {
      return new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.65,
        metalness: metal,
        roughness: rough,
        wireframe: isWire,
        transparent: true,
        opacity: isXRay ? 0.35 : opacity,
        side: THREE.DoubleSide,
      });
    };

    // -------------------------------------------------------------
    // MODEL 1: MARK-85 ARC REACTOR 3D
    // -------------------------------------------------------------
    if (type === 'ARC_REACTOR') {
      // 1. Outer Heavy Alloy Armor Containment Rim
      const outerRimGeo = new THREE.TorusGeometry(4.8, 0.45, 24, 64);
      const outerRimMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.15,
        wireframe: isWire,
      });
      const outerRim = new THREE.Mesh(outerRimGeo, outerRimMat);
      rootGroup.add(outerRim);
      dynamicSubMeshesRef.current.rings.push(outerRim);

      // 2. Beveled Magnetic Concentric Rings (3 Tiers)
      const ring1Geo = new THREE.TorusGeometry(3.8, 0.18, 16, 64);
      const ring1Mat = makeGlowMaterial(colors.primary, 0.9, 0.7);
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      rootGroup.add(ring1);
      dynamicSubMeshesRef.current.rings.push(ring1);

      const ring2Geo = new THREE.TorusGeometry(2.6, 0.14, 16, 48);
      const ring2Mat = makeGlowMaterial(colors.secondary, 0.85, 0.6);
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      rootGroup.add(ring2);
      dynamicSubMeshesRef.current.rings.push(ring2);

      const ring3Geo = new THREE.TorusGeometry(1.6, 0.1, 16, 36);
      const ring3Mat = makeGlowMaterial(colors.accent, 0.95, 0.8);
      const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
      rootGroup.add(ring3);
      dynamicSubMeshesRef.current.rings.push(ring3);

      // 3. 10 Radial Palladium/Copper Magnetic Acceleration Coils
      const coilCount = 10;
      for (let i = 0; i < coilCount; i++) {
        const angle = (i / coilCount) * Math.PI * 2;
        const coilGroup = new THREE.Group();

        // Main coil bar
        const coilGeo = new THREE.BoxGeometry(0.35, 1.4, 0.5);
        const coilMat = makeGlowMaterial(colors.primary, 0.92, 0.85, 0.1);
        const coilMesh = new THREE.Mesh(coilGeo, coilMat);
        coilMesh.position.y = 3.2;
        coilGroup.add(coilMesh);

        // Wound copper wire texture segments
        for (let w = -0.5; w <= 0.5; w += 0.25) {
          const wireRingGeo = new THREE.TorusGeometry(0.28, 0.05, 8, 16);
          const wireRingMat = makeGlowMaterial(colors.secondary, 0.8);
          const wireRing = new THREE.Mesh(wireRingGeo, wireRingMat);
          wireRing.position.set(0, 3.2 + w, 0);
          wireRing.rotation.x = Math.PI / 2;
          coilGroup.add(wireRing);
        }

        // Top emitter conduit
        const emitterGeo = new THREE.SphereGeometry(0.16, 12, 12);
        const emitterMat = makeGlowMaterial(colors.core, 1.0);
        const emitter = new THREE.Mesh(emitterGeo, emitterMat);
        emitter.position.set(0, 4.0, 0);
        coilGroup.add(emitter);

        coilGroup.rotation.z = angle;
        rootGroup.add(coilGroup);
        dynamicSubMeshesRef.current.coils.push(coilGroup);
      }

      // 4. Central Triangular / Hexagonal Palladium Energy Core
      const coreShapeGeo = new THREE.OctahedronGeometry(1.0, 2);
      const coreShapeMat = new THREE.MeshStandardMaterial({
        color: colors.core,
        emissive: colors.glow,
        emissiveIntensity: 1.8,
        metalness: 0.2,
        roughness: 0.05,
        wireframe: isWire,
        transparent: true,
        opacity: 0.95,
      });
      const coreMesh = new THREE.Mesh(coreShapeGeo, coreShapeMat);
      rootGroup.add(coreMesh);
      dynamicSubMeshesRef.current.coreMesh = coreMesh;

      // 5. Intense Central Point Light
      const coreLight = new THREE.PointLight(colors.glow, 4.5, 20);
      rootGroup.add(coreLight);
      dynamicSubMeshesRef.current.coreLight = coreLight;

      // 6. Volumetric Arc Discharge Ring Particles (Toroidal Stream)
      const particleCount = 450;
      const partGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for (let p = 0; p < particleCount; p++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const r = 2.0 + Math.random() * 2.8;
        posArray[p * 3] = Math.cos(theta) * r;
        posArray[p * 3 + 1] = Math.sin(theta) * r;
        posArray[p * 3 + 2] = (Math.random() - 0.5) * 1.5;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({
        size: 0.14,
        color: colors.glow,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const particleSystem = new THREE.Points(partGeo, partMat);
      rootGroup.add(particleSystem);
      dynamicSubMeshesRef.current.particles = particleSystem;
      dynamicSubMeshesRef.current.particlePositions = posArray;
    }

    // -------------------------------------------------------------
    // MODEL 2: NEURAL SYNAPSE AI BRAIN 3D
    // -------------------------------------------------------------
    else if (type === 'NEURAL_BRAIN') {
      const neuronCount = 280;
      const brainNodesGeo = new THREE.BufferGeometry();
      const nodePosArray = new Float32Array(neuronCount * 3);
      const axonLinePositions: number[] = [];

      // Generate dual hemisphere brain distribution
      const nodeCoords: THREE.Vector3[] = [];
      for (let n = 0; n < neuronCount; n++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 3.5;

        // Ellipsoid brain distortion (Left/Right hemisphere separation)
        const hemisphere = Math.random() > 0.5 ? 1 : -1;
        const x = Math.sin(phi) * Math.cos(theta) * 2.8 + hemisphere * 0.4;
        const y = Math.cos(phi) * 2.4;
        const z = Math.sin(phi) * Math.sin(theta) * 3.8;

        nodePosArray[n * 3] = x;
        nodePosArray[n * 3 + 1] = y;
        nodePosArray[n * 3 + 2] = z;

        const vec = new THREE.Vector3(x, y, z);
        nodeCoords.push(vec);
      }

      // Connect nearby neurons with glowing axon synapses
      for (let i = 0; i < neuronCount; i++) {
        for (let j = i + 1; j < neuronCount; j++) {
          const dist = nodeCoords[i].distanceTo(nodeCoords[j]);
          if (dist < 1.4) {
            axonLinePositions.push(nodeCoords[i].x, nodeCoords[i].y, nodeCoords[i].z);
            axonLinePositions.push(nodeCoords[j].x, nodeCoords[j].y, nodeCoords[j].z);
          }
        }
      }

      brainNodesGeo.setAttribute('position', new THREE.BufferAttribute(nodePosArray, 3));
      const brainNodeMat = new THREE.PointsMaterial({
        size: 0.18,
        color: colors.core,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const neuronPoints = new THREE.Points(brainNodesGeo, brainNodeMat);
      rootGroup.add(neuronPoints);
      dynamicSubMeshesRef.current.particles = neuronPoints;
      dynamicSubMeshesRef.current.particlePositions = nodePosArray;

      // Glowing axon synaptic web
      const axonGeo = new THREE.BufferGeometry();
      axonGeo.setAttribute('position', new THREE.Float32BufferAttribute(axonLinePositions, 3));
      const axonMat = new THREE.LineBasicMaterial({
        color: colors.primary,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const axonLines = new THREE.LineSegments(axonGeo, axonMat);
      rootGroup.add(axonLines);
      dynamicSubMeshesRef.current.neuralAxons = axonLines;

      // Central Holographic Consciousness Singularity
      const brainCoreGeo = new THREE.IcosahedronGeometry(1.2, 3);
      const brainCoreMat = makeGlowMaterial(colors.glow, 0.75, 0.2);
      const brainCore = new THREE.Mesh(brainCoreGeo, brainCoreMat);
      rootGroup.add(brainCore);
      dynamicSubMeshesRef.current.coreMesh = brainCore;

      const brainLight = new THREE.PointLight(colors.glow, 4.0, 16);
      rootGroup.add(brainLight);
      dynamicSubMeshesRef.current.coreLight = brainLight;
    }

    // -------------------------------------------------------------
    // MODEL 3: QUANTUM SPHERICAL MATRIX 3D
    // -------------------------------------------------------------
    else if (type === 'QUANTUM_SPHERE') {
      // 1. Triple Gyroscopic Rotating Gimbal Rings
      const ringGimbal1Geo = new THREE.TorusGeometry(4.2, 0.16, 16, 64);
      const ringGimbal1Mat = makeGlowMaterial(colors.primary, 0.9, 0.8);
      const gimbal1 = new THREE.Mesh(ringGimbal1Geo, ringGimbal1Mat);
      rootGroup.add(gimbal1);
      dynamicSubMeshesRef.current.rings.push(gimbal1);

      const ringGimbal2Geo = new THREE.TorusGeometry(3.4, 0.14, 16, 64);
      const ringGimbal2Mat = makeGlowMaterial(colors.secondary, 0.85, 0.8);
      const gimbal2 = new THREE.Mesh(ringGimbal2Geo, ringGimbal2Mat);
      gimbal2.rotation.x = Math.PI / 3;
      rootGroup.add(gimbal2);
      dynamicSubMeshesRef.current.rings.push(gimbal2);

      const ringGimbal3Geo = new THREE.TorusGeometry(2.5, 0.12, 16, 64);
      const ringGimbal3Mat = makeGlowMaterial(colors.accent, 0.95, 0.9);
      const gimbal3 = new THREE.Mesh(ringGimbal3Geo, ringGimbal3Mat);
      gimbal3.rotation.y = Math.PI / 4;
      rootGroup.add(gimbal3);
      dynamicSubMeshesRef.current.rings.push(gimbal3);

      // 2. Wireframe Geodesic Icosahedron Matrix
      const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
      const icoMat = new THREE.MeshStandardMaterial({
        color: colors.primary,
        wireframe: true,
        emissive: colors.glow,
        emissiveIntensity: 0.8,
      });
      const icoMesh = new THREE.Mesh(icoGeo, icoMat);
      rootGroup.add(icoMesh);
      dynamicSubMeshesRef.current.coils.push(icoMesh);

      // 3. Central Pulsing Quantum Singularity
      const qCoreGeo = new THREE.SphereGeometry(0.9, 32, 32);
      const qCoreMat = new THREE.MeshStandardMaterial({
        color: colors.core,
        emissive: colors.glow,
        emissiveIntensity: 2.2,
      });
      const qCore = new THREE.Mesh(qCoreGeo, qCoreMat);
      rootGroup.add(qCore);
      dynamicSubMeshesRef.current.coreMesh = qCore;

      const qLight = new THREE.PointLight(colors.glow, 4.0, 18);
      rootGroup.add(qLight);
      dynamicSubMeshesRef.current.coreLight = qLight;

      // 4. Quantum Cloud Particles
      const pCount = 350;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.0 + Math.random() * 2.8;
        pPos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
        pPos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
        pPos[i * 3 + 2] = Math.cos(phi) * r;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        size: 0.12,
        color: colors.glow,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(pGeo, pMat);
      rootGroup.add(points);
      dynamicSubMeshesRef.current.particles = points;
      dynamicSubMeshesRef.current.particlePositions = pPos;
    }

    // -------------------------------------------------------------
    // MODEL 4: JARVIS HOLOGRAPHIC HELMET / AVATAR 3D
    // -------------------------------------------------------------
    else if (type === 'CYBER_HELMET') {
      // 1. Cranial Shell & Jawline
      const headGroup = new THREE.Group();

      const craniumGeo = new THREE.SphereGeometry(2.6, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.7);
      const craniumMat = makeGlowMaterial(colors.primary, 0.75, 0.9, 0.1);
      const cranium = new THREE.Mesh(craniumGeo, craniumMat);
      headGroup.add(cranium);

      // Jaw and Cheek Plates
      const jawGeo = new THREE.ConeGeometry(2.4, 2.8, 6, 1, true);
      const jawMat = makeGlowMaterial(colors.secondary, 0.8, 0.85);
      const jaw = new THREE.Mesh(jawGeo, jawMat);
      jaw.rotation.x = Math.PI;
      jaw.position.y = -1.2;
      headGroup.add(jaw);

      // 2. Glowing Visor Eye Scanners
      const eyeLGeo = new THREE.BoxGeometry(0.8, 0.22, 0.3);
      const eyeMat = new THREE.MeshStandardMaterial({
        color: colors.core,
        emissive: colors.glow,
        emissiveIntensity: 2.5,
      });
      const eyeL = new THREE.Mesh(eyeLGeo, eyeMat);
      eyeL.position.set(-0.8, 0.3, 2.4);
      eyeL.rotation.y = 0.18;
      headGroup.add(eyeL);

      const eyeRGeo = new THREE.BoxGeometry(0.8, 0.22, 0.3);
      const eyeR = new THREE.Mesh(eyeRGeo, eyeMat);
      eyeR.position.set(0.8, 0.3, 2.4);
      eyeR.rotation.y = -0.18;
      headGroup.add(eyeR);

      // 3. Floating Cranial Halo HUD Rings
      const haloGeo = new THREE.TorusGeometry(3.6, 0.08, 12, 48);
      const haloMat = makeGlowMaterial(colors.accent, 0.9);
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 1.0;
      headGroup.add(halo);
      dynamicSubMeshesRef.current.rings.push(halo);

      rootGroup.add(headGroup);
      dynamicSubMeshesRef.current.coils.push(headGroup);

      const helmetLight = new THREE.PointLight(colors.glow, 3.8, 16);
      helmetLight.position.set(0, 0.5, 3.0);
      rootGroup.add(helmetLight);
      dynamicSubMeshesRef.current.coreLight = helmetLight;
    }

    // -------------------------------------------------------------
    // SHARED 3D AUDIO FREQUENCY SOUNDWAVE RINGS
    // -------------------------------------------------------------
    for (let s = 0; s < 3; s++) {
      const swGeo = new THREE.RingGeometry(5.2 + s * 0.8, 5.26 + s * 0.8, 64);
      const swMat = new THREE.MeshBasicMaterial({
        color: colors.glow,
        transparent: true,
        opacity: 0.25 - s * 0.06,
        side: THREE.DoubleSide,
      });
      const swMesh = new THREE.Mesh(swGeo, swMat);
      swMesh.rotation.x = Math.PI / 2;
      rootGroup.add(swMesh);
      dynamicSubMeshesRef.current.soundwaveRings.push(swMesh);
    }
  };

  // Main Three.js Setup & Animation Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 400;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 2, cameraDistanceRef.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 3. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 4. Build Initial Model
    build3DScene(scene, modelType);

    // 5. Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.02;

      // Handle Smooth Camera Distance (Zoom)
      cameraDistanceRef.current += (targetCameraDistanceRef.current - cameraDistanceRef.current) * 0.1;
      camera.position.z = cameraDistanceRef.current;

      // Handle Orbit Damping
      if (isAutoRotateRef.current && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.008;
      }
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (mainGroupRef.current) {
        mainGroupRef.current.rotation.x = currentRotationRef.current.x;
        mainGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Audio Level & State Amplification
      const amp = Math.max(0.04, audioLevelRef.current * 2.2);
      const st = orbStateRef.current;
      const explodeVal = explodeRef.current;

      const sub = dynamicSubMeshesRef.current;

      // Rotate sub-rings
      sub.rings.forEach((ring, idx) => {
        ring.rotation.z += (idx % 2 === 0 ? 0.015 : -0.02) * (st === 'THINKING' ? 3 : 1);
        if (explodeVal > 0) {
          ring.position.z = (idx + 1) * (explodeVal * 1.8);
        } else {
          ring.position.z = 0;
        }
      });

      // Explode Coils outward radially
      sub.coils.forEach((coil, idx) => {
        if (explodeVal > 0) {
          const shift = 1.0 + explodeVal * 0.8;
          coil.scale.set(shift, shift, shift);
        } else {
          coil.scale.set(1, 1, 1);
        }
      });

      // Core Mesh Pulse with Audio
      if (sub.coreMesh) {
        const pulseScale = 1.0 + Math.sin(time * 4) * 0.06 + amp * 0.45;
        sub.coreMesh.scale.set(pulseScale, pulseScale, pulseScale);
        sub.coreMesh.rotation.y += 0.03;
        sub.coreMesh.rotation.x += 0.015;
      }

      // Core Light Intensity
      if (sub.coreLight) {
        sub.coreLight.intensity = 3.5 + Math.sin(time * 6) * 1.0 + amp * 6.0;
      }

      // Particles Vortex Spin
      if (sub.particles && sub.particlePositions) {
        sub.particles.rotation.z += 0.01 + amp * 0.04;
        sub.particles.rotation.y += 0.005;
      }

      // Soundwave Rings Vibration & Expansion
      sub.soundwaveRings.forEach((sw, idx) => {
        const swScale = 1.0 + Math.sin(time * 3 + idx) * 0.08 + amp * (0.3 + idx * 0.2);
        sw.scale.set(swScale, swScale, swScale);
      });

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 6. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth || 400;
      const newH = typeof height === 'number' ? height : container.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObs.disconnect();
      renderer.dispose();
    };
  }, [modelType, colorTheme, height]);

  // Re-build 3D scene when modelType or colorTheme changes
  useEffect(() => {
    if (sceneRef.current) {
      build3DScene(sceneRef.current, modelType);
    }
  }, [modelType, colorTheme]);

  // Orbit / Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x += deltaY * 0.008;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    targetCameraDistanceRef.current = Math.min(26, Math.max(8, targetCameraDistanceRef.current + e.deltaY * 0.015));
  };

  // Touch handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMouseRef.current.x;
    const deltaY = e.touches[0].clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    targetRotationRef.current.y += deltaX * 0.01;
    targetRotationRef.current.x += deltaY * 0.01;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleResetCamera = () => {
    targetRotationRef.current = { x: 0.2, y: 0 };
    targetCameraDistanceRef.current = 14;
    setExplodeFactor(0);
  };

  return (
    <div
      ref={containerRef}
      id="jarvis-3d-hologram-stage"
      className={`relative w-full rounded-2xl bg-neutral-950/90 border border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] select-none ${className}`}
      style={{ height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* TOP LEFT: MODEL SELECTION PILLS & STATUS BADGE */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 max-w-xs pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setModelType('ARC_REACTOR')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
              modelType === 'ARC_REACTOR'
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Mark-85 Arc Reactor Core 3D"
          >
            <Zap className="w-3 h-3" />
            <span>ARC CORE</span>
          </button>

          <button
            onClick={() => setModelType('NEURAL_BRAIN')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
              modelType === 'NEURAL_BRAIN'
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.6)]'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Neural Synaptic AI Brain 3D"
          >
            <Brain className="w-3 h-3" />
            <span>NEURAL BRAIN</span>
          </button>

          <button
            onClick={() => setModelType('QUANTUM_SPHERE')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
              modelType === 'QUANTUM_SPHERE'
                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Quantum Matrix Sphere 3D"
          >
            <Compass className="w-3 h-3" />
            <span>QUANTUM</span>
          </button>

          <button
            onClick={() => setModelType('CYBER_HELMET')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
              modelType === 'CYBER_HELMET'
                ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Jarvis Hologram Helmet 3D"
          >
            <Cpu className="w-3 h-3" />
            <span>VISOR</span>
          </button>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-[10px] font-mono text-neutral-300 w-fit">
          <span
            className={`w-2 h-2 rounded-full ${
              orbState === 'SECURITY_MODE'
                ? 'bg-rose-500 animate-ping'
                : orbState === 'LISTENING'
                ? 'bg-sky-400 animate-pulse'
                : orbState === 'SPEAKING'
                ? 'bg-amber-400 animate-bounce'
                : orbState === 'THINKING'
                ? 'bg-purple-400 animate-pulse'
                : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
            }`}
          />
          <span className="font-bold tracking-wide">{orbState.replace('_', ' ')}</span>
          <span className="text-neutral-600">|</span>
          <span className="text-cyan-400">AUDIO: {Math.round(audioLevel * 100)}%</span>
        </div>
      </div>

      {/* TOP RIGHT: COLOR THEME PRESETS & QUICK VIEW CONTROLS */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 pointer-events-auto">
        {/* Color Switcher */}
        <div className="flex items-center gap-1 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-1 rounded-xl">
          {(
            [
              { id: 'CYAN_HOLO', color: '#06b6d4', label: 'Cyan' },
              { id: 'MARK85_GOLD_RED', color: '#f59e0b', label: 'Gold' },
              { id: 'COGNITIVE_PURPLE', color: '#a855f7', label: 'Purple' },
              { id: 'MATRIX_EMERALD', color: '#10b981', label: 'Emerald' },
              { id: 'SECURITY_CRIMSON', color: '#f43f5e', label: 'Red' },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setColorTheme(c.id)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                colorTheme === c.id ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.color }}
              title={c.label}
            />
          ))}
        </div>

        {/* Toggle Wireframe */}
        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
            isWireframe
              ? 'bg-cyan-500 text-black border-cyan-400'
              : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
          title="Toggle 3D Wireframe Mesh"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* Toggle X-Ray */}
        <button
          onClick={() => setIsXRayMode(!isXRayMode)}
          className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
            isXRayMode
              ? 'bg-purple-600 text-white border-purple-400'
              : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
          title="Toggle Holographic X-Ray Transparency"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Air Gesture */}
        <button
          onClick={() => setIsAirGestureActive(!isAirGestureActive)}
          className={`p-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1 ${
            isAirGestureActive
              ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
              : 'bg-neutral-900/80 text-cyan-400 border-cyan-500/40 hover:text-white hover:border-cyan-400'
          }`}
          title="Air Gesture (বাতাসে হাত নেড়ে ৩ডি মডেল নিয়ন্ত্রণ করুন)"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px] font-bold font-mono">
            {isAirGestureActive ? 'AIR GESTURE ON' : 'AIR GESTURE'}
          </span>
        </button>

        {/* Reset Camera View */}
        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-all"
          title="Reset 3D Camera View & Position"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Optical Air Gesture HUD */}
      <AirGestureHUD
        isActive={isAirGestureActive}
        onToggle={() => setIsAirGestureActive(!isAirGestureActive)}
        onRotate={(deltaYaw, deltaPitch) => {
          targetRotationRef.current.y += deltaYaw * 0.4;
          targetRotationRef.current.x = Math.max(-0.9, Math.min(0.9, targetRotationRef.current.x + deltaPitch * 0.3));
        }}
        onExplodeChange={(fac) => {
          setExplodeFactor((prev) => Math.max(0, Math.min(1, prev + fac)));
        }}
        onZoomChange={(zoom) => {
          targetCameraDistanceRef.current = Math.max(6, Math.min(28, targetCameraDistanceRef.current + zoom));
        }}
        onNextModel={() => {
          const models: Jarvis3DModelType[] = ['ARC_REACTOR', 'NEURAL_BRAIN', 'QUANTUM_SPHERE', 'CYBER_HELMET'];
          const idx = models.indexOf(modelType);
          const next = models[(idx + 1) % models.length];
          setModelType(next);
        }}
      />

      {/* FLOATING HUD TELEMETRY DATA (AROUND 3D CORE) */}
      {showHUDOverlay && (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          <div />

          {/* Bottom Telemetry HUD */}
          <div className="flex flex-wrap sm:flex-nowrap items-end justify-between gap-2">
            {/* Left HUD Telemetry */}
            <div className="hidden sm:block bg-neutral-950/85 backdrop-blur-md border border-cyan-500/20 rounded-xl p-2.5 text-[10px] font-mono space-y-1 text-neutral-400">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>ULTRON 3D TELEMETRY</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 text-[9px]">
                <div>FLUX: <span className="text-white">98.4%</span></div>
                <div>FREQ: <span className="text-cyan-400">4.82 GHz</span></div>
                <div>TEMP: <span className="text-emerald-400">32.4°C</span></div>
                <div>SYNAPSE: <span className="text-purple-400">2.4M/s</span></div>
              </div>
            </div>

            {/* Central Voice Touch Trigger */}
            <button
              onClick={onVoiceClick}
              className="pointer-events-auto mx-auto sm:mx-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-300 hover:text-white text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
              <span>{orbState === 'LISTENING' ? 'LISTENING TO VOICE...' : 'TOUCH TO SPEAK'}</span>
            </button>

            {/* Right Explode Slider */}
            <div className="pointer-events-auto hidden xs:flex bg-neutral-950/85 backdrop-blur-md border border-cyan-500/20 rounded-xl p-2 sm:p-2.5 text-[10px] font-mono space-y-1 text-neutral-400 flex-col items-end">
              <div className="flex items-center gap-1 text-cyan-300 font-bold text-[9px] sm:text-[10px]">
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>LAYERS: {Math.round(explodeFactor * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-20 sm:w-28 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
