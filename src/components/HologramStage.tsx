import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  HologramScene,
  HologramComponent,
  HologramLayer,
  HologramMaterialType,
  HologramDataCategory,
  HologramColorMapping,
} from '../types/hologram';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  Layers,
  RotateCw,
  Box,
  Compass,
  Sliders,
  Zap,
  Info,
  CheckCircle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Palette,
  Check,
  Tag,
  ChevronDown,
  ChevronUp,
  Flame,
  Activity,
  Radio,
  Wrench,
  Hammer,
  X,
  Camera,
} from 'lucide-react';
import { HolographicSchematicVisualizer } from './HolographicSchematicVisualizer';
import { AirGestureHUD } from './AirGestureHUD';

interface HologramStageProps {
  scene: HologramScene;
  colorMapping?: HologramColorMapping | Record<string, string>;
  activeCategory?: HologramDataCategory;
  onColorCategoryChange?: (category: HologramDataCategory) => void;
  onComponentSelect?: (component: HologramComponent | null) => void;
  onExplodeChange?: (factor: number) => void;
  onToggleHologramMode?: () => void;
  onToggleXRay?: () => void;
  onToggleWireframe?: () => void;
  onToggleAutoRotate?: () => void;
  onResetCamera?: () => void;
  onViewPreset?: (preset: 'FRONT' | 'BACK' | 'TOP' | 'ISOMETRIC') => void;
  onToggleLayer?: (layer: HologramLayer) => void;
  className?: string;
}

export type HologramColorScheme = HologramDataCategory;

// 16 Ultra-High Contrast Vibrant Distinct Component Colors
export const DISTINCT_VIBRANT_PALETTE = [
  '#06b6d4', // 1. Electric Cyan
  '#f59e0b', // 2. Solar Amber Gold
  '#a855f7', // 3. Cyber Violet / Purple
  '#10b981', // 4. Neon Emerald Green
  '#ec4899', // 5. Hot Magenta Pink
  '#3b82f6', // 6. Cobalt Royal Blue
  '#84cc16', // 7. Electric Lime
  '#f97316', // 8. Fiery Coral Orange
  '#eab308', // 9. Pure Radiant Gold
  '#ef4444', // 10. Ruby Red / Crimson
  '#38bdf8', // 11. Bright Sky Blue
  '#14b8a6', // 12. Mint Turquoise
  '#8b5cf6', // 13. Deep Indigo Violet
  '#d946ef', // 14. Radiant Fuchsia
  '#065f46', // 15. Forest Jade
  '#22d3ee', // 16. Luminous Aquamarine
];

// Functional Engineering Layer Colors
export const LAYER_COLOR_MAP: Record<HologramLayer, { main: string; emissive: string; label: string }> = {
  CORE: { main: '#38bdf8', emissive: '#7dd3fc', label: 'Core / SoC / Reactor' },
  ELECTRONICS: { main: '#10b981', emissive: '#34d399', label: 'Circuit / VRM / Chips' },
  COOLING: { main: '#f59e0b', emissive: '#fbbf24', label: 'Cooling / Radiator / Heatpipe' },
  MECHANICAL: { main: '#06b6d4', emissive: '#22d3ee', label: 'Turbine / Motors / Gears' },
  STRUCTURAL: { main: '#94a3b8', emissive: '#cbd5e1', label: 'Chassis / Mount / Frame' },
  TRACES: { main: '#a855f7', emissive: '#c084fc', label: 'Power & Signal Bus Traces' },
  CASING: { main: '#3b82f6', emissive: '#60a5fa', label: 'Exterior Shell / Casing' },
};

// Physical Material Engineering Colors
export const MATERIAL_COLOR_MAP: Record<string, { main: string; emissive: string; label: string }> = {
  copper: { main: '#b45309', emissive: '#d97706', label: 'Pure Copper (তামা)' },
  aluminum: { main: '#94a3b8', emissive: '#cbd5e1', label: 'Anodized Aluminum' },
  silicon: { main: '#1e293b', emissive: '#38bdf8', label: 'Neural Silicon SoC' },
  pcb_matte: { main: '#047857', emissive: '#059669', label: 'FR-4 PCB Substrate' },
  metal: { main: '#475569', emissive: '#64748b', label: 'Structural Steel/Alloy' },
  plastic: { main: '#0284c7', emissive: '#38bdf8', label: 'Engineered Polymer' },
  glowing_core: { main: '#38bdf8', emissive: '#7dd3fc', label: 'Plasma / Active Core' },
  hologram_glass: { main: '#0891b2', emissive: '#06b6d4', label: 'Optic Acrylic / Glass' },
  hologram_grid: { main: '#a855f7', emissive: '#c084fc', label: 'Holographic Matrix' },
  wireframe: { main: '#22d3ee', emissive: '#67e8f9', label: 'Vector CAD Wireframe' },
};

// Thermal Operating Profile Colors
export const TEMPERATURE_COLOR_MAP = {
  critical: { main: '#ef4444', emissive: '#f87171', label: 'Hot Core / Reactor (~85°C)' },
  warm: { main: '#f97316', emissive: '#fb923c', label: 'Active VRM / Induction (~55°C)' },
  optimal: { main: '#06b6d4', emissive: '#22d3ee', label: 'Active Cooling Zone (~32°C)' },
  supercooled: { main: '#3b82f6', emissive: '#60a5fa', label: 'Passive Ambient Substrate (~24°C)' },
};

// Power Distribution Rail Colors
export const POWER_COLOR_MAP = {
  highVoltage: { main: '#eab308', emissive: '#facc15', label: '+12V/+48V High-Voltage Bus' },
  logic3v3: { main: '#10b981', emissive: '#34d399', label: '0.9V - 1.2V Low-Voltage Logic' },
  rfSignal: { main: '#a855f7', emissive: '#c084fc', label: '+3.3V / High-Frequency Signals' },
  ground: { main: '#64748b', emissive: '#94a3b8', label: '0V System Ground (GND)' },
};

// Functional Subsystem Colors
export const SUBSYSTEM_COLOR_MAP = {
  compute: { main: '#06b6d4', emissive: '#38bdf8', label: 'Neural / Computing Subsystem' },
  power: { main: '#f59e0b', emissive: '#fbbf24', label: 'Power Conversion Subsystem' },
  thermal: { main: '#10b981', emissive: '#34d399', label: 'Thermal Dissipation Subsystem' },
  structural: { main: '#94a3b8', emissive: '#cbd5e1', label: 'Structural Chassis & Enclosure' },
  interconnect: { main: '#ec4899', emissive: '#f472b6', label: 'Data Bus & Signal Interconnect' },
};

