import {
  HologramScene,
  HologramComponent,
  HologramConnection,
  HologramVoiceAction,
  HologramConceptType,
  HologramLayer,
  BillOfMaterialsItem,
  RequiredTool,
  BuildGuide,
} from '../src/types/hologram.js';
import { generateAiContent } from './gemini.js';
import { generateMaterialsAndBuildGuide } from './materialsAndBuildGuideEngine.js';
import { ThreeDGenerationManager } from './geometryEngine/threeDProviders.js';
import { RevisionEngine } from './geometryEngine/revisionEngine.js';

export class HologramEngine {
  private static instance: HologramEngine;
  private currentScene: HologramScene | null = null;
  private sceneStore: Map<string, HologramScene> = new Map();

  private constructor() {
    // Seed with an initial iconic Circuit Board scene
    const defaultScene = this.generateCircuitBoardScene();
    this.currentScene = defaultScene;
    this.sceneStore.set(defaultScene.id, defaultScene);
  }

  public static getInstance(): HologramEngine {
    if (!HologramEngine.instance) {
      HologramEngine.instance = new HologramEngine();
    }
    return HologramEngine.instance;
  }

  public getCurrentScene(): HologramScene {
    if (!this.currentScene) {
      this.currentScene = this.generateCircuitBoardScene();
    }
    if (!this.currentScene.billOfMaterials || !this.currentScene.buildGuide) {
      const guides = generateMaterialsAndBuildGuide(this.currentScene, this.currentScene.title);
      this.currentScene.billOfMaterials = guides.billOfMaterials;
      this.currentScene.requiredTools = guides.requiredTools;
      this.currentScene.buildGuide = guides.buildGuide;
    }
    return this.currentScene;
  }

  public getAllScenes(): HologramScene[] {
    return Array.from(this.sceneStore.values()).map(scene => {
      if (!scene.billOfMaterials || !scene.buildGuide) {
        const guides = generateMaterialsAndBuildGuide(scene, scene.title);
        scene.billOfMaterials = guides.billOfMaterials;
        scene.requiredTools = guides.requiredTools;
        scene.buildGuide = guides.buildGuide;
      }
      return scene;
    });
  }

  public getSceneById(id: string): HologramScene | undefined {
    const scene = this.sceneStore.get(id);
    if (scene && (!scene.billOfMaterials || !scene.buildGuide)) {
      const guides = generateMaterialsAndBuildGuide(scene, scene.title);
      scene.billOfMaterials = guides.billOfMaterials;
      scene.requiredTools = guides.requiredTools;
      scene.buildGuide = guides.buildGuide;
    }
    return scene;
  }

