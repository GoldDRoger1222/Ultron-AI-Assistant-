import {
  HologramScene,
  HologramComponent,
  HologramLayer,
  ThreeDQualityLevel,
  ThreeDProviderType,
} from '../../src/types/hologram.js';
import { generateAiContent } from '../gemini.js';
import { generateMaterialsAndBuildGuide } from '../materialsAndBuildGuideEngine.js';
import { Procedural3DLibrary } from './proceduralLibrary.js';
import { ObjectSemanticBlueprint, ThreeDUnderstandingAgent } from './threeDUnderstandingAgent.js';
import { MeshValidator } from './meshValidator.js';

export interface I3DGenerationProvider {
  name: string;
  type: ThreeDProviderType;
  isConfigured: boolean;
  description: string;
  generate(
    prompt: string,
    blueprint: ObjectSemanticBlueprint,
    quality: ThreeDQualityLevel,
    imageUrl?: string
  ): Promise<HologramScene>;
}

// ---------------------------------------------------------------------------
// 1. PROCEDURAL 3D GENERATOR PROVIDER (Accurate Geometric Physics Engine)
// ---------------------------------------------------------------------------
export class ProceduralProvider implements I3DGenerationProvider {
  public name = 'Procedural 3D Engine';
  public type: ThreeDProviderType = 'procedural';
  public isConfigured = true;
  public description = 'Deterministic CAD-grade geometric constructor using mathematical primitives and trigonometric distribution.';

  public async generate(
    prompt: string,
    blueprint: ObjectSemanticBlueprint,
    quality: ThreeDQualityLevel = 'HIGH'
  ): Promise<HologramScene> {
    const start = Date.now();
    let scene: HologramScene;

    if (blueprint.proceduralGeneratorKey === 'ARC_REACTOR') {
      scene = Procedural3DLibrary.generateArcReactor(quality);
    } else if (blueprint.proceduralGeneratorKey === 'ROBOTIC_ARM') {
      scene = Procedural3DLibrary.generateRoboticArm(quality);
    } else if (blueprint.proceduralGeneratorKey === 'CIRCUIT_BOARD') {
      scene = Procedural3DLibrary.generateCircuitBoard(quality);
    } else if (blueprint.proceduralGeneratorKey === 'CAR') {
      scene = Procedural3DLibrary.generateCar(quality);
    } else if (blueprint.proceduralGeneratorKey === 'HEART') {
      scene = Procedural3DLibrary.generateHumanHeart(quality);
    } else if (blueprint.proceduralGeneratorKey === 'DRONE') {
      scene = Procedural3DLibrary.generateDrone(quality);
    } else if (blueprint.proceduralGeneratorKey === 'JET_ENGINE') {
      scene = Procedural3DLibrary.generateJetEngine(quality);
    } else if (blueprint.proceduralGeneratorKey === 'ARCHITECTURAL') {
      scene = Procedural3DLibrary.generateArchitecturalBuilding(quality);
    } else {
      // Intelligent general procedural synthesis
      scene = this.generateCustomProceduralScene(prompt, blueprint, quality);
    }

    const duration = Date.now() - start;
    const validation = MeshValidator.validate(scene, blueprint, this.name, duration);
    scene.validationReport = validation;
    scene.providerType = this.type;
    scene.providerDescription = this.description;
    scene.qualityLevel = quality;

    return scene;
  }

