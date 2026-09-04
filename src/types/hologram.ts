export type HologramConceptType =
  | 'ARC_REACTOR'
  | 'CIRCUIT_BOARD'
  | 'COOLING_SYSTEM'
  | 'ROBOTIC_ARM'
  | 'JET_ENGINE'
  | 'QUANTUM_CORE'
  | 'INVENTION_CONCEPT'
  | 'BUILDING_BLUEPRINT'
  | 'ROOM_ESTIMATE'
  | 'ARCHITECTURAL'
  | 'ARCHITECTURAL_MODEL'
  | 'VEHICLE_DESIGN'
  | 'BIOLOGICAL_ANATOMY'
  | 'SCIENTIFIC'
  | 'CUSTOM';

export type HologramLayer =
  | 'CASING'
  | 'ELECTRONICS'
  | 'MECHANICAL'
  | 'COOLING'
  | 'STRUCTURAL'
  | 'TRACES'
  | 'CORE';

export type HologramMaterialType =
  | 'hologram_glass'
  | 'hologram_grid'
  | 'wireframe'
  | 'metal'
  | 'titanium'
  | 'steel'
  | 'carbon_fiber'
  | 'ceramic'
  | 'gold'
  | 'pcb_matte'
  | 'copper'
  | 'glowing_core'
  | 'plastic'
  | 'silicon'
  | 'aluminum';

export type HologramComponentShape =
  | 'box'
  | 'cylinder'
  | 'sphere'
  | 'torus'
  | 'cone'
  | 'ring'
  | 'disc'
  | 'tube'
  | 'gear'
  | 'bracket'
  | 'radial_array'
  | 'pcb_substrate'
  | 'chip'
  | 'capacitor'
  | 'resistor'
  | 'fan_blade'
  | 'heat_pipe'
  | 'coil'
  | 'trace_line'
  | 'wall'
  | 'slab'
  | 'pillar'
  | 'roof'
  | 'door'
  | 'window'
  | 'pyramid'
  | 'capsule'
  | 'wedge'
  | 'stairs'
  | 'dome'
  | 'furniture'
  | 'pipe'
  | 'claw'
  | 'heart_ventricle'
  | 'aorta_arch'
  | 'custom';

export type ThreeDQualityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

export type ThreeDProviderType = 'procedural' | 'ai_neural' | 'image_to_3d' | 'text_to_3d';

export type ThreeDVisualizationMode = 'SOLID' | 'WIRE' | 'X_RAY' | 'TRANSPARENT' | 'EXPLODED' | 'CROSS_SECTION';

export interface ThreeDValidationReport {
  isValid: boolean;
  meshCount: number;
  vertexCount: number;
  polygonCount: number;
  geometryIntegrity: boolean;
  semanticMatchScore: number; // 0 - 100
  geometryQualityScore: number; // 0 - 100
  detailScore: number; // 0 - 100
  overallConfidence: number; // 0 - 100
  confidenceNotice?: string;
  passedSemanticValidation: boolean;
  expectedKeyElements: string[];
  detectedKeyElements: string[];
  generationProvider: string;
  generationDurationMs?: number;
  meshCorrupted?: boolean;
}

export type ThreeDGenerationStage =
  | 'IDLE'
  | 'UNDERSTANDING'
  | 'PLANNING'
  | 'GENERATING'
  | 'VALIDATING'
  | 'ANALYZING_VISION'
  | 'OPTIMIZING'
  | 'READY'
  | 'FAILED';

export interface ThreeDGenerationStatus {
  stage: ThreeDGenerationStage;
  message: string;
  progress: number;
  detail?: string;
}

export type HologramDataCategory =
  | 'DISTINCT'       // Part differentiation (each part has a distinct high-contrast vibrant color)
  | 'LAYER'          // By Engineering Functional Layer (CASING, ELECTRONICS, MECHANICAL, COOLING, etc.)
  | 'MATERIAL'       // By Physical Material (copper, silicon, pcb_matte, aluminum, etc.)
  | 'TEMPERATURE'    // Thermal dissipation / operating heat profile
  | 'POWER_STATUS'   // Power rail / signal distribution domain
  | 'SUBSYSTEM'      // Functional engineering subsystem
  | 'CUSTOM';        // Custom user-defined key-value mapping

export interface HologramColorMapping {
  category?: HologramDataCategory;
  customMap?: Record<string, string>;
  layerColors?: Partial<Record<HologramLayer, string>>;
  materialColors?: Partial<Record<HologramMaterialType, string>>;
  temperatureColors?: {
    supercooled?: string;
    optimal?: string;
    warm?: string;
    critical?: string;
  };
  powerColors?: {
    highVoltage?: string;
    logic3v3?: string;
    ground?: string;
    rfSignal?: string;
    standby?: string;
  };
  subsystemColors?: {
    compute?: string;
    power?: string;
    thermal?: string;
    structural?: string;
    interconnect?: string;
  };
}

export interface HologramComponent {
  id: string;
  name: string;
  layer: HologramLayer;
  shape: HologramComponentShape;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  explodedOffset: [number, number, number];
  color: string;
  emissiveColor?: string;
  emissiveIntensity?: number;
  materialType: HologramMaterialType;
  opacity: number;
  transparent?: boolean;
  visible: boolean;
  highlighted?: boolean;
  description?: string;
  electricalSpecs?: string;
  dimensionsApprox?: string;
  roomType?:
    | 'BEDROOM'
    | 'LIVING_ROOM'
    | 'KITCHEN'
    | 'BATHROOM'
    | 'BALCONY'
    | 'CORRIDOR'
    | 'OFFICE'
    | 'GARAGE'
    | 'TERRACE'
    | 'SERVER_ROOM'
    | 'CONFERENCE'
    | 'FOUNDATION'
    | 'ROOF'
    | 'PILLAR'
    | 'WALL'
    | 'DOOR'
    | 'WINDOW'
    | 'OTHER';
  floorLevel?: number;
  areaSqFt?: number;
  areaSqM?: number;
  roomDimensions?: { length: number; width: number; height: number; unit: string };
  manufacturingMachine?: string;
  manufacturingProcess?: string;
  subComponents?: HologramComponent[];
}