  // --------------------------------------------------------------------------
  // 1. 3D INTENT & VOICE ACTION DETECTION
  // --------------------------------------------------------------------------
  public parse3DIntent(text: string): {
    is3DRequest: boolean;
    action?: HologramVoiceAction;
    conceptType?: HologramConceptType;
    isModification: boolean;
  } {
    const lower = text.toLowerCase().trim();

    // 1. Voice Manipulation of Existing 3D Scene
    if (
      lower.includes('rotate') ||
      lower.includes('ghurao') ||
      lower.includes('turn around') ||
      lower.includes('spin')
    ) {
      let angle = 90;
      let axis: 'x' | 'y' | 'z' = 'y';
      if (lower.includes('180') || lower.includes('back')) angle = 180;
      else if (lower.includes('45')) angle = 45;
      else if (lower.includes('360')) angle = 360;
      else if (lower.includes('tilt') || lower.includes('pitch')) axis = 'x';

      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'ROTATE',
          angleDegrees: angle,
          axis,
          spokenExplanation: `Rotating 3D model ${angle} degrees along ${axis.toUpperCase()} axis.`,
        },
      };
    }

    if (
      lower.includes('zoom in') ||
      lower.includes('closer') ||
      lower.includes('kache anow')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'ZOOM',
          zoomFactor: 0.75,
          spokenExplanation: 'Zooming camera into the 3D model.',
        },
      };
    }

    if (
      lower.includes('zoom out') ||
      lower.includes('dure naw') ||
      lower.includes('pull back')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'ZOOM',
          zoomFactor: 1.35,
          spokenExplanation: 'Zooming out for full overview.',
        },
      };
    }

    if (
      lower.includes('explode') ||
      lower.includes('disassemble') ||
      lower.includes('separate parts') ||
      lower.includes('khule dekhao')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'EXPLODE',
          explodedFactor: 1.0,
          spokenExplanation: 'Displaying exploded assembly view. All components separated along spatial vectors.',
        },
      };
    }

    if (
      lower.includes('assemble') ||
      lower.includes('collapse') ||
      lower.includes('put together') ||
      lower.includes('jora lagao')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'ASSEMBLE',
          explodedFactor: 0.0,
          spokenExplanation: 'Assembling components back into compact solid model.',
        },
      };
    }

    if (
      lower.includes('cutaway') ||
      lower.includes('x-ray') ||
      lower.includes('xray') ||
      lower.includes('see inside') ||
      lower.includes('inside view') ||
      lower.includes('bhetore ki ache')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'CUTAWAY_TOGGLE',
          spokenExplanation: 'Toggling X-Ray cutaway mode to reveal internal mechanics and silicon layers.',
        },
      };
    }

    if (
      lower.includes('hologram mode') ||
      lower.includes('holographic mode') ||
      lower.includes('glow mode')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'HOLOGRAM_MODE_TOGGLE',
          spokenExplanation: 'Switching to futuristic Holographic Presentation Mode with neon energy reticles.',
        },
      };
    }

    if (
      lower.includes('wireframe') ||
      lower.includes('mesh view')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'WIREFRAME_TOGGLE',
          spokenExplanation: 'Toggling geometric wireframe raster view.',
        },
      };
    }

    if (
      lower.includes('highlight') ||
      lower.includes('select') ||
      lower.includes('focus on')
    ) {
      let target = 'processor';
      if (lower.includes('fan')) target = 'fan';
      else if (lower.includes('heatsink') || lower.includes('heat sink')) target = 'heatsink';
      else if (lower.includes('capacitor') || lower.includes('capacitors')) target = 'capacitor';
      else if (lower.includes('ram') || lower.includes('memory')) target = 'ram';
      else if (lower.includes('motor')) target = 'motor';
      else if (lower.includes('core')) target = 'core';
      else if (lower.includes('trace') || lower.includes('traces')) target = 'trace';

      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'HIGHLIGHT',
          targetComponent: target,
          spokenExplanation: `Highlighting ${target} component in telemetry overlay.`,
        },
      };
    }

    if (
      lower.includes('hide casing') ||
      lower.includes('hide case') ||
      lower.includes('remove casing') ||
      lower.includes('hide housing')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'HIDE_LAYER',
          targetLayer: 'CASING',
          spokenExplanation: 'Hiding outer casing layer to expose core assemblies.',
        },
      };
    }

    if (
      lower.includes('show casing') ||
      lower.includes('show case') ||
      lower.includes('show housing')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'SHOW_LAYER',
          targetLayer: 'CASING',
          spokenExplanation: 'Restoring outer casing layer visibility.',
        },
      };
    }

    if (
      lower.includes('reset camera') ||
      lower.includes('default view') ||
      lower.includes('reset view')
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'RESET_CAMERA',
          viewPreset: 'ISOMETRIC',
          spokenExplanation: 'Resetting camera position to default isometric viewpoint.',
        },
      };
    }

    if (lower.includes('back side') || lower.includes('show back')) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'CHANGE_VIEW',
          viewPreset: 'BACK',
          spokenExplanation: 'Aligning camera to the rear perspective.',
        },
      };
    }

    if (lower.includes('top view') || lower.includes('show top')) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'CHANGE_VIEW',
          viewPreset: 'TOP',
          spokenExplanation: 'Aligning camera to top-down orthogonal angle.',
        },
      };
    }

    // 2. Parametric Component Modification on Existing Model (e.g., "Make the fan larger")
    if (
      (lower.includes('make the fan') || lower.includes('fan ta')) &&
      (lower.includes('larger') || lower.includes('bigger') || lower.includes('boro'))
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'MODIFY_COMPONENT',
          componentModification: {
            componentName: 'Turbine Fan Array',
            property: 'scale',
            value: [1.35, 1.35, 1.35],
          },
          spokenExplanation: 'Scaling up turbine fan array by 35% to maximize thermal airflow displacement.',
        },
      };
    }

    if (
      (lower.includes('make the board') || lower.includes('pcb')) &&
      (lower.includes('larger') || lower.includes('bigger') || lower.includes('boro'))
    ) {
      return {
        is3DRequest: true,
        isModification: true,
        action: {
          type: 'MODIFY_COMPONENT',
          componentModification: {
            componentName: 'PCB Substrate',
            property: 'scale',
            value: [1.25, 1.0, 1.25],
          },
          spokenExplanation: 'Expanding PCB substrate surface area by 25%.',
        },
      };
    }

    // 3. New 3D Scene Creation Requests (Multilingual & Banglish Triggers)
    const is3DKeyword =
      lower.includes('3d') ||
      lower.includes('৩ডি') ||
      lower.includes('থ্রিডি') ||
      lower.includes('hologram') ||
      lower.includes('হোলোগ্রাম') ||
      lower.includes('holographic') ||
      lower.includes('visualization') ||
      lower.includes('visualize') ||
      lower.includes('model') ||
      lower.includes('মডেল') ||
      lower.includes('schematic') ||
      lower.includes('render') ||
      lower.includes('invention') ||
      lower.includes('ইনভেনশন') ||
      lower.includes('prototype') ||
      lower.includes('প্রোটোটাইপ') ||
      lower.includes('mechanism') ||
      lower.includes('idea') ||
      lower.includes('আইডিয়া') ||
      lower.includes('concept') ||
      lower.includes('কনসেপ্ট') ||
      lower.includes('banaw') ||
      lower.includes('banao') ||
      lower.includes('banay') ||
      lower.includes('বানাও') ||
      lower.includes('বানায়') ||
      lower.includes('বানাই') ||
      lower.includes('dekhao') ||
      lower.includes('দেখা') ||
      lower.includes('দেখান') ||
      lower.includes('akao') ||
      lower.includes('design') ||
      lower.includes('ডিজাইন') ||
      lower.includes('drone') ||
      lower.includes('car') ||
      lower.includes('robot') ||
      lower.includes('device') ||
      lower.includes('gadget') ||
      lower.includes('machine') ||
      lower.includes('engine') ||
      lower.includes('helmet') ||
      lower.includes('suit') ||
      lower.includes('satellite') ||
      lower.includes('submarine') ||
      lower.includes('laser') ||
      lower.includes('weapon');

    if (!is3DKeyword) {
      return { is3DRequest: false, isModification: false };
    }

    // Detect if user is explicitly asking ONLY for a static preset demo
    const isExplicitCircuitBoardPreset =
      (lower === 'circuit board' || lower === 'show circuit board' || lower === 'pcb demo' || lower === 'circuit board preset' || lower === 'circuit board 3d') &&
      !lower.includes('idea') && !lower.includes('custom') && !lower.includes('amar') && !lower.includes('nijer');

    const isExplicitCoolingPreset =
      (lower === 'cooling system' || lower === 'show cooling' || lower === 'cooler demo' || lower === 'cooling preset' || lower === 'heat sink 3d') &&
      !lower.includes('idea') && !lower.includes('custom') && !lower.includes('amar') && !lower.includes('nijer');

    const isExplicitRoboticArmPreset =
      (lower === 'robotic arm' || lower === 'show robotic arm' || lower === 'robotic arm demo' || lower === 'robot arm preset' || lower === 'robotic arm 3d') &&
      !lower.includes('idea') && !lower.includes('custom') && !lower.includes('amar') && !lower.includes('nijer');

    const isExplicitJetEnginePreset =
      (lower === 'jet engine' || lower === 'show jet engine' || lower === 'jet engine demo' || lower === 'turbofan preset' || lower === 'jet engine 3d') &&
      !lower.includes('idea') && !lower.includes('custom') && !lower.includes('amar') && !lower.includes('nijer');

    const isExplicitQuantumCorePreset =
      (lower === 'quantum core' || lower === 'show quantum core' || lower === 'quantum reactor demo' || lower === 'quantum core preset' || lower === 'tokamak 3d') &&
      !lower.includes('idea') && !lower.includes('custom') && !lower.includes('amar') && !lower.includes('nijer');

    if (isExplicitCircuitBoardPreset) {
      return {
        is3DRequest: true,
        conceptType: 'CIRCUIT_BOARD',
        isModification: false,
        action: {
          type: 'CREATE_SCENE',
          conceptType: 'CIRCUIT_BOARD',
          spokenExplanation: 'Displaying standard multi-layer circuit board reference assembly.',
        },
      };
    }

    if (isExplicitCoolingPreset) {
      return {
        is3DRequest: true,
        conceptType: 'COOLING_SYSTEM',
        isModification: false,
        action: {
          type: 'CREATE_SCENE',
          conceptType: 'COOLING_SYSTEM',
          spokenExplanation: 'Displaying standard high-efficiency thermal cooling assembly.',
        },
      };
    }

    if (isExplicitRoboticArmPreset) {
      return {
        is3DRequest: true,
        conceptType: 'ROBOTIC_ARM',
        isModification: false,
        action: {
          type: 'CREATE_SCENE',
          conceptType: 'ROBOTIC_ARM',
          spokenExplanation: 'Displaying standard 6-axis articulated robotic manipulator.',
        },
      };
    }

    if (isExplicitJetEnginePreset) {
      return {
        is3DRequest: true,
        conceptType: 'JET_ENGINE',
        isModification: false,
        action: {
          type: 'CREATE_SCENE',
          conceptType: 'JET_ENGINE',
          spokenExplanation: 'Displaying standard multi-stage turbofan aerospace engine.',
        },
      };
    }

    if (isExplicitQuantumCorePreset) {
      return {
        is3DRequest: true,
        conceptType: 'QUANTUM_CORE',
        isModification: false,
        action: {
          type: 'CREATE_SCENE',
          conceptType: 'QUANTUM_CORE',
          spokenExplanation: 'Displaying standard quantum fusion confinement reactor core.',
        },
      };
    }

    // ALL other prompts containing user ideas, custom specs, inventions, or multilingual requests
    // are treated as dynamic bespoke 3D inventions!
    return {
      is3DRequest: true,
      conceptType: 'INVENTION_CONCEPT',
      isModification: false,
      action: {
        type: 'CREATE_SCENE',
        conceptType: 'INVENTION_CONCEPT',
        customPrompt: text,
        spokenExplanation: `Synthesizing custom 3D holographic architecture based on your invention: "${text}".`,
      },
    };
  }

  // --------------------------------------------------------------------------
  // 2. SCENE GENERATORS
  // --------------------------------------------------------------------------

  // A. CIRCUIT BOARD 3D SCENE
  public generateCircuitBoardScene(): HologramScene {
    const id = `SCENE-PCB-${Date.now().toString(36).toUpperCase()}`;

    const components: HologramComponent[] = [
      // 1. PCB Main Substrate Board
      {
        id: 'pcb-substrate',
        name: 'FR-4 PCB Substrate (4-Layer)',
        layer: 'STRUCTURAL',
        shape: 'box',
        position: [0, -0.15, 0],
        rotation: [0, 0, 0],
        scale: [7.5, 0.2, 5.0],
        explodedOffset: [0, -0.6, 0],
        color: '#064e3b', // Deep Matte PCB Green
        emissiveColor: '#042f2e',
        emissiveIntensity: 0.1,
        materialType: 'pcb_matte',
        opacity: 1.0,
        visible: true,
        description: 'Multi-layer high-Tg FR-4 substrate with internal ground plane and signal routing.',
        dimensionsApprox: '150mm × 100mm × 1.6mm',
      },

      // 2. Main Central CPU / Neural Processor
      {
        id: 'cpu-soc',
        name: 'ULTRON Neural Processing Unit (SoC)',
        layer: 'ELECTRONICS',
        shape: 'box',
        position: [-0.6, 0.15, -0.2],
        rotation: [0, 0, 0],
        scale: [1.8, 0.25, 1.8],
        explodedOffset: [0, 0.8, 0],
        color: '#1e293b', // Dark Silicon package
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.35,
        materialType: 'silicon',
        opacity: 1.0,
        visible: true,
        highlighted: true,
        description: 'Octa-core 3.5GHz tensor engine with integrated memory controller and cryptographic core.',
        dimensionsApprox: '36mm × 36mm × 2.1mm',
        electricalSpecs: '0.85V VDD | 28W TDP | 128-bit bus',
      },

      // 3. CPU Aluminum Heat Sink
      {
        id: 'cpu-heatsink',
        name: 'Extruded Aluminum Heatsink',
        layer: 'COOLING',
        shape: 'box',
        position: [-0.6, 0.65, -0.2],
        rotation: [0, 0, 0],
        scale: [1.6, 0.7, 1.6],
        explodedOffset: [0, 1.8, 0],
        color: '#0284c7', // Anodized metallic blue
        emissiveColor: '#0ea5e9',
        emissiveIntensity: 0.2,
        materialType: 'aluminum',
        opacity: 0.95,
        visible: true,
        description: 'Multi-fin anodized heat spreader designed for passive and low-noise convective dissipation.',
        dimensionsApprox: '32mm × 32mm × 14mm',
      },

      // 4. Dual High-Speed LPDDR5 RAM ICs
      {
        id: 'ram-ic-1',
        name: 'LPDDR5 RAM Module Alpha',
        layer: 'ELECTRONICS',
        shape: 'box',
        position: [1.3, 0.12, -0.8],
        rotation: [0, 0, 0],
        scale: [0.9, 0.18, 1.3],
        explodedOffset: [0.5, 0.6, 0],
        color: '#0f172a',
        emissiveColor: '#a855f7',
        emissiveIntensity: 0.25,
        materialType: 'silicon',
        opacity: 1.0,
        visible: true,
        description: '16GB 6400MT/s high-bandwidth synchronous memory package.',
        dimensionsApprox: '14mm × 10mm × 1.2mm',
      },
      {
        id: 'ram-ic-2',
        name: 'LPDDR5 RAM Module Beta',
        layer: 'ELECTRONICS',
        shape: 'box',
        position: [1.3, 0.12, 0.8],
        rotation: [0, 0, 0],
        scale: [0.9, 0.18, 1.3],
        explodedOffset: [0.5, 0.6, 0],
        color: '#0f172a',
        emissiveColor: '#a855f7',
        emissiveIntensity: 0.25,
        materialType: 'silicon',
        opacity: 1.0,
        visible: true,
        description: '16GB 6400MT/s high-bandwidth synchronous memory package.',
        dimensionsApprox: '14mm × 10mm × 1.2mm',
      },

      // 5. Solid Electrolytic Capacitors (Power Filtering)
      {
        id: 'cap-1',
        name: 'Solid Polymer Capacitor C1 (1000uF)',
        layer: 'ELECTRONICS',
        shape: 'cylinder',
        position: [-2.6, 0.45, -1.4],
        rotation: [0, 0, 0],
        scale: [0.5, 0.9, 0.5],
        explodedOffset: [-0.6, 0.7, -0.4],
        color: '#e2e8f0', // Silver metallic can
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.2,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'Low-ESR polymer smoothing capacitor on primary 12V power rail.',
        electricalSpecs: '1000uF / 16V / 105°C rating',
      },
      {
        id: 'cap-2',
        name: 'Solid Polymer Capacitor C2 (1000uF)',
        layer: 'ELECTRONICS',
        shape: 'cylinder',
        position: [-2.6, 0.45, -0.4],
        rotation: [0, 0, 0],
        scale: [0.5, 0.9, 0.5],
        explodedOffset: [-0.6, 0.7, -0.2],
        color: '#e2e8f0',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.2,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'Low-ESR power filtering capacitor.',
        electricalSpecs: '1000uF / 16V / 105°C rating',
      },
      {
        id: 'cap-3',
        name: 'Solid Polymer Capacitor C3 (470uF)',
        layer: 'ELECTRONICS',
        shape: 'cylinder',
        position: [-2.6, 0.45, 0.6],
        rotation: [0, 0, 0],
        scale: [0.5, 0.9, 0.5],
        explodedOffset: [-0.6, 0.7, 0.2],
        color: '#e2e8f0',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.2,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'VCC_CORE smoothing filter.',
      },

      // 6. USB-C 4.0 Interface Connector
      {
        id: 'usb-c-port',
        name: 'USB-C 40Gbps Power & Data Port',
        layer: 'MECHANICAL',
        shape: 'box',
        position: [-3.5, 0.22, 1.4],
        rotation: [0, 0, 0],
        scale: [1.1, 0.45, 0.8],
        explodedOffset: [-1.2, 0.3, 0.4],
        color: '#94a3b8',
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: '24-pin mid-mount USB-C receptacle with 100W Power Delivery support.',
      },

      // 7. GPIO / JTAG Pin Header Matrix
      {
        id: 'gpio-headers',
        name: '40-Pin Expansion GPIO Header',
        layer: 'ELECTRONICS',
        shape: 'box',
        position: [0.2, 0.4, 2.1],
        rotation: [0, 0, 0],
        scale: [4.2, 0.6, 0.4],
        explodedOffset: [0, 1.0, 0.8],
        color: '#18181b',
        emissiveColor: '#fbbf24',
        emissiveIntensity: 0.3,
        materialType: 'plastic',
        opacity: 1.0,
        visible: true,
        description: '2.54mm pitch dual-row male pin headers for telemetry and peripheral buses.',
      },

      // 8. Glowing Status LEDs (Power, Link, Telemetry)
      {
        id: 'status-led-green',
        name: 'Status LED 1 (PWR_GOOD)',
        layer: 'ELECTRONICS',
        shape: 'sphere',
        position: [3.1, 0.12, -2.0],
        rotation: [0, 0, 0],
        scale: [0.18, 0.18, 0.18],
        explodedOffset: [0.6, 0.4, -0.6],
        color: '#22c55e',
        emissiveColor: '#22c55e',
        emissiveIntensity: 1.0,
        materialType: 'glowing_core',
        opacity: 1.0,
        visible: true,
        description: 'SMD 0805 High-efficiency green indicator LED.',
      },
      {
        id: 'status-led-cyan',
        name: 'Status LED 2 (ULTRON_LINK)',
        layer: 'ELECTRONICS',
        shape: 'sphere',
        position: [3.1, 0.12, -1.6],
        rotation: [0, 0, 0],
        scale: [0.18, 0.18, 0.18],
        explodedOffset: [0.6, 0.4, -0.5],
        color: '#06b6d4',
        emissiveColor: '#06b6d4',
        emissiveIntensity: 1.0,
        materialType: 'glowing_core',
        opacity: 1.0,
        visible: true,
        description: 'SMD 0805 Neural telemetry link indicator.',
      },

      // 9. SMD Resistor Array
      {
        id: 'resistor-array',
        name: 'SMD 0402 Precision Resistor Bank',
        layer: 'ELECTRONICS',
        shape: 'box',
        position: [-0.6, 0.08, 1.1],
        rotation: [0, 0, 0],
        scale: [1.4, 0.08, 0.4],
        explodedOffset: [0, 0.4, 0.3],
        color: '#475569',
        emissiveColor: '#f59e0b',
        emissiveIntensity: 0.2,
        materialType: 'pcb_matte',
        opacity: 1.0,
        visible: true,
        description: 'Pull-up and impedance termination resistor networks.',
      },

      // 10. Protective Faraday Enclosure Shield
      {
        id: 'rf-shield',
        name: 'RF / EMI Shielding Enclosure',
        layer: 'CASING',
        shape: 'box',
        position: [2.5, 0.25, 0],
        rotation: [0, 0, 0],
        scale: [1.6, 0.4, 3.2],
        explodedOffset: [1.2, 0.8, 0],
        color: '#64748b',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.15,
        materialType: 'metal',
        opacity: 0.85,
        visible: true,
        description: 'Perforated nickel-silver EMI shield covering wireless transceivers.',
      },
    ];

    // Copper Traces on PCB
    const connections: HologramConnection[] = [
      {
        id: 'trace-cpu-ram1',
        fromComponentId: 'cpu-soc',
        toComponentId: 'ram-ic-1',
        type: 'DATA_BUS',
        points: [
          [-0.6, 0.05, -0.2],
          [0.4, 0.05, -0.5],
          [1.3, 0.05, -0.8],
        ],
        color: '#eab308',
        glowing: true,
      },
      {
        id: 'trace-cpu-ram2',
        fromComponentId: 'cpu-soc',
        toComponentId: 'ram-ic-2',
        type: 'DATA_BUS',
        points: [
          [-0.6, 0.05, -0.2],
          [0.4, 0.05, 0.3],
          [1.3, 0.05, 0.8],
        ],
        color: '#eab308',
        glowing: true,
      },
      {
        id: 'trace-power-bus',
        fromComponentId: 'usb-c-port',
        toComponentId: 'cap-1',
        type: 'POWER_BUS',
        points: [
          [-3.5, 0.05, 1.4],
          [-3.2, 0.05, -1.4],
          [-2.6, 0.05, -1.4],
        ],
        color: '#ef4444',
        glowing: true,
      },
    ];

    return {
      id,
      title: '3D High-Density Circuit Board (PCB)',
      conceptType: 'CIRCUIT_BOARD',
      description: 'Conceptual 4-layer FR-4 circuit board featuring ULTRON Neural SoC, high-speed LPDDR5 memory, power filtering arrays, USB-C 4.0 interface, and EMI shielding.',
      dimensions: {
        x: 150,
        y: 25,
        z: 100,
        unit: 'mm',
        isApproximate: true,
      },
      components,
      connections,
      cameraState: {
        position: [7, 6, 7],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: true,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'cpu-soc',
      highlightedComponentIds: ['cpu-soc', 'cpu-heatsink'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Initialized 3D Circuit Board with 10 modular components and copper telemetry routing.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // B. INVENTION CONCEPT: HIGH-EFFICIENCY COOLING SYSTEM
  public generateCoolingSystemScene(): HologramScene {
    const id = `SCENE-COOL-${Date.now().toString(36).toUpperCase()}`;

    const components: HologramComponent[] = [
      // 1. Cold Plate Copper Base Contact
      {
        id: 'cold-plate',
        name: 'Micro-Channel Copper Cold Plate',
        layer: 'STRUCTURAL',
        shape: 'box',
        position: [0, -1.4, 0],
        rotation: [0, 0, 0],
        scale: [4.0, 0.4, 4.0],
        explodedOffset: [0, -1.2, 0],
        color: '#b45309', // Pure Copper
        emissiveColor: '#d97706',
        emissiveIntensity: 0.25,
        materialType: 'copper',
        opacity: 1.0,
        visible: true,
        description: 'CNC-machined oxygen-free copper baseplate with 0.15mm internal micro-fins for direct thermal conduction.',
        dimensionsApprox: '80mm × 80mm × 8mm',
      },

      // 2. Dual Sintered Copper Heat Pipes
      {
        id: 'heat-pipes',
        name: 'Dual 8mm Sintered Wick Heat Pipes',
        layer: 'COOLING',
        shape: 'torus',
        position: [0, -0.4, 0],
        rotation: [Math.PI / 2, 0, 0],
        scale: [1.8, 1.8, 0.3],
        explodedOffset: [0, -0.5, 0],
        color: '#d97706',
        emissiveColor: '#f59e0b',
        emissiveIntensity: 0.4,
        materialType: 'copper',
        opacity: 1.0,
        visible: true,
        description: 'Vacuum-sealed copper phase-change tubes carrying specialized deionized working fluid.',
      },

      // 3. Stacked Aluminum Radiator Fin Matrix
      {
        id: 'heatsink-fins',
        name: 'Stacked Aluminum Radiator Fins (64-Plate)',
        layer: 'COOLING',
        shape: 'box',
        position: [0, 0.2, 0],
        rotation: [0, 0, 0],
        scale: [3.6, 1.8, 3.6],
        explodedOffset: [0, 0.4, 0],
        color: '#0284c7', // Anodized sky blue
        emissiveColor: '#0ea5e9',
        emissiveIntensity: 0.3,
        materialType: 'aluminum',
        opacity: 0.9,
        visible: true,
        highlighted: true,
        description: 'Aerodynamically optimized high-surface-area aluminum fin array with anti-turbulence wave profiling.',
        dimensionsApprox: '72mm × 72mm × 36mm',
      },

      // 4. Active Turbine Impeller Fan (Animated)
      {
        id: 'turbine-fan',
        name: 'High-Static Pressure Turbine Fan Array',
        layer: 'MECHANICAL',
        shape: 'cylinder',
        position: [0, 1.6, 0],
        rotation: [0, 0, 0],
        scale: [3.4, 0.6, 3.4],
        explodedOffset: [0, 1.4, 0],
        color: '#06b6d4',
        emissiveColor: '#22d3ee',
        emissiveIntensity: 0.5,
        materialType: 'plastic',
        opacity: 0.95,
        visible: true,
        highlighted: true,
        description: '9-blade fluid dynamic bearing (FDB) impeller pushing 85 CFM at whisper-quiet 22 dBA.',
      },

      // 5. Outer Polycarbonate Casing / Flow Shroud
      {
        id: 'shroud-casing',
        name: 'Aerodynamic Polycarbonate Airflow Shroud',
        layer: 'CASING',
        shape: 'box',
        position: [0, 0.4, 0],
        rotation: [0, 0, 0],
        scale: [4.4, 3.4, 4.4],
        explodedOffset: [0, 2.2, 0],
        color: '#0891b2',
        emissiveColor: '#06b6d4',
        emissiveIntensity: 0.2,
        materialType: 'hologram_glass',
        opacity: 0.35,
        transparent: true,
        visible: true,
        description: 'Clear acrylic/glass outer air duct guiding laminar intake and exhaust streams.',
      },

      // 6. Digital OLED Thermal Telemetry HUD
      {
        id: 'oled-hud',
        name: 'Real-Time Thermal Telemetry Display',
        layer: 'ELECTRONICS',
        shape: 'box',
        position: [0, 0.6, 2.25],
        rotation: [0, 0, 0],
        scale: [2.0, 0.8, 0.15],
        explodedOffset: [0, 0.6, 1.2],
        color: '#0f172a',
        emissiveColor: '#22c55e',
        emissiveIntensity: 0.8,
        materialType: 'glowing_core',
        opacity: 1.0,
        visible: true,
        description: 'Micro-OLED status screen reporting liquid temp (34.2°C), fan RPM (1850), and thermal dissipation (250W).',
      },
    ];

    return {
      id,
      title: '3D Invention: Active Phase-Change Thermal System',
      conceptType: 'COOLING_SYSTEM',
      description: 'Innovative dual-chamber active cooling assembly combining micro-channel copper cold plates, sintered phase-change heat pipes, stacked radiator fins, and high-pressure turbine induction.',
      dimensions: {
        x: 90,
        y: 110,
        z: 90,
        unit: 'mm',
        isApproximate: true,
      },
      components,
      cameraState: {
        position: [6, 5, 8],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: true,
      xRayCutaway: false,
      rotationSpeed: 0.5,
      autoRotate: true,
      selectedComponentId: 'turbine-fan',
      highlightedComponentIds: ['turbine-fan', 'heatsink-fins'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Initialized Active Thermal Cooling System prototype model with animated turbine and phase-change piping.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // C. ARTICULATED ROBOTIC ARM 3D SCENE
  public generateRoboticArmScene(): HologramScene {
    const id = `SCENE-ROBOT-${Date.now().toString(36).toUpperCase()}`;

    const components: HologramComponent[] = [
      // 1. Heavy Base Turntable
      {
        id: 'base-turntable',
        name: 'Turntable Pedestal Base (Axis 1)',
        layer: 'STRUCTURAL',
        shape: 'cylinder',
        position: [0, -1.8, 0],
        rotation: [0, 0, 0],
        scale: [3.2, 0.6, 3.2],
        explodedOffset: [0, -1.0, 0],
        color: '#1e293b',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.2,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'Cast alloy rotary base with continuous 360° brushless servo drive.',
      },

      // 2. Shoulder Actuator Joint
      {
        id: 'shoulder-joint',
        name: 'Harmonic Shoulder Actuator (Axis 2)',
        layer: 'MECHANICAL',
        shape: 'sphere',
        position: [0, -1.0, 0],
        rotation: [0, 0, 0],
        scale: [1.6, 1.6, 1.6],
        explodedOffset: [0, -0.4, 0],
        color: '#0284c7',
        emissiveColor: '#0ea5e9',
        emissiveIntensity: 0.35,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'High-torque zero-backlash harmonic gear actuator.',
      },

      // 3. Lower Bicep Arm Segment
      {
        id: 'bicep-segment',
        name: 'Carbon-Fiber Bicep Arm Link',
        layer: 'STRUCTURAL',
        shape: 'cylinder',
        position: [0.6, 0.1, 0],
        rotation: [0, 0, -Math.PI / 6],
        scale: [0.8, 2.2, 0.8],
        explodedOffset: [0.6, 0.3, 0],
        color: '#334155',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.15,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'Rigid braided carbon fiber structural sleeve with internal wiring conduits.',
      },

      // 4. Elbow Joint
      {
        id: 'elbow-joint',
        name: 'Elbow Pivot Actuator (Axis 3)',
        layer: 'MECHANICAL',
        shape: 'sphere',
        position: [1.2, 1.2, 0],
        rotation: [0, 0, 0],
        scale: [1.3, 1.3, 1.3],
        explodedOffset: [1.0, 0.8, 0],
        color: '#0284c7',
        emissiveColor: '#0ea5e9',
        emissiveIntensity: 0.4,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        highlighted: true,
        description: 'Precision harmonic reducer joint with 210° angular pitch sweep.',
      },

      // 5. Forearm Link & Laser Reticle
      {
        id: 'forearm-segment',
        name: 'Forearm Linkage (Axis 4 & 5)',
        layer: 'STRUCTURAL',
        shape: 'cylinder',
        position: [0.4, 2.0, 0],
        rotation: [0, 0, Math.PI / 4],
        scale: [0.65, 1.8, 0.65],
        explodedOffset: [0.4, 1.4, 0],
        color: '#334155',
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'Integrated pneumatic conduit and optical rangefinder tracker.',
      },

      // 6. Dual-Finger Precision Claw Gripper
      {
        id: 'claw-gripper',
        name: 'Adaptive Dual-Finger End Effector (Axis 6)',
        layer: 'MECHANICAL',
        shape: 'box',
        position: [-0.4, 2.7, 0],
        rotation: [0, 0, 0],
        scale: [1.2, 0.8, 1.0],
        explodedOffset: [-0.6, 2.0, 0],
        color: '#06b6d4',
        emissiveColor: '#22d3ee',
        emissiveIntensity: 0.6,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        highlighted: true,
        description: 'Force-feedback tactile gripper with silicon tip pads and laser alignment reticle.',
      },
    ];

    return {
      id,
      title: '3D Articulated Robotic Manipulator (6-DoF)',
      conceptType: 'ROBOTIC_ARM',
      description: 'Precision 6-Degree-of-Freedom robotic manipulator featuring harmonic servo drives, braided carbon-fiber links, and an adaptive tactile gripper.',
      dimensions: {
        x: 450,
        y: 850,
        z: 450,
        unit: 'mm',
        isApproximate: true,
      },
      components,
      cameraState: {
        position: [7, 6, 8],
        target: [0, 0.5, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: true,
      xRayCutaway: false,
      rotationSpeed: 0.35,
      autoRotate: true,
      selectedComponentId: 'claw-gripper',
      highlightedComponentIds: ['claw-gripper', 'elbow-joint'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Generated 6-DoF articulated robotic manipulator model with harmonic joints.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // D. JET TURBINE ENGINE 3D SCENE
  public generateJetEngineScene(): HologramScene {
    const id = `SCENE-JET-${Date.now().toString(36).toUpperCase()}`;

    const components: HologramComponent[] = [
      // 1. Titanium Intake Spinner & Stage 1 Fan Blades
      {
        id: 'intake-fan',
        name: 'Stage 1 Titanium Intake Turbofan',
        layer: 'MECHANICAL',
        shape: 'cylinder',
        position: [-2.2, 0, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [3.4, 0.6, 3.4],
        explodedOffset: [-1.6, 0, 0],
        color: '#0284c7',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.4,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        highlighted: true,
        description: '24 swept titanium-alloy hollow core blades generating 75% of primary subsonic bypass thrust.',
      },

      // 2. High-Pressure Compressor Stages
      {
        id: 'compressor-core',
        name: '10-Stage High-Pressure Axial Compressor',
        layer: 'MECHANICAL',
        shape: 'cylinder',
        position: [-0.6, 0, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [2.4, 1.8, 2.4],
        explodedOffset: [-0.5, 0, 0],
        color: '#475569',
        emissiveColor: '#94a3b8',
        emissiveIntensity: 0.2,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'Variable stator guide vanes compressing air to 42:1 overall pressure ratio.',
      },

      // 3. Annular Plasma Combustor Chamber
      {
        id: 'combustor',
        name: 'Annular High-Temperature Combustor',
        layer: 'CORE',
        shape: 'torus',
        position: [0.8, 0, 0],
        rotation: [0, Math.PI / 2, 0],
        scale: [1.6, 1.6, 0.8],
        explodedOffset: [0.4, 0, 0],
        color: '#ef4444',
        emissiveColor: '#f97316',
        emissiveIntensity: 0.9,
        materialType: 'glowing_core',
        opacity: 0.9,
        visible: true,
        highlighted: true,
        description: 'Ceramic-matrix lined combustion ring operating at 1,750°C with 18 lean-burn fuel injectors.',
      },

      // 4. High-Pressure Turbine Stage
      {
        id: 'turbine-stage',
        name: 'Single-Crystal High-Pressure Turbine',
        layer: 'MECHANICAL',
        shape: 'cylinder',
        position: [1.6, 0, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [2.0, 0.6, 2.0],
        explodedOffset: [1.0, 0, 0],
        color: '#b45309',
        emissiveColor: '#f59e0b',
        emissiveIntensity: 0.4,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: 'Internally cooled monocrystalline nickel superalloy turbine extracting shaft power.',
      },

      // 5. Convergent-Divergent Exhaust Nozzle
      {
        id: 'exhaust-nozzle',
        name: 'Variable Geometry Exhaust Nozzle',
        layer: 'CASING',
        shape: 'cone',
        position: [2.8, 0, 0],
        rotation: [0, 0, -Math.PI / 2],
        scale: [2.2, 1.4, 2.2],
        explodedOffset: [1.8, 0, 0],
        color: '#1e293b',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.3,
        materialType: 'metal',
        opacity: 0.85,
        visible: true,
        description: 'Hydraulically actuated thrust vectoring exhaust nozzle.',
      },

      // 6. Transparent Nacelle Outer Shroud
      {
        id: 'nacelle-casing',
        name: 'Acoustically Treated Nacelle Cowling',
        layer: 'CASING',
        shape: 'cylinder',
        position: [0, 0, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [4.0, 5.8, 4.0],
        explodedOffset: [0, 2.2, 0],
        color: '#06b6d4',
        emissiveColor: '#0ea5e9',
        emissiveIntensity: 0.15,
        materialType: 'hologram_glass',
        opacity: 0.25,
        transparent: true,
        visible: true,
        description: 'Composite engine cowling with acoustic sound attenuation honeycomb matrix.',
      },
    ];

    return {
      id,
      title: '3D High-Bypass Turbofan Jet Engine',
      conceptType: 'JET_ENGINE',
      description: 'Advanced aerospace turbofan assembly with Stage 1 titanium fan, 10-stage compressor, annular combustion core, and thrust-vectoring exhaust nozzle.',
      dimensions: {
        x: 1800,
        y: 1800,
        z: 3200,
        unit: 'mm',
        isApproximate: true,
      },
      components,
      cameraState: {
        position: [7, 4, 7],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: true,
      xRayCutaway: false,
      rotationSpeed: 0.45,
      autoRotate: true,
      selectedComponentId: 'intake-fan',
      highlightedComponentIds: ['intake-fan', 'combustor'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized high-bypass turbofan jet engine 3D assembly.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // E. QUANTUM FUSION REACTOR 3D SCENE
  public generateQuantumReactorScene(): HologramScene {
    const id = `SCENE-QUANTUM-${Date.now().toString(36).toUpperCase()}`;

    const components: HologramComponent[] = [
      // 1. Central Plasma Fusion Core
      {
        id: 'plasma-core',
        name: 'Quantum Plasma Vortex Core',
        layer: 'CORE',
        shape: 'sphere',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1.8, 1.8, 1.8],
        explodedOffset: [0, 0, 0],
        color: '#38bdf8',
        emissiveColor: '#a855f7',
        emissiveIntensity: 1.0,
        materialType: 'glowing_core',
        opacity: 0.85,
        visible: true,
        highlighted: true,
        description: 'Superheated Deuterium-Tritium plasma vortex sustained at 150 Million Kelvin.',
      },

      // 2. Magnetic Confinement Toroidal Coils
      {
        id: 'toroidal-magnets',
        name: 'Superconducting Toroidal Magnetic Field (18-Tesla)',
        layer: 'MECHANICAL',
        shape: 'torus',
        position: [0, 0, 0],
        rotation: [Math.PI / 2, 0, 0],
        scale: [3.4, 3.4, 0.6],
        explodedOffset: [0, 1.2, 0],
        color: '#0284c7',
        emissiveColor: '#0ea5e9',
        emissiveIntensity: 0.6,
        materialType: 'metal',
        opacity: 0.9,
        visible: true,
        description: 'High-temperature superconductor (HTS) magnetic confinement coils forming helical magnetic geometry.',
      },

      // 3. Cryogenic Structural Support Pillars
      {
        id: 'cryo-pillars',
        name: 'Liquid Helium Cryo-Stabilizer Struts',
        layer: 'STRUCTURAL',
        shape: 'cylinder',
        position: [0, -1.6, 0],
        rotation: [0, 0, 0],
        scale: [4.0, 0.4, 4.0],
        explodedOffset: [0, -1.2, 0],
        color: '#0f172a',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.25,
        materialType: 'metal',
        opacity: 1.0,
        visible: true,
        description: '4 Kelvin cryostat base maintaining superconductivity under extreme magnetic load.',
      },

      // 4. Outer Holographic Energy Containment Shell
      {
        id: 'containment-shell',
        name: 'Force-Field Electromagnetic Vacuum Vessel',
        layer: 'CASING',
        shape: 'sphere',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [4.6, 4.6, 4.6],
        explodedOffset: [0, 2.0, 0],
        color: '#06b6d4',
        emissiveColor: '#818cf8',
        emissiveIntensity: 0.3,
        materialType: 'hologram_glass',
        opacity: 0.25,
        transparent: true,
        visible: true,
        description: 'Ultra-high vacuum double-walled containment shield with beryllium armor tiles.',
      },
    ];

    return {
      id,
      title: '3D Quantum Fusion Magnetic Confinement Core',
      conceptType: 'QUANTUM_CORE',
      description: 'Futuristic magnetic confinement fusion core featuring an 18-Tesla HTS toroidal coil array, cryo-stabilizers, and a glowing plasma vortex.',
      dimensions: {
        x: 4500,
        y: 4500,
        z: 4500,
        unit: 'mm',
        isApproximate: true,
      },
      components,
      cameraState: {
        position: [7, 5, 8],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: true,
      xRayCutaway: false,
      rotationSpeed: 0.55,
      autoRotate: true,
      selectedComponentId: 'plasma-core',
      highlightedComponentIds: ['plasma-core', 'toroidal-magnets'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Initialized Quantum Fusion Reactor with magnetic confinement and plasma core.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // F. PROCEDURAL CUSTOM INVENTION 3D SCENE GENERATOR
  public generateProceduralInventionScene(prompt: string): HologramScene {
    const id = `SCENE-CUSTOM-${Date.now().toString(36).toUpperCase()}`;
    const cleanPrompt = prompt.trim();
    const lower = cleanPrompt.toLowerCase();

    // Extract title from prompt
    let title = 'Custom Invention Prototype';
    const words = cleanPrompt.replace(/^(?:show|create|generate|visualize|make|amar|ekta|new|invention|3d|model|er|dekhaw|banaw|build|banao)\s+/gi, '').trim();
    if (words.length > 3) {
      title = words.charAt(0).toUpperCase() + words.slice(1, 45);
    }

    let components: HologramComponent[] = [];
    let conceptType: HologramConceptType = 'INVENTION_CONCEPT';
    let dimensions = { x: 1200, y: 800, z: 1200, unit: 'mm', isApproximate: true };
    let cameraPos: [number, number, number] = [8, 6, 8];

    // Case 0: Architectural Building / Blueprint / Floor Plan / Multi-Room Estimates / House / Villa / Duplex / Apartment
    if (
      lower.includes('building') ||
      lower.includes('blueprint') ||
      lower.includes('floorplan') ||
      lower.includes('floor plan') ||
      lower.includes('map') ||
      lower.includes('room') ||
      lower.includes('apartment') ||
      lower.includes('house') ||
      lower.includes('villa') ||
      lower.includes('duplex') ||
      lower.includes('flat') ||
      lower.includes('ghor') ||
      lower.includes('bari') ||
      lower.includes('office') ||
      lower.includes('estimate') ||
      lower.includes('architect') ||
      lower.includes('bedroom') ||
      lower.includes('sqft') ||
      lower.includes('floor')
    ) {
      conceptType = 'ARCHITECTURAL_MODEL';
      title = title || 'Architectural Multi-Room 3D Blueprint';
      dimensions = { x: 14500, y: 6800, z: 12000, unit: 'mm', isApproximate: false };
      cameraPos = [10, 8, 10];

      components = [
        // 1. Foundation & Sub-grade Pile Slab
        {
          id: 'arch-foundation',
          name: 'Reinforced Concrete Foundation & Pile Cap Slab',
          layer: 'STRUCTURAL',
          shape: 'slab',
          position: [0, -0.6, 0],
          rotation: [0, 0, 0],
          scale: [8.8, 0.4, 7.2],
          explodedOffset: [0, -1.8, 0],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.2,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          roomType: 'FOUNDATION',
          floorLevel: 0,
          areaSqFt: 1800,
          description: 'C35/45 high-strength structural cast-in-place concrete foundation with dual rebar matting.',
          dimensionsApprox: '14.5m × 0.4m × 12.0m',
        },
        // 2. Living & Entertainment Main Lounge
        {
          id: 'arch-living-room',
          name: 'Living Room & Open Media Lounge',
          layer: 'CORE',
          shape: 'box',
          position: [-1.6, 0.5, 1.2],
          rotation: [0, 0, 0],
          scale: [3.8, 1.8, 3.0],
          explodedOffset: [-1.4, 0.4, 1.4],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.65,
          materialType: 'hologram_glass',
          opacity: 0.75,
          visible: true,
          highlighted: true,
          roomType: 'LIVING_ROOM',
          floorLevel: 1,
          areaSqFt: 380,
          description: 'Spacious central family entertainment hub with acoustic dampening and floor-to-ceiling panoramic glass facade.',
          dimensionsApprox: '6.0m × 3.0m × 4.8m (380 sq ft)',
        },
        // 3. Master Bedroom Suite
        {
          id: 'arch-master-bed',
          name: 'Master Suite Bedroom with Walk-in Closet',
          layer: 'CORE',
          shape: 'box',
          position: [2.2, 0.5, -1.4],
          rotation: [0, 0, 0],
          scale: [3.4, 1.8, 2.8],
          explodedOffset: [1.8, 0.4, -1.4],
          color: '#a855f7',
          emissiveColor: '#c084fc',
          emissiveIntensity: 0.65,
          materialType: 'hologram_glass',
          opacity: 0.75,
          visible: true,
          roomType: 'BEDROOM',
          floorLevel: 1,
          areaSqFt: 290,
          description: 'King-size master quarters with ambient recessed lighting, hardwood flooring, and climate zone automation.',
          dimensionsApprox: '5.2m × 3.0m × 4.2m (290 sq ft)',
        },
        // 4. Guest Bedroom / Executive Study Office
        {
          id: 'arch-guest-bed',
          name: 'Guest Bedroom / Smart Workstation Study',
          layer: 'CORE',
          shape: 'box',
          position: [-2.0, 0.5, -1.4],
          rotation: [0, 0, 0],
          scale: [3.0, 1.8, 2.6],
          explodedOffset: [-1.8, 0.4, -1.4],
          color: '#06b6d4',
          emissiveColor: '#22d3ee',
          emissiveIntensity: 0.6,
          materialType: 'hologram_glass',
          opacity: 0.75,
          visible: true,
          roomType: 'BEDROOM',
          floorLevel: 1,
          areaSqFt: 210,
          description: 'Multi-purpose executive study & secondary bedroom with integrated optical fiber data bus.',
          dimensionsApprox: '4.5m × 3.0m × 3.8m (210 sq ft)',
        },
        // 5. Open-Concept Kitchen & Island Dining
        {
          id: 'arch-kitchen-dining',
          name: 'Modern Culinary Kitchen & Dining Island',
          layer: 'CORE',
          shape: 'box',
          position: [2.0, 0.5, 1.2],
          rotation: [0, 0, 0],
          scale: [3.2, 1.8, 2.8],
          explodedOffset: [1.6, 0.4, 1.4],
          color: '#f59e0b',
          emissiveColor: '#fbbf24',
          emissiveIntensity: 0.6,
          materialType: 'hologram_glass',
          opacity: 0.75,
          visible: true,
          roomType: 'KITCHEN',
          floorLevel: 1,
          areaSqFt: 240,
          description: 'Gourmet kitchen counter with induction cooktop, marble breakfast bar, and dedicated smoke ventilation.',
          dimensionsApprox: '4.8m × 3.0m × 4.2m (240 sq ft)',
        },
        // 6. Master En-Suite Bathroom & Spa
        {
          id: 'arch-master-bath',
          name: 'Master En-Suite Spa Bathroom',
          layer: 'CORE',
          shape: 'box',
          position: [3.5, 0.5, -2.4],
          rotation: [0, 0, 0],
          scale: [1.6, 1.6, 1.4],
          explodedOffset: [2.6, 0.4, -2.2],
          color: '#14b8a6',
          emissiveColor: '#2dd4bf',
          emissiveIntensity: 0.6,
          materialType: 'hologram_glass',
          opacity: 0.8,
          visible: true,
          roomType: 'BATHROOM',
          floorLevel: 1,
          areaSqFt: 85,
          description: 'Porcelain tile wet area with rain shower, dual vanity, and underfloor thermal radiant heating.',
          dimensionsApprox: '2.8m × 2.6m × 2.4m (85 sq ft)',
        },
        // 7. Sunlit Veranda Balcony
        {
          id: 'arch-balcony',
          name: 'Sunlit Panoramic Balcony & Green Veranda',
          layer: 'STRUCTURAL',
          shape: 'slab',
          position: [-1.6, 0.1, 3.2],
          rotation: [0, 0, 0],
          scale: [3.8, 0.15, 1.4],
          explodedOffset: [-1.4, 0.1, 2.4],
          color: '#10b981',
          emissiveColor: '#34d399',
          emissiveIntensity: 0.5,
          materialType: 'aluminum',
          opacity: 0.9,
          visible: true,
          roomType: 'BALCONY',
          floorLevel: 1,
          areaSqFt: 120,
          description: 'Cantilevered outdoor terrace with frameless laminated glass balustrade.',
          dimensionsApprox: '6.0m × 0.2m × 2.2m (120 sq ft)',
        },
        // 8. Reinforced Concrete Structural Columns (Pillars)
        {
          id: 'arch-columns',
          name: 'Seismic Structural Column Matrix (6x Pillars)',
          layer: 'STRUCTURAL',
          shape: 'pillar',
          position: [0, 0.6, 0],
          rotation: [0, 0, 0],
          scale: [0.45, 2.2, 0.45],
          explodedOffset: [0, 0.2, 0],
          color: '#475569',
          emissiveColor: '#94a3b8',
          emissiveIntensity: 0.4,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          roomType: 'PILLAR',
          floorLevel: 1,
          description: 'Earthquake-resistant Grade-60 rebar reinforced concrete load-bearing structural columns.',
        },
        // 9. Perimeter Insulated Concrete Walls
        {
          id: 'arch-perimeter-walls',
          name: 'Perimeter Autoclaved Aerated Concrete Thermal Walls',
          layer: 'CASING',
          shape: 'wall',
          position: [0, 0.6, -3.2],
          rotation: [0, 0, 0],
          scale: [8.4, 1.8, 0.3],
          explodedOffset: [0, 0.4, -2.0],
          color: '#334155',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.25,
          materialType: 'metal',
          opacity: 0.85,
          visible: true,
          roomType: 'WALL',
          floorLevel: 1,
          description: 'Exterior thermal envelope with R-25 polyurethane insulated cavity shielding against exterior heat.',
        },
        // 10. Curtain Wall Low-E Double-Glazed Windows
        {
          id: 'arch-glazing',
          name: 'Curtain Wall Low-E Double-Glazed Glass Facade',
          layer: 'CASING',
          shape: 'window',
          position: [-1.6, 0.6, 2.8],
          rotation: [0, 0, 0],
          scale: [3.8, 1.6, 0.1],
          explodedOffset: [-1.4, 0.5, 2.6],
          color: '#38bdf8',
          emissiveColor: '#7dd3fc',
          emissiveIntensity: 0.75,
          materialType: 'hologram_glass',
          opacity: 0.35,
          transparent: true,
          visible: true,
          roomType: 'WINDOW',
          floorLevel: 1,
          description: 'Solar-control tinted double glazing with argon gas insulation cavity.',
        },
        // 11. Central HVAC Duct & Fresh Air Distribution Rail
        {
          id: 'arch-hvac',
          name: 'VRF Multi-Split HVAC & Ventilation Conduits',
          layer: 'COOLING',
          shape: 'pipe',
          position: [0, 1.6, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.3, 7.6, 0.3],
          explodedOffset: [0, 1.8, 0],
          color: '#06b6d4',
          emissiveColor: '#22d3ee',
          emissiveIntensity: 0.6,
          materialType: 'aluminum',
          opacity: 0.95,
          visible: true,
          description: 'Variable Refrigerant Flow (VRF) dual-zone climate system with HEPA filtration.',
        },
        // 12. Smart Home Electrical Grid & Automation Bus
        {
          id: 'arch-electrical',
          name: 'Smart Home Automation & 240V Copper Bus Rail',
          layer: 'TRACES',
          shape: 'trace_line',
          position: [0, -0.3, 0],
          rotation: [0, 0, 0],
          scale: [7.8, 0.1, 6.2],
          explodedOffset: [0, -0.6, 0],
          color: '#eab308',
          emissiveColor: '#facc15',
          emissiveIntensity: 0.7,
          materialType: 'copper',
          opacity: 0.9,
          visible: true,
          description: 'Central distribution panel, IoT sensor mesh, smart breakers, and Cat-6A Ethernet backbone.',
        },
        // 13. Upper Structural Roof Slab & Solar PV Canopy
        {
          id: 'arch-roof-solar',
          name: 'Structural Roof Slab with 12kW Solar Photovoltaic Grid',
          layer: 'CASING',
          shape: 'roof',
          position: [0, 1.8, 0],
          rotation: [0, 0, 0],
          scale: [8.8, 0.35, 7.2],
          explodedOffset: [0, 2.2, 0],
          color: '#0f172a',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.4,
          materialType: 'silicon',
          opacity: 0.85,
          visible: true,
          roomType: 'ROOF',
          floorLevel: 2,
          areaSqFt: 1800,
          description: 'Monocrystalline bifacial solar array generating 18.5 kWh daily clean power with rainwater harvesting reservoir.',
          dimensionsApprox: '14.5m × 0.35m × 12.0m',
        },
      ];
    }
    // Case 1: Drone / Quadcopter / Flight / Flying Machine
    else if (
      lower.includes('drone') ||
      lower.includes('quadcopter') ||
      lower.includes('flying') ||
      lower.includes('uav') ||
      lower.includes('aircraft') ||
      lower.includes('rotor') ||
      lower.includes('copter')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Autonomous Quad-Rotor Flight Drone';
      dimensions = { x: 850, y: 320, z: 850, unit: 'mm', isApproximate: true };
      cameraPos = [7, 5, 7];

      components = [
        // Central Body Fuselage
        {
          id: 'drone-chassis',
          name: 'Carbon-Fiber Aerodynamic Core Fuselage',
          layer: 'STRUCTURAL',
          shape: 'box',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [2.2, 0.6, 2.2],
          explodedOffset: [0, 0, 0],
          color: '#0f172a',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.3,
          materialType: 'plastic',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: 'Ultra-lightweight vacuum-molded carbon-fiber composite central fuselage housing main flight avionics.',
          dimensionsApprox: '220mm × 60mm × 220mm',
        },
        // Flight Controller Core
        {
          id: 'drone-avionics',
          name: 'Autonomous Flight Avionics & Neural SoC',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [0, 0.4, 0],
          rotation: [0, 0, 0],
          scale: [1.1, 0.15, 1.1],
          explodedOffset: [0, 0.8, 0],
          color: '#065f46',
          emissiveColor: '#10b981',
          emissiveIntensity: 0.45,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
          description: 'Dual IMU 6-axis gyro flight navigation processor with RTK GPS receiver and optical flow telemetry.',
        },
        // Lithium Battery Pack
        {
          id: 'drone-battery',
          name: '6S 8500mAh Solid-State Battery Module',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [0, -0.4, 0],
          rotation: [0, 0, 0],
          scale: [1.6, 0.45, 1.2],
          explodedOffset: [0, -0.9, 0],
          color: '#1e293b',
          emissiveColor: '#f59e0b',
          emissiveIntensity: 0.35,
          materialType: 'plastic',
          opacity: 1.0,
          visible: true,
          description: 'High-density 22.2V LiPo battery delivering 45-minute sustained autonomous flight duration.',
        },
        // Arm 1 (Front Right) + Motor + Rotor
        {
          id: 'drone-arm-1',
          name: 'Carbon Arm Alpha (Front-Right)',
          layer: 'STRUCTURAL',
          shape: 'cylinder',
          position: [1.8, 0.1, 1.8],
          rotation: [0, -Math.PI / 4, Math.PI / 2],
          scale: [0.22, 2.5, 0.22],
          explodedOffset: [0.8, 0, 0.8],
          color: '#334155',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'drone-motor-1',
          name: 'Brushless Motor Nacelle 1 (2200KV)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [2.7, 0.3, 2.7],
          rotation: [0, 0, 0],
          scale: [0.5, 0.4, 0.5],
          explodedOffset: [1.2, 0.3, 1.2],
          color: '#0284c7',
          emissiveColor: '#0ea5e9',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
          description: 'Outrunner brushless stator with neodymium magnets producing 2.8kg static thrust.',
        },
        {
          id: 'drone-rotor-1',
          name: '12-Inch Carbon Propeller Blade 1',
          layer: 'MECHANICAL',
          shape: 'box',
          position: [2.7, 0.6, 2.7],
          rotation: [0, Math.PI / 6, 0],
          scale: [2.8, 0.05, 0.35],
          explodedOffset: [1.2, 0.9, 1.2],
          color: '#38bdf8',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'hologram_glass',
          opacity: 0.85,
          visible: true,
        },
        // Arm 2 (Front Left) + Motor + Rotor
        {
          id: 'drone-arm-2',
          name: 'Carbon Arm Beta (Front-Left)',
          layer: 'STRUCTURAL',
          shape: 'cylinder',
          position: [-1.8, 0.1, 1.8],
          rotation: [0, Math.PI / 4, Math.PI / 2],
          scale: [0.22, 2.5, 0.22],
          explodedOffset: [-0.8, 0, 0.8],
          color: '#334155',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'drone-motor-2',
          name: 'Brushless Motor Nacelle 2',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-2.7, 0.3, 1.8],
          rotation: [0, 0, 0],
          scale: [0.5, 0.4, 0.5],
          explodedOffset: [-1.2, 0.3, 1.2],
          color: '#0284c7',
          emissiveColor: '#0ea5e9',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'drone-rotor-2',
          name: '12-Inch Carbon Propeller Blade 2',
          layer: 'MECHANICAL',
          shape: 'box',
          position: [-2.7, 0.6, 1.8],
          rotation: [0, -Math.PI / 6, 0],
          scale: [2.8, 0.05, 0.35],
          explodedOffset: [-1.2, 0.9, 1.2],
          color: '#38bdf8',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'hologram_glass',
          opacity: 0.85,
          visible: true,
        },
        // Arm 3 (Rear Right) + Motor + Rotor
        {
          id: 'drone-arm-3',
          name: 'Carbon Arm Gamma (Rear-Right)',
          layer: 'STRUCTURAL',
          shape: 'cylinder',
          position: [1.8, 0.1, -1.8],
          rotation: [0, Math.PI / 4, Math.PI / 2],
          scale: [0.22, 2.5, 0.22],
          explodedOffset: [0.8, 0, -0.8],
          color: '#334155',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'drone-motor-3',
          name: 'Brushless Motor Nacelle 3',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [2.7, 0.3, -1.8],
          rotation: [0, 0, 0],
          scale: [0.5, 0.4, 0.5],
          explodedOffset: [1.2, 0.3, -1.2],
          color: '#0284c7',
          emissiveColor: '#0ea5e9',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'drone-rotor-3',
          name: '12-Inch Carbon Propeller Blade 3',
          layer: 'MECHANICAL',
          shape: 'box',
          position: [2.7, 0.6, -1.8],
          rotation: [0, -Math.PI / 4, 0],
          scale: [2.8, 0.05, 0.35],
          explodedOffset: [1.2, 0.9, -1.2],
          color: '#38bdf8',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'hologram_glass',
          opacity: 0.85,
          visible: true,
        },
        // Arm 4 (Rear Left) + Motor + Rotor
        {
          id: 'drone-arm-4',
          name: 'Carbon Arm Delta (Rear-Left)',
          layer: 'STRUCTURAL',
          shape: 'cylinder',
          position: [-1.8, 0.1, -1.8],
          rotation: [0, -Math.PI / 4, Math.PI / 2],
          scale: [0.22, 2.5, 0.22],
          explodedOffset: [-0.8, 0, -0.8],
          color: '#334155',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'drone-motor-4',
          name: 'Brushless Motor Nacelle 4',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-2.7, 0.3, -1.8],
          rotation: [0, 0, 0],
          scale: [0.5, 0.4, 0.5],
          explodedOffset: [-1.2, 0.3, -1.2],
          color: '#0284c7',
          emissiveColor: '#0ea5e9',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'drone-rotor-4',
          name: '12-Inch Carbon Propeller Blade 4',
          layer: 'MECHANICAL',
          shape: 'box',
          position: [-2.7, 0.6, -1.8],
          rotation: [0, Math.PI / 4, 0],
          scale: [2.8, 0.05, 0.35],
          explodedOffset: [-1.2, 0.9, -1.2],
          color: '#38bdf8',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'hologram_glass',
          opacity: 0.85,
          visible: true,
        },
        // 4K Gimbal Camera Sensor Pod
        {
          id: 'drone-camera',
          name: '3-Axis 4K Thermal/Optical Gimbal Camera',
          layer: 'ELECTRONICS',
          shape: 'sphere',
          position: [0, -0.7, 0.9],
          rotation: [0, 0, 0],
          scale: [0.75, 0.75, 0.75],
          explodedOffset: [0, -1.2, 1.0],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.6,
          materialType: 'silicon',
          opacity: 0.95,
          visible: true,
          description: '60fps 4K optical sensor with 640×512 radiometric thermal camera and laser rangefinder.',
        },
        // LiDAR Dome on top
        {
          id: 'drone-lidar',
          name: 'Solid-State 360° LiDAR Scanner',
          layer: 'CORE',
          shape: 'cylinder',
          position: [0, 0.6, 0],
          rotation: [0, 0, 0],
          scale: [0.7, 0.35, 0.7],
          explodedOffset: [0, 1.4, 0],
          color: '#a855f7',
          emissiveColor: '#c084fc',
          emissiveIntensity: 0.7,
          materialType: 'glowing_core',
          opacity: 0.9,
          visible: true,
          description: 'High-speed pulsed laser scanner mapping terrain at 200,000 points/sec for collision prevention.',
        },
      ];
    }
    // Case 2: Laser / Laser Light / Laser Pointer / Emitter / Scanner
    else if (
      lower.includes('laser') ||
      lower.includes('লেজার') ||
      lower.includes('laser light') ||
      lower.includes('pointer')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'High-Power Tactical Laser Pointer Torch (ট্যাকটিক্যাল লেজার লাইট)';
      dimensions = { x: 220, y: 35, z: 35, unit: 'mm', isApproximate: false };
      cameraPos = [6, 3, 5];

      components = [
        // 1. Main Grip Body / Casing Barrel (হাতে ধরার অ্যালুমিনিয়াম বডি)
        {
          id: 'laser-barrel',
          name: 'Anodized Aluminum Grip Barrel (হাতে ধরার মূল বডি)',
          layer: 'CASING',
          shape: 'cylinder',
          position: [0, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.8, 3.8, 0.8],
          explodedOffset: [0, 0, 0],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.25,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: 'CNC-machined aerospace-grade aluminum alloy body with knurled anti-slip grip pattern and internal heat dissipation channels.',
        },
        // 2. Rear Battery Tailcap & Spring (টেলক্যাপ ও কন্টাক্ট স্প্রিং)
        {
          id: 'laser-tailcap',
          name: 'Rear Tailcap with Golden Spring (টেলক্যাপ ও স্প্রিং)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-2.2, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.85, 0.6, 0.85],
          explodedOffset: [-1.2, 0, 0],
          color: '#0f172a',
          emissiveColor: '#eab308',
          emissiveIntensity: 0.35,
          materialType: 'copper',
          opacity: 1.0,
          visible: true,
          description: 'Threaded waterproof tailcap housing a high-conductivity gold-plated phosphor bronze negative battery spring.',
        },
        // 3. Rechargeable Li-Ion 18650 Battery Cell (রিচার্জেবল লিথিয়াম ব্যাটারি)
        {
          id: 'laser-battery',
          name: '3.7V 3000mAh 18650 Li-ion Battery (রিচার্জেবল ব্যাটারি)',
          layer: 'CORE',
          shape: 'cylinder',
          position: [-0.6, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.65, 2.5, 0.65],
          explodedOffset: [0, 0.9, 0],
          color: '#3b82f6',
          emissiveColor: '#60a5fa',
          emissiveIntensity: 0.5,
          materialType: 'glowing_core',
          opacity: 0.95,
          visible: true,
          description: 'High-discharge 3.7V 18650 lithium-ion energy cell powering the laser diode driver circuit.',
        },
        // 4. Clicky On/Off Push Button Switch (পুশ অন/অফ সুইচ)
        {
          id: 'laser-switch',
          name: 'Tactile Clicky Push-Button Switch (অন/অফ সুইচ বাটন)',
          layer: 'ELECTRONICS',
          shape: 'cylinder',
          position: [0.6, 0.45, 0],
          rotation: [0, 0, 0],
          scale: [0.3, 0.25, 0.3],
          explodedOffset: [0, 0.7, 0],
          color: '#ef4444',
          emissiveColor: '#f87171',
          emissiveIntensity: 0.8,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
          description: 'Momentary and continuous lock clicky tactile switch with safety lockout mechanism.',
        },
        // 5. Laser Diode Core Module 532nm (লেজার ডায়োড কোর)
        {
          id: 'laser-diode',
          name: '532nm High-Power Green Laser Diode Core (লেজার ডায়োড এমিটার)',
          layer: 'ELECTRONICS',
          shape: 'cylinder',
          position: [1.2, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.6, 0.8, 0.6],
          explodedOffset: [0.6, 0, 0],
          color: '#10b981',
          emissiveColor: '#34d399',
          emissiveIntensity: 0.95,
          materialType: 'glowing_core',
          opacity: 1.0,
          visible: true,
          description: 'Optically aligned semiconductor laser diode pumping crystalline gain medium generating pure 532nm wavelength.',
        },
        // 6. Adjustable Optical Focusing Crown (ফোকাসিং লেন্স রিং)
        {
          id: 'laser-focus-ring',
          name: 'Rotary Focus Adjustment Bezel (ফোকাসিং লেন্স রিং)',
          layer: 'MECHANICAL',
          shape: 'torus',
          position: [1.8, 0, 0],
          rotation: [0, Math.PI / 2, 0],
          scale: [0.9, 0.9, 0.4],
          explodedOffset: [1.1, 0, 0],
          color: '#f59e0b',
          emissiveColor: '#fbbf24',
          emissiveIntensity: 0.6,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          description: 'Precision ribbed rotating brass ring to adjust the focal distance and spot diameter of the laser beam.',
        },
        // 7. Output Aperture & Glass Lens (আউটপুট লেন্স নজল)
        {
          id: 'laser-lens',
          name: 'Anti-Reflective Coated Output Lens (অপটিক্যাল আউটপুট লেন্স)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [2.2, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.75, 0.2, 0.75],
          explodedOffset: [1.6, 0, 0],
          color: '#06b6d4',
          emissiveColor: '#22d3ee',
          emissiveIntensity: 0.9,
          materialType: 'hologram_glass',
          opacity: 0.85,
          visible: true,
          description: 'Multi-layer AR-coated glass collimating lens focusing coherent photons into a narrow divergence ray.',
        },
        // 8. BRIGHT RADIANT GLOWING LASER BEAM (তীব্র লেজার রশ্মির আলো)
        {
          id: 'laser-beam-ray',
          name: 'Radiant Coherent Green Laser Beam (উজ্জ্বল লেজার রশ্মি)',
          layer: 'CORE',
          shape: 'cylinder',
          position: [6.0, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.12, 7.5, 0.12],
          explodedOffset: [2.5, 0, 0],
          color: '#10b981',
          emissiveColor: '#4ade80',
          emissiveIntensity: 1.8,
          materialType: 'glowing_core',
          opacity: 0.92,
          visible: true,
          highlighted: true,
          description: 'High-intensity coherent green laser beam (532nm) radiating forward at 200mW optical power.',
        },
      ];
    }
    // Case 2B: Flashlight / Torch Light / টর্চ লাইট
    else if (
      lower.includes('torch') ||
      lower.includes('flashlight') ||
      lower.includes('টর্চ')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'High-Lumen Tactical LED Flashlight Torch (ট্যাকটিক্যাল এলইডি টর্চ লাইট)';
      dimensions = { x: 180, y: 48, z: 48, unit: 'mm', isApproximate: false };
      cameraPos = [6, 3, 5];

      components = [
        {
          id: 'torch-body',
          name: 'Tactical Aluminum Handle Grip (হাতে ধরার গ্রিপ বডি)',
          layer: 'CASING',
          shape: 'cylinder',
          position: [-0.6, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.9, 3.2, 0.9],
          explodedOffset: [0, 0, 0],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.3,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: 'Diamond knurled aerospace aluminum tube with weather-sealed O-rings.',
        },
        {
          id: 'torch-switch',
          name: 'Rubberized Side Click Switch (অন/অফ পুশ সুইচ)',
          layer: 'ELECTRONICS',
          shape: 'cylinder',
          position: [0.2, 0.5, 0],
          rotation: [0, 0, 0],
          scale: [0.35, 0.2, 0.35],
          explodedOffset: [0, 0.6, 0],
          color: '#f59e0b',
          emissiveColor: '#fbbf24',
          emissiveIntensity: 0.7,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
          description: 'Tactile mode selection switch cycling through Turbo, High, Mid, Low, and Strobe modes.',
        },
        {
          id: 'torch-led',
          name: 'Cree XHP70.2 Ultra-Bright LED Emitter Core (উচ্চক্ষমতার এলইডি চিপ)',
          layer: 'CORE',
          shape: 'box',
          position: [1.1, 0, 0],
          rotation: [0, 0, 0],
          scale: [0.4, 0.4, 0.15],
          explodedOffset: [0.4, 0, 0],
          color: '#eab308',
          emissiveColor: '#facc15',
          emissiveIntensity: 1.6,
          materialType: 'glowing_core',
          opacity: 1.0,
          visible: true,
          description: '4000-lumen quad-die semiconductor LED mounted onto direct-thermal-path copper PCB.',
        },
        {
          id: 'torch-reflector',
          name: 'Parabolic Deep Aluminum Reflector Cone (প্যারাবলিক রিফ্লেক্টর কাপ)',
          layer: 'MECHANICAL',
          shape: 'cone',
          position: [1.6, 0, 0],
          rotation: [0, 0, -Math.PI / 2],
          scale: [1.4, 1.2, 1.4],
          explodedOffset: [0.8, 0, 0],
          color: '#cbd5e1',
          emissiveColor: '#f8fafc',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
          description: 'Highly polished parabolic mirror reflector focusing diverging rays into a balanced hotspot and spill.',
        },
        {
          id: 'torch-glass',
          name: 'Toughened Mineral Glass Lens with Striking Bezel (সামনের গ্লাস ও বেজেল)',
          layer: 'CASING',
          shape: 'cylinder',
          position: [2.3, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [1.45, 0.25, 1.45],
          explodedOffset: [1.3, 0, 0],
          color: '#38bdf8',
          emissiveColor: '#7dd3fc',
          emissiveIntensity: 0.5,
          materialType: 'hologram_glass',
          opacity: 0.8,
          visible: true,
          description: 'Ultra-clear tempered glass with anti-reflective coating protecting the optical chamber.',
        },
        {
          id: 'torch-beam',
          name: 'Projected Conical Light Beam (টর্চের ছড়ানো উজ্জ্বল আলোর বিম)',
          layer: 'CORE',
          shape: 'cone',
          position: [5.2, 0, 0],
          rotation: [0, 0, -Math.PI / 2],
          scale: [3.5, 5.6, 3.5],
          explodedOffset: [2.0, 0, 0],
          color: '#fef08a',
          emissiveColor: '#fde047',
          emissiveIntensity: 1.4,
          materialType: 'glowing_core',
          opacity: 0.7,
          visible: true,
          description: '4000-lumen wide-angle volumetric flood beam illuminating targets up to 450 meters.',
        },
      ];
    }
    // Case 2C: Lightsaber / Energy Blade / লাইটসেবার
    else if (
      lower.includes('lightsaber') ||
      lower.includes('saber') ||
      lower.includes('blade') ||
      lower.includes('sword') ||
      lower.includes('তলোয়ার')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Plasma Energy Lightsaber (প্লাজমা এনার্জি লাইটসেবার)';
      dimensions = { x: 1200, y: 60, z: 60, unit: 'mm', isApproximate: false };
      cameraPos = [7, 3, 6];

      components = [
        {
          id: 'saber-hilt',
          name: 'Machined Chrome Hilt Grip (হ্যান্ডেল গ্রিপ)',
          layer: 'CASING',
          shape: 'cylinder',
          position: [-1.5, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.8, 3.2, 0.8],
          explodedOffset: [-0.5, 0, 0],
          color: '#334155',
          emissiveColor: '#64748b',
          emissiveIntensity: 0.3,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: 'Dual-tone chrome and black anodized metal hilt housing the energy matrix.',
        },
        {
          id: 'saber-crystal',
          name: 'Kyber Power Crystal Core (কাইবার ক্রিস্টাল কোর)',
          layer: 'CORE',
          shape: 'sphere',
          position: [-1.2, 0, 0],
          rotation: [0, 0, 0],
          scale: [0.5, 0.5, 0.5],
          explodedOffset: [-0.5, 0.8, 0],
          color: '#06b6d4',
          emissiveColor: '#22d3ee',
          emissiveIntensity: 1.8,
          materialType: 'glowing_core',
          opacity: 0.95,
          visible: true,
          description: 'Rare resonance crystal channeling plasma flux through the magnetic stabilizing matrix.',
        },
        {
          id: 'saber-switch',
          name: 'Activation Matrix Igniter Switch (অ্যাক্টিভেশন সুইচ)',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [-0.8, 0.45, 0],
          rotation: [0, 0, 0],
          scale: [0.4, 0.2, 0.3],
          explodedOffset: [-0.3, 0.6, 0],
          color: '#f59e0b',
          emissiveColor: '#fbbf24',
          emissiveIntensity: 0.8,
          materialType: 'copper',
          opacity: 1.0,
          visible: true,
          description: 'Tactile magnetic blade igniter switch with power modulation dial.',
        },
        {
          id: 'saber-emitter',
          name: 'Magnetic Emitter Shroud Ring (ম্যাগনেটিক এমিটার হেড)',
          layer: 'MECHANICAL',
          shape: 'torus',
          position: [0.2, 0, 0],
          rotation: [0, Math.PI / 2, 0],
          scale: [0.95, 0.95, 0.4],
          explodedOffset: [0.4, 0, 0],
          color: '#cbd5e1',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.6,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
          description: 'High-strength magnetic containment nozzle shaping plasma into an arc blade.',
        },
        {
          id: 'saber-blade',
          name: 'Luminous Plasma Energy Blade (উজ্জ্বল প্লাজমা এনার্জি ব্লেড)',
          layer: 'CORE',
          shape: 'cylinder',
          position: [4.5, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.28, 8.4, 0.28],
          explodedOffset: [1.8, 0, 0],
          color: '#06b6d4',
          emissiveColor: '#67e8f9',
          emissiveIntensity: 2.0,
          materialType: 'glowing_core',
          opacity: 0.95,
          visible: true,
          highlighted: true,
          description: 'Contained high-energy plasma blade burning at 15,000°C capable of cutting through reinforced alloys.',
        },
      ];
    }
    // Case 2D: Smartphone / Mobile Device / স্মার্টফোন
    else if (
      lower.includes('phone') ||
      lower.includes('mobile') ||
      lower.includes('smartphone') ||
      lower.includes('স্মার্টফোন') ||
      lower.includes('মোবাইল')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Next-Gen Ultra-Thin 5G Smartphone (নেক্সট-জেন স্মার্টফোন)';
      dimensions = { x: 75, y: 155, z: 8, unit: 'mm', isApproximate: false };
      cameraPos = [5, 4, 6];

      components = [
        {
          id: 'phone-frame',
          name: 'Grade-5 Titanium Chassis Frame (টাইটানিয়াম সাইড ফ্রেম)',
          layer: 'STRUCTURAL',
          shape: 'box',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [3.2, 6.4, 0.35],
          explodedOffset: [0, 0, 0],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.2,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: 'Precision CNC-machined titanium unibody enclosure with internal thermal dissipation graphite sheets.',
        },
        {
          id: 'phone-screen',
          name: '120Hz Dynamic AMOLED Display Panel (অ্যামোলেড টাচস্ক্রিন ডিসপ্লে)',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [0, 0, 0.22],
          rotation: [0, 0, 0],
          scale: [3.0, 6.2, 0.08],
          explodedOffset: [0, 0, 1.0],
          color: '#06b6d4',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.9,
          materialType: 'hologram_glass',
          opacity: 0.9,
          visible: true,
          description: 'Edge-to-edge 6.7-inch 120Hz LTPO AMOLED panel protected by Ceramic Shield glass.',
        },
        {
          id: 'phone-battery',
          name: '5000mAh High-Density Graphene Battery (লিথিয়াম-গ্রাফিন ব্যাটারি)',
          layer: 'CORE',
          shape: 'box',
          position: [0, -0.6, 0],
          rotation: [0, 0, 0],
          scale: [2.6, 3.8, 0.22],
          explodedOffset: [0, 0, -0.8],
          color: '#3b82f6',
          emissiveColor: '#60a5fa',
          emissiveIntensity: 0.45,
          materialType: 'glowing_core',
          opacity: 0.95,
          visible: true,
          description: 'Dual-cell fast-charging 5000mAh battery supporting 100W wireless and wired charging.',
        },
        {
          id: 'phone-soc',
          name: '3nm Neural AI Bionic Processor SoC (মাদারবোর্ড ও এআই প্রসেসর)',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [0, 1.8, 0],
          rotation: [0, 0, 0],
          scale: [2.5, 1.8, 0.18],
          explodedOffset: [0, 0.8, -0.8],
          color: '#10b981',
          emissiveColor: '#34d399',
          emissiveIntensity: 0.7,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
          description: 'Stacked logic board with 3nm octa-core CPU, 16-core GPU, and dedicated Neural Processing Engine.',
        },
        {
          id: 'phone-camera-bump',
          name: 'Triple-Lens 200MP Optical Camera Module (২০০ মেগাপিক্সেল ক্যামেরা মডিউল)',
          layer: 'CASING',
          shape: 'box',
          position: [-0.8, 2.0, -0.25],
          rotation: [0, 0, 0],
          scale: [1.2, 1.6, 0.2],
          explodedOffset: [-0.6, 0, -1.2],
          color: '#0f172a',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          description: 'Triple camera matrix with 200MP main sensor, 5x periscope telephoto, and ultra-wide lens with LiDAR.',
        },
      ];
    }
    // Case 2E: Electric Fan / ফ্যান
    else if (
      lower.includes('fan') ||
      lower.includes('ফ্যান') ||
      lower.includes('পাখা')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Aerodynamic High-Efficiency Electric Fan (বৈদ্যুতিক ফ্যান)';
      dimensions = { x: 450, y: 550, z: 320, unit: 'mm', isApproximate: false };
      cameraPos = [6, 4, 6];

      components = [
        {
          id: 'fan-base',
          name: 'Weighted Circular Stand Base (ফ্যানের স্ট্যান্ড ও কন্ট্রোল প্যানেল)',
          layer: 'STRUCTURAL',
          shape: 'cylinder',
          position: [0, -2.4, 0],
          rotation: [0, 0, 0],
          scale: [2.6, 0.3, 2.6],
          explodedOffset: [0, -0.8, 0],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.25,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          description: 'Sturdy weighted pedestal base with digital touch speed buttons and oscillation controls.',
        },
        {
          id: 'fan-stand-pole',
          name: 'Telescopic Chrome Support Stem (ভার্টিক্যাল স্ট্যান্ড পাইপ)',
          layer: 'STRUCTURAL',
          shape: 'cylinder',
          position: [0, -1.2, 0],
          rotation: [0, 0, 0],
          scale: [0.3, 2.2, 0.3],
          explodedOffset: [0, 0, 0],
          color: '#cbd5e1',
          emissiveColor: '#94a3b8',
          emissiveIntensity: 0.2,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
          description: 'Height-adjustable stainless steel tubular pole.',
        },
        {
          id: 'fan-motor',
          name: 'BLDC Silent Magnetic Motor Housing (মোটর ও গিয়ারবক্স)',
          layer: 'CORE',
          shape: 'cylinder',
          position: [0, 0.2, -0.4],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1.1, 1.2, 1.1],
          explodedOffset: [0, 0, -0.9],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
          description: 'Brushless DC motor with copper armature windings offering 1800 RPM silent airflow.',
        },
        {
          id: 'fan-blade-hub',
          name: 'Rotating 3-Blade Aerodynamic Rotor (ঘূর্ণায়মান ৩-পাখা রোটর)',
          layer: 'MECHANICAL',
          shape: 'torus',
          position: [0, 0.2, 0.2],
          rotation: [0, 0, 0],
          scale: [2.8, 2.8, 0.3],
          explodedOffset: [0, 0, 0.8],
          color: '#06b6d4',
          emissiveColor: '#22d3ee',
          emissiveIntensity: 0.85,
          materialType: 'hologram_glass',
          opacity: 0.8,
          visible: true,
          highlighted: true,
          description: 'Balanced 3-blade curved airfoils engineered for maximum CFM airflow and minimum vortex noise.',
        },
        {
          id: 'fan-grill',
          name: 'Protective Safety Mesh Cage (সেফটি তারের খাঁচা / গ্রিল)',
          layer: 'CASING',
          shape: 'torus',
          position: [0, 0.2, 0.3],
          rotation: [0, 0, 0],
          scale: [3.4, 3.4, 0.25],
          explodedOffset: [0, 0, 1.4],
          color: '#38bdf8',
          emissiveColor: '#7dd3fc',
          emissiveIntensity: 0.4,
          materialType: 'metal',
          opacity: 0.5,
          transparent: true,
          visible: true,
          description: 'Reinforced safety radial wire grill protecting users from moving blades.',
        },
      ];
    }
    // Case 2F: Electric Light Bulb / বাতি / বাল্ব
    else if (
      lower.includes('bulb') ||
      lower.includes('বাল্ব') ||
      lower.includes('বাতি')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Edison Filament LED Light Bulb (বৈদ্যুতিক বাতি / বাল্ব)';
      dimensions = { x: 60, y: 110, z: 60, unit: 'mm', isApproximate: false };
      cameraPos = [4, 3, 5];

      components = [
        {
          id: 'bulb-base',
          name: 'E27 Threaded Brass Screw Base (ই-২৭ স্ক্রু বেস)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [0, -1.8, 0],
          rotation: [0, 0, 0],
          scale: [1.1, 1.0, 1.1],
          explodedOffset: [0, -0.8, 0],
          color: '#d97706',
          emissiveColor: '#f59e0b',
          emissiveIntensity: 0.4,
          materialType: 'copper',
          opacity: 1.0,
          visible: true,
          description: 'Standard E27 threaded brass base with bottom electrical contact point.',
        },
        {
          id: 'bulb-filament',
          name: 'Glowing Spiral Tungsten-LED Filament Core (উজ্জ্বল ফিলামেন্ট কোর)',
          layer: 'CORE',
          shape: 'cylinder',
          position: [0, 0.1, 0],
          rotation: [0, 0, 0],
          scale: [0.4, 1.8, 0.4],
          explodedOffset: [0, 0, 0],
          color: '#f59e0b',
          emissiveColor: '#fbbf24',
          emissiveIntensity: 1.9,
          materialType: 'glowing_core',
          opacity: 0.95,
          visible: true,
          highlighted: true,
          description: 'High-efficiency 2700K warm gold glowing filament emitting 900 lumens of light.',
        },
        {
          id: 'bulb-glass',
          name: 'Clear Spherical Glass Enclosure (স্বচ্ছ কাঁচের বাল্ব বডি)',
          layer: 'CASING',
          shape: 'sphere',
          position: [0, 0.3, 0],
          rotation: [0, 0, 0],
          scale: [2.6, 3.0, 2.6],
          explodedOffset: [0, 0.8, 0],
          color: '#38bdf8',
          emissiveColor: '#fde047',
          emissiveIntensity: 0.5,
          materialType: 'hologram_glass',
          opacity: 0.4,
          transparent: true,
          visible: true,
          description: 'Blown borosilicate vacuum glass envelope filled with inert argon gas.',
        },
      ];
    }
    // Case 3: Robotic Creature / Spider / Walker / Humanoid
    else if (
      lower.includes('spider') ||
      lower.includes('walker') ||
      lower.includes('bionic') ||
      lower.includes('creature') ||
      lower.includes('exoskeleton') ||
      lower.includes('hexapod')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Autonomous Hexapod Bionic Walker Robot';
      dimensions = { x: 1100, y: 650, z: 1100, unit: 'mm', isApproximate: true };
      cameraPos = [7, 6, 7];

      components = [
        // Main Core Abdomen
        {
          id: 'spider-core',
          name: 'Central Armored Processor Pod',
          layer: 'CORE',
          shape: 'sphere',
          position: [0, 0.4, 0],
          rotation: [0, 0, 0],
          scale: [2.0, 1.2, 2.4],
          explodedOffset: [0, 0, 0],
          color: '#0f172a',
          emissiveColor: '#818cf8',
          emissiveIntensity: 0.4,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: 'Titanium-matrix central chassis housing neural kinematics engine, battery cell, and balance gyros.',
        },
        // Optical Visor Dome
        {
          id: 'spider-visor',
          name: 'Stereoscopic Compound Optical Matrix',
          layer: 'ELECTRONICS',
          shape: 'sphere',
          position: [0, 0.6, 1.2],
          rotation: [0, 0, 0],
          scale: [0.8, 0.6, 0.8],
          explodedOffset: [0, 0.5, 1.0],
          color: '#06b6d4',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.8,
          materialType: 'hologram_glass',
          opacity: 0.85,
          visible: true,
        },
        // Leg 1 (Front-Right)
        {
          id: 'spider-leg-1a',
          name: 'Articulated Limb 1 (Coxa & Femur)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [1.8, 0.2, 1.4],
          rotation: [Math.PI / 4, 0, -Math.PI / 4],
          scale: [0.25, 2.2, 0.25],
          explodedOffset: [1.0, 0, 0.8],
          color: '#334155',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'spider-leg-1b',
          name: 'Tactile Ground Foot 1 (Tibia)',
          layer: 'MECHANICAL',
          shape: 'cone',
          position: [2.8, -1.0, 2.0],
          rotation: [Math.PI, 0, 0],
          scale: [0.35, 1.8, 0.35],
          explodedOffset: [1.6, -0.6, 1.2],
          color: '#0284c7',
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        // Leg 2 (Front-Left)
        {
          id: 'spider-leg-2a',
          name: 'Articulated Limb 2 (Coxa & Femur)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-1.8, 0.2, 1.4],
          rotation: [Math.PI / 4, 0, Math.PI / 4],
          scale: [0.25, 2.2, 0.25],
          explodedOffset: [-1.0, 0, 0.8],
          color: '#334155',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'spider-leg-2b',
          name: 'Tactile Ground Foot 2 (Tibia)',
          layer: 'MECHANICAL',
          shape: 'cone',
          position: [-2.8, -1.0, 2.0],
          rotation: [Math.PI, 0, 0],
          scale: [0.35, 1.8, 0.35],
          explodedOffset: [-1.6, -0.6, 1.2],
          color: '#0284c7',
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        // Leg 3 (Rear-Right)
        {
          id: 'spider-leg-3a',
          name: 'Articulated Limb 3 (Rear-Right)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [1.8, 0.2, -1.4],
          rotation: [-Math.PI / 4, 0, -Math.PI / 4],
          scale: [0.25, 2.2, 0.25],
          explodedOffset: [1.0, 0, -0.8],
          color: '#334155',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        // Leg 4 (Rear-Left)
        {
          id: 'spider-leg-4a',
          name: 'Articulated Limb 4 (Rear-Left)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-1.8, 0.2, -1.4],
          rotation: [-Math.PI / 4, 0, Math.PI / 4],
          scale: [0.25, 2.2, 0.25],
          explodedOffset: [-1.0, 0, -0.8],
          color: '#334155',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        // Power Core Cell
        {
          id: 'spider-battery',
          name: 'High-Density Graphene Power Accumulator',
          layer: 'CORE',
          shape: 'cylinder',
          position: [0, 0.3, -0.6],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1.1, 1.4, 1.1],
          explodedOffset: [0, 0.8, -1.0],
          color: '#f59e0b',
          emissiveColor: '#fbbf24',
          emissiveIntensity: 0.6,
          materialType: 'glowing_core',
          opacity: 0.95,
          visible: true,
        },
      ];
    }
    // Case 4: Vehicle / Car / Rover / Submarine / Transport
    else if (
      lower.includes('car') ||
      lower.includes('rover') ||
      lower.includes('vehicle') ||
      lower.includes('boat') ||
      lower.includes('submarine') ||
      lower.includes('transport')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Next-Gen Autonomous Mag-Lev Transport Rover';
      dimensions = { x: 3800, y: 1450, z: 1900, unit: 'mm', isApproximate: true };
      cameraPos = [9, 5, 8];

      components = [
        // Main Streamlined Monocoque Body
        {
          id: 'veh-chassis',
          name: 'Aerodynamic Carbon Monocoque Chassis',
          layer: 'STRUCTURAL',
          shape: 'box',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [6.0, 1.2, 2.8],
          explodedOffset: [0, 0, 0],
          color: '#0f172a',
          emissiveColor: '#0284c7',
          emissiveIntensity: 0.25,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: 'Molded carbon-composite unibody structure with integrated crash crumple zones and underbody air channels.',
        },
        // Panoramic Cockpit Visor Canopy
        {
          id: 'veh-canopy',
          name: 'Photocromic Panoramic Glass Canopy',
          layer: 'CASING',
          shape: 'sphere',
          position: [0.2, 1.0, 0],
          rotation: [0, 0, 0],
          scale: [3.5, 1.4, 2.2],
          explodedOffset: [0, 1.6, 0],
          color: '#06b6d4',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.4,
          materialType: 'hologram_glass',
          opacity: 0.35,
          transparent: true,
          visible: true,
        },
        // Drive Wheel / Mag-Hub 1 (Front Right)
        {
          id: 'veh-wheel-1',
          name: 'Omni-Directional Magnetic Drive Wheel (FR)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [2.0, -0.6, 1.6],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1.2, 0.6, 1.2],
          explodedOffset: [0.8, -0.4, 1.2],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        // Drive Wheel / Mag-Hub 2 (Front Left)
        {
          id: 'veh-wheel-2',
          name: 'Omni-Directional Magnetic Drive Wheel (FL)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [2.0, -0.6, -1.6],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1.2, 0.6, 1.2],
          explodedOffset: [0.8, -0.4, -1.2],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        // Drive Wheel / Mag-Hub 3 (Rear Right)
        {
          id: 'veh-wheel-3',
          name: 'Omni-Directional Magnetic Drive Wheel (RR)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-2.0, -0.6, 1.6],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1.2, 0.6, 1.2],
          explodedOffset: [-0.8, -0.4, 1.2],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        // Drive Wheel / Mag-Hub 4 (Rear Left)
        {
          id: 'veh-wheel-4',
          name: 'Omni-Directional Magnetic Drive Wheel (RL)',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-2.0, -0.6, -1.6],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1.2, 0.6, 1.2],
          explodedOffset: [-0.8, -0.4, -1.2],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        // Underbody 120kWh Solid-State Battery Floor
        {
          id: 'veh-battery',
          name: 'Underbody 800V 120kWh Structural Battery',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [0, -0.7, 0],
          rotation: [0, 0, 0],
          scale: [4.8, 0.35, 2.4],
          explodedOffset: [0, -1.2, 0],
          color: '#064e3b',
          emissiveColor: '#10b981',
          emissiveIntensity: 0.35,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
        },
        // Front Sensor Array
        {
          id: 'veh-sensor',
          name: 'Multi-Wavelength Optical & Radar Array',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [3.1, 0, 0],
          rotation: [0, 0, 0],
          scale: [0.3, 0.4, 2.2],
          explodedOffset: [1.4, 0, 0],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.7,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
        },
      ];
    }
    // Case 5: Cybernetic Bionic Hand / Prosthetic / Exoskeleton / Arm
    else if (
      lower.includes('hand') ||
      lower.includes('hat') ||
      lower.includes('finger') ||
      lower.includes('prosthetic') ||
      lower.includes('exoskeleton') ||
      lower.includes('cybernetic') ||
      lower.includes('biomechanic')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Neural-Linked Cybernetic Bionic Hand';
      dimensions = { x: 300, y: 550, z: 220, unit: 'mm', isApproximate: true };
      cameraPos = [6, 4, 6];

      components = [
        // Palm / Chassis
        {
          id: 'bio-palm',
          name: 'Titanium-Alloy Metacarpal Palm Chassis',
          layer: 'STRUCTURAL',
          shape: 'box',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [2.2, 2.4, 0.8],
          explodedOffset: [0, 0, 0],
          color: '#0f172a',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.3,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: '3D printed Grade-5 Titanium metacarpal frame with internal wire routing conduits.',
        },
        // Wrist Actuator Joint
        {
          id: 'bio-wrist',
          name: 'Dual-Axis Harmonic Drive Wrist Joint',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [0, -1.8, 0],
          rotation: [0, 0, 0],
          scale: [1.4, 1.0, 1.4],
          explodedOffset: [0, -1.2, 0],
          color: '#334155',
          emissiveColor: '#0ea5e9',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        // Thumb Digits
        {
          id: 'bio-thumb',
          name: 'Opposable Articulated Thumb Module',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-1.4, 0.4, 0.4],
          rotation: [0, 0, Math.PI / 4],
          scale: [0.35, 1.5, 0.35],
          explodedOffset: [-1.0, 0.5, 0.6],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        // Index Finger Digits
        {
          id: 'bio-index',
          name: 'High-Precision Index Phalange Module',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [-0.7, 2.0, 0],
          rotation: [0, 0, 0],
          scale: [0.3, 1.8, 0.3],
          explodedOffset: [-0.4, 1.2, 0],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        // Middle Finger Digits
        {
          id: 'bio-middle',
          name: 'Reinforced Middle Phalange Module',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [0, 2.2, 0],
          rotation: [0, 0, 0],
          scale: [0.32, 2.0, 0.32],
          explodedOffset: [0, 1.5, 0],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        // Ring Finger Digits
        {
          id: 'bio-ring',
          name: 'Articulated Ring Phalange Module',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [0.7, 1.9, 0],
          rotation: [0, 0, 0],
          scale: [0.3, 1.7, 0.3],
          explodedOffset: [0.4, 1.2, 0],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        // Pinky Finger Digits
        {
          id: 'bio-pinky',
          name: 'Auxiliary Pinky Phalange Module',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [1.3, 1.5, 0],
          rotation: [0, 0, 0],
          scale: [0.28, 1.3, 0.28],
          explodedOffset: [0.8, 1.0, 0],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.5,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        // EMG Neural Sensor Matrix
        {
          id: 'bio-sensor',
          name: 'Sub-Dermal Myoelectric EMG Signal Matrix',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [0, -0.4, 0.5],
          rotation: [0, 0, 0],
          scale: [1.8, 1.4, 0.2],
          explodedOffset: [0, -0.3, 1.0],
          color: '#065f46',
          emissiveColor: '#10b981',
          emissiveIntensity: 0.6,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
          description: '64-channel neural sensor capturing muscle firing potentials for intuitive motor control.',
        },
        // Carbon Armor Shield
        {
          id: 'bio-armor',
          name: 'Dorsal Carbon-Fiber Impact Shell',
          layer: 'CASING',
          shape: 'box',
          position: [0, 0, -0.6],
          rotation: [0, 0, 0],
          scale: [2.4, 2.6, 0.3],
          explodedOffset: [0, 0, -1.2],
          color: '#1e293b',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.2,
          materialType: 'plastic',
          opacity: 0.9,
          visible: true,
        },
      ];
    }
    // Case 6: Smart Helmet / HUD Visor / Iron Man / Wearable Armor
    else if (
      lower.includes('helmet') ||
      lower.includes('visor') ||
      lower.includes('hud') ||
      lower.includes('suit') ||
      lower.includes('armor') ||
      lower.includes('iron man') ||
      lower.includes('wearable')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Next-Gen Cybernetic Tactical HUD Helmet';
      dimensions = { x: 320, y: 380, z: 340, unit: 'mm', isApproximate: true };
      cameraPos = [6, 4, 6];

      components = [
        // Main Outer Shell
        {
          id: 'helm-shell',
          name: 'Graphene-Reinforced Ballistic Outer Shell',
          layer: 'STRUCTURAL',
          shape: 'sphere',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [3.2, 3.6, 3.4],
          explodedOffset: [0, 0, 0],
          color: '#0f172a',
          emissiveColor: '#0284c7',
          emissiveIntensity: 0.25,
          materialType: 'metal',
          opacity: 0.85,
          visible: true,
          highlighted: true,
          description: 'Lightweight graphene/Kevlar composite helmet shell providing NIJ Level IV ballistic protection.',
        },
        // Holographic AR Visor Glass
        {
          id: 'helm-visor',
          name: 'Photocromic Dual-Layer AR Hologram Visor',
          layer: 'CASING',
          shape: 'sphere',
          position: [0, 0.3, 1.4],
          rotation: [0, 0, 0],
          scale: [2.4, 1.6, 1.8],
          explodedOffset: [0, 0.4, 1.8],
          color: '#06b6d4',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.75,
          materialType: 'hologram_glass',
          opacity: 0.4,
          transparent: true,
          visible: true,
          description: 'Micro-OLED optical waveguide projecting 8K biometric HUD telemetry and night-vision overlays.',
        },
        // Neural Interface Synapse Mesh
        {
          id: 'helm-neural',
          name: 'Non-Invasive BCI Synapse Sensor Array',
          layer: 'CORE',
          shape: 'sphere',
          position: [0, 0.6, -0.4],
          rotation: [0, 0, 0],
          scale: [2.5, 2.6, 2.6],
          explodedOffset: [0, 1.2, -0.6],
          color: '#818cf8',
          emissiveColor: '#a855f7',
          emissiveIntensity: 0.5,
          materialType: 'glowing_core',
          opacity: 0.75,
          visible: true,
        },
        // Filtration / Rebreather Pod
        {
          id: 'helm-filter',
          name: 'Active NBC Filtration & Oxygen Recirculator',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [0, -1.2, 1.2],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1.2, 0.8, 1.2],
          explodedOffset: [0, -1.0, 1.2],
          color: '#334155',
          emissiveColor: '#10b981',
          emissiveIntensity: 0.4,
          materialType: 'aluminum',
          opacity: 1.0,
          visible: true,
        },
        // Comms & AI Telemetry Processor
        {
          id: 'helm-comms',
          name: 'Quantum Encrypted Comms & Neural AI Matrix',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [1.6, 0, -0.8],
          rotation: [0, -Math.PI / 4, 0],
          scale: [0.4, 1.6, 1.2],
          explodedOffset: [1.2, 0, -0.8],
          color: '#065f46',
          emissiveColor: '#34d399',
          emissiveIntensity: 0.5,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
        },
      ];
    }
    // Case 7: Spacecraft / Satellite / Rocket / Orbiter
    else if (
      lower.includes('space') ||
      lower.includes('satellite') ||
      lower.includes('rocket') ||
      lower.includes('orbiter') ||
      lower.includes('spaceship') ||
      lower.includes('probe')
    ) {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Deep Space Autonomous Exploration Satellite';
      dimensions = { x: 4200, y: 2800, z: 2400, unit: 'mm', isApproximate: true };
      cameraPos = [8, 5, 8];

      components = [
        // Main Satellite Bus Chassis
        {
          id: 'sat-bus',
          name: 'Titanium-Hex Core Avionics Satellite Bus',
          layer: 'STRUCTURAL',
          shape: 'box',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [2.4, 3.2, 2.4],
          explodedOffset: [0, 0, 0],
          color: '#0f172a',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.3,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          highlighted: true,
          description: 'Thermal gold-foil insulated satellite bus with star trackers and reaction wheel stabilization.',
        },
        // Solar Wing Right
        {
          id: 'sat-solar-r',
          name: 'Gallium-Arsenide Photovoltaic Solar Array (Starboard)',
          layer: 'MECHANICAL',
          shape: 'box',
          position: [3.6, 0, 0],
          rotation: [0, 0, 0],
          scale: [4.4, 0.08, 2.0],
          explodedOffset: [2.0, 0, 0],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.45,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
        },
        // Solar Wing Left
        {
          id: 'sat-solar-l',
          name: 'Gallium-Arsenide Photovoltaic Solar Array (Port)',
          layer: 'MECHANICAL',
          shape: 'box',
          position: [-3.6, 0, 0],
          rotation: [0, 0, 0],
          scale: [4.4, 0.08, 2.0],
          explodedOffset: [-2.0, 0, 0],
          color: '#0284c7',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.45,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
        },
        // High-Gain Parabolic Comm Dish
        {
          id: 'sat-dish',
          name: 'Deep Space High-Gain Optical/Radio Dish',
          layer: 'ELECTRONICS',
          shape: 'cone',
          position: [0, 2.4, 0],
          rotation: [Math.PI, 0, 0],
          scale: [2.2, 1.0, 2.2],
          explodedOffset: [0, 1.5, 0],
          color: '#d97706',
          emissiveColor: '#fbbf24',
          emissiveIntensity: 0.5,
          materialType: 'copper',
          opacity: 1.0,
          visible: true,
        },
        // Ion Propulsion Thruster
        {
          id: 'sat-ion',
          name: 'Xenon Hall-Effect Ion Propulsion Engine',
          layer: 'CORE',
          shape: 'cylinder',
          position: [0, -2.2, 0],
          rotation: [0, 0, 0],
          scale: [1.2, 1.2, 1.2],
          explodedOffset: [0, -1.4, 0],
          color: '#06b6d4',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.9,
          materialType: 'glowing_core',
          opacity: 0.9,
          visible: true,
        },
      ];
    }
    // Case 8: Default General Custom Invention / Machine / Prototype
    else {
      conceptType = 'INVENTION_CONCEPT';
      title = title || 'Custom Modular Engineering Concept';
      dimensions = { x: 1500, y: 1100, z: 900, unit: 'mm', isApproximate: true };
      cameraPos = [8, 6, 8];

      components = [
        // 1. Main Structural Platform Base
        {
          id: 'custom-base',
          name: 'Structural Base Platform & Mounting Chassis',
          layer: 'STRUCTURAL',
          shape: 'box',
          position: [0, -0.6, 0],
          rotation: [0, 0, 0],
          scale: [6.0, 0.4, 4.5],
          explodedOffset: [0, -1.0, 0],
          color: '#0f172a',
          emissiveColor: '#0284c7',
          emissiveIntensity: 0.2,
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
          description: 'Heavy-duty CNC anodized aluminum chassis foundation with vibration dampeners.',
        },
        // 2. Central Quantum/Electromagnetic Transducer Core
        {
          id: 'custom-core',
          name: 'Primary Energy Conversion Transducer Core',
          layer: 'CORE',
          shape: 'sphere',
          position: [0, 0.5, 0],
          rotation: [0, 0, 0],
          scale: [1.8, 1.8, 1.8],
          explodedOffset: [0, 0, 0],
          color: '#38bdf8',
          emissiveColor: '#818cf8',
          emissiveIntensity: 0.9,
          materialType: 'glowing_core',
          opacity: 0.85,
          visible: true,
          highlighted: true,
          description: 'High-flux energy transducer utilizing electromagnetic induction and plasma resonance.',
        },
        // 3. Toroidal Magnetic Induction Field Coils
        {
          id: 'custom-coils',
          name: 'Resonant Magnetic Confinement Torus',
          layer: 'MECHANICAL',
          shape: 'torus',
          position: [0, 0.5, 0],
          rotation: [Math.PI / 2, 0, 0],
          scale: [2.8, 2.8, 0.5],
          explodedOffset: [0, 0.8, 0],
          color: '#d97706',
          emissiveColor: '#f59e0b',
          emissiveIntensity: 0.5,
          materialType: 'copper',
          opacity: 1.0,
          visible: true,
          description: 'Oxygen-free high-conductivity copper toroidal winding providing 12-Tesla inductive magnetic field.',
        },
        // 4. Multi-Layer Electronics Logic Substrate
        {
          id: 'custom-pcb',
          name: 'Neural Control & Telemetry Substrate Board',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [1.8, 0.2, 0],
          rotation: [0, 0, 0],
          scale: [1.8, 0.15, 2.8],
          explodedOffset: [1.2, 0.5, 0],
          color: '#065f46',
          emissiveColor: '#10b981',
          emissiveIntensity: 0.35,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
          description: 'Embedded FPGA logic matrix processing sensor telemetry and feedback loops.',
        },
        // 5. Thermal Heat Radiator Fins
        {
          id: 'custom-radiator',
          name: 'Stacked Aluminum Thermal Radiator Fin Array',
          layer: 'COOLING',
          shape: 'box',
          position: [-1.8, 0.4, 0],
          rotation: [0, 0, 0],
          scale: [1.6, 1.4, 2.4],
          explodedOffset: [-1.2, 0.6, 0],
          color: '#0284c7',
          emissiveColor: '#0ea5e9',
          emissiveIntensity: 0.25,
          materialType: 'aluminum',
          opacity: 0.95,
          visible: true,
          description: 'Multi-channel convective heat exchanger with heat-pipe integration.',
        },
        // 6. Transparent Protective Shielding Dome
        {
          id: 'custom-shield',
          name: 'Holographic Polycarbonate Containment Shield',
          layer: 'CASING',
          shape: 'sphere',
          position: [0, 0.6, 0],
          rotation: [0, 0, 0],
          scale: [4.4, 3.2, 4.4],
          explodedOffset: [0, 2.0, 0],
          color: '#06b6d4',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.25,
          materialType: 'hologram_glass',
          opacity: 0.2,
          transparent: true,
          visible: true,
          description: 'Anti-static impact-resistant protective dome with optical scan HUD overlay.',
        },
        // 7. Actuator Motor Drive
        {
          id: 'custom-actuator',
          name: 'Dual Harmonic Drive Kinetic Actuator',
          layer: 'MECHANICAL',
          shape: 'cylinder',
          position: [0, -0.1, 1.5],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.6, 1.8, 0.6],
          explodedOffset: [0, 0, 1.2],
          color: '#475569',
          materialType: 'metal',
          opacity: 1.0,
          visible: true,
        },
        // 8. Digital Telemetry Status Matrix
        {
          id: 'custom-display',
          name: 'Quantum Telemetry OLED Touch Interface',
          layer: 'ELECTRONICS',
          shape: 'box',
          position: [0, 0.1, -1.8],
          rotation: [Math.PI / 6, 0, 0],
          scale: [2.0, 0.1, 1.2],
          explodedOffset: [0, 0.6, -1.2],
          color: '#0f172a',
          emissiveColor: '#38bdf8',
          emissiveIntensity: 0.75,
          materialType: 'silicon',
          opacity: 1.0,
          visible: true,
          description: 'High-brightness graphical display presenting real-time system metrics, temperature, and power flow.',
        },
      ];
    }

    const guides = generateMaterialsAndBuildGuide({
      title: `3D Concept: ${title}`,
      conceptType,
      description: `Custom 3D procedural prototype synthesized from your specifications: "${cleanPrompt}".`,
      components,
    }, cleanPrompt);

    return {
      id,
      title: `3D Concept: ${title}`,
      conceptType,
      description: `Custom 3D procedural prototype synthesized from your specifications: "${cleanPrompt}". Features ${components.length} multi-layer interactive sub-assemblies with real-time telemetry inspection.`,
      dimensions,
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: cameraPos,
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: true,
      xRayCutaway: false,
      rotationSpeed: 0.5,
      autoRotate: true,
      selectedComponentId: components[0]?.id,
      highlightedComponentIds: components.filter((c) => c.highlighted).map((c) => c.id),
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: `Synthesized bespoke 3D conceptual prototype for: "${cleanPrompt}"`,
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // G. DYNAMIC 3D SCENE GENERATOR PIPELINE (UNDERSTANDING -> PLANNING -> GENERATION -> VALIDATION)
  public async generateDynamicSceneWithAI(
    userPrompt: string,
    quality: any = 'HIGH',
    preferredProvider?: any,
    imageUrl?: string
  ): Promise<HologramScene> {
    const prompt = userPrompt.trim();

    try {
      const manager = ThreeDGenerationManager.getInstance();
      const { scene } = await manager.generateModel(prompt, quality, preferredProvider, imageUrl);
      
      this.currentScene = scene;
      this.sceneStore.set(scene.id, scene);
      return scene;
    } catch (err: any) {
      console.info('[HologramEngine] 3D Generation pipeline fell back to procedural library:', err?.message || err);
      const fallbackScene = this.generateProceduralInventionScene(prompt);
      this.currentScene = fallbackScene;
      this.sceneStore.set(fallbackScene.id, fallbackScene);
      return fallbackScene;
    }
  }

  // H. ARCHITECTURAL BUILDING BLUEPRINT 3D SCENE
  public generateBuildingBlueprintScene(prompt?: string): HologramScene {
    const id = `SCENE-ARCH-BLUEPRINT-${Date.now().toString(36).toUpperCase()}`;
    const scene = this.generateProceduralInventionScene(prompt || 'Multi-Room Residential Apartment Building Blueprint');
    scene.id = id;
    scene.conceptType = 'BUILDING_BLUEPRINT';
    scene.title = 'Residential Floor Plan & Architectural Blueprint';
    return scene;
  }

  // I. DUPLEX VILLA 3D SCENE
  public generateDuplexVillaScene(prompt?: string): HologramScene {
    const id = `SCENE-ARCH-DUPLEX-${Date.now().toString(36).toUpperCase()}`;
    const scene = this.generateProceduralInventionScene(prompt || '2-Story Luxury Duplex Villa House Map with Rooms Estimate');
    scene.id = id;
    scene.conceptType = 'ARCHITECTURAL_MODEL';
    scene.title = '2-Story Luxury Duplex Villa Architecture';
    return scene;
  }

  // J. COMMERCIAL OFFICE 3D SCENE
  public generateCommercialOfficeScene(prompt?: string): HologramScene {
    const id = `SCENE-ARCH-OFFICE-${Date.now().toString(36).toUpperCase()}`;
    const scene = this.generateProceduralInventionScene(prompt || 'High-Tech Commercial Office Floorplan with Server Room');
    scene.id = id;
    scene.conceptType = 'ARCHITECTURAL_MODEL';
    scene.title = 'High-Tech Commercial Office Floor Plan';
    return scene;
  }

  // --------------------------------------------------------------------------
  // 3. APPLY MODIFICATIONS / VOICE TRANSFORMATIONS TO ACTIVE SCENE
  // --------------------------------------------------------------------------
  public applyActionToScene(action: HologramVoiceAction): {
    scene: HologramScene;
    spokenResponse: string;
  } {
    let scene = this.getCurrentScene();

    // If new scene creation is requested
    if (action.type === 'CREATE_SCENE') {
      if (action.conceptType === 'COOLING_SYSTEM') {
        scene = this.generateCoolingSystemScene();
      } else if (action.conceptType === 'ROBOTIC_ARM') {
        scene = this.generateRoboticArmScene();
      } else if (action.conceptType === 'JET_ENGINE') {
        scene = this.generateJetEngineScene();
      } else if (action.conceptType === 'QUANTUM_CORE') {
        scene = this.generateQuantumReactorScene();
      } else if (action.conceptType === 'BUILDING_BLUEPRINT' || action.conceptType === 'ARCHITECTURAL_MODEL' || action.conceptType === 'ROOM_ESTIMATE') {
        scene = this.generateBuildingBlueprintScene(action.customPrompt || action.spokenExplanation);
      } else if (action.conceptType === 'INVENTION_CONCEPT' || action.customPrompt) {
        scene = this.generateProceduralInventionScene(action.customPrompt || action.spokenExplanation || 'Custom Invention Prototype');
      } else {
        scene = this.generateCircuitBoardScene();
      }

      this.currentScene = scene;
      this.sceneStore.set(scene.id, scene);

      return {
        scene,
        spokenResponse: action.spokenExplanation || `Generated 3D ${scene.title}. All components and telemetry are online.`,
      };
    }

    // Mutate existing scene state
    scene.version++;
    scene.updatedAt = new Date().toISOString();

    let details = '';
    let responseText = action.spokenExplanation || 'Updated 3D scene.';

    switch (action.type) {
      case 'EXPLODE':
        scene.explodedFactor = action.explodedFactor !== undefined ? action.explodedFactor : 1.0;
        details = `Exploded view set to ${(scene.explodedFactor * 100).toFixed(0)}%`;
        responseText = 'Exploded view active. All sub-assemblies separated along component vectors.';
        break;

      case 'ASSEMBLE':
        scene.explodedFactor = 0.0;
        details = 'Exploded view collapsed to 0%';
        responseText = 'Components assembled into compact solid state.';
        break;

      case 'ROTATE':
        scene.rotationSpeed = (action.angleDegrees || 90) > 0 ? 0.8 : -0.8;
        details = `Rotated ${action.angleDegrees || 90}° along ${action.axis || 'Y'} axis`;
        responseText = `Rotating model ${action.angleDegrees || 90} degrees.`;
        break;

      case 'ZOOM':
        const currentPos = scene.cameraState.position;
        const factor = action.zoomFactor || 0.8;
        scene.cameraState.position = [
          currentPos[0] * factor,
          currentPos[1] * factor,
          currentPos[2] * factor,
        ];
        details = `Zoom adjusted by factor ${factor}`;
        responseText = factor < 1 ? 'Zoomed in on the 3D model.' : 'Zoomed out for global perspective.';
        break;

      case 'CUTAWAY_TOGGLE':
        scene.xRayCutaway = !scene.xRayCutaway;
        details = `X-Ray cutaway toggled to ${scene.xRayCutaway}`;
        responseText = scene.xRayCutaway ? 'X-Ray cutaway enabled. Outer casing is now translucent.' : 'Standard solid rendering restored.';
        break;

      case 'HOLOGRAM_MODE_TOGGLE':
        scene.hologramEffect = !scene.hologramEffect;
        details = `Hologram mode toggled to ${scene.hologramEffect}`;
        responseText = scene.hologramEffect ? 'Holographic display mode enabled with cybernetic scan reticles.' : 'Realistic material shading enabled.';
        break;

      case 'WIREFRAME_TOGGLE':
        scene.wireframeMode = !scene.wireframeMode;
        details = `Wireframe mode toggled to ${scene.wireframeMode}`;
        responseText = scene.wireframeMode ? 'Wireframe geometry enabled.' : 'Shaded polygon surface restored.';
        break;

      case 'HIGHLIGHT':
        const target = (action.targetComponent || '').toLowerCase();
        const matched = scene.components.find((c) =>
          c.name.toLowerCase().includes(target) || c.id.toLowerCase().includes(target)
        );
        if (matched) {
          scene.selectedComponentId = matched.id;
          scene.highlightedComponentIds = [matched.id];
          details = `Highlighted component: ${matched.name}`;
          responseText = `Focusing on ${matched.name}. ${matched.description || ''}`;
        } else {
          details = `Attempted highlight on ${target}`;
          responseText = `Component matching ${target} selected.`;
        }
        break;

      case 'HIDE_LAYER':
        if (action.targetLayer && scene.activeLayers[action.targetLayer] !== undefined) {
          scene.activeLayers[action.targetLayer] = false;
          details = `Hidden layer: ${action.targetLayer}`;
          responseText = `Hidden ${action.targetLayer.toLowerCase()} layer.`;
        }
        break;

      case 'SHOW_LAYER':
        if (action.targetLayer && scene.activeLayers[action.targetLayer] !== undefined) {
          scene.activeLayers[action.targetLayer] = true;
          details = `Restored layer: ${action.targetLayer}`;
          responseText = `Showing ${action.targetLayer.toLowerCase()} layer.`;
        }
        break;

      case 'MODIFY_COMPONENT':
        if (action.componentModification) {
          const { componentName, property, value } = action.componentModification;
          const comp = scene.components.find((c) =>
            c.name.toLowerCase().includes((componentName || '').toLowerCase())
          );
          if (comp) {
            if (property === 'scale' && Array.isArray(value)) {
              comp.scale = [
                comp.scale[0] * value[0],
                comp.scale[1] * value[1],
                comp.scale[2] * value[2],
              ];
            } else if (property === 'color' && typeof value === 'string') {
              comp.color = value;
            }
            comp.highlighted = true;
            details = `Modified ${comp.name} ${property}`;
            responseText = `Modified ${comp.name}. Applied new ${property} parameters.`;
          }
        }
        break;

      case 'RESET_CAMERA':
        scene.cameraState = {
          position: [7, 6, 7],
          target: [0, 0, 0],
          fov: 45,
        };
        scene.explodedFactor = 0.0;
        details = 'Camera reset to default isometric position';
        responseText = 'Camera and orientation reset to default.';
        break;

      case 'CHANGE_VIEW':
        if (action.viewPreset === 'BACK') {
          scene.cameraState.position = [0, 2, -9];
          responseText = 'Displaying rear view.';
        } else if (action.viewPreset === 'TOP') {
          scene.cameraState.position = [0, 10, 0.1];
          responseText = 'Displaying top-down orthogonal view.';
        } else if (action.viewPreset === 'FRONT') {
          scene.cameraState.position = [0, 2, 9];
          responseText = 'Displaying front perspective.';
        }
        details = `Camera changed to ${action.viewPreset} viewpoint`;
        break;
    }

    scene.history.unshift({
      timestamp: new Date().toISOString(),
      action: action.type,
      details: details || 'Applied voice transformation',
      modifiedBy: 'VOICE_COMMAND',
    });

    this.currentScene = scene;
    this.sceneStore.set(scene.id, scene);

    return {
      scene,
      spokenResponse: responseText,
    };
  }
}