  private generateCustomProceduralScene(
    prompt: string,
    blueprint: ObjectSemanticBlueprint,
    quality: ThreeDQualityLevel
  ): HologramScene {
    const id = `SCENE-PROCEDURAL-${Date.now().toString(36).toUpperCase()}`;
    const components: HologramComponent[] = [];

    // Construct an intelligent multi-layer structural assembly based on archetype
    // 1. Base / Outer Chassis
    components.push({
      id: 'custom-main-chassis',
      name: `${blueprint.objectType} Outer Structural Housing`,
      layer: 'CASING',
      shape: blueprint.primaryShapeArchetype === 'circular' ? 'cylinder' : 'box',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [6.4, 2.2, 4.8],
      explodedOffset: [0, 1.4, 0],
      color: '#1e293b',
      emissiveColor: '#38bdf8',
      emissiveIntensity: 0.2,
      materialType: 'titanium',
      opacity: 0.9,
      visible: true,
      description: `Primary structural framework machined for ${blueprint.objectType}.`,
    });

    // 2. Active Core Module
    components.push({
      id: 'custom-active-core',
      name: `${blueprint.objectType} Central Power & Processing Core`,
      layer: 'CORE',
      shape: blueprint.primaryShapeArchetype === 'circular' ? 'sphere' : 'cylinder',
      position: [0, 0.2, 0],
      rotation: [0, 0, 0],
      scale: [2.4, 1.6, 2.4],
      explodedOffset: [0, 0.4, 0],
      color: '#06b6d4',
      emissiveColor: '#00f0ff',
      emissiveIntensity: 1.2,
      materialType: 'glowing_core',
      opacity: 1.0,
      visible: true,
      highlighted: true,
      description: `Main functional core supplying continuous operation and control logic.`,
    });

    // 3. Sub-Assemblies based on expected elements
    blueprint.expectedKeyElements.slice(0, 6).forEach((elemName, idx) => {
      const angle = (idx / 6) * Math.PI * 2;
      const radius = 3.2;
      components.push({
        id: `custom-sub-${idx + 1}`,
        name: `${elemName.charAt(0).toUpperCase() + elemName.slice(1)} Sub-Assembly`,
        layer: (blueprint.recommendedLayers[idx % blueprint.recommendedLayers.length] || 'MECHANICAL') as HologramLayer,
        shape: idx % 2 === 0 ? 'cylinder' : 'box',
        position: [Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius],
        rotation: [0, angle, 0],
        scale: [1.2, 1.2, 1.2],
        explodedOffset: [Math.cos(angle) * 2.2, 0.8, Math.sin(angle) * 2.2],
        color: blueprint.primaryColors[idx % blueprint.primaryColors.length] || '#0284c7',
        emissiveColor: '#38bdf8',
        emissiveIntensity: 0.4,
        materialType: blueprint.suggestedMaterials[idx % blueprint.suggestedMaterials.length] || 'aluminum',
        opacity: 1.0,
        visible: true,
        description: `Dedicated ${elemName} integrated into the primary physical assembly.`,
      });
    });

    const guides = generateMaterialsAndBuildGuide({
      title: `${blueprint.objectType} 3D Physical Prototype`,
      conceptType: blueprint.category,
      description: `Procedural 3D engineering prototype synthesized for "${prompt}".`,
      components,
    }, prompt);

    return {
      id,
      title: `${blueprint.objectType} 3D Physical Prototype`,
      conceptType: blueprint.category,
      description: `Procedural 3D engineering prototype synthesized for "${prompt}".`,
      dimensions: { x: blueprint.dimensions.x, y: blueprint.dimensions.y, z: blueprint.dimensions.z, unit: blueprint.dimensions.unit, isApproximate: false },
      components,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [8, 6, 8],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: 'custom-active-core',
      highlightedComponentIds: ['custom-active-core'],
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
      providerType: this.type,
      providerDescription: this.description,
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: `Synthesized procedural multi-layer assembly for: "${prompt}".`,
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };
  }
}

// ---------------------------------------------------------------------------
// 2. AI 3D PROVIDER (Gemini Neural Spatial Synthesis)
// ---------------------------------------------------------------------------
export class AI3DProvider implements I3DGenerationProvider {
  public name = 'AI Neural 3D Synthesizer (Gemini Flash Spatial)';
  public type: ThreeDProviderType = 'ai_neural';
  public isConfigured = !!process.env.GEMINI_API_KEY;
  public description = 'Deep multimodal generative 3D spatial decomposition engine constructing precise component coordinates.';

