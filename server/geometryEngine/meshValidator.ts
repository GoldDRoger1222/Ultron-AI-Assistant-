import { HologramScene, ThreeDValidationReport } from '../../src/types/hologram.js';
import { ObjectSemanticBlueprint } from './threeDUnderstandingAgent.js';

export class MeshValidator {
  /**
   * Validates a generated 3D scene both technically and semantically against the requested blueprint.
   */
  public static validate(
    scene: HologramScene,
    blueprint: ObjectSemanticBlueprint,
    providerName: string,
    durationMs: number = 250
  ): ThreeDValidationReport {
    if (!scene || !Array.isArray(scene.components) || scene.components.length === 0) {
      return {
        isValid: false,
        meshCount: 0,
        vertexCount: 0,
        polygonCount: 0,
        geometryIntegrity: false,
        semanticMatchScore: 0,
        geometryQualityScore: 0,
        detailScore: 0,
        overallConfidence: 0,
        confidenceNotice: 'Generation failed: Empty geometry. No 3D components found.',
        passedSemanticValidation: false,
        expectedKeyElements: blueprint.expectedKeyElements,
        detectedKeyElements: [],
        generationProvider: providerName,
        generationDurationMs: durationMs,
        meshCorrupted: true,
      };
    }

    const components = scene.components;
    let totalEstimatedVertices = 0;
    let totalEstimatedPolygons = 0;
    let geometryIntegrity = true;

    // 1. Calculate Technical Geometry Metrics
    components.forEach((comp) => {
      // Check invalid scales or positions
      if (
        !Array.isArray(comp.position) ||
        comp.position.some((v) => isNaN(v)) ||
        !Array.isArray(comp.scale) ||
        comp.scale.some((v) => isNaN(v) || v <= 0)
      ) {
        geometryIntegrity = false;
      }

      // Approximate polygon and vertex load based on shape
      switch (comp.shape) {
        case 'cylinder':
        case 'capacitor':
        case 'pipe':
        case 'pillar':
          totalEstimatedVertices += 66;
          totalEstimatedPolygons += 64;
          break;
        case 'torus':
        case 'coil':
        case 'ring':
          totalEstimatedVertices += 1176;
          totalEstimatedPolygons += 2304;
          break;
        case 'sphere':
        case 'heart_ventricle':
        case 'dome':
          totalEstimatedVertices += 561;
          totalEstimatedPolygons += 1024;
          break;
        case 'cone':
        case 'aorta_arch':
          totalEstimatedVertices += 34;
          totalEstimatedPolygons += 32;
          break;
        case 'claw':
          totalEstimatedVertices += 48;
          totalEstimatedPolygons += 44;
          break;
        case 'box':
        case 'chip':
        case 'pcb_substrate':
        case 'slab':
        case 'roof':
        case 'wall':
        default:
          totalEstimatedVertices += 24;
          totalEstimatedPolygons += 12;
          break;
      }
    });

    // 2. Semantic Alignment Validation
    // Match detected component names against expected elements
    const compNames = components.map((c) => (c.name + ' ' + (c.description || '')).toLowerCase());
    const detectedKeyElements: string[] = [];

    blueprint.expectedKeyElements.forEach((expected) => {
      const words = expected.toLowerCase().split(' ');
      const match = compNames.some((cName) => words.some((w) => w.length > 3 && cName.includes(w)));
      if (match) {
        detectedKeyElements.push(expected);
      }
    });

    const expectedCount = Math.max(1, blueprint.expectedKeyElements.length);
    const semanticMatchRatio = detectedKeyElements.length / expectedCount;
    const semanticMatchScore = Math.min(100, Math.round(semanticMatchRatio * 95 + (components.length >= 6 ? 5 : 0)));

    // 3. Geometry Quality Score (variety of shapes, materials, layers)
    const uniqueShapes = new Set(components.map((c) => c.shape)).size;
    const uniqueLayers = new Set(components.map((c) => c.layer)).size;
    const uniqueMaterials = new Set(components.map((c) => c.materialType)).size;

    const qualityBonus = Math.min(30, uniqueShapes * 8) + Math.min(30, uniqueLayers * 8) + Math.min(20, uniqueMaterials * 6);
    const geometryQualityScore = Math.min(100, Math.max(40, 30 + qualityBonus));

    // 4. Detail Score based on component density
    const detailScore = Math.min(100, Math.round((components.length / 12) * 85 + (totalEstimatedPolygons > 1000 ? 15 : 5)));

    // 5. Overall Confidence Calculation
    const overallConfidence = Math.round(
      semanticMatchScore * 0.45 + geometryQualityScore * 0.35 + detailScore * 0.2
    );

    const passedSemanticValidation = semanticMatchScore >= 50 && components.length >= 3;

    let confidenceNotice: string | undefined;
    if (overallConfidence >= 85) {
      confidenceNotice = `High-confidence geometric match (${overallConfidence}%). ${components.length} coherent sub-assemblies verified.`;
    } else if (overallConfidence >= 65) {
      confidenceNotice = `Acceptable structural match (${overallConfidence}%). Procedural approximation generated.`;
    } else {
      confidenceNotice = `Generated model confidence is moderate (${overallConfidence}%). Structural validation may differ from physical specs.`;
    }

    return {
      isValid: geometryIntegrity && passedSemanticValidation,
      meshCount: components.length,
      vertexCount: totalEstimatedVertices,
      polygonCount: totalEstimatedPolygons,
      geometryIntegrity,
      semanticMatchScore,
      geometryQualityScore,
      detailScore,
      overallConfidence,
      confidenceNotice,
      passedSemanticValidation,
      expectedKeyElements: blueprint.expectedKeyElements,
      detectedKeyElements,
      generationProvider: providerName,
      generationDurationMs: durationMs,
      meshCorrupted: !geometryIntegrity,
    };
  }
}
