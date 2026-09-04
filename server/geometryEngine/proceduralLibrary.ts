import {
  HologramScene,
  HologramComponent,
  HologramConceptType,
  HologramLayer,
  ThreeDQualityLevel,
} from '../../src/types/hologram.js';
import { generateMaterialsAndBuildGuide } from '../materialsAndBuildGuideEngine.js';

/**
 * High-precision procedural 3D geometric builders.
 * Generates REAL recognizable multi-component physical geometry for iconic engineering & biological objects.
 */
export class Procedural3DLibrary {

  // =========================================================================
  // 1. IRON MAN ARC REACTOR (High-Fidelity Real Geometric Construction)
  // =========================================================================
  public static generateArcReactor(quality: ThreeDQualityLevel = 'HIGH'): HologramScene {
    const id = `SCENE-ARCREACTOR-${Date.now().toString(36).toUpperCase()}`;
    const coilCount = quality === 'LOW' ? 6 : quality === 'MEDIUM' ? 8 : quality === 'ULTRA' ? 12 : 10;
    const components: HologramComponent[] = [];

    // 1. Heavy Titanium Outer Protective Bezel & Housing Ring
    components.push({
      id: 'arc-outer-housing',
      name: 'Titanium-Alloy Outer Containment Housing',
      layer: 'CASING',
      shape: 'torus',
      position: [0, 0, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [6.8, 6.8, 1.2],
      explodedOffset: [0, 0, -2.2],
      color: '#475569',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.25,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      description: 'Machined grade-5 titanium outer containment ring with cryogenic micro-channel conduits.',
      dimensionsApprox: 'Ø120mm × 24mm',
    });

    // 2. Stainless Steel Retaining Mounting Rim
    components.push({
      id: 'arc-mounting-rim',
      name: 'Stainless Steel Flange Retaining Ring',
      layer: 'STRUCTURAL',
      shape: 'cylinder',
      position: [0, 0, -0.2],
      rotation: [Math.PI / 2, 0, 0],
      scale: [6.4, 0.4, 6.4],
      explodedOffset: [0, 0, -1.6],
      color: '#334155',
      emissiveColor: '#64748b',
      emissiveIntensity: 0.1,
      materialType: 'steel',
      opacity: 1.0,
      visible: true,
      description: 'Internal structural mounting plate with hex fastener points for thoracic chassis integration.',
      dimensionsApprox: 'Ø112mm × 6mm',
    });

    // 3. Concentric Magnetic Toroid Chamber Ring
    components.push({
      id: 'arc-toroid-chamber',
      name: 'Magnetic Toroidal Confinement Channel',
      layer: 'CORE',
      shape: 'torus',
      position: [0, 0, 0.05],
      rotation: [Math.PI / 2, 0, 0],
      scale: [4.8, 4.8, 0.65],
      explodedOffset: [0, 0, -0.6],
      color: '#0f172a',
      emissiveColor: '#00f0ff',
      emissiveIntensity: 0.4,
      materialType: 'ceramic',
      opacity: 0.95,
      visible: true,
      description: 'Superconducting toroidal channel producing a 14-Tesla magnetic plasma stabilization field.',
      dimensionsApprox: 'Ø88mm × 14mm',
    });

    // 4. Radial Copper Transformer Coils (Trigonometrically arrayed around circular track)
    const coilRadius = 2.4;
    for (let i = 0; i < coilCount; i++) {
      const angle = (i / coilCount) * Math.PI * 2;
      const cx = Math.cos(angle) * coilRadius;
      const cy = Math.sin(angle) * coilRadius;
      components.push({
        id: `arc-copper-coil-${i + 1}`,
        name: `Radial Copper Induction Coil #${i + 1}`,
        layer: 'ELECTRONICS',
        shape: 'torus',
        position: [cx, cy, 0.1],
        rotation: [0, 0, angle + Math.PI / 2],
        scale: [0.95, 0.6, 0.95],
        explodedOffset: [Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0.5],
        color: '#b45309',
        emissiveColor: '#d97706',
        emissiveIntensity: 0.6,
        materialType: 'copper',
        opacity: 1.0,
        visible: true,
        description: `High-purity OFHC copper coil segment wound with 240 turns of superconducting wire for resonant step-up conversion.`,
        dimensionsApprox: '18mm × 14mm × 12mm',
      });
    }

    // 5. Radial Steel Anchor Clamps / Brackets
    const bracketCount = quality === 'LOW' ? 4 : 6;
    const bracketRadius = 2.45;
    for (let i = 0; i < bracketCount; i++) {
      const angle = (i / bracketCount) * Math.PI * 2 + (Math.PI / bracketCount);
      const bx = Math.cos(angle) * bracketRadius;
      const by = Math.sin(angle) * bracketRadius;
      components.push({
        id: `arc-bracket-${i + 1}`,
        name: `Radial Alloy Anchor Bracket #${i + 1}`,
        layer: 'STRUCTURAL',
        shape: 'box',
        position: [bx, by, 0.22],
        rotation: [0, 0, angle],
        scale: [0.35, 0.95, 0.3],
        explodedOffset: [Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 1.0],
        color: '#64748b',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.3,
        materialType: 'titanium',
        opacity: 1.0,
        visible: true,
        description: 'Titanium-carbide retention clamp locking magnetic coil geometry under Lorentz forces.',
        dimensionsApprox: '8mm × 22mm × 6mm',
      });
    }

    // 6. Transparent Polycarbonate Protective Core Lens Face
    components.push({
      id: 'arc-protective-lens',
      name: 'Optic Quartz Flux Distribution Lens',
      layer: 'CASING',
      shape: 'cylinder',
      position: [0, 0, 0.3],
      rotation: [Math.PI / 2, 0, 0],
      scale: [3.8, 0.15, 3.8],
      explodedOffset: [0, 0, 1.8],
      color: '#0891b2',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.8,
      materialType: 'hologram_glass',
      opacity: 0.65,
      transparent: true,
      visible: true,
      description: 'Anti-reflective laser-etched quartz optic disc focusing high-energy photonic radiation.',
      dimensionsApprox: 'Ø65mm × 3mm',
    });

    // 7. Central Palladium-Vibranium Energy Core
    components.push({
      id: 'arc-central-core',
      name: 'Palladium-Isotope Plasma Emitter Core',
      layer: 'CORE',
      shape: 'cylinder',
      position: [0, 0, 0.1],
      rotation: [Math.PI / 2, 0, 0],
      scale: [2.2, 0.6, 2.2],
      explodedOffset: [0, 0, 1.0],
      color: '#38bdf8',
      emissiveColor: '#00f0ff',
      emissiveIntensity: 1.5,
      materialType: 'glowing_core',
      opacity: 0.95,
      visible: true,
      highlighted: true,
      description: 'High-density micro-fusion reaction cell delivering 3 Gigajoules/second sustained power output.',
      dimensionsApprox: 'Ø42mm × 18mm',
    });

    // 8. Inner Focus Ring / Beam Collimator
    components.push({
      id: 'arc-inner-collimator',
      name: 'Gold-Plated Inner Collimator Ring',
      layer: 'ELECTRONICS',
      shape: 'torus',
      position: [0, 0, 0.25],
      rotation: [Math.PI / 2, 0, 0],
      scale: [2.0, 2.0, 0.35],
      explodedOffset: [0, 0, 1.4],
      color: '#eab308',
      emissiveColor: '#facc15',
      emissiveIntensity: 0.7,
      materialType: 'gold',
      opacity: 1.0,
      visible: true,
      description: 'Gold sputtering flux collimator preventing stray electron cascade during rapid throttle shifts.',
      dimensionsApprox: 'Ø36mm × 7mm',
    });

    // 9. Rear Heat Sink & Cryo Radiator Matrix
    components.push({
      id: 'arc-rear-radiator',
      name: 'Cryogenic Vapor-Chamber Heat Dissipator',
      layer: 'COOLING',
      shape: 'cylinder',
      position: [0, 0, -0.6],
      rotation: [Math.PI / 2, 0, 0],
      scale: [5.6, 0.5, 5.6],
      explodedOffset: [0, 0, -2.8],
      color: '#1e293b',
      emissiveColor: '#06b6d4',
      emissiveIntensity: 0.2,
      materialType: 'aluminum',
      opacity: 1.0,
      visible: true,
      description: 'Micro-finned aluminum baseplate coupled with closed-loop liquid nitrogen circulation channels.',
      dimensionsApprox: 'Ø105mm × 10mm',
    });

    const guides = generateMaterialsAndBuildGuide({
      title: 'Stark Arc Reactor Mark-V Energy Core',
      conceptType: 'ARC_REACTOR',
      description: 'Self-sustaining magnetic confinement plasma micro-fusion reactor with titanium containment chassis, 10 radial OFHC copper induction coils, and palladium core.',
      components,
    }, 'Iron Man Arc Reactor');

    return {
      id,
      title: 'Stark Arc Reactor Mark-V Energy Core',
      conceptType: 'ARC_REACTOR',
      description: 'Self-sustaining magnetic confinement plasma micro-fusion reactor with titanium containment chassis, 10 radial OFHC copper induction coils, and palladium core.',
      dimensions: { x: 120, y: 120, z: 45, unit: 'mm', isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [0, 0, 12],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'arc-central-core',
      highlightedComponentIds: ['arc-central-core', 'arc-outer-housing'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      qualityLevel: quality,
      providerType: 'procedural',
      providerDescription: 'Procedural 3D Engine (Acoustic & Geometric Physics Synthesizer)',
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized high-fidelity procedural geometry for Stark Arc Reactor Mark-V Core.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // =========================================================================
  // 2. ROBOTIC ARTICULATED ARM (6-DOF Industrial Manipulator)
  // =========================================================================
  public static generateRoboticArm(quality: ThreeDQualityLevel = 'HIGH'): HologramScene {
    const id = `SCENE-ROBOTICARM-${Date.now().toString(36).toUpperCase()}`;
    const components: HologramComponent[] = [];

    // 1. Heavy Foundation Baseplate
    components.push({
      id: 'arm-base-pedestal',
      name: 'Cast Steel Mounting Pedestal Base',
      layer: 'STRUCTURAL',
      shape: 'cylinder',
      position: [0, -3.2, 0],
      rotation: [0, 0, 0],
      scale: [4.4, 0.8, 4.4],
      explodedOffset: [0, -1.8, 0],
      color: '#1e293b',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.15,
      materialType: 'steel',
      opacity: 1.0,
      visible: true,
      description: 'Solid cast-steel ground anchor base with 8 vibration-dampening M20 anchor bolt locations.',
      dimensionsApprox: 'Ø450mm × 80mm',
    });

    // 2. Base Azimuth Rotating Swivel Turret (J1 Axis)
    components.push({
      id: 'arm-turret-joint',
      name: 'J1 Harmonic Drive Swivel Turret',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [0, -2.4, 0],
      rotation: [0, 0, 0],
      scale: [3.2, 0.9, 3.2],
      explodedOffset: [0, -1.0, 0],
      color: '#0284c7',
      emissiveColor: '#0ea5e9',
      emissiveIntensity: 0.3,
      materialType: 'aluminum',
      opacity: 1.0,
      visible: true,
      description: '360° continuous rotation azimuth base driven by brushless AC servo motor with 160:1 harmonic gear ratio.',
      dimensionsApprox: 'Ø320mm × 120mm',
    });

    // 3. Main Shoulder Pivot Fork Joint (J2 Axis)
    components.push({
      id: 'arm-shoulder-joint',
      name: 'J2 High-Torque Shoulder Pivot Fork',
      layer: 'MECHANICAL',
      shape: 'box',
      position: [0, -1.5, 0],
      rotation: [0, 0, 0],
      scale: [2.6, 1.4, 2.2],
      explodedOffset: [-0.8, -0.4, 0],
      color: '#0369a1',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.3,
      materialType: 'aluminum',
      opacity: 1.0,
      visible: true,
      description: 'Dual-bearing cantilever fork capable of 480 Nm peak payload torque.',
      dimensionsApprox: '260mm × 140mm × 220mm',
    });

    // 4. Primary Lower Boom Segment (Carbon-Reinforced Linkage)
    components.push({
      id: 'arm-lower-boom',
      name: 'Primary Carbon-Composite Lower Arm Boom',
      layer: 'STRUCTURAL',
      shape: 'cylinder',
      position: [0.8, 0.2, 0],
      rotation: [0, 0, -Math.PI / 6],
      scale: [1.3, 3.6, 1.3],
      explodedOffset: [1.2, 0.4, 0],
      color: '#0f172a',
      emissiveColor: '#06b6d4',
      emissiveIntensity: 0.2,
      materialType: 'carbon_fiber',
      opacity: 1.0,
      visible: true,
      description: 'Toray T800 high-modulus carbon fiber structural tubular truss with internal cable harness conduits.',
      dimensionsApprox: 'Ø130mm × 420mm',
    });

    // 5. Shoulder Hydraulic / Servo Actuator Cylinder
    components.push({
      id: 'arm-shoulder-actuator',
      name: 'Dual-Action Electro-Hydraulic Linear Actuator',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [-0.6, -0.6, 0.8],
      rotation: [0, 0, Math.PI / 4],
      scale: [0.65, 2.4, 0.65],
      explodedOffset: [-0.8, 0, 1.2],
      color: '#d97706',
      emissiveColor: '#f59e0b',
      emissiveIntensity: 0.4,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      description: 'Precision ball-screw linear actuator with optical linear encoder providing 5-micron position repeatability.',
      dimensionsApprox: 'Ø65mm × 280mm',
    });

    // 6. Elbow Articulation Joint (J3 Axis)
    components.push({
      id: 'arm-elbow-joint',
      name: 'J3 Pitch Articulation Elbow Assembly',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [1.8, 1.8, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [1.6, 1.8, 1.6],
      explodedOffset: [1.8, 1.2, 0],
      color: '#0284c7',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.3,
      materialType: 'aluminum',
      opacity: 1.0,
      visible: true,
      description: 'High-rigidity planetary gearbox elbow pivot with integrated magnetic absolute angular encoder.',
      dimensionsApprox: 'Ø160mm × 180mm',
    });

    // 7. Upper Forearm Linkage
    components.push({
      id: 'arm-forearm-boom',
      name: 'Upper Forearm Segment',
      layer: 'STRUCTURAL',
      shape: 'cylinder',
      position: [0.8, 2.8, 0],
      rotation: [0, 0, Math.PI / 4],
      scale: [1.0, 3.2, 1.0],
      explodedOffset: [0.8, 2.0, 0],
      color: '#0f172a',
      emissiveColor: '#06b6d4',
      emissiveIntensity: 0.2,
      materialType: 'carbon_fiber',
      opacity: 1.0,
      visible: true,
      description: 'Lightweight forearm tube housing pneumatic air lines and 24V bus wiring.',
      dimensionsApprox: 'Ø100mm × 360mm',
    });

    // 8. 3-Axis Wrist Gimbal Pitch-Roll Unit (J4 / J5 / J6)
    components.push({
      id: 'arm-wrist-gimbal',
      name: '3-Axis Integrated Wrist Gimbal Flange',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [-0.4, 3.8, 0],
      rotation: [0, 0, 0],
      scale: [1.2, 1.0, 1.2],
      explodedOffset: [-0.6, 2.8, 0],
      color: '#475569',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.35,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      description: 'Compact hollow-shaft wrist assembly providing ±180° pitch, ±180° yaw, and 360° roll manipulation.',
      dimensionsApprox: 'Ø120mm × 100mm',
    });

    // 9. End Effector Tooling Master Coupler
    components.push({
      id: 'arm-tool-coupler',
      name: 'ISO-9409 Quick-Change End Effector Chuck',
      layer: 'STRUCTURAL',
      shape: 'cylinder',
      position: [-0.4, 4.4, 0],
      rotation: [0, 0, 0],
      scale: [1.1, 0.35, 1.1],
      explodedOffset: [-0.6, 3.4, 0],
      color: '#eab308',
      emissiveColor: '#facc15',
      emissiveIntensity: 0.5,
      materialType: 'gold',
      opacity: 1.0,
      visible: true,
      description: 'Pneumatic tool-changer interface with 8 signal pass-through gold pins.',
      dimensionsApprox: 'Ø110mm × 35mm',
    });

    // 10. Articulated Left Gripper Claw Finger
    components.push({
      id: 'arm-left-finger',
      name: 'Left Tactile Robotic Gripper Finger',
      layer: 'MECHANICAL',
      shape: 'claw',
      position: [-0.85, 5.0, 0],
      rotation: [0, 0, -0.2],
      scale: [0.4, 1.5, 0.45],
      explodedOffset: [-1.8, 4.2, 0],
      color: '#06b6d4',
      emissiveColor: '#22d3ee',
      emissiveIntensity: 0.6,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      highlighted: true,
      description: 'Dual-jointed robotic gripping claw lined with capacitive tactile pressure sensors.',
      dimensionsApprox: '40mm × 150mm × 45mm',
    });

    // 11. Articulated Right Gripper Claw Finger
    components.push({
      id: 'arm-right-finger',
      name: 'Right Tactile Robotic Gripper Finger',
      layer: 'MECHANICAL',
      shape: 'claw',
      position: [0.05, 5.0, 0],
      rotation: [0, 0, 0.2],
      scale: [0.4, 1.5, 0.45],
      explodedOffset: [0.8, 4.2, 0],
      color: '#06b6d4',
      emissiveColor: '#22d3ee',
      emissiveIntensity: 0.6,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      highlighted: true,
      description: 'Opposing precision gripper finger with silicon high-friction grasping pad.',
      dimensionsApprox: '40mm × 150mm × 45mm',
    });

    // 12. End-Effector High-Precision Lidar & Optical Camera Sensor
    components.push({
      id: 'arm-vision-sensor',
      name: 'Micro-Stereo Depth Camera & Laser Pointer',
      layer: 'ELECTRONICS',
      shape: 'box',
      position: [-0.4, 4.65, 0.45],
      rotation: [0, 0, 0],
      scale: [0.5, 0.35, 0.35],
      explodedOffset: [-0.6, 3.8, 1.2],
      color: '#10b981',
      emissiveColor: '#34d399',
      emissiveIntensity: 0.9,
      materialType: 'silicon',
      opacity: 1.0,
      visible: true,
      description: 'Real-time spatial object tracking optical camera with RGBD depth projection.',
      dimensionsApprox: '50mm × 35mm × 35mm',
    });

    const guides = generateMaterialsAndBuildGuide({
      title: '6-DOF Precision Articulated Robotic Arm',
      conceptType: 'ROBOTIC_ARM',
      description: 'Multi-axis industrial carbon-composite robotic manipulator with harmonic-drive joints, electro-hydraulic booster, and sensory gripper end-effector.',
      components,
    }, 'Robotic Arm');

    return {
      id,
      title: '6-DOF Precision Articulated Robotic Arm',
      conceptType: 'ROBOTIC_ARM',
      description: 'Multi-axis industrial carbon-composite robotic manipulator with harmonic-drive joints, electro-hydraulic booster, and sensory gripper end-effector.',
      dimensions: { x: 450, y: 920, z: 450, unit: 'mm', isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [6, 4, 10],
        target: [0, 1.5, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'arm-left-finger',
      highlightedComponentIds: ['arm-left-finger', 'arm-right-finger'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      qualityLevel: quality,
      providerType: 'procedural',
      providerDescription: 'Procedural 3D Engine (Kinematic Articulation Synthesizer)',
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized 6-DOF robotic manipulator geometry with realistic articulated linkages and dual gripper.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // =========================================================================
  // 3. CIRCUIT BOARD (Multi-Layer High-Speed PCB Architecture)
  // =========================================================================
  public static generateCircuitBoard(quality: ThreeDQualityLevel = 'HIGH'): HologramScene {
    const id = `SCENE-CIRCUITBOARD-${Date.now().toString(36).toUpperCase()}`;
    const components: HologramComponent[] = [];

    // 1. 8-Layer FR4 Glass-Epoxy PCB Substrate
    components.push({
      id: 'pcb-substrate-board',
      name: '8-Layer FR4 High-Tg Matte Black PCB Substrate',
      layer: 'STRUCTURAL',
      shape: 'pcb_substrate',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [9.0, 0.25, 7.0],
      explodedOffset: [0, -1.2, 0],
      color: '#064e3b',
      emissiveColor: '#059669',
      emissiveIntensity: 0.15,
      materialType: 'pcb_matte',
      opacity: 1.0,
      visible: true,
      description: 'High-density interconnect (HDI) multilayer printed circuit board with blind and buried micro-vias.',
      dimensionsApprox: '180mm × 5mm × 140mm',
    });

    // 2. Central Neural AI SoC / CPU Core Processor
    components.push({
      id: 'pcb-central-soc',
      name: 'Octa-Core Neural Processing SoC (Ultron-X1 Silicon)',
      layer: 'CORE',
      shape: 'chip',
      position: [-0.6, 0.35, -0.4],
      rotation: [0, 0, 0],
      scale: [2.8, 0.45, 2.8],
      explodedOffset: [-0.6, 1.2, -0.4],
      color: '#1e293b',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.85,
      materialType: 'silicon',
      opacity: 1.0,
      visible: true,
      highlighted: true,
      description: '3nm FinFET monolithic processor with integrated NPU accelerators delivering 120 TOPS inference throughput.',
      dimensionsApprox: '38mm × 8mm × 38mm',
    });

    // 3. Copper Vapor-Chamber Heat Spreader Plate over SoC
    components.push({
      id: 'pcb-soc-heatsink',
      name: 'Nickel-Plated Copper Vapor-Chamber Heat Spreader',
      layer: 'COOLING',
      shape: 'box',
      position: [-0.6, 0.75, -0.4],
      rotation: [0, 0, 0],
      scale: [2.9, 0.3, 2.9],
      explodedOffset: [-0.6, 2.2, -0.4],
      color: '#b45309',
      emissiveColor: '#d97706',
      emissiveIntensity: 0.3,
      materialType: 'copper',
      opacity: 1.0,
      visible: true,
      description: 'Direct-contact vapor chamber dissipating up to 140W thermal design power (TDP).',
      dimensionsApprox: '40mm × 5mm × 40mm',
    });

    // 4. DDR5 Quad-Channel High-Speed RAM IC Modules
    for (let i = 0; i < 4; i++) {
      const rx = 2.4;
      const rz = -2.0 + i * 1.3;
      components.push({
        id: `pcb-ram-chip-${i + 1}`,
        name: `LPDDR5X 16GB Memory Module #${i + 1}`,
        layer: 'ELECTRONICS',
        shape: 'chip',
        position: [rx, 0.28, rz],
        rotation: [0, 0, 0],
        scale: [1.2, 0.2, 0.9],
        explodedOffset: [rx + 1.2, 0.8, rz],
        color: '#0f172a',
        emissiveColor: '#06b6d4',
        emissiveIntensity: 0.4,
        materialType: 'silicon',
        opacity: 1.0,
        visible: true,
        description: `8533 MT/s ultra-fast unified memory IC providing 136 GB/s memory bandwidth per channel.`,
        dimensionsApprox: '14mm × 3mm × 10mm',
      });
    }

    // 5. 6-Phase VRM Solid Electrolytic Capacitors (Gold Cans)
    for (let i = 0; i < 6; i++) {
      const cx = -3.2;
      const cz = -2.2 + i * 0.9;
      components.push({
        id: `pcb-capacitor-${i + 1}`,
        name: `560µF 6.3V Solid Polymer Capacitor #${i + 1}`,
        layer: 'ELECTRONICS',
        shape: 'capacitor',
        position: [cx, 0.55, cz],
        rotation: [0, 0, 0],
        scale: [0.65, 0.85, 0.65],
        explodedOffset: [cx - 1.2, 0.8, cz],
        color: '#b45309',
        emissiveColor: '#eab308',
        emissiveIntensity: 0.45,
        materialType: 'aluminum',
        opacity: 1.0,
        visible: true,
        description: 'Ultra-low ESR solid conductive polymer aluminum capacitor for high-frequency VRM ripple smoothing.',
        dimensionsApprox: 'Ø8mm × 12mm',
      });
    }

    // 6. Ferrite Shielded Power Choke Inductors
    for (let i = 0; i < 4; i++) {
      const ix = -2.3;
      const iz = -1.6 + i * 1.1;
      components.push({
        id: `pcb-inductor-${i + 1}`,
        name: `Ferrite Core Power Inductor 0.22µH #${i + 1}`,
        layer: 'ELECTRONICS',
        shape: 'box',
        position: [ix, 0.45, iz],
        rotation: [0, 0, 0],
        scale: [0.75, 0.65, 0.75],
        explodedOffset: [ix - 0.6, 0.9, iz],
        color: '#334155',
        emissiveColor: '#64748b',
        emissiveIntensity: 0.2,
        materialType: 'ceramic',
        opacity: 1.0,
        visible: true,
        description: 'High-current molded power choke capable of 45A saturation current per phase.',
        dimensionsApprox: '10mm × 9mm × 10mm',
      });
    }

    // 7. PCIe Gen5 x16 Expansion Slot Connector
    components.push({
      id: 'pcb-pcie-slot',
      name: 'PCIe 5.0 x16 High-Speed Card Slot',
      layer: 'STRUCTURAL',
      shape: 'box',
      position: [0, 0.5, 2.6],
      rotation: [0, 0, 0],
      scale: [6.4, 0.7, 0.65],
      explodedOffset: [0, 1.2, 1.4],
      color: '#1e293b',
      emissiveColor: '#eab308',
      emissiveIntensity: 0.4,
      materialType: 'plastic',
      opacity: 1.0,
      visible: true,
      description: 'Gold-plated 164-pin surface mount connector delivering 128 GB/s bidirectional throughput.',
      dimensionsApprox: '110mm × 10mm × 9mm',
    });

    // 8. USB4 / Thunderbolt-4 Dual I/O Port Block
    components.push({
      id: 'pcb-usb4-port',
      name: 'Shielded Dual USB4 / 40Gbps Type-C Receptacle',
      layer: 'CASING',
      shape: 'box',
      position: [-4.2, 0.45, 1.6],
      rotation: [0, 0, 0],
      scale: [0.8, 0.65, 1.8],
      explodedOffset: [-1.6, 0.6, 1.6],
      color: '#475569',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.3,
      materialType: 'steel',
      opacity: 1.0,
      visible: true,
      description: 'Full EMI-shielded stainless steel receptacle supporting 100W USB-PD and 40Gbps dual DisplayPort signals.',
      dimensionsApprox: '12mm × 9mm × 24mm',
    });

    const guides = generateMaterialsAndBuildGuide({
      title: 'Neural Computing Multi-Layer PCB Motherboard',
      conceptType: 'CIRCUIT_BOARD',
      description: 'High-density 8-layer HDI printed circuit board with FinFET SoC, 6-phase VRM power delivery, quad LPDDR5X channels, and PCIe Gen5 bus.',
      components,
    }, 'Circuit Board');

    return {
      id,
      title: 'Neural Computing Multi-Layer PCB Motherboard',
      conceptType: 'CIRCUIT_BOARD',
      description: 'High-density 8-layer HDI printed circuit board with FinFET SoC, 6-phase VRM power delivery, quad LPDDR5X channels, and PCIe Gen5 bus.',
      dimensions: { x: 180, y: 22, z: 140, unit: 'mm', isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [0, 8, 8],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'pcb-central-soc',
      highlightedComponentIds: ['pcb-central-soc', 'pcb-substrate-board'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      qualityLevel: quality,
      providerType: 'procedural',
      providerDescription: 'Procedural 3D Engine (Micro-Electronic Topology Synthesizer)',
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized high-density circuit board geometry with realistic surface-mount components, chips, and VRM capacitors.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // =========================================================================
  // 4. FUTURISTIC ELECTRIC SUPERCAR (Aerodynamic Vehicle Chassis)
  // =========================================================================
  public static generateCar(quality: ThreeDQualityLevel = 'HIGH'): HologramScene {
    const id = `SCENE-CAR-${Date.now().toString(36).toUpperCase()}`;
    const components: HologramComponent[] = [];

    // 1. Aerodynamic Carbon-Fiber Lower Monocoque Chassis
    components.push({
      id: 'car-chassis-monocoque',
      name: 'Carbon-Fiber Lower Monocoque Chassis',
      layer: 'STRUCTURAL',
      shape: 'box',
      position: [0, -0.4, 0],
      rotation: [0, 0, 0],
      scale: [7.8, 0.65, 3.8],
      explodedOffset: [0, -1.6, 0],
      color: '#0f172a',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.15,
      materialType: 'carbon_fiber',
      opacity: 1.0,
      visible: true,
      description: 'Torsional rigidity rated at 65,000 Nm/deg with integrated aluminum crash crumple boxes.',
      dimensionsApprox: '4600mm × 380mm × 2100mm',
    });

    // 2. Sculpted Upper Bodywork & Aero Fenders
    components.push({
      id: 'car-body-shell',
      name: 'Sculpted Titanium-Composite Aerodynamic Body Shell',
      layer: 'CASING',
      shape: 'box',
      position: [0, 0.4, 0],
      rotation: [0, 0, 0],
      scale: [7.2, 0.9, 3.6],
      explodedOffset: [0, 1.4, 0],
      color: '#0284c7',
      emissiveColor: '#0ea5e9',
      emissiveIntensity: 0.35,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      description: 'Wind-tunnel optimized aerodynamic contouring achieving ultra-low 0.19 drag coefficient.',
      dimensionsApprox: '4400mm × 540mm × 2000mm',
    });

    // 3. Tear-Drop Panoramic Glass Cockpit Canopy
    components.push({
      id: 'car-cockpit-canopy',
      name: 'Electrochromic Smart Quartz Glass Cockpit Canopy',
      layer: 'CASING',
      shape: 'dome',
      position: [-0.2, 1.1, 0],
      rotation: [0, 0, 0],
      scale: [3.8, 1.1, 2.8],
      explodedOffset: [0, 2.4, 0],
      color: '#0891b2',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.6,
      materialType: 'hologram_glass',
      opacity: 0.65,
      transparent: true,
      visible: true,
      description: 'Solar-attenuating toughened laminated glass bubble with heads-up display projection coating.',
      dimensionsApprox: '2200mm × 650mm × 1600mm',
    });

    // 4. Floor-Mounted 800V Solid-State Battery Pack
    components.push({
      id: 'car-battery-pack',
      name: '800V 120kWh Solid-State Lithium Battery Matrix',
      layer: 'CORE',
      shape: 'box',
      position: [0, -0.65, 0],
      rotation: [0, 0, 0],
      scale: [5.2, 0.35, 3.2],
      explodedOffset: [0, -2.4, 0],
      color: '#10b981',
      emissiveColor: '#34d399',
      emissiveIntensity: 0.8,
      materialType: 'glowing_core',
      opacity: 0.95,
      visible: true,
      highlighted: true,
      description: 'Silicon-anode cell pack delivering 650 miles range with 350kW ultra-fast DC charging capability.',
      dimensionsApprox: '3100mm × 210mm × 1800mm',
    });

    // 5. 4 Performance Low-Profile Wheels & Alloy Rims
    const wheelPositions: [number, number, number][] = [
      [2.6, -0.5, 1.9],   // Front-Right
      [2.6, -0.5, -1.9],  // Front-Left
      [-2.6, -0.5, 1.9],  // Rear-Right
      [-2.6, -0.5, -1.9], // Rear-Left
    ];

    const wheelNames = ['Front-Right 21" Alloy Wheel', 'Front-Left 21" Alloy Wheel', 'Rear-Right 22" Alloy Wheel', 'Rear-Left 22" Alloy Wheel'];

    wheelPositions.forEach((pos, idx) => {
      components.push({
        id: `car-wheel-${idx + 1}`,
        name: wheelNames[idx],
        layer: 'MECHANICAL',
        shape: 'cylinder',
        position: pos,
        rotation: [Math.PI / 2, 0, 0],
        scale: [1.8, 0.75, 1.8],
        explodedOffset: [pos[0] * 1.3, pos[1], pos[2] * 1.8],
        color: '#1e293b',
        emissiveColor: '#eab308',
        emissiveIntensity: 0.3,
        materialType: 'aluminum',
        opacity: 1.0,
        visible: true,
        description: 'Forged magnesium-alloy turbine rim wrapped with Michelin Pilot Sport Cup-2 track tire.',
        dimensionsApprox: 'Ø530mm × 295mm',
      });
    });

    // 6. Dual Front Projector Laser Headlights
    components.push({
      id: 'car-headlights-front',
      name: 'Matrix Matrix-LED Laser Headlight Array',
      layer: 'ELECTRONICS',
      shape: 'box',
      position: [3.8, 0.15, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.25, 3.2],
      explodedOffset: [5.2, 0.15, 0],
      color: '#38bdf8',
      emissiveColor: '#00f0ff',
      emissiveIntensity: 1.6,
      materialType: 'glowing_core',
      opacity: 1.0,
      visible: true,
      description: '600-meter throw adaptive laser beam with auto-dimming active glare prevention.',
      dimensionsApprox: '240mm × 150mm × 1900mm',
    });

    // 7. Active Aerodynamic Rear Wing / Diffuser
    components.push({
      id: 'car-rear-spoiler',
      name: 'Active Carbon-Fiber Aero Downforce Wing',
      layer: 'MECHANICAL',
      shape: 'box',
      position: [-3.8, 0.9, 0],
      rotation: [0, 0, 0.1],
      scale: [0.9, 0.15, 3.6],
      explodedOffset: [-5.2, 1.6, 0],
      color: '#0f172a',
      emissiveColor: '#f43f5e',
      emissiveIntensity: 0.6,
      materialType: 'carbon_fiber',
      opacity: 1.0,
      visible: true,
      description: 'Hydraulically actuated dual-element wing providing up to 850kg downforce at 300 km/h.',
      dimensionsApprox: '550mm × 90mm × 2100mm',
    });

    const guides = generateMaterialsAndBuildGuide({
      title: 'Hyper-EV Aerodynamic Supercar Prototype',
      conceptType: 'VEHICLE_DESIGN',
      description: 'All-electric hypercar with carbon-fiber monocoque, 800V solid-state battery floor, active aero wing, and quad independent wheel motors.',
      components,
    }, 'Electric Supercar');

    return {
      id,
      title: 'Hyper-EV Aerodynamic Supercar Prototype',
      conceptType: 'VEHICLE_DESIGN',
      description: 'All-electric hypercar with carbon-fiber monocoque, 800V solid-state battery floor, active aero wing, and quad independent wheel motors.',
      dimensions: { x: 4600, y: 1200, z: 2100, unit: 'mm', isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [8, 5, 8],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'car-body-shell',
      highlightedComponentIds: ['car-body-shell', 'car-battery-pack'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      qualityLevel: quality,
      providerType: 'procedural',
      providerDescription: 'Procedural 3D Engine (Aerodynamic Vehicle Synthesizer)',
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized electric supercar geometry with carbon monocoque, 4 independent wheels, battery floor, and laser matrix optics.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // =========================================================================
  // 5. HUMAN HEART (Anatomical Biological Engine)
  // =========================================================================
  public static generateHumanHeart(quality: ThreeDQualityLevel = 'HIGH'): HologramScene {
    const id = `SCENE-HEART-${Date.now().toString(36).toUpperCase()}`;
    const components: HologramComponent[] = [];

    // 1. Left Ventricle Muscular Chamber (Thick Myocardium Wall)
    components.push({
      id: 'heart-left-ventricle',
      name: 'Left Ventricle (Ventriculus Sinister)',
      layer: 'CORE',
      shape: 'heart_ventricle',
      position: [0.6, -0.6, 0.2],
      rotation: [0, 0, -0.2],
      scale: [2.6, 3.4, 2.4],
      explodedOffset: [1.2, -1.0, 0.4],
      color: '#dc2626',
      emissiveColor: '#ef4444',
      emissiveIntensity: 0.4,
      materialType: 'ceramic',
      opacity: 0.95,
      visible: true,
      highlighted: true,
      description: 'Primary systemic pumping chamber with 12mm thick myocardium generating 120 mmHg systolic pressure.',
      dimensionsApprox: '65mm × 85mm × 60mm',
    });

    // 2. Right Ventricle Chamber (Pulmonary Circuit Pump)
    components.push({
      id: 'heart-right-ventricle',
      name: 'Right Ventricle (Ventriculus Dexter)',
      layer: 'CORE',
      shape: 'heart_ventricle',
      position: [-0.9, -0.5, 0.4],
      rotation: [0, 0, 0.15],
      scale: [2.2, 3.0, 2.0],
      explodedOffset: [-1.4, -0.8, 0.6],
      color: '#b91c1c',
      emissiveColor: '#f87171',
      emissiveIntensity: 0.3,
      materialType: 'ceramic',
      opacity: 0.95,
      visible: true,
      description: 'Crescent-shaped pulmonary pump propelling deoxygenated blood through the pulmonary valve into the lungs.',
      dimensionsApprox: '55mm × 75mm × 50mm',
    });

    // 3. Left Atrium Receiving Chamber
    components.push({
      id: 'heart-left-atrium',
      name: 'Left Atrium (Atrium Sinistrum)',
      layer: 'STRUCTURAL',
      shape: 'sphere',
      position: [0.8, 1.2, -0.6],
      rotation: [0, 0, 0],
      scale: [2.0, 1.8, 1.8],
      explodedOffset: [1.4, 1.6, -1.0],
      color: '#991b1b',
      emissiveColor: '#f87171',
      emissiveIntensity: 0.25,
      materialType: 'ceramic',
      opacity: 0.9,
      visible: true,
      description: 'Receives oxygen-rich blood from the four pulmonary veins at low pressure (~8 mmHg).',
      dimensionsApprox: '50mm × 45mm × 45mm',
    });

    // 4. Right Atrium Receiving Chamber & SA Node
    components.push({
      id: 'heart-right-atrium',
      name: 'Right Atrium with Sinoatrial (SA) Pacemaker Node',
      layer: 'STRUCTURAL',
      shape: 'sphere',
      position: [-1.1, 1.1, -0.2],
      rotation: [0, 0, 0],
      scale: [2.1, 1.9, 1.9],
      explodedOffset: [-1.6, 1.4, -0.4],
      color: '#7f1d1d',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.5,
      materialType: 'ceramic',
      opacity: 0.9,
      visible: true,
      description: 'Receives systemic venous return from superior/inferior vena cava. Houses the SA nodal pacemaker.',
      dimensionsApprox: '52mm × 48mm × 48mm',
    });

    // 5. Ascending Aorta Arch with Branching Arteries
    components.push({
      id: 'heart-aorta-arch',
      name: 'Aorta Arch & Brachiocephalic Trunk (Arcus Aortae)',
      layer: 'MECHANICAL',
      shape: 'aorta_arch',
      position: [0.1, 2.4, 0],
      rotation: [0, 0, 0],
      scale: [2.8, 2.2, 1.8],
      explodedOffset: [0, 2.4, 0],
      color: '#ef4444',
      emissiveColor: '#f87171',
      emissiveIntensity: 0.6,
      materialType: 'plastic',
      opacity: 0.95,
      visible: true,
      description: 'Main systemic high-pressure arterial conduit distributing oxygenated blood throughout the human body.',
      dimensionsApprox: '70mm × 55mm × 45mm',
    });

    // 6. Superior & Inferior Vena Cava Large Veins
    components.push({
      id: 'heart-vena-cava',
      name: 'Superior & Inferior Vena Cava Main Veins',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [-1.6, 1.6, -0.8],
      rotation: [0, 0, 0.1],
      scale: [1.2, 3.8, 1.2],
      explodedOffset: [-2.4, 1.8, -1.2],
      color: '#1d4ed8',
      emissiveColor: '#3b82f6',
      emissiveIntensity: 0.6,
      materialType: 'plastic',
      opacity: 0.95,
      visible: true,
      description: 'Large capacitance venous vessels returning deoxygenated systemic blood to the right atrium.',
      dimensionsApprox: 'Ø30mm × 95mm',
    });

    // 7. Pulmonary Artery Trunk
    components.push({
      id: 'heart-pulmonary-trunk',
      name: 'Pulmonary Artery Bifurcation Trunk (Truncus Pulmonalis)',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [-0.4, 1.8, 0.8],
      rotation: [0.4, 0, -0.3],
      scale: [1.3, 2.4, 1.3],
      explodedOffset: [-0.6, 2.2, 1.6],
      color: '#2563eb',
      emissiveColor: '#60a5fa',
      emissiveIntensity: 0.5,
      materialType: 'plastic',
      opacity: 0.95,
      visible: true,
      description: 'Carries low-oxygen blood from the right ventricle into the left and right lung capillary beds.',
      dimensionsApprox: 'Ø32mm × 60mm',
    });

    // 8. Coronary Blood Vessels Network (LAD & Circumflex Arteries)
    components.push({
      id: 'heart-coronary-arteries',
      name: 'Left Anterior Descending (LAD) Coronary Artery Network',
      layer: 'TRACES',
      shape: 'torus',
      position: [0.1, -0.2, 1.2],
      rotation: [0.6, 0.3, 0],
      scale: [2.2, 2.2, 0.3],
      explodedOffset: [0.2, 0, 2.2],
      color: '#f59e0b',
      emissiveColor: '#fbbf24',
      emissiveIntensity: 0.75,
      materialType: 'gold',
      opacity: 1.0,
      visible: true,
      description: 'Coronary circulation tree supplying oxygen and nutrients directly to the active myocardium muscle fibers.',
      dimensionsApprox: 'Ø55mm × 8mm',
    });

    const guides = generateMaterialsAndBuildGuide({
      title: 'Human Cardiac Engine (Anatomical 3D Model)',
      conceptType: 'BIOLOGICAL_ANATOMY',
      description: 'Anatomically structured 3D model of the human heart showing left/right ventricles, atria chambers, aortic arch, vena cava, pulmonary trunk, and coronary vasculature.',
      components,
    }, 'Human Heart');

    return {
      id,
      title: 'Human Cardiac Engine (Anatomical 3D Model)',
      conceptType: 'BIOLOGICAL_ANATOMY',
      description: 'Anatomically structured 3D model of the human heart showing left/right ventricles, atria chambers, aortic arch, vena cava, pulmonary trunk, and coronary vasculature.',
      dimensions: { x: 120, y: 140, z: 95, unit: 'mm', isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [0, 2, 9],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'heart-left-ventricle',
      highlightedComponentIds: ['heart-left-ventricle', 'heart-aorta-arch'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      qualityLevel: quality,
      providerType: 'procedural',
      providerDescription: 'Procedural 3D Engine (Anatomical Morphometry Synthesizer)',
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized anatomical heart geometry with distinct muscular ventricles, atria, aortic arch, vena cava, and coronary vascular traces.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // =========================================================================
  // 6. DRONE / QUADCOPTER (Autonomous UAV Flight Assembly)
  // =========================================================================
  public static generateDrone(quality: ThreeDQualityLevel = 'HIGH'): HologramScene {
    const id = `SCENE-DRONE-${Date.now().toString(36).toUpperCase()}`;
    const components: HologramComponent[] = [];

    // 1. Central Carbon-Fiber Fuselage Core
    components.push({
      id: 'drone-fuselage-core',
      name: 'Molded Carbon-Fiber Fuselage Core',
      layer: 'STRUCTURAL',
      shape: 'box',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [2.6, 0.9, 2.6],
      explodedOffset: [0, 0.6, 0],
      color: '#0f172a',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.2,
      materialType: 'carbon_fiber',
      opacity: 1.0,
      visible: true,
      description: 'Waterproof IP67 avionics enclosure housing flight controller, IMU sensors, and 5.8GHz video telemetry.',
      dimensionsApprox: '130mm × 45mm × 130mm',
    });

    // 2. Flight Controller & Navigation SoC
    components.push({
      id: 'drone-flight-controller',
      name: 'Triple-Redundant Autopilot Flight Controller SoC',
      layer: 'CORE',
      shape: 'chip',
      position: [0, 0.35, 0],
      rotation: [0, 0, 0],
      scale: [1.2, 0.25, 1.2],
      explodedOffset: [0, 1.4, 0],
      color: '#06b6d4',
      emissiveColor: '#22d3ee',
      emissiveIntensity: 0.8,
      materialType: 'silicon',
      opacity: 1.0,
      visible: true,
      highlighted: true,
      description: 'Dual Cortex-M7 processors running Kalman filter state estimation with centimeter-level RTK GPS positioning.',
      dimensionsApprox: '36mm × 8mm × 36mm',
    });

    // 3. 4 Tubular Carbon Motor Arms (X-Configuration, 45 degrees offset)
    const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    const armRadius = 2.8;

    armAngles.forEach((angle, idx) => {
      const ax = Math.cos(angle) * (armRadius / 2);
      const az = Math.sin(angle) * (armRadius / 2);
      const mx = Math.cos(angle) * armRadius;
      const mz = Math.sin(angle) * armRadius;

      // Arm tube
      components.push({
        id: `drone-arm-${idx + 1}`,
        name: `Carbon Boom Arm #${idx + 1}`,
        layer: 'STRUCTURAL',
        shape: 'cylinder',
        position: [ax, 0, az],
        rotation: [Math.PI / 2, 0, -angle + Math.PI / 2],
        scale: [0.4, armRadius, 0.4],
        explodedOffset: [Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4],
        color: '#1e293b',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.15,
        materialType: 'carbon_fiber',
        opacity: 1.0,
        visible: true,
        description: 'Twill-weave carbon fiber structural boom with hollow routing for 60A motor signal wiring.',
        dimensionsApprox: 'Ø20mm × 140mm',
      });

      // Brushless Outrunner Motor
      components.push({
        id: `drone-motor-${idx + 1}`,
        name: `Brushless Outrunner Motor #${idx + 1} (2207 1950KV)`,
        layer: 'MECHANICAL',
        shape: 'cylinder',
        position: [mx, 0.3, mz],
        rotation: [0, 0, 0],
        scale: [0.95, 0.7, 0.95],
        explodedOffset: [Math.cos(angle) * 2.2, 0.8, Math.sin(angle) * 2.2],
        color: '#b45309',
        emissiveColor: '#d97706',
        emissiveIntensity: 0.45,
        materialType: 'copper',
        opacity: 1.0,
        visible: true,
        description: 'High-torque brushless DC motor with N52SH neodymium curved magnets and balanced titanium shaft.',
        dimensionsApprox: 'Ø28mm × 21mm',
      });

      // Dual-Blade Carbon Propeller
      components.push({
        id: `drone-prop-${idx + 1}`,
        name: `Carbon-Nylon Propeller #${idx + 1} (5.1" Tri-Blade)`,
        layer: 'MECHANICAL',
        shape: 'fan_blade',
        position: [mx, 0.75, mz],
        rotation: [0, idx * (Math.PI / 2), 0],
        scale: [2.6, 0.1, 0.4],
        explodedOffset: [Math.cos(angle) * 2.6, 1.8, Math.sin(angle) * 2.6],
        color: '#0284c7',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.3,
        materialType: 'plastic',
        opacity: 0.85,
        visible: true,
        description: 'Aerodynamically optimized airfoil propeller generating up to 1.8kg static thrust per motor.',
        dimensionsApprox: '130mm × 5mm × 20mm',
      });
    });

    // 4. 3-Axis Gimbal 4K Optical Camera Pod
    components.push({
      id: 'drone-camera-gimbal',
      name: '3-Axis Stabilized 4K 60FPS Sensor Gimbal',
      layer: 'ELECTRONICS',
      shape: 'sphere',
      position: [0, -0.9, 1.2],
      rotation: [0, 0, 0],
      scale: [1.1, 1.1, 1.1],
      explodedOffset: [0, -1.8, 2.0],
      color: '#10b981',
      emissiveColor: '#34d399',
      emissiveIntensity: 0.7,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      description: '1-inch CMOS image sensor with 3-axis brushless stabilization gimbal and obstacle-avoidance stereo cameras.',
      dimensionsApprox: 'Ø55mm',
    });

    // 5. 6S High-Discharge LiPo Battery Block
    components.push({
      id: 'drone-lipo-battery',
      name: '6S 5000mAh 100C Graphene LiPo Battery Pack',
      layer: 'CORE',
      shape: 'box',
      position: [0, -0.65, 0],
      rotation: [0, 0, 0],
      scale: [1.8, 0.7, 1.4],
      explodedOffset: [0, -1.6, 0],
      color: '#eab308',
      emissiveColor: '#facc15',
      emissiveIntensity: 0.5,
      materialType: 'plastic',
      opacity: 1.0,
      visible: true,
      description: '22.2V high-energy density graphene power pack providing 32 minutes continuous flight time.',
      dimensionsApprox: '90mm × 35mm × 70mm',
    });

    const guides = generateMaterialsAndBuildGuide({
      title: 'Autonomous X-Quad UAV Flight System',
      conceptType: 'VEHICLE_DESIGN',
      description: 'Carbon-fiber quadcopter drone with 4 high-output brushless motors, RTK autopilot flight controller, 4K gimbal camera, and 6S graphene battery.',
      components,
    }, 'Autonomous Drone');

    return {
      id,
      title: 'Autonomous X-Quad UAV Flight System',
      conceptType: 'VEHICLE_DESIGN',
      description: 'Carbon-fiber quadcopter drone with 4 high-output brushless motors, RTK autopilot flight controller, 4K gimbal camera, and 6S graphene battery.',
      dimensions: { x: 380, y: 120, z: 380, unit: 'mm', isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [6, 5, 7],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'drone-fuselage-core',
      highlightedComponentIds: ['drone-fuselage-core', 'drone-camera-gimbal'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      qualityLevel: quality,
      providerType: 'procedural',
      providerDescription: 'Procedural 3D Engine (Aeronautical Drone Synthesizer)',
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized accurate quadcopter drone geometry with 4 carbon arms, brushless motors, propellers, flight controller, and gimbal camera.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // =========================================================================
  // 7. JET ENGINE (High-Bypass Turbofan Propulsion)
  // =========================================================================
  public static generateJetEngine(quality: ThreeDQualityLevel = 'HIGH'): HologramScene {
    const id = `SCENE-JETENGINE-${Date.now().toString(36).toUpperCase()}`;
    const components: HologramComponent[] = [];

    // 1. Aerodynamic Outer Nacelle Enclosure Cowling
    components.push({
      id: 'jet-nacelle-cowl',
      name: 'Aerodynamic Titanium Nacelle Cowling',
      layer: 'CASING',
      shape: 'cylinder',
      position: [0, 0, 0],
      rotation: [0, 0, Math.PI / 2],
      scale: [6.4, 9.2, 6.4],
      explodedOffset: [0, 2.2, 0],
      color: '#334155',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.2,
      materialType: 'titanium',
      opacity: 0.85,
      transparent: true,
      visible: true,
      description: 'Acoustic-lined carbon-titanium air intake nacelle with anti-icing bleed air channels.',
      dimensionsApprox: 'Ø2400mm × 3500mm',
    });

    // 2. Central Front Intake Spinner Cone
    components.push({
      id: 'jet-spinner-cone',
      name: 'Titanium Inlet Aerodynamic Spinner Cone',
      layer: 'MECHANICAL',
      shape: 'cone',
      position: [4.4, 0, 0],
      rotation: [0, 0, -Math.PI / 2],
      scale: [1.8, 2.2, 1.8],
      explodedOffset: [2.6, 0, 0],
      color: '#0f172a',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.3,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      description: 'Elliptical front spinner with rubberized tip and heated thermal de-icing coil.',
      dimensionsApprox: 'Ø700mm × 850mm',
    });

    // 3. 18-Blade Wide-Chord Fan Rotor Wheel
    components.push({
      id: 'jet-fan-blades',
      name: 'Wide-Chord Hollow Titanium Fan Rotor (18 Blades)',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [3.4, 0, 0],
      rotation: [0, 0, Math.PI / 2],
      scale: [5.6, 0.8, 5.6],
      explodedOffset: [1.8, 0, 0],
      color: '#0284c7',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.45,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      highlighted: true,
      description: 'Diffusion-bonded hollow titanium blades producing 85% of total engine takeoff thrust (90,000 lbf).',
      dimensionsApprox: 'Ø2150mm × 320mm',
    });

    // 4. Low & High Pressure Multi-Stage Axial Compressor
    components.push({
      id: 'jet-compressor-core',
      name: '10-Stage High-Pressure Axial Compressor Spool',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [1.2, 0, 0],
      rotation: [0, 0, Math.PI / 2],
      scale: [3.2, 3.4, 3.2],
      explodedOffset: [0.8, 0, 0],
      color: '#475569',
      emissiveColor: '#64748b',
      emissiveIntensity: 0.25,
      materialType: 'steel',
      opacity: 1.0,
      visible: true,
      description: 'Compresses intake air to 45:1 pressure ratio before entering the annular combustion zone.',
      dimensionsApprox: 'Ø1200mm × 1300mm',
    });

    // 5. Annular High-Temperature Combustion Chamber
    components.push({
      id: 'jet-combustion-chamber',
      name: 'Annular Ceramic-Coated Combustion Chamber',
      layer: 'CORE',
      shape: 'cylinder',
      position: [-1.2, 0, 0],
      rotation: [0, 0, Math.PI / 2],
      scale: [2.8, 1.8, 2.8],
      explodedOffset: [-0.6, 0, 0],
      color: '#f97316',
      emissiveColor: '#ef4444',
      emissiveIntensity: 1.2,
      materialType: 'glowing_core',
      opacity: 1.0,
      visible: true,
      highlighted: true,
      description: 'Operates at 1,700°C with 24 dual-orifice fuel nozzles delivering aviation kerosene mixture.',
      dimensionsApprox: 'Ø1080mm × 680mm',
    });

    // 6. High-Pressure Single-Crystal Nickel Turbine Wheel
    components.push({
      id: 'jet-turbine-wheel',
      name: 'Single-Crystal Superalloy Turbine Wheel',
      layer: 'MECHANICAL',
      shape: 'cylinder',
      position: [-2.6, 0, 0],
      rotation: [0, 0, Math.PI / 2],
      scale: [3.4, 1.2, 3.4],
      explodedOffset: [-1.4, 0, 0],
      color: '#b45309',
      emissiveColor: '#f59e0b',
      emissiveIntensity: 0.7,
      materialType: 'copper',
      opacity: 1.0,
      visible: true,
      description: 'Single-crystal CMSX-4 nickel superalloy turbine blades cooled by internal serpentine film air channels.',
      dimensionsApprox: 'Ø1300mm × 450mm',
    });

    // 7. Convergent Exhaust Nozzle & Thrust Reverser
    components.push({
      id: 'jet-exhaust-cone',
      name: 'Variable Exhaust Nozzle & Core Centerbody Cone',
      layer: 'CASING',
      shape: 'cone',
      position: [-4.4, 0, 0],
      rotation: [0, 0, Math.PI / 2],
      scale: [2.6, 2.6, 2.6],
      explodedOffset: [-2.4, 0, 0],
      color: '#1e293b',
      emissiveColor: '#f97316',
      emissiveIntensity: 0.4,
      materialType: 'titanium',
      opacity: 1.0,
      visible: true,
      description: 'Directs supersonic jet exhaust gases rearward with integrated hydraulic cascade thrust-reverser doors.',
      dimensionsApprox: 'Ø1000mm × 1000mm',
    });

    const guides = generateMaterialsAndBuildGuide({
      title: 'High-Bypass Commercial Turbofan Jet Engine',
      conceptType: 'JET_ENGINE',
      description: 'High-bypass dual-spool turbofan aircraft propulsion engine featuring 18 wide-chord titanium fan blades, 10-stage axial compressor, ceramic combustion chamber, and superalloy turbine.',
      components,
    }, 'Turbofan Jet Engine');

    return {
      id,
      title: 'High-Bypass Commercial Turbofan Jet Engine',
      conceptType: 'JET_ENGINE',
      description: 'High-bypass dual-spool turbofan aircraft propulsion engine featuring 18 wide-chord titanium fan blades, 10-stage axial compressor, ceramic combustion chamber, and superalloy turbine.',
      dimensions: { x: 3500, y: 2400, z: 2400, unit: 'mm', isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [10, 4, 8],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'jet-fan-blades',
      highlightedComponentIds: ['jet-fan-blades', 'jet-combustion-chamber'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      qualityLevel: quality,
      providerType: 'procedural',
      providerDescription: 'Procedural 3D Engine (Thermodynamic Turbofan Synthesizer)',
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized turbofan jet engine geometry with titanium fan blades, axial compressor, combustion chamber, and turbine assembly.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }

  // =========================================================================
  // 8. ARCHITECTURAL BLUEPRINT (Multi-Room Residential Villa)
  // =========================================================================
  public static generateArchitecturalBuilding(quality: ThreeDQualityLevel = 'HIGH'): HologramScene {
    const id = `SCENE-ARCH-${Date.now().toString(36).toUpperCase()}`;
    const components: HologramComponent[] = [
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
      {
        id: 'arch-kitchen-dining',
        name: 'Modern Kitchen Island & Dining Room',
        layer: 'CORE',
        shape: 'box',
        position: [2.2, 0.5, 1.4],
        rotation: [0, 0, 0],
        scale: [3.4, 1.8, 2.6],
        explodedOffset: [1.8, 0.4, 1.4],
        color: '#10b981',
        emissiveColor: '#34d399',
        emissiveIntensity: 0.6,
        materialType: 'hologram_glass',
        opacity: 0.75,
        visible: true,
        roomType: 'KITCHEN',
        floorLevel: 1,
        areaSqFt: 240,
        description: 'Chef kitchen with quartz countertops, induction cooktop, ventilation hood, and breakfast bar seating.',
        dimensionsApprox: '5.2m × 3.0m × 3.8m (240 sq ft)',
      },
      {
        id: 'arch-solar-roof',
        name: 'Monocrystalline Solar PV Array Rooftop Slab',
        layer: 'CASING',
        shape: 'roof',
        position: [0, 2.2, 0],
        rotation: [0, 0, 0],
        scale: [9.0, 0.8, 7.4],
        explodedOffset: [0, 2.4, 0],
        color: '#0f172a',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.35,
        materialType: 'silicon',
        opacity: 0.9,
        visible: true,
        roomType: 'ROOF',
        floorLevel: 2,
        areaSqFt: 1800,
        description: '12kW high-efficiency building-integrated photovoltaic (BIPV) solar glass tiles with micro-inverters.',
        dimensionsApprox: '14.8m × 0.8m × 12.2m',
      },
    ];

    const guides = generateMaterialsAndBuildGuide({
      title: 'Architectural Multi-Room 3D Residential Blueprint',
      conceptType: 'BUILDING_BLUEPRINT',
      description: 'Precision architectural blueprint model with reinforced concrete foundation, open-concept living lounge, master suite, kitchen island, and solar array roof.',
      components,
    }, 'Building Blueprint');

    return {
      id,
      title: 'Architectural Multi-Room 3D Residential Blueprint',
      conceptType: 'BUILDING_BLUEPRINT',
      description: 'Precision architectural blueprint model with reinforced concrete foundation, open-concept living lounge, master suite, kitchen island, and solar array roof.',
      dimensions: { x: 14500, y: 6800, z: 12000, unit: 'mm', isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [10, 8, 10],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: true,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'arch-living-room',
      highlightedComponentIds: ['arch-living-room', 'arch-solar-roof'],
      activeLayers: {
        CASING: true,
        ELECTRONICS: true,
        MECHANICAL: true,
        COOLING: true,
        STRUCTURAL: true,
        TRACES: true,
        CORE: true,
      },
      qualityLevel: quality,
      providerType: 'procedural',
      providerDescription: 'Procedural 3D Engine (BIM Architectural Spatial Synthesizer)',
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: 'Synthesized architectural blueprint with structural foundation, rooms layout, and solar roof slab.',
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }
}