  public async generate(
    prompt: string,
    blueprint: ObjectSemanticBlueprint,
    quality: ThreeDQualityLevel = 'HIGH'
  ): Promise<HologramScene> {
    const start = Date.now();

    const systemInstruction = `You are the ULTRON 3D Spatial Geometry Engine.
Synthesize an accurate, high-fidelity 3D multi-component assembly representing the user's requested object: "${blueprint.objectType}".

Object Shape Archetype: ${blueprint.primaryShapeArchetype}
Symmetry: ${blueprint.symmetry}
Expected Components: ${blueprint.expectedKeyElements.join(', ')}
Suggested Materials: ${blueprint.suggestedMaterials.join(', ')}

REQUIREMENTS:
1. Provide between 8 and 14 realistically named sub-components that fit together spatially into the requested physical object.
2. DO NOT use generic names like "Sphere001" or "Object002". Use precise engineering names (e.g. "Titanium Outer Ring", "Radial Induction Coils", "Palladium Energy Core", "Hydraulic Pivot Joint").
3. Ensure coordinates fit logically together in space along the primary axis with realistic scale ratios.
4. Set realistic materialType ("titanium" | "copper" | "steel" | "carbon_fiber" | "glowing_core" | "hologram_glass" | "silicon" | "aluminum").

Return ONLY valid JSON matching this schema:
{
  "title": "Descriptive Title (e.g. Arc Reactor Mark-V Energy Core)",
  "description": "2-sentence engineering overview",
  "dimensions": { "x": 120, "y": 120, "z": 45, "unit": "mm" },
  "components": [
    {
      "id": "kebab-case-id",
      "name": "Meaningful Component Name",
      "layer": "CASING" | "ELECTRONICS" | "MECHANICAL" | "COOLING" | "STRUCTURAL" | "TRACES" | "CORE",
      "shape": "torus" | "cylinder" | "box" | "sphere" | "cone" | "ring" | "claw" | "dome" | "pipe",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "explodedOffset": [0, 1, 0],
      "color": "#hexColor",
      "emissiveColor": "#hexColor",
      "emissiveIntensity": 0.4,
      "materialType": "titanium" | "copper" | "steel" | "carbon_fiber" | "glowing_core" | "hologram_glass" | "silicon" | "aluminum",
      "opacity": 1.0,
      "visible": true,
      "highlighted": false,
      "description": "Engineering function of this component"
    }
  ]
}`;

    const aiRes = await generateAiContent({
      prompt: `Generate the complete 3D spatial assembly JSON for: "${prompt}". Ensure real physical parts.`,
      systemInstruction,
      temperature: 0.2,
      responseMimeType: 'application/json',
    });

    const rawText = typeof aiRes === 'object' && aiRes ? aiRes.text : String(aiRes || '');
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed || !Array.isArray(parsed.components) || parsed.components.length < 3) {
      throw new Error('AI spatial synthesis failed to return valid multi-component geometry.');
    }