export interface HologramConnection {
  id: string;
  fromComponentId: string;
  toComponentId: string;
  type: 'SIGNAL_TRACE' | 'POWER_BUS' | 'HEAT_PIPE' | 'MECHANICAL_LINK' | 'DATA_BUS';
  points: [number, number, number][];
  color: string;
  glowing?: boolean;
}

export interface HologramSceneHistoryEntry {
  timestamp: string;
  action: string;
  details: string;
  modifiedBy: 'VOICE_COMMAND' | 'UI_INTERACTION' | 'AI_ENGINE';
}

export interface BillOfMaterialsItem {
  id: string;
  name: string;
  category: 'Structural' | 'Electronics' | 'Mechanical' | 'Sensors & IoT' | 'Cooling' | 'Casing & Facade' | 'Power & Energy' | 'Plumbing & Gas' | 'Fasteners & Hardware' | 'Raw Material' | 'Other';
  quantity: string;
  approximateCost?: string;
  specs?: string;
  purpose: string;
  sourcingTip?: string;
  componentId?: string;
}

export interface RequiredTool {
  id: string;
  name: string;
  category: 'Civil & Construction' | 'Electronic & Soldering' | 'Mechanical & Machining' | 'Testing & Measurement' | 'Safety Equipment' | 'Software & Calibration';
  purpose: string;
  isEssential: boolean;
}

export interface BuildPhaseStep {
  stepNumber: number;
  phaseTitle: string;
  estimatedDuration: string;
  instruction: string;
  detailedSteps: string[];
  requiredTools: string[];
  safetyPrecautions: string[];
  qualityChecks: string[];
  targetComponents?: string[];
}

export interface BuildGuide {
  title: string;
  estimatedTotalTime: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced Engineering' | 'Industrial / Contractor Grade';
  estimatedTotalCost?: string;
  overview: string;
  prerequisites: string[];
  safetyOverview: string[];
  steps: BuildPhaseStep[];
}

export interface HologramScene {
  id: string;
  title: string;
  conceptType: HologramConceptType;
  description: string;
  dimensions?: {
    x: number;
    y: number;
    z: number;
    unit: string;
    isApproximate: boolean;
  };
  components: HologramComponent[];
  connections?: HologramConnection[];
  billOfMaterials?: BillOfMaterialsItem[];
  requiredTools?: RequiredTool[];
  buildGuide?: BuildGuide;
  cameraState: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  explodedFactor: number; // 0 to 1
  wireframeMode: boolean;
  hologramEffect: boolean; // Futuristic cyan glow + scanline effect
  xRayCutaway: boolean; // Translucent exterior casing
  rotationSpeed: number;
  autoRotate: boolean;
  selectedComponentId?: string;
  highlightedComponentIds: string[];
  activeLayers: Record<HologramLayer, boolean>;
  colorMapping?: HologramColorMapping;
  // Enhanced 3D Intelligence Fields
  qualityLevel?: ThreeDQualityLevel;
  providerType?: ThreeDProviderType;
  providerDescription?: string;
  visualizationMode?: ThreeDVisualizationMode;
  validationReport?: ThreeDValidationReport;
  measuredPolygonCount?: number;
  measuredVertexCount?: number;
  imageUrlReference?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: HologramSceneHistoryEntry[];
}

export type HologramVoiceActionType =
  | 'CREATE_SCENE'
  | 'ROTATE'
  | 'ZOOM'
  | 'EXPLODE'
  | 'ASSEMBLE'
  | 'HIGHLIGHT'
  | 'UNHIGHLIGHT'
  | 'HIDE_LAYER'
  | 'SHOW_LAYER'
  | 'CUTAWAY_TOGGLE'
  | 'HOLOGRAM_MODE_TOGGLE'
  | 'WIREFRAME_TOGGLE'
  | 'AUTO_ROTATE_TOGGLE'
  | 'SET_VISUALIZATION_MODE'
  | 'SET_QUALITY_LEVEL'
  | 'IMAGE_TO_3D'
  | 'MODIFY_COMPONENT'
  | 'NATURAL_LANGUAGE_MODIFY'
  | 'CHANGE_VIEW'
  | 'RESET_CAMERA';

export interface HologramVoiceAction {
  type: HologramVoiceActionType;
  conceptType?: HologramConceptType;
  customPrompt?: string;
  targetComponent?: string;
  targetLayer?: HologramLayer;
  angleDegrees?: number;
  axis?: 'x' | 'y' | 'z';
  zoomFactor?: number;
  viewPreset?: 'FRONT' | 'BACK' | 'TOP' | 'ISOMETRIC' | 'INSIDE' | 'RESET';
  explodedFactor?: number;
  visualizationMode?: ThreeDVisualizationMode;
  qualityLevel?: ThreeDQualityLevel;
  imageUrl?: string;
  componentModification?: {
    componentId?: string;
    componentName?: string;
    property: 'scale' | 'color' | 'position' | 'visibility' | 'materialType';
    value: any;
  };
  spokenExplanation?: string;
}