// Helper to calculate exact component color based on current category and colorMapping property
export const getComponentColor = (
  comp: HologramComponent,
  index: number,
  category: HologramDataCategory = 'DISTINCT',
  colorMapping?: HologramColorMapping | Record<string, string>
): { color: string; emissive: string; label?: string; categoryKey?: string } => {
  // Normalize colorMapping
  const mappingObj = (colorMapping as HologramColorMapping) || {};
  const customDict = (colorMapping && typeof colorMapping === 'object' && !('layerColors' in colorMapping) && !('category' in colorMapping)
    ? (colorMapping as Record<string, string>)
    : mappingObj.customMap) || {};

  // 1. Direct Component ID or Name override in customMap
  if (customDict[comp.id]) {
    const c = customDict[comp.id];
    return { color: c, emissive: c, label: `Custom: ${comp.name}`, categoryKey: 'CUSTOM' };
  }
  if (customDict[comp.name]) {
    const c = customDict[comp.name];
    return { color: c, emissive: c, label: `Custom: ${comp.name}`, categoryKey: 'CUSTOM' };
  }

  // 2. Map based on requested category
  if (category === 'LAYER') {
    // Check override in colorMapping.layerColors or customDict
    const override = mappingObj.layerColors?.[comp.layer] || customDict[comp.layer];
    const layerInfo = LAYER_COLOR_MAP[comp.layer] || { main: '#38bdf8', emissive: '#7dd3fc', label: comp.layer };
    const mainCol = override || layerInfo.main;
    return {
      color: mainCol,
      emissive: override || layerInfo.emissive,
      label: layerInfo.label,
      categoryKey: comp.layer,
    };
  }

  if (category === 'MATERIAL') {
    // Check override in colorMapping.materialColors or customDict
    const override = mappingObj.materialColors?.[comp.materialType] || customDict[comp.materialType];
    const matInfo = MATERIAL_COLOR_MAP[comp.materialType] || { main: '#94a3b8', emissive: '#cbd5e1', label: comp.materialType };
    const mainCol = override || matInfo.main;
    return {
      color: mainCol,
      emissive: override || matInfo.emissive,
      label: matInfo.label,
      categoryKey: comp.materialType,
    };
  }

  if (category === 'TEMPERATURE') {
    const nameLower = (comp.name || '').toLowerCase();
    const isCritical =
      comp.layer === 'CORE' ||
      comp.materialType === 'silicon' ||
      nameLower.includes('core') ||
      nameLower.includes('soc') ||
      nameLower.includes('reactor');
    const isWarm =
      comp.layer === 'ELECTRONICS' ||
      comp.shape === 'chip' ||
      comp.shape === 'capacitor' ||
      comp.shape === 'coil' ||
      nameLower.includes('vrm');
    const isOptimal =
      comp.layer === 'COOLING' ||
      comp.shape === 'fan_blade' ||
      comp.shape === 'heat_pipe' ||
      nameLower.includes('cooler');

    let profile = TEMPERATURE_COLOR_MAP.supercooled;
    let key = 'supercooled';
    if (isCritical) {
      profile = TEMPERATURE_COLOR_MAP.critical;
      key = 'critical';
    } else if (isWarm) {
      profile = TEMPERATURE_COLOR_MAP.warm;
      key = 'warm';
    } else if (isOptimal) {
      profile = TEMPERATURE_COLOR_MAP.optimal;
      key = 'optimal';
    }

    const customTemp = mappingObj.temperatureColors?.[key as keyof typeof mappingObj.temperatureColors];
    const col = customTemp || profile.main;
    return {
      color: col,
      emissive: customTemp || profile.emissive,
      label: profile.label,
      categoryKey: key,
    };
  }

  if (category === 'POWER_STATUS') {
    const nameLower = (comp.name || '').toLowerCase();
    const isHV =
      nameLower.includes('bus') ||
      nameLower.includes('power') ||
      nameLower.includes('pcie') ||
      comp.layer === 'TRACES';
    const isLogic = comp.layer === 'CORE' || comp.materialType === 'silicon';
    const isGround = comp.shape === 'pcb_substrate' || comp.layer === 'STRUCTURAL';

    let profile = POWER_COLOR_MAP.rfSignal;
    let key = 'rfSignal';
    if (isHV) {
      profile = POWER_COLOR_MAP.highVoltage;
      key = 'highVoltage';
    } else if (isLogic) {
      profile = POWER_COLOR_MAP.logic3v3;
      key = 'logic3v3';
    } else if (isGround) {
      profile = POWER_COLOR_MAP.ground;
      key = 'ground';
    }

    const customPower = mappingObj.powerColors?.[key as keyof typeof mappingObj.powerColors];
    const col = customPower || profile.main;
    return {
      color: col,
      emissive: customPower || profile.emissive,
      label: profile.label,
      categoryKey: key,
    };
  }

  if (category === 'SUBSYSTEM') {
    const nameLower = (comp.name || '').toLowerCase();
    let profile = SUBSYSTEM_COLOR_MAP.structural;
    let key = 'structural';

    if (comp.layer === 'CORE' || comp.materialType === 'silicon' || nameLower.includes('processor')) {
      profile = SUBSYSTEM_COLOR_MAP.compute;
      key = 'compute';
    } else if (comp.shape === 'capacitor' || comp.shape === 'coil' || comp.shape === 'resistor' || nameLower.includes('vrm')) {
      profile = SUBSYSTEM_COLOR_MAP.power;
      key = 'power';
    } else if (comp.layer === 'COOLING' || comp.shape === 'heat_pipe' || comp.shape === 'fan_blade') {
      profile = SUBSYSTEM_COLOR_MAP.thermal;
      key = 'thermal';
    } else if (comp.layer === 'TRACES' || comp.shape === 'trace_line' || nameLower.includes('bus')) {
      profile = SUBSYSTEM_COLOR_MAP.interconnect;
      key = 'interconnect';
    }

    const customSub = mappingObj.subsystemColors?.[key as keyof typeof mappingObj.subsystemColors];
    const col = customSub || profile.main;
    return {
      color: col,
      emissive: customSub || profile.emissive,
      label: profile.label,
      categoryKey: key,
    };
  }

  // DEFAULT / DISTINCT category
  const fallback = DISTINCT_VIBRANT_PALETTE[index % DISTINCT_VIBRANT_PALETTE.length];
  const isDarkDefault = !comp.color || comp.color === '#000000' || comp.color === '#1e293b' || comp.color === '#0f172a';
  const c = isDarkDefault ? fallback : comp.color;
  return {
    color: c,
    emissive: comp.emissiveColor || c,
    label: `Part #${index + 1}: ${comp.name}`,
    categoryKey: comp.id,
  };
};