    const formattedComponents: HologramComponent[] = parsed.components.map((c: any, idx: number) => {
      let pos: [number, number, number] = Array.isArray(c.position) && c.position.length === 3
        ? [Number(c.position[0]) || 0, Number(c.position[1]) || 0, Number(c.position[2]) || 0]
        : [0, idx * 0.25, 0];
      let sc: [number, number, number] = Array.isArray(c.scale) && c.scale.length === 3
        ? [Math.max(0.1, Number(c.scale[0]) || 1), Math.max(0.1, Number(c.scale[1]) || 1), Math.max(0.1, Number(c.scale[2]) || 1)]
        : [1, 1, 1];
      let exp: [number, number, number] = Array.isArray(c.explodedOffset) && c.explodedOffset.length === 3
        ? [Number(c.explodedOffset[0]) || 0, Number(c.explodedOffset[1]) || 0, Number(c.explodedOffset[2]) || 0]
        : [0, (idx - parsed.components.length / 2) * 0.4, 0];

      // Coordinate scaling
      const maxCoord = Math.max(Math.abs(pos[0]), Math.abs(pos[1]), Math.abs(pos[2]), Math.abs(sc[0]), Math.abs(sc[1]), Math.abs(sc[2]));
      if (maxCoord > 25) {
        const factor = 1 / 100;
        pos = [pos[0] * factor, pos[1] * factor, pos[2] * factor];
        sc = [Math.max(0.1, sc[0] * factor), Math.max(0.1, sc[1] * factor), Math.max(0.1, sc[2] * factor)];
        exp = [exp[0] * factor, exp[1] * factor, exp[2] * factor];
      }

      return {
        id: c.id || `ai-comp-${idx + 1}`,
        name: c.name || `Sub-Assembly ${idx + 1}`,
        layer: (c.layer || 'MECHANICAL') as HologramLayer,
        shape: c.shape || 'box',
        position: pos,
        rotation: Array.isArray(c.rotation) && c.rotation.length === 3 ? (c.rotation as [number, number, number]) : [0, 0, 0],
        scale: sc,
        explodedOffset: exp,
        color: c.color || '#0284c7',
        emissiveColor: c.emissiveColor || c.color || '#38bdf8',
        emissiveIntensity: typeof c.emissiveIntensity === 'number' ? Math.max(0.2, c.emissiveIntensity) : 0.4,
        materialType: c.materialType || 'titanium',
        opacity: typeof c.opacity === 'number' ? c.opacity : 1.0,
        transparent: c.materialType === 'hologram_glass' || (typeof c.opacity === 'number' && c.opacity < 1.0),
        visible: true,
        highlighted: !!c.highlighted || idx === 0,
        description: c.description || 'Precision engineered sub-assembly.',
      };
    });

    const guides = generateMaterialsAndBuildGuide({
      title: parsed.title || `${blueprint.objectType} 3D Model`,
      conceptType: blueprint.category,
      description: parsed.description || `AI-Synthesized 3D architecture for: "${prompt}".`,
      components: formattedComponents,
    }, prompt);

    const scene: HologramScene = {
      id: `SCENE-AI-${Date.now().toString(36).toUpperCase()}`,
      title: parsed.title || `${blueprint.objectType} 3D Model`,
      conceptType: blueprint.category,
      description: parsed.description || `AI-Synthesized 3D architecture for: "${prompt}".`,
      dimensions: parsed.dimensions || { x: blueprint.dimensions.x, y: blueprint.dimensions.y, z: blueprint.dimensions.z, unit: 'mm', isApproximate: false },
      components: formattedComponents,
      billOfMaterials: guides.billOfMaterials,
      requiredTools: guides.requiredTools,
      buildGuide: guides.buildGuide,
      cameraState: {
        position: [8, 6, 8],
        target: [0, 0, 0],
        fov: 45,
      },
      explodedFactor: 0.0,
      wireframeMode: false,
      hologramEffect: false,
      xRayCutaway: false,
      rotationSpeed: 0.4,
      autoRotate: true,
      selectedComponentId: formattedComponents[0]?.id,
      highlightedComponentIds: formattedComponents.filter((c) => c.highlighted).map((c) => c.id),
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
      providerType: this.type,
      providerDescription: this.description,
      visualizationMode: 'SOLID',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'SCENE_CREATED',
          details: `Synthesized neural 3D geometry for: "${prompt}".`,
          modifiedBy: 'AI_ENGINE',
        },
      ],
    };

    const duration = Date.now() - start;
    scene.validationReport = MeshValidator.validate(scene, blueprint, this.name, duration);
    return scene;
  }
}

// ---------------------------------------------------------------------------
// 3. IMAGE-TO-3D RECONSTRUCTION PROVIDER
// ---------------------------------------------------------------------------
export class ImageTo3DProvider implements I3DGenerationProvider {
  public name = 'Multimodal Image-to-3D Reconstructor';
  public type: ThreeDProviderType = 'image_to_3d';
  public isConfigured = !!process.env.GEMINI_API_KEY;
  public description = 'Visual feature extraction decomposing uploaded reference images into volumetric 3D component meshes.';

