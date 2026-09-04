import { HologramConceptType, HologramLayer, HologramMaterialType } from '../../src/types/hologram.js';

export interface ObjectSemanticBlueprint {
  objectType: string;
  category: HologramConceptType;
  primaryShapeArchetype: 'circular' | 'cylindrical' | 'articulated' | 'planar' | 'aerodynamic' | 'organic' | 'architectural' | 'polyhedral';
  symmetry: 'radial' | 'bilateral' | 'axial' | 'asymmetric';
  dimensions: { x: number; y: number; z: number; unit: string };
  expectedKeyElements: string[];
  suggestedMaterials: HologramMaterialType[];
  primaryColors: string[];
  recommendedLayers: HologramLayer[];
  isProceduralSupported: boolean;
  proceduralGeneratorKey?: 'ARC_REACTOR' | 'ROBOTIC_ARM' | 'CIRCUIT_BOARD' | 'CAR' | 'HEART' | 'DRONE' | 'JET_ENGINE' | 'ARCHITECTURAL';
}

/**
 * 3D Object Understanding Agent
 * Analyzes natural language requests into structured 3D physical specifications before geometry generation.
 */
export class ThreeDUnderstandingAgent {
  public static analyze(prompt: string): ObjectSemanticBlueprint {
    const lower = prompt.toLowerCase().trim();

    // 1. ARC REACTOR (Stark / Iron Man / Fusion Core)
    if (
      lower.includes('arc reactor') ||
      lower.includes('iron man reactor') ||
      lower.includes('stark reactor') ||
      lower.includes('fusion reactor') ||
      lower.includes('arc-reactor') ||
      lower.includes('palladium core')
    ) {
      return {
        objectType: 'Iron Man Arc Reactor Mark-V',
        category: 'ARC_REACTOR',
        primaryShapeArchetype: 'circular',
        symmetry: 'radial',
        dimensions: { x: 120, y: 120, z: 45, unit: 'mm' },
        expectedKeyElements: [
          'outer housing ring',
          'radial copper induction coils',
          'palladium plasma core',
          'magnetic toroid confinement',
          'support brackets',
          'optic protective lens',
        ],
        suggestedMaterials: ['titanium', 'copper', 'glowing_core', 'hologram_glass', 'steel', 'gold'],
        primaryColors: ['#475569', '#b45309', '#38bdf8', '#0891b2', '#eab308'],
        recommendedLayers: ['CASING', 'CORE', 'ELECTRONICS', 'STRUCTURAL', 'COOLING'],
        isProceduralSupported: true,
        proceduralGeneratorKey: 'ARC_REACTOR',
      };
    }

    // 2. ROBOTIC ARM / ARTICULATED MANIPULATOR
    if (
      lower.includes('robotic arm') ||
      lower.includes('robot arm') ||
      lower.includes('manipulator') ||
      lower.includes('bionic arm') ||
      lower.includes('prosthetic arm') ||
      lower.includes('industrial robot')
    ) {
      return {
        objectType: '6-DOF Articulated Robotic Manipulator',
        category: 'ROBOTIC_ARM',
        primaryShapeArchetype: 'articulated',
        symmetry: 'bilateral',
        dimensions: { x: 450, y: 920, z: 450, unit: 'mm' },
        expectedKeyElements: [
          'mounting pedestal base',
          'rotating azimuth turret',
          'shoulder pivot joint',
          'lower arm boom',
          'linear hydraulic actuator',
          'elbow articulation',
          'wrist gimbal',
          'gripper claws',
        ],
        suggestedMaterials: ['steel', 'aluminum', 'carbon_fiber', 'titanium', 'silicon'],
        primaryColors: ['#1e293b', '#0284c7', '#d97706', '#06b6d4', '#10b981'],
        recommendedLayers: ['STRUCTURAL', 'MECHANICAL', 'ELECTRONICS', 'CASING'],
        isProceduralSupported: true,
        proceduralGeneratorKey: 'ROBOTIC_ARM',
      };
    }

    // 3. CIRCUIT BOARD / MOTHERBOARD / PCB
    if (
      lower.includes('circuit board') ||
      lower.includes('circuit') ||
      lower.includes('pcb') ||
      lower.includes('motherboard') ||
      lower.includes('microchip') ||
      lower.includes('processor board')
    ) {
      return {
        objectType: 'High-Density HDI PCB Motherboard',
        category: 'CIRCUIT_BOARD',
        primaryShapeArchetype: 'planar',
        symmetry: 'bilateral',
        dimensions: { x: 180, y: 22, z: 140, unit: 'mm' },
        expectedKeyElements: [
          'FR4 PCB substrate',
          'central CPU / SoC silicon chip',
          'copper heat spreader',
          'DDR memory chips',
          'solid capacitors',
          'choke inductors',
          'expansion slot connector',
        ],
        suggestedMaterials: ['pcb_matte', 'silicon', 'copper', 'aluminum', 'gold', 'plastic'],
        primaryColors: ['#064e3b', '#1e293b', '#b45309', '#38bdf8', '#eab308'],
        recommendedLayers: ['STRUCTURAL', 'CORE', 'ELECTRONICS', 'COOLING', 'TRACES'],
        isProceduralSupported: true,
        proceduralGeneratorKey: 'CIRCUIT_BOARD',
      };
    }

    // 4. CAR / AUTOMOBILE / VEHICLE
    if (
      lower.includes('car') ||
      lower.includes('supercar') ||
      lower.includes('vehicle') ||
      lower.includes('automobile') ||
      lower.includes('hypercar') ||
      lower.includes('gari') ||
      lower.includes('rover')
    ) {
      return {
        objectType: 'Hyper-EV Aerodynamic Supercar',
        category: 'VEHICLE_DESIGN',
        primaryShapeArchetype: 'aerodynamic',
        symmetry: 'bilateral',
        dimensions: { x: 4600, y: 1200, z: 2100, unit: 'mm' },
        expectedKeyElements: [
          'monocoque chassis',
          'aerodynamic body shell',
          'cockpit glass canopy',
          'solid-state battery floor',
          '4 alloy wheels with tires',
          'front laser headlights',
          'rear downforce wing',
        ],
        suggestedMaterials: ['carbon_fiber', 'titanium', 'hologram_glass', 'glowing_core', 'aluminum'],
        primaryColors: ['#0f172a', '#0284c7', '#0891b2', '#10b981', '#38bdf8'],
        recommendedLayers: ['STRUCTURAL', 'CASING', 'CORE', 'MECHANICAL', 'ELECTRONICS'],
        isProceduralSupported: true,
        proceduralGeneratorKey: 'CAR',
      };
    }

    // 5. HUMAN HEART / BIOLOGICAL ANATOMY
    if (
      lower.includes('heart') ||
      lower.includes('human heart') ||
      lower.includes('cardiac') ||
      lower.includes('anatomy') ||
      lower.includes('ventricle') ||
      lower.includes('ridpindo')
    ) {
      return {
        objectType: 'Human Cardiac Engine (Anatomy)',
        category: 'BIOLOGICAL_ANATOMY',
        primaryShapeArchetype: 'organic',
        symmetry: 'asymmetric',
        dimensions: { x: 120, y: 140, z: 95, unit: 'mm' },
        expectedKeyElements: [
          'left muscular ventricle',
          'right ventricle chamber',
          'left atrium',
          'right atrium',
          'ascending aorta arch',
          'vena cava veins',
          'pulmonary artery trunk',
          'coronary arteries',
        ],
        suggestedMaterials: ['ceramic', 'plastic', 'gold', 'glowing_core'],
        primaryColors: ['#dc2626', '#b91c1c', '#991b1b', '#ef4444', '#1d4ed8', '#f59e0b'],
        recommendedLayers: ['CORE', 'STRUCTURAL', 'MECHANICAL', 'TRACES'],
        isProceduralSupported: true,
        proceduralGeneratorKey: 'HEART',
      };
    }

    // 6. DRONE / UAV / QUADCOPTER
    if (
      lower.includes('drone') ||
      lower.includes('quadcopter') ||
      lower.includes('uav') ||
      lower.includes('multirotor')
    ) {
      return {
        objectType: 'Autonomous X-Quad UAV Flight System',
        category: 'VEHICLE_DESIGN',
        primaryShapeArchetype: 'aerodynamic',
        symmetry: 'radial',
        dimensions: { x: 380, y: 120, z: 380, unit: 'mm' },
        expectedKeyElements: [
          'carbon-fiber fuselage core',
          'flight controller SoC',
          '4 tubular motor arms',
          'brushless outrunner motors',
          'dual-blade propellers',
          'gimbal camera sensor',
          'LiPo battery pack',
        ],
        suggestedMaterials: ['carbon_fiber', 'silicon', 'copper', 'plastic', 'titanium'],
        primaryColors: ['#0f172a', '#06b6d4', '#b45309', '#0284c7', '#10b981'],
        recommendedLayers: ['STRUCTURAL', 'CORE', 'MECHANICAL', 'ELECTRONICS'],
        isProceduralSupported: true,
        proceduralGeneratorKey: 'DRONE',
      };
    }

    // 7. JET ENGINE / TURBOFAN
    if (
      lower.includes('jet engine') ||
      lower.includes('turbofan') ||
      lower.includes('turbine') ||
      lower.includes('aircraft engine')
    ) {
      return {
        objectType: 'High-Bypass Turbofan Jet Engine',
        category: 'JET_ENGINE',
        primaryShapeArchetype: 'cylindrical',
        symmetry: 'axial',
        dimensions: { x: 3500, y: 2400, z: 2400, unit: 'mm' },
        expectedKeyElements: [
          'outer nacelle cowl',
          'intake spinner cone',
          'titanium fan rotor blades',
          'axial compressor spool',
          'annular combustion chamber',
          'single-crystal turbine wheel',
          'exhaust nozzle cone',
        ],
        suggestedMaterials: ['titanium', 'steel', 'copper', 'glowing_core'],
        primaryColors: ['#334155', '#0284c7', '#475569', '#f97316', '#b45309'],
        recommendedLayers: ['CASING', 'MECHANICAL', 'CORE', 'STRUCTURAL'],
        isProceduralSupported: true,
        proceduralGeneratorKey: 'JET_ENGINE',
      };
    }

    // 8. ARCHITECTURAL BUILDING / BLUEPRINT
    if (
      lower.includes('building') ||
      lower.includes('house') ||
      lower.includes('villa') ||
      lower.includes('apartment') ||
      lower.includes('blueprint') ||
      lower.includes('floorplan') ||
      lower.includes('duplex')
    ) {
      return {
        objectType: 'Architectural Residential Multi-Room Blueprint',
        category: 'BUILDING_BLUEPRINT',
        primaryShapeArchetype: 'architectural',
        symmetry: 'bilateral',
        dimensions: { x: 14500, y: 6800, z: 12000, unit: 'mm' },
        expectedKeyElements: [
          'concrete foundation slab',
          'living room lounge',
          'master bedroom suite',
          'kitchen dining area',
          'solar PV roof slab',
        ],
        suggestedMaterials: ['metal', 'hologram_glass', 'silicon'],
        primaryColors: ['#1e293b', '#0284c7', '#a855f7', '#10b981', '#0f172a'],
        recommendedLayers: ['STRUCTURAL', 'CORE', 'CASING'],
        isProceduralSupported: true,
        proceduralGeneratorKey: 'ARCHITECTURAL',
      };
    }

    // Default Custom Physical Concept
    return {
      objectType: prompt.slice(0, 40),
      category: 'INVENTION_CONCEPT',
      primaryShapeArchetype: 'polyhedral',
      symmetry: 'radial',
      dimensions: { x: 1200, y: 800, z: 1200, unit: 'mm' },
      expectedKeyElements: ['outer enclosure', 'internal core module', 'mounting framework', 'functional sub-assemblies'],
      suggestedMaterials: ['titanium', 'aluminum', 'copper', 'glowing_core', 'hologram_glass'],
      primaryColors: ['#0284c7', '#38bdf8', '#f59e0b', '#10b981'],
      recommendedLayers: ['CASING', 'CORE', 'MECHANICAL', 'ELECTRONICS', 'STRUCTURAL'],
      isProceduralSupported: false,
    };
  }
}