// Check if WebGL is supported by the browser context
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

// Safe color creator to prevent Three.js shader crash on malformed hex or named colors
const createSafeColor = (colorStr?: string, fallbackHex: string = '#06b6d4'): THREE.Color => {
  try {
    if (!colorStr || typeof colorStr !== 'string' || colorStr.trim() === '') {
      return new THREE.Color(fallbackHex);
    }
    const clean = colorStr.trim();
    // If it's a valid hex or CSS name, three.js will parse it
    return new THREE.Color(clean);
  } catch (e) {
    return new THREE.Color(fallbackHex);
  }
};

export const HologramStage: React.FC<HologramStageProps> = ({
  scene,
  colorMapping,
  activeCategory,
  onColorCategoryChange,
  onComponentSelect,
  onExplodeChange,
  onToggleHologramMode,
  onToggleXRay,
  onToggleWireframe,
  onToggleAutoRotate,
  onResetCamera,
  onViewPreset,
  onToggleLayer,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedComp, setSelectedComp] = useState<HologramComponent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);
  const [polyCount, setPolyCount] = useState(0);
  const [viewMode, setViewMode] = useState<'3D' | 'SCHEMATIC'>('3D');
  const [webGLError, setWebGLError] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState<HologramColorScheme>(
    activeCategory || (colorMapping && typeof colorMapping === 'object' && 'category' in colorMapping && colorMapping.category ? (colorMapping.category as HologramDataCategory) : 'DISTINCT')
  );
  const [showColorLegend, setShowColorLegend] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isAirGestureActive, setIsAirGestureActive] = useState(false);

  // Sync external activeCategory or colorMapping.category if updated
  useEffect(() => {
    if (activeCategory) {
      setColorScheme(activeCategory);
    } else if (colorMapping && typeof colorMapping === 'object' && 'category' in colorMapping && colorMapping.category) {
      setColorScheme(colorMapping.category as HologramDataCategory);
    }
  }, [activeCategory, colorMapping]);

  const handleSelectScheme = (scheme: HologramColorScheme) => {
    setColorScheme(scheme);
    if (onColorCategoryChange) {
      onColorCategoryChange(scheme);
    }
  };

  // References for Three.js lifecycle
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelContainerGroupRef = useRef<THREE.Group | null>(null);
  const modelContentGroupRef = useRef<THREE.Group | null>(null);
  const meshMapRef = useRef<Map<string, { mesh: THREE.Object3D; component: HologramComponent }>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const dynamicObjectsRef = useRef<{
    fanMeshes: THREE.Object3D[];
    rings: THREE.Object3D[];
    scanBeam: THREE.Mesh | null;
    particles: THREE.Points | null;
    pulseLights: THREE.PointLight[];
  }>({
    fanMeshes: [],
    rings: [],
    scanBeam: null,
    particles: null,
    pulseLights: [],
  });

  // Camera interaction state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number; dist?: number }>({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({
    radius: 11,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 0.4, 0),
  });

  // Sync selected component with parent
  useEffect(() => {
    if (scene.selectedComponentId) {
      const found = scene.components.find((c) => c.id === scene.selectedComponentId);
      if (found) setSelectedComp(found);
    }
  }, [scene.selectedComponentId, scene.components]);

  // --------------------------------------------------------------------------
  // INITIALIZE THREE.JS SCENE & RENDERER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== '3D') return;
    if (!containerRef.current) return;

    if (!checkWebGLSupport()) {
      setWebGLError('WebGL is not hardware-supported in this environment.');
      setViewMode('SCHEMATIC');
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e: any) {
      console.warn('WebGL Renderer failed to initialize:', e);
      setWebGLError('WebGL Context could not be created.');
      setViewMode('SCHEMATIC');
      return;
    }

    // 1. Scene
    const threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0x020617);
    threeScene.fog = new THREE.FogExp2(0x020617, 0.015);
    sceneRef.current = threeScene;

    // Model Container & Content Hierarchy
    // container stays at (0, 0.4, 0) and gets scaled
    // content group contains children and gets centered at (-center.x, -center.y, -center.z)
    const modelContainer = new THREE.Group();
    modelContainer.name = 'MODEL_CONTAINER';
    modelContainer.position.set(0, 0.4, 0);
    threeScene.add(modelContainer);
    modelContainerGroupRef.current = modelContainer;

    const modelContent = new THREE.Group();
    modelContent.name = 'MODEL_CONTENT';
    modelContainer.add(modelContent);
    modelContentGroupRef.current = modelContent;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const initialPos = scene.cameraState?.position || [8, 6, 8];
    const initialTarget = new THREE.Vector3(0, 0.4, 0);
    camera.position.set(initialPos[0], initialPos[1], initialPos[2]);
    camera.lookAt(initialTarget);
    cameraRef.current = camera;

    // Initialize spherical coords
    const camOffset = camera.position.clone().sub(initialTarget);
    cameraSphericalRef.current.radius = camOffset.length() || 11;
    cameraSphericalRef.current.theta = Math.atan2(camOffset.x, camOffset.z);
    cameraSphericalRef.current.phi = Math.acos(Math.max(-1, Math.min(1, camOffset.y / (camOffset.length() || 1))));
    cameraSphericalRef.current.target = initialTarget;

    // 3. Renderer configuration
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    // Clear old canvases
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Vibrant Sci-Fi Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 1.5);
    threeScene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0x06b6d4, 1.0);
    threeScene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    threeScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.0);
    dirLight2.position.set(-10, 10, -10);
    threeScene.add(dirLight2);

    const centerGlowLight = new THREE.PointLight(0x06b6d4, 3.0, 30);
    centerGlowLight.position.set(0, 1.5, 0);
    threeScene.add(centerGlowLight);
    dynamicObjectsRef.current.pulseLights = [centerGlowLight];

    // 5. Holographic Stage Pedestal, Grid & Floating Matrix
    buildHolographicStage(threeScene);

    // 6. Build 3D Components
    rebuildComponents(threeScene, scene);

    // 7. Mouse & Touch Event Handlers
    const domElement = renderer.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
      } else if (e.button === 2) {
        isRightDraggingRef.current = true;
      }
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        cameraSphericalRef.current.theta -= deltaX * 0.008;
        cameraSphericalRef.current.phi = Math.max(
          0.08,
          Math.min(Math.PI / 2 + 0.35, cameraSphericalRef.current.phi - deltaY * 0.008)
        );
        updateCameraPosition();
      } else if (isRightDraggingRef.current) {
        cameraSphericalRef.current.target.x -= deltaX * 0.01;
        cameraSphericalRef.current.target.y += deltaY * 0.01;
        updateCameraPosition();
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isRightDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        3.0,
        Math.min(35, cameraSphericalRef.current.radius + e.deltaY * 0.012)
      );
      updateCameraPosition();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDraggingRef.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartRef.current.dist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - touchStartRef.current.x;
        const deltaY = e.touches[0].clientY - touchStartRef.current.y;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        cameraSphericalRef.current.theta -= deltaX * 0.01;
        cameraSphericalRef.current.phi = Math.max(
          0.08,
          Math.min(Math.PI / 2 + 0.35, cameraSphericalRef.current.phi - deltaY * 0.01)
        );
        updateCameraPosition();
      } else if (e.touches.length === 2 && touchStartRef.current.dist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const diff = touchStartRef.current.dist - newDist;
        touchStartRef.current.dist = newDist;

        cameraSphericalRef.current.radius = Math.max(
          3.0,
          Math.min(35, cameraSphericalRef.current.radius + diff * 0.03)
        );
        updateCameraPosition();
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      touchStartRef.current.dist = undefined;
    };

    // Click & Tap raycaster for component selection
    const handleClick = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersectableObjects: THREE.Object3D[] = [];
      meshMapRef.current.forEach(({ mesh }) => {
        intersectableObjects.push(mesh);
      });

      const intersects = raycaster.intersectObjects(intersectableObjects, true);
      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.componentId && hitObj.parent) {
          hitObj = hitObj.parent;
        }
        if (hitObj && hitObj.userData?.componentId) {
          const compId = hitObj.userData.componentId;
          const found = scene.components.find((c) => c.id === compId);
          if (found) {
            setSelectedComp(found);
            if (onComponentSelect) onComponentSelect(found);
          }
        }
      }
    };

    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    domElement.addEventListener('click', handleClick);
    domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 9. Render Loop
    let lastTime = performance.now();
    let frameCounter = 0;
    let fpsTimer = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      frameCounter++;
      if (now - fpsTimer >= 1000) {
        setFps(frameCounter);
        frameCounter = 0;
        fpsTimer = now;
      }

      // Auto-rotation if enabled
      if (scene.autoRotate && !isDraggingRef.current && !isRightDraggingRef.current) {
        cameraSphericalRef.current.theta += (scene.rotationSpeed || 0.4) * delta;
        updateCameraPosition();
      }

      // Dynamic object animations
      const dyn = dynamicObjectsRef.current;
      dyn.fanMeshes.forEach((fan) => {
        fan.rotation.y += delta * 7.5;
      });

      dyn.rings.forEach((ring, idx) => {
        ring.rotation.z += delta * (idx % 2 === 0 ? 0.35 : -0.25);
      });

      if (dyn.scanBeam) {
        dyn.scanBeam.position.y = Math.sin(now * 0.0018) * 2.8;
      }

      if (dyn.particles) {
        dyn.particles.rotation.y += delta * 0.08;
      }

      if (dyn.pulseLights[0]) {
        dyn.pulseLights[0].intensity = 2.5 + Math.sin(now * 0.003) * 1.0;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      domElement.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [viewMode]);

  // Update Camera Spherical Position
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi, target } = cameraSphericalRef.current;
    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  };

  // --------------------------------------------------------------------------
  // BUILD HOLOGRAPHIC PEDESTAL & STAGE
  // --------------------------------------------------------------------------
  const buildHolographicStage = (threeScene: THREE.Scene) => {
    const dyn = dynamicObjectsRef.current;
    dyn.rings = [];

    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, -2.4, 0);

    // 1. Grid Floor
    const gridHelper = new THREE.GridHelper(20, 40, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = 0;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.45;
    stageGroup.add(gridHelper);

    // 2. Concentric Holographic Pedestal Rings
    const ringRadii = [2.8, 4.2, 5.8];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.05, r + 0.05, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 1 ? 0xa855f7 : 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.02 + idx * 0.01;
      stageGroup.add(ringMesh);
      dyn.rings.push(ringMesh);
    });

    // 3. Volumetric Scanner Laser Line
    const scanGeo = new THREE.PlaneGeometry(12, 0.08);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const scanBeam = new THREE.Mesh(scanGeo, scanMat);
    scanBeam.rotation.x = Math.PI / 2;
    scanBeam.position.set(0, 0, 0);
    threeScene.add(scanBeam);
    dyn.scanBeam = scanBeam;

    // 4. Floating Holographic Cybernetic Particles
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 10 + 1;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.09,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    threeScene.add(particles);
    dyn.particles = particles;

    threeScene.add(stageGroup);
  };

  // Helper: Build shape geometry with high geometric quality & safe defaults
  const createShapeGeometry = (shape: string, s: [number, number, number]): THREE.BufferGeometry => {
    const sx = Math.max(0.08, Math.abs(Number(s[0]) || 1));
    const sy = Math.max(0.08, Math.abs(Number(s[1]) || 1));
    const sz = Math.max(0.08, Math.abs(Number(s[2]) || 1));

    switch (shape) {
      case 'cylinder':
      case 'capacitor':
      case 'resistor':
      case 'pipe':
      case 'pillar':
        return new THREE.CylinderGeometry(sx / 2, sz / 2, sy, 32);
      case 'disc':
        return new THREE.CylinderGeometry(sx / 2, sx / 2, Math.max(0.05, sy), 32);
      case 'ring':
      case 'tube': {
        const outerR = Math.max(0.3, sx / 2);
        const tubeR = Math.max(0.05, Math.min(outerR * 0.35, sz / 4));
        return new THREE.TorusGeometry(outerR, tubeR, 24, 48);
      }
      case 'dome':
        return new THREE.SphereGeometry(sx / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      case 'sphere':
      case 'core':
        return new THREE.SphereGeometry(sx / 2, 32, 32);
      case 'heart_ventricle': {
        const geo = new THREE.SphereGeometry(sx / 2, 32, 24);
        geo.scale(1.0, 1.35, 0.9);
        return geo;
      }
      case 'aorta_arch': {
        const geo = new THREE.TorusGeometry(sx * 0.45, Math.max(0.08, sz * 0.2), 24, 32, Math.PI * 0.85);
        return geo;
      }
      case 'capsule':
        return new THREE.CapsuleGeometry
          ? new THREE.CapsuleGeometry(sx / 2, Math.max(0.1, sy), 16, 16)
          : new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 24);
      case 'torus':
      case 'coil': {
        const radius = Math.max(0.3, sx / 2);
        const tube = Math.max(0.06, Math.min(radius * 0.4, sz / 4));
        return new THREE.TorusGeometry(radius, tube, 24, 48);
      }
      case 'cone':
        return new THREE.ConeGeometry(sx / 2, sy, 32);
      case 'pyramid':
        return new THREE.ConeGeometry(sx / 2, sy, 4);
      case 'gear':
      case 'radial_array': {
        const gearGeo = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 16);
        return gearGeo;
      }
      case 'fan_blade':
        return new THREE.BoxGeometry(sx, sy * 0.25, sz);
      case 'bracket':
      case 'claw': {
        return new THREE.BoxGeometry(sx, sy, sz);
      }
      case 'trace_line':
        return new THREE.BoxGeometry(sx, Math.max(0.04, sy * 0.1), sz);
      case 'heat_pipe':
        return new THREE.CylinderGeometry(sx * 0.35, sx * 0.35, sy, 16);
      case 'roof':
      case 'wedge': {
        const prismGeo = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 3);
        prismGeo.rotateX(Math.PI / 2);
        return prismGeo;
      }
      case 'wall':
      case 'slab':
      case 'door':
      case 'window':
      case 'furniture':
      case 'stairs':
      case 'chip':
      case 'pcb_substrate':
      case 'box':
      default:
        return new THREE.BoxGeometry(sx, sy, sz);
    }
  };

  // --------------------------------------------------------------------------
  // REBUILD 3D COMPONENTS WITH ISOLATED CENTERING & ZERO DRIFT
  // --------------------------------------------------------------------------
  const rebuildComponents = (threeScene: THREE.Scene, sceneData: HologramScene) => {
    const modelContainer = modelContainerGroupRef.current;
    const modelContent = modelContentGroupRef.current;
    if (!modelContainer || !modelContent) return;

    // 1. Clear previous objects from content group
    while (modelContent.children.length > 0) {
      const child = modelContent.children[0];
      modelContent.remove(child);
    }
    meshMapRef.current.clear();
    dynamicObjectsRef.current.fanMeshes = [];

    // Reset transforms of content group during assembly
    modelContent.position.set(0, 0, 0);
    modelContent.scale.set(1, 1, 1);
    modelContent.rotation.set(0, 0, 0);

    let totalPolygons = 0;

    const brightVibrantColors = [
      '#06b6d4', // Cyan
      '#a855f7', // Purple
      '#38bdf8', // Sky
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#6366f1', // Indigo
      '#14b8a6', // Teal
    ];

    // 2. Build Component Meshes
    sceneData.components.forEach((comp, compIdx) => {
      // Check Layer visibility
      if (sceneData.activeLayers && sceneData.activeLayers[comp.layer] === false) {
        return;
      }
      if (comp.visible === false) return;

      const group = new THREE.Group();
      group.userData = { componentId: comp.id, name: comp.name };

      // Calculate distinct vibrant color based on active color category & color mapping
      const colorInfo = getComponentColor(comp, compIdx, colorScheme, colorMapping);
      const rawColor = colorInfo.color;
      const emissiveHex = colorInfo.emissive;

      const matColor = createSafeColor(rawColor, DISTINCT_VIBRANT_PALETTE[compIdx % DISTINCT_VIBRANT_PALETTE.length]);
      const emissiveColor = createSafeColor(emissiveHex, rawColor);
      let emissiveIntensity = comp.emissiveIntensity !== undefined ? Math.max(0.35, comp.emissiveIntensity) : 0.45;
      let opacity = comp.opacity !== undefined ? comp.opacity : 1.0;
      let transparent = comp.transparent || opacity < 1.0;

      // Holographic Mode Stylization
      if (sceneData.hologramEffect) {
        if (comp.layer === 'CASING') {
          opacity = 0.45;
          transparent = true;
          emissiveIntensity = 0.6;
        } else if (comp.layer === 'CORE' || comp.materialType === 'glowing_core') {
          emissiveIntensity = 1.3;
        }
      }

      // X-Ray Cutaway Override for Casing
      if (sceneData.xRayCutaway && comp.layer === 'CASING') {
        opacity = 0.25;
        transparent = true;
        emissiveIntensity = 0.7;
      }

      const isWireframe =
        sceneData.wireframeMode ||
        comp.materialType === 'wireframe' ||
        comp.materialType === 'hologram_grid';

      // Standard material with ambient reflectance
      const material = new THREE.MeshStandardMaterial({
        color: matColor,
        emissive: emissiveColor,
        emissiveIntensity: comp.highlighted ? emissiveIntensity + 0.6 : emissiveIntensity,
        roughness: 0.35,
        metalness: 0.2,
        transparent,
        opacity,
        wireframe: isWireframe,
        side: THREE.DoubleSide,
      });

      // Geometry Creation
      const s = comp.scale || [1, 1, 1];
      const geometry = createShapeGeometry(comp.shape, s);

      if (geometry.index) {
        totalPolygons += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        totalPolygons += geometry.attributes.position.count / 3;
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { componentId: comp.id, name: comp.name };
      group.add(mesh);

      // Glowing Edge Wireframe outline for crisp edge definition
      const wireColor = comp.highlighted ? new THREE.Color(0x22d3ee) : matColor.clone().offsetHSL(0, 0.1, 0.15);
      const wireMat = new THREE.MeshBasicMaterial({
        color: wireColor,
        wireframe: true,
        transparent: true,
        opacity: comp.highlighted ? 0.95 : 0.45,
      });
      const wireMesh = new THREE.Mesh(geometry, wireMat);
      wireMesh.scale.multiplyScalar(1.002);
      group.add(wireMesh);

      // Bounding Box Reticle if highlighted
      if (comp.highlighted || comp.id === sceneData.selectedComponentId) {
        const bbox = new THREE.Box3().setFromObject(mesh);
        const bboxHelper = new THREE.Box3Helper(bbox, new THREE.Color(0x38bdf8));
        group.add(bboxHelper);
      }

      // Fan/Turbine rotating list
      if (
        comp.id.includes('fan') ||
        comp.id.includes('turbine') ||
        comp.id.includes('spinner') ||
        comp.id.includes('rotor')
      ) {
        dynamicObjectsRef.current.fanMeshes.push(group);
      }

      // Calculate position with exploded factor
      const expOffset = comp.explodedOffset || [0, 0, 0];
      const factor = sceneData.explodedFactor || 0;
      const px = (Number(comp.position?.[0]) || 0) + (Number(expOffset[0]) || 0) * factor;
      const py = (Number(comp.position?.[1]) || 0) + (Number(expOffset[1]) || 0) * factor;
      const pz = (Number(comp.position?.[2]) || 0) + (Number(expOffset[2]) || 0) * factor;

      group.position.set(px, py, pz);
      if (comp.rotation && comp.rotation.length === 3) {
        group.rotation.set(
          Number(comp.rotation[0]) || 0,
          Number(comp.rotation[1]) || 0,
          Number(comp.rotation[2]) || 0
        );
      }

      modelContent.add(group);
      meshMapRef.current.set(comp.id, { mesh: group, component: comp });
    });

    // 3. Render Connections / Traces
    if (sceneData.connections && sceneData.connections.length > 0) {
      sceneData.connections.forEach((conn) => {
        if (conn.points && conn.points.length >= 2) {
          const curve = new THREE.CatmullRomCurve3(
            conn.points.map((p) => new THREE.Vector3(Number(p[0]) || 0, Number(p[1]) || 0, Number(p[2]) || 0))
          );
          const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.05, 8, false);
          const tubeMat = new THREE.MeshBasicMaterial({
            color: createSafeColor(conn.color, '#38bdf8'),
            wireframe: false,
          });
          const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
          modelContent.add(tubeMesh);
          meshMapRef.current.set(conn.id, {
            mesh: tubeMesh,
            component: {
              id: conn.id,
              name: `Bus Connection: ${conn.type}`,
              layer: 'TRACES',
              shape: 'custom',
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
              explodedOffset: [0, 0, 0],
              color: conn.color,
              materialType: 'copper',
              opacity: 1,
              visible: true,
            },
          });
        }
      });
    }

    // 4. ROBUST BOUNDING BOX NORMALIZATION (ZERO DRIFT)
    // Update local matrices so bounding box calculation is accurate
    modelContent.updateMatrixWorld(true);
    const boundingBox = new THREE.Box3().setFromObject(modelContent);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Center content around local origin (0, 0, 0)
    modelContent.position.set(-center.x, -center.y, -center.z);

    // Scale parent container so model is always comfortably within view
    const maxDim = Math.max(size.x, size.y, size.z);
    let autoScale = 1.0;
    if (maxDim > 0.1) {
      autoScale = 4.8 / Math.max(1.0, maxDim);
    }
    modelContainer.scale.setScalar(autoScale);
    modelContainer.position.set(0, 0.3, 0);

    setPolyCount(Math.round(totalPolygons));
  };

  // Re-run rebuild when scene props change
  useEffect(() => {
    if (viewMode === '3D' && sceneRef.current) {
      rebuildComponents(sceneRef.current, scene);
    }
  }, [
    scene.components,
    scene.connections,
    scene.explodedFactor,
    scene.wireframeMode,
    scene.hologramEffect,
    scene.xRayCutaway,
    scene.activeLayers,
    scene.selectedComponentId,
    scene.highlightedComponentIds,
    scene.version,
    scene.colorMapping,
    colorMapping,
    viewMode,
    colorScheme,
  ]);

  // View Preset Trigger
  const handleSetView = (preset: 'FRONT' | 'BACK' | 'TOP' | 'ISOMETRIC') => {
    if (onViewPreset) onViewPreset(preset);
    if (!cameraRef.current) return;

    if (preset === 'FRONT') {
      cameraSphericalRef.current.theta = 0;
      cameraSphericalRef.current.phi = Math.PI / 2;
    } else if (preset === 'BACK') {
      cameraSphericalRef.current.theta = Math.PI;
      cameraSphericalRef.current.phi = Math.PI / 2;
    } else if (preset === 'TOP') {
      cameraSphericalRef.current.theta = 0;
      cameraSphericalRef.current.phi = 0.05;
    } else if (preset === 'ISOMETRIC') {
      cameraSphericalRef.current.theta = Math.PI / 4;
      cameraSphericalRef.current.phi = Math.PI / 3;
    }
    cameraSphericalRef.current.target.set(0, 0.4, 0);
    cameraSphericalRef.current.radius = 11;
    updateCameraPosition();
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // If in 2D Schematic Mode or WebGL failed, render Schematic Visualizer
  if (viewMode === 'SCHEMATIC') {
    return (
      <HolographicSchematicVisualizer
        scene={scene}
        colorMapping={colorMapping}
        colorCategory={colorScheme}
        onComponentSelect={(c) => {
          setSelectedComp(c);
          if (onComponentSelect) onComponentSelect(c);
        }}
        onExplodeChange={onExplodeChange}
        onToggleLayer={onToggleLayer}
        onResetView={onResetCamera}
        className={className}
        errorMessage={webGLError}
        onSwitchTo3D={() => {
          setWebGLError(null);
          setViewMode('3D');
        }}
      />
    );
  }

  return (
    <div
      id="hologram-stage-viewport"
      className={`relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-neutral-950 flex flex-col ${className}`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 cursor-grab active:cursor-grabbing min-h-[380px] touch-none"
      />

      {/* TOP OVERLAY: Model Title & Mode Selector */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 gap-2">
        <div className="flex items-center gap-2.5 bg-neutral-950/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-3 py-1.5 pointer-events-auto shadow-lg shadow-black/40">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-white tracking-wide">
                {scene.title}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {scene.conceptType}
              </span>
              {scene.providerType && (
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                  scene.providerType === 'procedural'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}>
                  {scene.providerType === 'procedural' ? 'CAD ENGINE' : 'AI NEURAL'}
                </span>
              )}
              {scene.qualityLevel && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {scene.qualityLevel}
                </span>
              )}
              {scene.validationReport && (
                <button
                  id="btn-open-validation-report"
                  onClick={() => setShowValidationModal(true)}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 transition-all border ${
                    scene.validationReport.isValid
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                      : 'bg-amber-950 text-amber-300 border-amber-500/50 hover:bg-amber-900'
                  }`}
                  title="Click to view 3D Geometry & Semantic Validation Report"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{scene.validationReport.overallConfidence}% VERIFIED</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
              {scene.components?.length || 0} Sub-Assemblies | {polyCount.toLocaleString()} Polygons
            </p>
          </div>
        </div>

        {/* View Presets & Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 rounded-xl p-1 pointer-events-auto shadow-lg shadow-black/40">
          {/* Data Category Color Scheme Picker */}
          <div className="flex items-center bg-neutral-900/80 rounded-lg p-0.5 border border-neutral-800">
            <button
              id="btn-scheme-distinct"
              onClick={() => handleSelectScheme('DISTINCT')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'DISTINCT'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Multi-Color Mode: Each component has a distinct high-contrast color (আলাদা আলাদা রঙ)"
            >
              <Palette className="w-3 h-3" />
              <span>MULTI-COLOR</span>
            </button>
            <button
              id="btn-scheme-layer"
              onClick={() => handleSelectScheme('LAYER')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'LAYER'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Layer Color Mode: Colored by functional engineering layers (লেয়ার রঙ)"
            >
              <Layers className="w-3 h-3" />
              <span>BY LAYER</span>
            </button>
            <button
              id="btn-scheme-material"
              onClick={() => handleSelectScheme('MATERIAL')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'MATERIAL'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Realistic Material Mode: Copper, Silicon, Aluminum (আসল উপাদান)"
            >
              <Box className="w-3 h-3" />
              <span>MATERIAL</span>
            </button>
            <button
              id="btn-scheme-temp"
              onClick={() => handleSelectScheme('TEMPERATURE')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'TEMPERATURE'
                  ? 'bg-red-500 text-white font-bold shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Thermal Profile Mode: Heat generation and dissipation zones (তাপমাত্রা প্রোফাইল)"
            >
              <Flame className="w-3 h-3" />
              <span>THERMAL</span>
            </button>
            <button
              id="btn-scheme-power"
              onClick={() => handleSelectScheme('POWER_STATUS')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'POWER_STATUS'
                  ? 'bg-yellow-400 text-black font-bold shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Power & Signal Rails: 48V, 3.3V Logic, High-Frequency Signals (বিদ্যুৎ ও সংকেত লাইন)"
            >
              <Zap className="w-3 h-3" />
              <span>POWER</span>
            </button>
            <button
              id="btn-scheme-subsystem"
              onClick={() => handleSelectScheme('SUBSYSTEM')}
              className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                colorScheme === 'SUBSYSTEM'
                  ? 'bg-pink-500 text-white font-bold shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Subsystem Architecture: Compute, Power, Cooling, Interconnect (সাব-সিস্টেম ভাগ)"
            >
              <Activity className="w-3 h-3" />
              <span>SUBSYSTEM</span>
            </button>
          </div>

          <div className="w-[1px] h-4 bg-neutral-800" />

          {/* Toggle Color Key Legend */}
          <button
            id="btn-toggle-color-legend"
            onClick={() => setShowColorLegend(!showColorLegend)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all border ${
              showColorLegend
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'text-neutral-300 hover:bg-neutral-800 border-neutral-800'
            }`}
            title="Toggle Color Key / Component Legend (রঙের তালিকা)"
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

          {/* Switch to 2D Schematic */}
          <button
            id="btn-switch-schematic"
            onClick={() => setViewMode('SCHEMATIC')}
            className="px-2 py-1 rounded-lg text-[10px] font-mono text-cyan-400 hover:bg-cyan-950/60 hover:text-white border border-cyan-500/30 flex items-center gap-1 transition-all"
            title="Switch to 2D Schematic Blueprint Mode"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2D SCHEMATIC</span>
          </button>

          <div className="w-[1px] h-4 bg-neutral-800" />

          <button
            id="btn-view-iso"
            onClick={() => handleSetView('ISOMETRIC')}
            className="px-2 py-1 rounded-lg text-[10px] font-mono text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
            title="Isometric View"
          >
            ISO
          </button>
          <button
            id="btn-view-front"
            onClick={() => handleSetView('FRONT')}
            className="px-2 py-1 rounded-lg text-[10px] font-mono text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
            title="Front Elevation"
          >
            FRONT
          </button>
          <button
            id="btn-view-top"
            onClick={() => handleSetView('TOP')}
            className="px-2 py-1 rounded-lg text-[10px] font-mono text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
            title="Top Plan View"
          >
            TOP
          </button>
          <button
            id="btn-reset-cam"
            onClick={() => handleSetView('ISOMETRIC')}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
            title="Fit to Screen / Reset Camera"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-stage-fullscreen"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
            title="Toggle Fullscreen Viewport"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* FLOATING INTERACTIVE COLOR LEGEND HUD */}
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
            Click any part to inspect and highlight in 3D:
          </p>

          <div className="overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
            {scene.components.map((comp, idx) => {
              const info = getComponentColor(comp, idx, colorScheme, colorMapping);
              const isSelected = selectedComp?.id === comp.id;

              return (
                <button
                  key={comp.id}
                  id={`legend-item-${comp.id}`}
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

      {/* FLOATING RETICLE OVERLAY FOR SELECTED COMPONENT */}
      {selectedComp && (
        <div className="absolute bottom-16 left-4 bg-neutral-950/95 backdrop-blur-xl border border-cyan-500/60 rounded-xl p-3.5 max-w-sm sm:max-w-md pointer-events-auto z-20 shadow-2xl shadow-cyan-950/90 animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-neutral-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] flex-shrink-0"
                style={{ backgroundColor: selectedComp.color || '#38bdf8' }}
              />
              <span className="text-xs font-mono font-bold text-cyan-300 truncate">
                {selectedComp.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {selectedComp.layer}
              </span>
              <button
                onClick={() => {
                  setSelectedComp(null);
                  if (onComponentSelect) onComponentSelect(null);
                }}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Close component inspector"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-300 font-mono mb-2 leading-relaxed">
            {selectedComp.description || 'Active sub-assembly node in 3D spatial matrix.'}
          </p>

          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono text-neutral-300 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800 mb-2">
            <div>
              <span className="text-neutral-500">Geometry:</span> {selectedComp.shape}
            </div>
            <div>
              <span className="text-neutral-500">Material:</span> {selectedComp.materialType}
            </div>
            {selectedComp.dimensionsApprox && (
              <div className="col-span-2 text-cyan-300">
                <span className="text-neutral-500">Dimensions:</span> {selectedComp.dimensionsApprox}
              </div>
            )}
            {selectedComp.roomType && (
              <div className="col-span-2 text-amber-300">
                <span className="text-neutral-500">Category:</span> {selectedComp.roomType} ({selectedComp.areaSqFt || 0} sq ft)
              </div>
            )}
          </div>

          {/* Manufacturing Machine & Process (তৈরিতে প্রয়োজনীয় মেশিন ও পদ্ধতি) */}
          {(selectedComp.manufacturingMachine || selectedComp.manufacturingProcess) && (
            <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/40 space-y-1 text-[9px] font-mono text-amber-200">
              {selectedComp.manufacturingMachine && (
                <div className="flex items-start gap-1">
                  <Wrench className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-amber-400 font-bold">মেশিন/যন্ত্রপাতি: </span>
                    <span>{selectedComp.manufacturingMachine}</span>
                  </div>
                </div>
              )}
              {selectedComp.manufacturingProcess && (
                <div className="flex items-start gap-1">
                  <Hammer className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-amber-400 font-bold">বানানোর পদ্ধতি: </span>
                    <span>{selectedComp.manufacturingProcess}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BOTTOM CONTROLS BAR: Exploded Slider, Hologram, Cutaway, Wireframe, Auto-Rotate */}
      <div className="border-t border-cyan-500/20 bg-neutral-950/90 backdrop-blur-md px-2.5 sm:px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-10">
        {/* Exploded View Slider */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 min-w-0">
          <span className="text-[10.5px] sm:text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1 shrink-0">
            <Sliders className="w-3.5 h-3.5" />
            EXPLODE: {Math.round((scene.explodedFactor || 0) * 100)}%
          </span>
          <input
            id="slider-exploded-factor"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scene.explodedFactor || 0}
            onChange={(e) => onExplodeChange && onExplodeChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-neutral-800 rounded-lg cursor-pointer h-1.5 min-w-0"
          />
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Hologram Glow Mode */}
          <button
            id="btn-toggle-hologram"
            onClick={onToggleHologramMode}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
              scene.hologramEffect
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
            title="Toggle Futuristic Cyan Hologram Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">HOLOGRAPHIC</span>
          </button>

          {/* X-Ray Cutaway Mode */}
          <button
            id="btn-toggle-xray"
            onClick={onToggleXRay}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
              scene.xRayCutaway
                ? 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
            title="Toggle Translucent Exterior Cutaway"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">X-RAY</span>
          </button>

          {/* Wireframe Mode */}
          <button
            id="btn-toggle-wireframe"
            onClick={onToggleWireframe}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
              scene.wireframeMode
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
            title="Toggle Wireframe CAD Matrix"
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CAD WIRE</span>
          </button>

          {/* Air Gesture Control Button */}
          <button
            id="btn-toggle-air-gesture"
            onClick={() => setIsAirGestureActive(!isAirGestureActive)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border cursor-pointer ${
              isAirGestureActive
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-neutral-900 text-cyan-400 border-cyan-500/30 hover:border-cyan-400'
            }`}
            title="Air Gesture (বাতাসে হাত নেড়ে ৩ডি মডেল নিয়ন্ত্রণ করুন)"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">
              {isAirGestureActive ? 'AIR GESTURE ON' : 'AIR GESTURE'}
            </span>
          </button>

          {/* Auto Rotate */}
          <button
            id="btn-toggle-autorotate"
            onClick={onToggleAutoRotate}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
              scene.autoRotate
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 animate-spin-slow'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
            }`}
            title="Toggle Continuous Turntable Auto-Rotation"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optical Air Gesture Floating Controller */}
      <AirGestureHUD
        isActive={isAirGestureActive}
        onToggle={() => setIsAirGestureActive(!isAirGestureActive)}
        onRotate={(yaw, pitch) => {
          cameraSphericalRef.current.theta -= yaw * 0.04;
          cameraSphericalRef.current.phi = Math.max(
            0.08,
            Math.min(Math.PI / 2 + 0.35, cameraSphericalRef.current.phi - pitch * 0.04)
          );
          updateCameraPosition();
        }}
        onExplodeChange={(fac) => {
          const newExplode = Math.max(0, Math.min(1, (scene.explodedFactor || 0) + fac));
          if (onExplodeChange) onExplodeChange(newExplode);
        }}
        onZoomChange={(zoom) => {
          cameraSphericalRef.current.radius = Math.max(
            3.0,
            Math.min(35, cameraSphericalRef.current.radius + zoom)
          );
          updateCameraPosition();
        }}
      />

      {/* 3D Geometry & Semantic Validation Report Modal */}
      {showValidationModal && scene.validationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full p-5 shadow-2xl shadow-cyan-950/50 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wider">3D GEOMETRY VALIDATION REPORT</h3>
              </div>
              <button
                onClick={() => setShowValidationModal(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Overall Confidence</span>
                <span className="text-xl font-bold text-emerald-400">{scene.validationReport.overallConfidence}%</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Semantic Match Score</span>
                <span className="text-xl font-bold text-cyan-400">{scene.validationReport.semanticMatchScore}%</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Geometry Quality</span>
                <span className="text-xl font-bold text-purple-400">{scene.validationReport.geometryQualityScore}%</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Sub-Assemblies</span>
                <span className="text-xl font-bold text-amber-400">{scene.validationReport.meshCount} Assemblies</span>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Watertight & Topology Integrity:</span>
                <span className={scene.validationReport.geometryIntegrity ? 'text-emerald-400' : 'text-red-400'}>
                  {scene.validationReport.geometryIntegrity ? 'PASSED (Clean)' : 'WARN (Degraded)'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Polygon Count:</span>
                <span className="text-cyan-300">{scene.validationReport.polygonCount.toLocaleString()} Polys</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Generator Engine:</span>
                <span className="text-purple-300">{scene.validationReport.generationProvider}</span>
              </div>
              {scene.validationReport.confidenceNotice && (
                <div className="mt-2 text-[11px] text-neutral-400 bg-neutral-900 p-2 rounded border border-neutral-800">
                  {scene.validationReport.confidenceNotice}
                </div>
              )}
            </div>

            {scene.validationReport.detectedKeyElements && scene.validationReport.detectedKeyElements.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-neutral-400 uppercase tracking-wide block">Verified Key Subcomponents:</span>
                <div className="flex flex-wrap gap-1.5">
                  {scene.validationReport.detectedKeyElements.map((el, i) => (
                    <span key={i} className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      ✓ {el}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