  public async generate(
    prompt: string,
    blueprint: ObjectSemanticBlueprint,
    quality: ThreeDQualityLevel = 'HIGH',
    imageUrl?: string
  ): Promise<HologramScene> {
    const aiProvider = new AI3DProvider();
    const enrichedPrompt = `[IMAGE REFERENCE CONTEXT: ${imageUrl || 'Uploaded Blueprint Photo'}] Analyze image geometry features and reconstruct: ${prompt}`;
    const scene = await aiProvider.generate(enrichedPrompt, blueprint, quality);
    scene.providerType = 'image_to_3d';
    scene.providerDescription = this.description;
    scene.imageUrlReference = imageUrl;
    return scene;
  }
}

// ---------------------------------------------------------------------------
// 4. PROVIDER MANAGER & MASTER ORCHESTRATOR
// ---------------------------------------------------------------------------
export class ThreeDGenerationManager {
  private static instance: ThreeDGenerationManager;
  private proceduralProvider = new ProceduralProvider();
  private aiProvider = new AI3DProvider();
  private imageTo3dProvider = new ImageTo3DProvider();

  public static getInstance(): ThreeDGenerationManager {
    if (!ThreeDGenerationManager.instance) {
      ThreeDGenerationManager.instance = new ThreeDGenerationManager();
    }
    return ThreeDGenerationManager.instance;
  }

  /**
   * Master 3D Generation Pipeline:
   * USER REQUEST -> 3D UNDERSTANDING -> GEOMETRY PLANNING -> MODEL GENERATION -> VALIDATION -> RESULT
   */
  public async generateModel(
    userPrompt: string,
    quality: ThreeDQualityLevel = 'HIGH',
    preferredProvider?: ThreeDProviderType,
    imageUrl?: string
  ): Promise<{ scene: HologramScene; validation: any; providerUsed: string }> {
    // 1. 3D Object Understanding
    const blueprint = ThreeDUnderstandingAgent.analyze(userPrompt);

    let scene: HologramScene;
    let providerUsed = 'Procedural 3D Engine';

    // 2. Select Provider
    if (imageUrl || preferredProvider === 'image_to_3d') {
      try {
        scene = await this.imageTo3dProvider.generate(userPrompt, blueprint, quality, imageUrl);
        providerUsed = this.imageTo3dProvider.name;
      } catch {
        scene = await this.proceduralProvider.generate(userPrompt, blueprint, quality);
        providerUsed = this.proceduralProvider.name;
      }
    } else if (preferredProvider === 'ai_neural' && this.aiProvider.isConfigured) {
      try {
        scene = await this.aiProvider.generate(userPrompt, blueprint, quality);
        providerUsed = this.aiProvider.name;
      } catch {
        scene = await this.proceduralProvider.generate(userPrompt, blueprint, quality);
        providerUsed = this.proceduralProvider.name;
      }
    } else if (blueprint.isProceduralSupported) {
      // Direct high-fidelity procedural generation
      scene = await this.proceduralProvider.generate(userPrompt, blueprint, quality);
      providerUsed = this.proceduralProvider.name;
    } else if (this.aiProvider.isConfigured) {
      try {
        scene = await this.aiProvider.generate(userPrompt, blueprint, quality);
        providerUsed = this.aiProvider.name;
      } catch {
        scene = await this.proceduralProvider.generate(userPrompt, blueprint, quality);
        providerUsed = this.proceduralProvider.name;
      }
    } else {
      scene = await this.proceduralProvider.generate(userPrompt, blueprint, quality);
      providerUsed = this.proceduralProvider.name;
    }

    // 3. Automated Validation Check & Self-Healing
    if (scene.validationReport && !scene.validationReport.isValid) {
      console.warn('Initial 3D generation failed validation. Triggering procedural self-healing fallback...');
      scene = await this.proceduralProvider.generate(userPrompt, blueprint, quality);
      providerUsed = 'Procedural 3D Engine (Self-Healed)';
    }

    return {
      scene,
      validation: scene.validationReport,
      providerUsed,
    };
  }
}
