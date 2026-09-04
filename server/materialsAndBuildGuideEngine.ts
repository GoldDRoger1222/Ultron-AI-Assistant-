import {
  BillOfMaterialsItem,
  RequiredTool,
  BuildGuide,
  BuildPhaseStep,
  HologramComponent,
  HologramConceptType,
  HologramScene,
} from '../src/types/hologram.js';

export function generateMaterialsAndBuildGuide(
  scene: Partial<HologramScene>,
  userPrompt: string = ''
): {
  billOfMaterials: BillOfMaterialsItem[];
  requiredTools: RequiredTool[];
  buildGuide: BuildGuide;
} {
  const title = scene.title || 'Engineered System';
  const conceptType = scene.conceptType || 'INVENTION_CONCEPT';
  const components = scene.components || [];
  const promptLower = (userPrompt + ' ' + (scene.description || '') + ' ' + title).toLowerCase();

  // 1. ARCHITECTURAL / BUILDING BLUEPRINTS / RESIDENTIAL APARTMENTS / HOUSES / DUPLEXES / OFFICES
  if (
    conceptType === 'BUILDING_BLUEPRINT' ||
    conceptType === 'ARCHITECTURAL_MODEL' ||
    conceptType === 'ROOM_ESTIMATE' ||
    promptLower.includes('building') ||
    promptLower.includes('blueprint') ||
    promptLower.includes('apartment') ||
    promptLower.includes('duplex') ||
    promptLower.includes('house') ||
    promptLower.includes('villa') ||
    promptLower.includes('office') ||
    promptLower.includes('floor') ||
    promptLower.includes('room') ||
    promptLower.includes('bari') ||
    promptLower.includes('ghor')
  ) {
    const isCommercial = promptLower.includes('office') || promptLower.includes('commercial');
    const isDuplex = promptLower.includes('duplex') || promptLower.includes('villa');
    
    const billOfMaterials: BillOfMaterialsItem[] = [
      {
        id: 'mat-arch-1',
        name: 'Portland Structural Cement (C35/45 Grade)',
        category: 'Structural',
        quantity: isDuplex ? '850 Bags (50kg)' : '520 Bags (50kg)',
        approximateCost: isDuplex ? '$7,650 / ৳8,40,000' : '$4,680 / ৳5,15,000',
        specs: 'High early strength 42.5N Ordinary Portland Cement',
        purpose: 'Foundation footing, reinforced concrete columns, beams and slab casting.',
        sourcingTip: 'Procure freshly batched cement from certified local suppliers.',
      },
      {
        id: 'mat-arch-2',
        name: 'Deformed High-Yield Steel Rebar (Grade 60 / 500W)',
        category: 'Structural',
        quantity: isDuplex ? '6.8 Metric Tons' : '4.2 Metric Tons',
        approximateCost: isDuplex ? '$6,120 / ৳6,70,000' : '$3,780 / ৳4,15,000',
        specs: '10mm, 12mm, 16mm & 20mm ribbed TMT high-ductility steel rebar',
        purpose: 'Tension and shear reinforcement for monolithic concrete skeletal frame.',
        sourcingTip: 'Verify mill test certificate for yield strength and bending ductility.',
      },
      {
        id: 'mat-arch-3',
        name: 'AAC Autoclaved Aerated Concrete Blocks',
        category: 'Structural',
        quantity: '2,400 Blocks (600x200x100mm)',
        approximateCost: '$2,880 / ৳3,15,000',
        specs: 'Dry density 550-650 kg/m³, thermal conductivity 0.12 W/m·K',
        purpose: 'Eco-friendly, lightweight interior partition and perimeter external walls.',
        sourcingTip: 'Reduces building dead-load by up to 50% compared to traditional red clay bricks.',
      },
      {
        id: 'mat-arch-4',
        name: 'Low-E Double-Glazed Argon Tempered Glass Panels',
        category: 'Casing & Facade',
        quantity: '28 Units (Custom Fitted)',
        approximateCost: '$3,920 / ৳4,30,000',
        specs: '6mm Low-E + 12mm Argon spacer + 6mm Clear Tempered glass',
        purpose: 'Thermal barrier windows, sliding balcony doors, and daylight facade.',
        sourcingTip: 'Ensure multi-point locking aluminum thermal-break subframes.',
      },
      {
        id: 'mat-arch-5',
        name: 'Monocrystalline Bifacial Solar PV Rooftop Array',
        category: 'Power & Energy',
        quantity: '16 Panels (550W each, 8.8kW Peak)',
        approximateCost: '$4,840 / ৳5,30,000',
        specs: 'Tier-1 High Efficiency PERC cells with 10kW Hybrid Inverter & 15kWh LiFePO4 battery',
        purpose: 'Off-grid rooftop renewable power generation and grid-tie net metering.',
        sourcingTip: 'Install at optimum 23-degree tilt angle facing south for maximum solar harvest.',
      },
      {
        id: 'mat-arch-6',
        name: 'Smart Multi-Zone VRF HVAC & Air Ducts',
        category: 'Cooling',
        quantity: '1 Outdoor Condenser + 5 Indoor Inverter Cassettes',
        approximateCost: '$5,200 / ৳5,70,000',
        specs: 'Variable Refrigerant Flow R32 eco-gas with HEPA MERV-13 air filtration',
        purpose: 'Zone-by-zone climate control, dehumidification, and fresh air heat recovery.',
        sourcingTip: 'Pre-route insulated copper lines during initial MEP framing phase.',
      },
      {
        id: 'mat-arch-7',
        name: 'PPR-C Hot/Cold Plumbing & PVC Drainage Grid',
        category: 'Plumbing & Gas',
        quantity: '350 Meters Pipes + Fixture Fittings',
        approximateCost: '$1,850 / ৳2,00,000',
        specs: 'Polypropylene Random Copolymer PN20 rated for 95°C hot water',
        purpose: 'Concealed water distribution and acoustic insulated sanitary drainage.',
        sourcingTip: 'Perform 10 bar hydraulic pressure test before wall plastering.',
      },
      {
        id: 'mat-arch-8',
        name: 'Flame-Retardant Copper Wiring & Smart Distribution Matrix',
        category: 'Electronics',
        quantity: '18 Coils (1.5mm², 2.5mm², 4.0mm² FR PVC)',
        approximateCost: '$2,100 / ৳2,30,000',
        specs: '99.99% pure electrolytic copper with RCBO residual current circuit breakers',
        purpose: 'Concealed conduit power wiring, IoT ambient lighting, and high-load appliance feeds.',
        sourcingTip: 'Include dedicated earth grounding rod (<1 ohm ground resistance).',
      },
      {
        id: 'mat-arch-9',
        name: 'Vitrified Porcelain Floor Tiles & Waterproof Membrane',
        category: 'Raw Material',
        quantity: '1,650 Sq Ft (600x1200mm Tiles)',
        approximateCost: '$3,300 / ৳3,60,000',
        specs: 'Anti-slip R10 rating, water absorption <0.05%, laser-cut rectified edges',
        purpose: 'High-traffic floor finish for living lounges, bedrooms, and kitchen zones.',
        sourcingTip: 'Apply 2-coat polymer elastomeric waterproofing in bathrooms and balcony.',
      },
    ];

    const requiredTools: RequiredTool[] = [
      {
        id: 'tool-arch-1',
        name: 'Auto-Leveling 360° Rotary Laser Transit & Plumb',
        category: 'Testing & Measurement',
        purpose: 'Ensuring laser-accurate horizontal foundation leveling and vertical column plumb.',
        isEssential: true,
      },
      {
        id: 'tool-arch-2',
        name: 'Hydraulic Rebar Cutting & Bending Machine',
        category: 'Civil & Construction',
        purpose: 'Precision bending of structural rebar stirrups and heavy column bars up to 25mm.',
        isEssential: true,
      },
      {
        id: 'tool-arch-3',
        name: 'High-Frequency Needle Concrete Vibrator (50mm)',
        category: 'Civil & Construction',
        purpose: 'Compacting wet concrete to eliminate honeycombs and air pockets inside column formwork.',
        isEssential: true,
      },
      {
        id: 'tool-arch-4',
        name: 'PPR Pipe Socket Thermal Fusion Welder (20-63mm)',
        category: 'Mechanical & Machining',
        purpose: 'Leak-proof thermal joint welding of hot/cold plumbing pipes.',
        isEssential: true,
      },
      {
        id: 'tool-arch-5',
        name: 'Heavy-Duty SDS-Max Rotary Hammer Drill & Chisel',
        category: 'Civil & Construction',
        purpose: 'Core drilling through concrete for MEP pipe penetrations and anchor installation.',
        isEssential: true,
      },
      {
        id: 'tool-arch-6',
        name: 'True-RMS Digital Insulation Tester & Earth Ground Clamp',
        category: 'Electronic & Soldering',
        purpose: 'Verifying dielectric insulation resistance of electrical conduits and grounding safety.',
        isEssential: true,
      },
      {
        id: 'tool-arch-7',
        name: 'Personal Protective Equipment (PPE) Full Pack',
        category: 'Safety Equipment',
        purpose: 'High-impact hard hats, steel-toed boots, safety harness with shock-absorbing lanyards.',
        isEssential: true,
      },
    ];

    const buildGuide: BuildGuide = {
      title: isDuplex ? '2-Story Luxury Duplex Villa Construction & Assembly Protocol' : 'Modern Multi-Room Architectural Construction Blueprint',
      estimatedTotalTime: isDuplex ? '5 - 8 Months' : '4 - 6 Months',
      difficultyLevel: 'Industrial / Contractor Grade',
      estimatedTotalCost: isDuplex ? '$42,000 - $68,000 / ৳46,00,000 - ৳75,00,000' : '$28,000 - $45,000 / ৳30,00,000 - ৳50,00,000',
      overview: 'End-to-end civil engineering and architectural execution procedure covering ground soil compaction, reinforced foundation casting, column/slab erection, AAC masonry partitioning, MEP rough-ins, and turn-key interior finishes.',
      prerequisites: [
        'Geotechnical soil test report & approved civil structural engineering drawings.',
        'Municipal zoning building permits, utility line clearance, and boundary demarcation.',
        'Continuous deep tube-well/mains water supply and temporary 3-phase construction power meter.',
        'Excavation access route established for cement ready-mix transit trucks and materials storage.',
      ],
      safetyOverview: [
        'Mandatory OSHA/civil safety gear (PPE) on-site at all times.',
        'Install edge-fall protection railings and safety catch netting around open slab perimeters.',
        'Strict 28-day water ponding curing cycle for all cast concrete slabs before de-shuttering prop removal.',
        'Lockout-Tagout (LOTO) procedures when commissioning main 400V electrical panels.',
      ],
      steps: [
        {
          stepNumber: 1,
          phaseTitle: 'Phase 1: Site Demarcation, Excavation & Mat Foundation Casting',
          estimatedDuration: '3 - 4 Weeks',
          instruction: 'Stake out structural coordinates with laser transit, excavate soil down to virgin hard strata, lay 100mm gravel blinding bed, tie dual-layer Grade-60 rebar mat, and pour monolithic C35 waterproof concrete foundation slab.',
          detailedSteps: [
            'Survey building corners and boundary setbacks using laser theodolite.',
            'Excavate earth to 1.5m depth and compact base soil with mechanical plate compactor to 98% Proctor density.',
            'Lay 100mm thick sand-gravel blinding layer followed by 500-gauge polyethylene vapor barrier.',
            'Fabricate rebar reinforcement matting with 150mm c/c spacing and tie column starter cages.',
            'Pour monolithic C35 mix concrete continuously, vibrating thoroughly with needle vibrators.',
            'Apply wet hessian cloth ponding curing for minimum 14 days.',
          ],
          requiredTools: ['Rotary Laser Transit', 'Needle Concrete Vibrator', 'Rebar Bender', 'Plate Compactor'],
          safetyPrecautions: ['Shore up deep trench walls to prevent soil collapse', 'Ensure clear egress paths for workers'],
          qualityChecks: ['Perform concrete slump test (target 100-120mm)', 'Cast test cubes for 7-day and 28-day compressive break tests'],
        },
        {
          stepNumber: 2,
          phaseTitle: 'Phase 2: Reinforced Columns, Beams & Floor Slab Skeletal Framing',
          estimatedDuration: '4 - 5 Weeks',
          instruction: 'Erect column rebar cages, assemble waterproof phenolic plywood shuttering, cast structural columns, erect falsework scaffolding, and pour intermediate floor slabs.',
          detailedSteps: [
            'Align column rebar cages with laser plumb and secure concrete spacer cover blocks (40mm).',
            'Assemble precision shuttering formwork with heavy-duty steel tie rods.',
            'Pour column concrete in controlled 1.0m lifts to prevent aggregate segregation.',
            'Erect scaffolding falsework, beam bottoms, and slab decking with upward camber of 2mm/meter.',
            'Tie slab reinforcement top and bottom steel mesh, including electrical fan box conduits.',
            'Cast floor slab monolithically with integrated beams and cure for 28 days.',
          ],
          requiredTools: ['Laser Plumb', 'Scaffolding Towers', 'Concrete Pump & Boom', 'Rebar Cutter'],
          safetyPrecautions: ['Do not remove formwork props prematurely', 'Wear safety harnesses when working at height'],
          qualityChecks: ['Verify horizontal slab level with laser receiver', 'Ensure zero honeycombing at beam-column junctions'],
        },
        {
          stepNumber: 3,
          phaseTitle: 'Phase 3: AAC Block Masonry Walls, Door/Window Lintels & Balconies',
          estimatedDuration: '3 - 4 Weeks',
          instruction: 'Lay AAC lightweight block walls with polymer thin-bed mortar, cast reinforced RCC lintels over all openings, and build cantilevered balcony railings.',
          detailedSteps: [
            'Set starting corner blocks with spirit level and polymer adhesive mortar.',
            'Lay block courses with staggered vertical joints and embed horizontal wire mesh reinforcement every 3rd course.',
            'Cast RCC lintels with minimum 150mm bearing over all door and window spans.',
            'Build perimeter parapet walls and reinforced balcony balustrades with weep holes for drainage.',
            'Apply fiber-mesh reinforced exterior waterproof base-coat plaster.',
          ],
          requiredTools: ['Spirit Level', 'Block Cutter Saw', 'Mortar Mixer', 'Scaffolding'],
          safetyPrecautions: ['Install safety guard rails on balconies immediately', 'Keep dust masks on during AAC block cutting'],
          qualityChecks: ['Check 90-degree internal room squareness using 3-4-5 triangle method', 'Verify wall verticality within 3mm tolerance'],
        },
        {
          stepNumber: 4,
          phaseTitle: 'Phase 4: Concealed MEP Rough-In (Electrical, VRF HVAC & PPR Plumbing)',
          estimatedDuration: '3 Weeks',
          instruction: 'Chase wall grooves for electrical conduits, run VRF refrigerant insulated pipes, install hot/cold PPR plumbing lines and sound-insulated drainage drops.',
          detailedSteps: [
            'Cut precise wall chases with dual-blade dustless groove cutter.',
            'Install heavy-duty PVC electrical conduits, distribution boxes, and data cables.',
            'Fuse PPR-C hot and cold water supply lines with thermal socket welder.',
            'Route insulated copper refrigerant lines and condensate drain piping for all VRF air conditioning units.',
            'Perform 10-bar hydraulic pressure test on plumbing network for 24 hours without pressure drop.',
          ],
          requiredTools: ['PPR Fusion Welder', 'Wall Chaser & Vacuum', 'Hydrostatic Test Pump', 'Insulation Tester'],
          safetyPrecautions: ['Verify no live wiring before testing', 'Use ear protection during mechanical groove cutting'],
          qualityChecks: ['Zero pressure drop on 24-hour plumbing hydrostatic hold', 'Check circuit breaker trip curve calibration'],
        },
        {
          stepNumber: 5,
          phaseTitle: 'Phase 5: Glazing, Solar Rooftop Grid & Thermal Waterproofing',
          estimatedDuration: '2 - 3 Weeks',
          instruction: 'Fit double-glazed Low-E aluminum thermal-break windows, install 8.8kW rooftop bifacial solar PV panels with hybrid inverter, and lay roof terrace waterproofing.',
          detailedSteps: [
            'Anchor aluminum thermal-break window subframes with structural silicone sealant.',
            'Glaze Low-E double insulated glass units with argon gas seals.',
            'Apply 3-layer polyurethane elastomeric waterproofing membrane with geotextile fleece on roof slab.',
            'Erect anodized aluminum solar mounting racks at optimal 23° tilt angle.',
            'Mount 550W bifacial solar PV panels, wire DC combiner box, and integrate hybrid inverter & storage battery.',
          ],
          requiredTools: ['Laser Level', 'MC4 Solar Crimping Tool', 'Vacuum Suction Glass Lifters', 'Torque Wrench'],
          safetyPrecautions: ['Double safety tethering when working on roof edges', 'Handle DC high-voltage solar strings with insulated gloves'],
          qualityChecks: ['Perform 48-hour roof water ponding test to confirm 100% leak-proof seal', 'Log solar string open-circuit voltage (Voc) and short-circuit current (Isc)'],
        },
        {
          stepNumber: 6,
          phaseTitle: 'Phase 6: Interior Flooring, Fixtures, Architectural Painting & Commissioning',
          estimatedDuration: '3 - 4 Weeks',
          instruction: 'Lay vitrified porcelain tiles, install sanitary ware and electrical switches, apply breathable anti-microbial paint, and complete final commissioning.',
          detailedSteps: [
            'Lay vitrified porcelain floor tiles with 2mm leveling spacers and epoxy antimicrobial grout.',
            'Mount high-efficiency sanitary fixtures, thermostatic mixer showers, and vanity counters.',
            'Install smart modular touch switches, LED architectural cove lighting, and VRF indoor units.',
            'Apply 2 coats of skim-coat putty followed by premium low-VOC matte interior paint.',
            'Conduct comprehensive load test, airflow balancing, and hand over turnkey architectural building.',
          ],
          requiredTools: ['Tile Laser Cutter', 'Tile Leveling System', 'True-RMS Multimeter', 'Airflow Anemometer'],
          safetyPrecautions: ['Ensure adequate ventilation during painting', 'Verify RCD earth leakage trip functionality'],
          qualityChecks: ['100% tile adhesion without hollow tapping sounds', 'Verify seamless smart home automation response'],
        },
      ],
    };

    return { billOfMaterials, requiredTools, buildGuide };
  }

  // 2. CIRCUIT BOARDS / AI NPUS / ELECTRONICS / EMBEDDED HARDWARE
  if (
    conceptType === 'CIRCUIT_BOARD' ||
    promptLower.includes('pcb') ||
    promptLower.includes('circuit') ||
    promptLower.includes('chip') ||
    promptLower.includes('processor') ||
    promptLower.includes('npu') ||
    promptLower.includes('microcontroller')
  ) {
    const billOfMaterials: BillOfMaterialsItem[] = [
      {
        id: 'mat-pcb-1',
        name: 'FR-4 High-Tg (TG170) 4-Layer Printed Circuit Board',
        category: 'Structural',
        quantity: '5 Prototype Boards',
        approximateCost: '$45.00 / ৳5,200',
        specs: '1.6mm thickness, 1oz inner/outer copper, ENIG immersion gold finish, controlled 50Ω impedance',
        purpose: 'Main structural and electrical routing backbone.',
        sourcingTip: 'Order from JLCPCB / PCBWay with lead-free ENIG surface finish.',
      },
      {
        id: 'mat-pcb-2',
        name: 'ULTRON Neural Processing Core (BGA-484 SoC)',
        category: 'Electronics',
        quantity: '2 Units',
        approximateCost: '$120.00 / ৳14,000',
        specs: '14nm FinFET, 8-Core NPU @ 2.4GHz, 16 TOPS INT8 AI acceleration',
        purpose: 'Edge AI neural inference and sensor telemetry fusion.',
        sourcingTip: 'Store in moisture barrier bag with desiccant until reflow.',
      },
      {
        id: 'mat-pcb-3',
        name: '16GB LPDDR5 High-Speed Memory IC (BGA Stack)',
        category: 'Electronics',
        quantity: '2 Units',
        approximateCost: '$38.00 / ৳4,400',
        specs: '6400 MT/s data rate, 1.1V low-power supply',
        purpose: 'Direct high-bandwidth cache for neural model weights and telemetry buffers.',
        sourcingTip: 'Requires matched trace lengths with length-tuning serpentine meanders.',
      },
      {
        id: 'mat-pcb-4',
        name: 'Synchronous Buck DC-DC Power Management IC (PMIC)',
        category: 'Power & Energy',
        quantity: '4 Units (TPS65218 or equivalent)',
        approximateCost: '$14.00 / ৳1,600',
        specs: '95% efficiency, 0.8V to 3.3V multi-channel outputs @ 10A peak',
        purpose: 'Provides ultra-clean power rails with <10mV ripple to core processor.',
        sourcingTip: 'Place solid low-ESR ceramic decoupling caps directly adjacent to pins.',
      },
      {
        id: 'mat-pcb-5',
        name: 'Vapor Chamber Micro-Fin Anodized Copper Heat Sink',
        category: 'Cooling',
        quantity: '1 Unit (40x40x12mm)',
        approximateCost: '$18.00 / ৳2,100',
        specs: 'Phase-change vapor chamber with 12W/m·K thermal conductive pad',
        purpose: 'Rapidly dissipates 25W thermal dissipation from BGA processor.',
        sourcingTip: 'Use spring-loaded screw mounting to maintain consistent 25 psi clamping pressure.',
      },
      {
        id: 'mat-pcb-6',
        name: 'USB-C 40Gbps Thunderbolt / USB4 Interface Port',
        category: 'Electronics',
        quantity: '2 Units (Mid-mount SMD)',
        approximateCost: '$6.00 / ৳700',
        specs: '24-pin dual-row with ESD TVS diode surge protection arrays',
        purpose: 'High-speed diagnostic data transmission and 100W USB-PD power delivery.',
        sourcingTip: 'Ensure through-hole shield tabs are securely anchored to chassis ground.',
      },
      {
        id: 'mat-pcb-7',
        name: 'SMD Passives Assortment (0402 / 0603 Capacitors & Resistors)',
        category: 'Electronics',
        quantity: '1 Reel (120+ Components)',
        approximateCost: '$12.00 / ৳1,400',
        specs: 'X7R 10uF/0.1uF ceramic capacitors, 0.1% tolerance thin-film resistors',
        purpose: 'High-frequency decoupling, pull-ups, and RC low-pass signal filtering.',
        sourcingTip: 'Use SAC305 lead-free solder paste with Type 4 particle size.',
      },
    ];

    const requiredTools: RequiredTool[] = [
      {
        id: 'tool-pcb-1',
        name: 'Hot Air BGA Rework Station & Micro-Soldering Pen',
        category: 'Electronic & Soldering',
        purpose: 'Precision soldering of fine-pitch SMD ICs and controlled BGA reflow.',
        isEssential: true,
      },
      {
        id: 'tool-pcb-2',
        name: 'Trinocular Stereo Inspection Microscope (7X-45X Zoom)',
        category: 'Testing & Measurement',
        purpose: 'Inspecting micro-solder joints, bridging, and solder ball alignment under BGA chips.',
        isEssential: true,
      },
      {
        id: 'tool-pcb-3',
        name: '4-Channel 200MHz Digital Storage Oscilloscope & Logic Analyzer',
        category: 'Testing & Measurement',
        purpose: 'Validating high-speed clock waveforms, power rail ripple, and I2C/SPI bus packets.',
        isEssential: true,
      },
      {
        id: 'tool-pcb-4',
        name: 'Stainless Steel SMT Solder Paste Stencil & Squeegee',
        category: 'Mechanical & Machining',
        purpose: 'Dispensing consistent solder paste volumes across all SMD component pads.',
        isEssential: true,
      },
      {
        id: 'tool-pcb-5',
        name: 'PID-Controlled Infrared SMT Reflow Oven',
        category: 'Electronic & Soldering',
        purpose: 'Automated 4-zone thermal profile soldering (Preheat, Soak, Reflow, Cool).',
        isEssential: true,
      },
      {
        id: 'tool-pcb-6',
        name: 'ESD-Safe Grounded Wrist Strap & Anti-Static Mat',
        category: 'Safety Equipment',
        purpose: 'Protecting sensitive silicon semiconductor gates from electrostatic breakdown.',
        isEssential: true,
      },
    ];

    const buildGuide: BuildGuide = {
      title: 'AI Neural Coprocessor PCB Assembly & Fabrication Protocol',
      estimatedTotalTime: '6 - 10 Hours',
      difficultyLevel: 'Advanced Engineering',
      estimatedTotalCost: '$250 - $400 / ৳28,000 - ৳45,000',
      overview: 'Step-by-step surface mount assembly and hardware verification procedure for high-speed multi-layer computing and AI edge acceleration PCBs.',
      prerequisites: [
        'Fabricated 4-layer ENIG PCB and laser-cut stainless steel stencil.',
        'SAC305 lead-free solder paste stored at 4°C (thawed 2 hours prior to use).',
        'BOM component pick-and-place reel setup and ESD-safe workstation grounded.',
      ],
      safetyOverview: [
        'Always work in an ESD-protected area with grounded conductive mat.',
        'Use activated carbon fume extractor when heating rosin flux and solder paste.',
        'Allow PCB assembly to cool below 50°C before handling to prevent solder joint micro-cracks.',
      ],
      steps: [
        {
          stepNumber: 1,
          phaseTitle: 'Phase 1: Bare PCB Quality Inspection & Solder Paste Stencil Printing',
          estimatedDuration: '1 Hour',
          instruction: 'Inspect bare board for etch defects, mount PCB in alignment fixture, register stainless steel stencil, and squeegee SAC305 solder paste across all pads.',
          detailedSteps: [
            'Check bare PCB under microscope for copper shorts or ENIG oxidation.',
            'Clamp PCB into stencil printing jig and align fiducial marks under 10X magnification.',
            'Apply SAC305 solder paste and wipe with 45-degree stainless squeegee in one continuous stroke.',
            'Inspect paste volume on fine-pitch 0.5mm BGA pads to ensure zero bridging or insufficient deposition.',
          ],
          requiredTools: ['SMT Stencil Jig', 'Stereo Microscope', 'Stainless Squeegee'],
          safetyPrecautions: ['Wear nitrile gloves when handling solder paste containing silver alloy'],
          qualityChecks: ['Uniform paste height of 100um with crisp pad definition under microscope'],
        },
        {
          stepNumber: 2,
          phaseTitle: 'Phase 2: SMD Component Placement & BGA Ball Alignment',
          estimatedDuration: '2 Hours',
          instruction: 'Place discrete 0402 passives, power ICs, and high-density BGA neural processor and memory chips using vacuum pickup pen.',
          detailedSteps: [
            'Place 0402 ceramic capacitors and precision resistors along power rails.',
            'Mount USB-C mid-mount receptacle and TVS surge protection diodes.',
            'Align BGA neural processor chip using PCB silkscreen corner guidelines and optical split-vision.',
            'Place LPDDR5 memory stack with light downward pressure to seat solder balls into flux paste.',
          ],
          requiredTools: ['Vacuum SMD Pickup Pen', 'Fine-Tip Titanium Tweezers', 'Magnification Lamp'],
          safetyPrecautions: ['Maintain continuous ESD wrist strap grounding'],
          qualityChecks: ['Verify component polarity markings (Pin 1 dots, electrolytic diode bands)'],
        },
        {
          stepNumber: 3,
          phaseTitle: 'Phase 3: Thermal Profile Reflow Soldering',
          estimatedDuration: '1.5 Hours',
          instruction: 'Run PCB through PID-controlled reflow oven according to lead-free temperature curve.',
          detailedSteps: [
            'Preheat phase: Ramp from 25°C to 150°C at 1.5°C/sec to activate flux solvent evaporate.',
            'Soak phase: Hold at 150°C - 180°C for 90 seconds to equalize thermal mass across PCB.',
            'Reflow peak: Ramp to 245°C peak for 30 seconds to achieve complete solder melting and wetting.',
            'Cooling phase: Controlled cooling at 3°C/sec to form fine-grain intermetallic solder joints.',
          ],
          requiredTools: ['PID SMT Reflow Oven', 'K-Type Thermocouple Logger'],
          safetyPrecautions: ['Use heat-resistant silicone gloves when extracting hot reflow tray', 'Fume extractor on maximum'],
          qualityChecks: ['Inspect BGA perimeter for uniform collapse and zero solder bead shorts'],
        },
        {
          stepNumber: 4,
          phaseTitle: 'Phase 4: Optical Joint Inspection & Ultrasonic Flux Cleaning',
          estimatedDuration: '1 Hour',
          instruction: 'Inspect all solder fillets under microscope, touch up any dry joints with micro-iron, and wash PCB in ultrasonic IPA bath.',
          detailedSteps: [
            'Examine every IC lead under 45X magnification for shiny, concave solder fillets.',
            'Submerge PCB into ultrasonic bath with 99.9% pure Isopropyl Alcohol (IPA) for 8 minutes to dissolve flux residue.',
            'Blow dry with dry nitrogen or clean compressed air at 40°C.',
          ],
          requiredTools: ['Stereo Microscope', 'Ultrasonic Cleaner', 'Micro-Soldering Pen'],
          safetyPrecautions: ['Keep IPA away from open sparks or hot soldering elements'],
          qualityChecks: ['Zero ionic contamination or sticky flux residue on high-impedance trace lines'],
        },
        {
          stepNumber: 5,
          phaseTitle: 'Phase 5: Power Rail Impedance Check & Smoke-Stopper Boot',
          estimatedDuration: '1.5 Hours',
          instruction: 'Perform unpowered resistance checks on 3.3V, 1.8V, 1.1V, and 0.8V rails, then apply current-limited bench power.',
          detailedSteps: [
            'Measure resistance between all power rails and ground (verify >100Ω on core rail, >10kΩ on I/O rails).',
            'Connect 12V input through current-limited benchtop power supply set to 100mA limit (Smoke-Stopper).',
            'Check step-down switching PMIC outputs with digital multimeter (verify 0.80V ±1%, 1.10V ±1%, 3.30V ±1%).',
            'Verify thermal camera image shows zero hot-spots (>45°C) during idle boot state.',
          ],
          requiredTools: ['Digital Multimeter', 'Benchtop Power Supply', 'FLIR Thermal Camera'],
          safetyPrecautions: ['Cut power immediately if current draw exceeds 150mA during initial boot'],
          qualityChecks: ['Power rail noise ripple <15mV peak-to-peak on oscilloscope'],
        },
        {
          stepNumber: 6,
          phaseTitle: 'Phase 6: Heat Sink Clamping, Firmware Flashing & Stress Test',
          estimatedDuration: '2 Hours',
          instruction: 'Mount vapor chamber heat sink with thermal pad, flash bootloader over USB-C, and run 100% compute stress benchmarks.',
          detailedSteps: [
            'Apply high-conductivity thermal interface pad over NPU SoC core.',
            'Clamp anodized aluminum vapor chamber heat sink with calibrated 25 psi tension springs.',
            'Flash firmware and edge AI model weights via USB-C DFU mode.',
            'Run continuous INT8 matrix multiplication stress test for 1 hour while logging core temperature (<65°C target).',
          ],
          requiredTools: ['Torque Screwdriver', 'Oscilloscope', 'PC Terminal Host'],
          safetyPrecautions: ['Do not touch energized switching inductors during full load test'],
          qualityChecks: ['100% packet integrity over USB-C and zero dropped neural inference frames'],
        },
      ],
    };

    return { billOfMaterials, requiredTools, buildGuide };
  }

  // 3. ROBOTICS / ROBOTIC ARMS / CYBERNETICS / MECHANISMS
  if (
    conceptType === 'ROBOTIC_ARM' ||
    promptLower.includes('robot') ||
    promptLower.includes('arm') ||
    promptLower.includes('exoskeleton') ||
    promptLower.includes('bionic') ||
    promptLower.includes('actuator') ||
    promptLower.includes('servo') ||
    promptLower.includes('mechanism')
  ) {
    const billOfMaterials: BillOfMaterialsItem[] = [
      {
        id: 'mat-rob-1',
        name: 'CNC Milled 7075-T6 Aerospace Aluminum Structural Arms',
        category: 'Mechanical',
        quantity: '6 Link Segments (Anodized)',
        approximateCost: '$480.00 / ৳55,000',
        specs: 'High strength-to-weight ratio, tensile yield strength 503 MPa, ±0.02mm tolerance',
        purpose: 'Main articulating skeletal structure for 6-axis degrees of freedom.',
        sourcingTip: 'Order precision CNC milling with hard-anodized surface finish.',
      },
      {
        id: 'mat-rob-2',
        name: 'Zero-Backlash Strain Wave Harmonic Drive Reducers',
        category: 'Mechanical',
        quantity: '6 Units (Ratio 1:50 & 1:100)',
        approximateCost: '$720.00 / ৳82,000',
        specs: 'Zero backlash (<10 arcsec), high torque density up to 85 Nm',
        purpose: 'Provides silky smooth, ultra-precise torque multiplication for all joints.',
        sourcingTip: 'Use synthetic grease designed for harmonic gear flexsplines.',
      },
      {
        id: 'mat-rob-3',
        name: 'Frameless High-Torque Brushless DC (BLDC) Motors',
        category: 'Power & Energy',
        quantity: '6 Motors (24V - 48V rated)',
        approximateCost: '$360.00 / ৳41,000',
        specs: 'High pole count, low cogging torque, neodymium N52 magnets',
        purpose: 'Directly powers rotary joint motion with rapid dynamic response.',
        sourcingTip: 'Integrate directly inside hollow-shaft harmonic gearboxes.',
      },
      {
        id: 'mat-rob-4',
        name: '17-Bit Absolute Magnetic Rotary Encoders',
        category: 'Sensors & IoT',
        quantity: '6 Encoders (BiSS-C / SSI Interface)',
        approximateCost: '$150.00 / ৳17,000',
        specs: '131,072 counts per revolution (0.0027° resolution)',
        purpose: 'Instant joint angle tracking without needing homing cycles on startup.',
        sourcingTip: 'Shield encoder cables against high-frequency motor switching PWM noise.',
      },
      {
        id: 'mat-rob-5',
        name: 'STM32 / CAN-FD Distributed Servo Motion Driver Nodes',
        category: 'Electronics',
        quantity: '6 Joint Controllers + 1 Master Host',
        approximateCost: '$240.00 / ৳27,500',
        specs: 'FOC (Field Oriented Control) algorithm, 10Mbps CAN-FD bus, 20kHz current loop',
        purpose: 'Real-time microsecond-level joint trajectory and torque closed-loop control.',
        sourcingTip: 'Daisy-chain with twisted shielded pair cabling and 120Ω termination.',
      },
      {
        id: 'mat-rob-6',
        name: 'Adaptive Electric 3-Jaw Servo Gripper with Force Feedback',
        category: 'Mechanical',
        quantity: '1 End-Effector Unit',
        approximateCost: '$180.00 / ৳20,500',
        specs: '0-100mm stroke, 0-80N controllable gripping force, soft silicone tip inserts',
        purpose: 'Versatile grasping and manipulating of delicate or heavy objects.',
        sourcingTip: 'Calibrate load cell force sensors prior to automated pick routines.',
      },
      {
        id: 'mat-rob-7',
        name: '48V 1200W Industrial Switch-Mode Power Supply',
        category: 'Power & Energy',
        quantity: '1 Unit (Mean Well RSP-1200-48)',
        approximateCost: '$165.00 / ৳19,000',
        specs: '48V DC @ 25A output, active PFC, dynamic regenerative braking dissipation clamp',
        purpose: 'Delivers high peak current during rapid robotic accelerations.',
        sourcingTip: 'Install dynamic braking dump resistor to absorb back-EMF energy.',
      },
    ];

    const requiredTools: RequiredTool[] = [
      {
        id: 'tool-rob-1',
        name: 'Precision Torque-Limiting Hex Screwdriver Set (0.2 - 5.0 Nm)',
        category: 'Mechanical & Machining',
        purpose: 'Torquing aluminum fasteners to exact factory specs without stripping threads.',
        isEssential: true,
      },
      {
        id: 'tool-rob-2',
        name: 'USB-to-CAN-FD Bus Diagnostic Protocol Analyzer',
        category: 'Testing & Measurement',
        purpose: 'Monitoring real-time telemetry packets, PID loop errors, and joint currents.',
        isEssential: true,
      },
      {
        id: 'tool-rob-3',
        name: 'Dial Test Indicator (0.001mm) & Magnetic Base',
        category: 'Testing & Measurement',
        purpose: 'Checking rotary joint concentricity and backlash play on harmonic gearboxes.',
        isEssential: true,
      },
      {
        id: 'tool-rob-4',
        name: '48V Current-Limited Benchtop DC Power Supply',
        category: 'Electronic & Soldering',
        purpose: 'Safe individual joint motor calibration and FOC phase angle alignment.',
        isEssential: true,
      },
      {
        id: 'tool-rob-5',
        name: 'Chemical Threadlocker (Loctite 243 Blue / 271 Red)',
        category: 'Safety Equipment',
        purpose: 'Preventing fastener loosening under continuous vibrational cycles.',
        isEssential: true,
      },
    ];

    const buildGuide: BuildGuide = {
      title: '6-DoF Precision Articulated Robotic Arm Fabrication & Calibration Protocol',
      estimatedTotalTime: '2 - 3 Days',
      difficultyLevel: 'Advanced Engineering',
      estimatedTotalCost: '$2,200 - $3,500 / ৳2,50,000 - ৳4,00,000',
      overview: 'Mechanical assembly, harmonic drive integration, distributed FOC servo driver wiring, kinematic calibration, and trajectory tuning of an industrial precision 6-axis robot manipulator.',
      prerequisites: [
        'CNC machined 7075 aluminum linkage components and harmonic gearsets ready.',
        'Motor drivers pre-flashed with FOC servo firmware.',
        'Sturdy steel base plate (min 20kg) bolted securely to test workbench.',
      ],
      safetyOverview: [
        'Always keep Emergency Stop (E-Stop) button within immediate arm reach during motor testing.',
        'Never place hands inside the robotic workspace during initial motion commands.',
        'Configure maximum software velocity clamps at 10% during first-time trajectory runs.',
      ],
      steps: [
        {
          stepNumber: 1,
          phaseTitle: 'Phase 1: Base Turntable & Axis 1 Harmonic Reducer Assembly',
          estimatedDuration: '4 Hours',
          instruction: 'Mount Axis-1 BLDC motor and harmonic drive reducer onto heavy steel base plate with Loctite 243 threadlocker.',
          detailedSteps: [
            'Bolt main turntable housing to steel base plate with M6 Grade 12.9 high-tensile bolts.',
            'Press Axis-1 harmonic gearbox flexspline into housing with uniform torque pattern.',
            'Mount frameless BLDC rotor onto gearbox input shaft and tighten clamping collar.',
            'Install 17-bit magnetic absolute encoder disc and verify 0.5mm air gap to sensor PCB.',
          ],
          requiredTools: ['Torque Screwdriver', 'Dial Indicator', 'Loctite 243'],
          safetyPrecautions: ['Ensure heavy base plate is securely clamped to table to prevent tipping'],
          qualityChecks: ['Radial runout on base turntable <0.02mm measured with dial indicator'],
        },
        {
          stepNumber: 2,
          phaseTitle: 'Phase 2: Shoulder (Axis 2) & Elbow (Axis 3) Structural Linkages',
          estimatedDuration: '6 Hours',
          instruction: 'Assemble the high-torque shoulder and elbow joints with internal hollow-shaft wiring conduits.',
          detailedSteps: [
            'Bolt high-ratio (1:100) harmonic drive reducers into Axis-2 shoulder housing.',
            'Attach 7075-T6 aluminum upper arm extrusion and check alignment under load.',
            'Integrate Axis-3 elbow actuator assembly and route power/CAN-FD cables through center hollow bore.',
            'Verify smooth 360-degree rotation of all joints by hand before applying electrical power.',
          ],
          requiredTools: ['Metric Hex Set', 'Torque Wrench', 'Cable Guide Tool'],
          safetyPrecautions: ['Support upper arm with counterweight or foam block during assembly'],
          qualityChecks: ['Zero axial play or gear binding throughout full ±135° joint travel'],
        },
        {
          stepNumber: 3,
          phaseTitle: 'Phase 3: 3-Axis Wrist Assembly & Adaptive Gripper Installation',
          estimatedDuration: '5 Hours',
          instruction: 'Assemble compact 3-axis spherical wrist (Axes 4, 5, 6) and attach the electric servo gripper.',
          detailedSteps: [
            'Mount compact 1:50 harmonic reducers for roll-pitch-roll wrist configuration.',
            'Wire miniature absolute encoders and FOC controller micro-nodes inside wrist housing.',
            'Bolt electric 3-jaw gripper to Axis-6 tool flange ISO 9409-1-50-4-M6.',
            'Connect gripper 24V power and RS-485 serial communication cable.',
          ],
          requiredTools: ['Micro-Hex Drivers', 'Wire Strippers', 'Digital Multimeter'],
          safetyPrecautions: ['Ensure internal cables have sufficient slack for ±360° continuous wrist rotation'],
          qualityChecks: ['Confirm gripper fingers close concentrically to center within 0.05mm'],
        },
        {
          stepNumber: 4,
          phaseTitle: 'Phase 4: Distributed CAN-FD Wiring & Power Harness Integration',
          estimatedDuration: '4 Hours',
          instruction: 'Wire the daisy-chained CAN-FD communication bus and 48V DC power distribution harness.',
          detailedSteps: [
            'Connect 48V power bus cables to each joint node in parallel using heavy 14AWG silicone wire.',
            'Daisy-chain CAN-FD high-speed data bus from Master controller to Joint 1 through Joint 6.',
            'Install 120Ω precision termination resistor at the final wrist node.',
            'Perform unpowered continuity and short-circuit insulation tests.',
          ],
          requiredTools: ['CAN-FD Protocol Analyzer', 'Digital Multimeter', 'Crimping Tool'],
          safetyPrecautions: ['Check polarity carefully; reverse 48V connection will destroy MOSFET driver bridges'],
          qualityChecks: ['Zero packet drop or frame error on 5Mbps CAN-FD bus test'],
        },
        {
          stepNumber: 5,
          phaseTitle: 'Phase 5: FOC Motor Calibration & Kinematic Zero-Point Alignment',
          estimatedDuration: '5 Hours',
          instruction: 'Run automated Field Oriented Control (FOC) electrical offset calibration and calibrate joint home positions.',
          detailedSteps: [
            'Power each joint sequentially and run automated FOC phase angle and resistance calibration routine.',
            'Move arm to mechanical physical alignment jig to zero all 17-bit magnetic encoders.',
            'Tune proportional-integral-derivative (PID) position and velocity feedback gains.',
            'Verify closed-loop positional holding under 5kg static cantilever load.',
          ],
          requiredTools: ['PC Calibration GUI', 'Laser Distance Sensor', 'Oscilloscope'],
          safetyPrecautions: ['Keep E-Stop engaged between test sweeps; stand outside arm maximum radius'],
          qualityChecks: ['Repeatable positioning accuracy within ±0.03mm across 100 test cycles'],
        },
        {
          stepNumber: 6,
          phaseTitle: 'Phase 6: Trajectory Generation, Speed Profiling & Stress Testing',
          estimatedDuration: '4 Hours',
          instruction: 'Execute S-curve smooth trajectory motion profiles and run full-payload endurance stress test.',
          detailedSteps: [
            'Test Cartesian linear path interpolation (X, Y, Z translation with fixed tool orientation).',
            'Ramp joint speeds up to 180°/sec while monitoring motor driver temperatures (<55°C).',
            'Run continuous 1000-cycle pick-and-place benchmark with 3.5kg payload.',
            'Verify safety collision detection triggers soft E-Stop if force exceeds 25N threshold.',
          ],
          requiredTools: ['Benchmark Test Host', 'FLIR Thermal Camera', 'Sound Level Meter'],
          safetyPrecautions: ['Safety cage or light curtain active during high-speed tests'],
          qualityChecks: ['100% trajectory repeatability without thermal throttling or tracking error'],
        },
      ],
    };

    return { billOfMaterials, requiredTools, buildGuide };
  }

  // 4. JET PROPULSION / TURBOFAN ENGINES / AEROSPACE
  if (
    conceptType === 'JET_ENGINE' ||
    promptLower.includes('jet') ||
    promptLower.includes('engine') ||
    promptLower.includes('turbine') ||
    promptLower.includes('thruster') ||
    promptLower.includes('propulsion') ||
    promptLower.includes('rocket')
  ) {
    const billOfMaterials: BillOfMaterialsItem[] = [
      {
        id: 'mat-jet-1',
        name: 'Inconel 718 High-Temperature Superalloy Turbine Rotor Discs',
        category: 'Mechanical',
        quantity: '2 Stage Discs (5-Axis CNC Milled)',
        approximateCost: '$1,400.00 / ৳1,60,000',
        specs: 'High creep-rupture strength up to 980°C, nickel-chromium superalloy',
        purpose: 'Extracts kinetic energy from high-velocity combustion exhaust to drive compressor.',
        sourcingTip: 'Require dynamic balancing certification <0.005g tolerance.',
      },
      {
        id: 'mat-jet-2',
        name: 'Titanium Ti-6Al-4V Grade 5 Compressor Blades & Impeller',
        category: 'Mechanical',
        quantity: '1 Centrifugal Impeller + 3 Axial Stages',
        approximateCost: '$850.00 / ৳97,000',
        specs: 'Density 4.43 g/cm³, tensile strength 950 MPa, aerodynamic airfoil profile',
        purpose: 'Compresses ambient intake air by 6:1 pressure ratio before combustion chamber.',
        sourcingTip: 'Check with ultrasonic non-destructive flaw detection.',
      },
      {
        id: 'mat-jet-3',
        name: 'Ceramic Hybrid High-Speed Bearings (120,000 RPM Rated)',
        category: 'Mechanical',
        quantity: '2 Bearings (Silicon Nitride Si3N4 Balls + Steel Rings)',
        approximateCost: '$320.00 / ৳36,500',
        specs: 'ABEC-9 precision, oil-fuel mist lubrication channel, low friction coefficient',
        purpose: 'Supports the main high-speed rotating central spool shaft.',
        sourcingTip: 'Requires filtered 5-micron continuous fuel-oil lubrication feed.',
      },
      {
        id: 'mat-jet-4',
        name: 'Annular Combustion Chamber with Thermal Barrier Ceramic Coating',
        category: 'Structural',
        quantity: '1 Unit (316L Stainless with Yttria-Stabilized Zirconia)',
        approximateCost: '$450.00 / ৳51,500',
        specs: 'Multi-hole dilution air swirlers, operates at 1150°C internal flame core',
        purpose: 'Provides stable continuous combustion of atomized aviation fuel.',
        sourcingTip: 'Verify laser-drilled cooling hole pattern for uniform flame containment.',
      },
      {
        id: 'mat-jet-5',
        name: 'High-Pressure Micro Fuel Pump & 12x Swirl Atomizer Nozzles',
        category: 'Mechanical',
        quantity: '1 Pump + 12 Precision Nozzles',
        approximateCost: '$280.00 / ৳32,000',
        specs: '60 PSI operating pressure, 25 micron droplet atomization, Jet-A1 / Kerosene',
        purpose: 'Delivers finely atomized fuel mist for instantaneous combustion.',
        sourcingTip: 'Install dual fuel filter (10 micron pre-filter, 3 micron final filter).',
      },
      {
        id: 'mat-jet-6',
        name: 'Electronic Engine Control Unit (Full Authority FADEC)',
        category: 'Electronics',
        quantity: '1 FADEC Unit with Dual EGT Thermocouples & RPM Sensors',
        approximateCost: '$350.00 / ৳40,000',
        specs: '32-bit ARM Cortex-M7, automated startup glow plug control, over-speed cutoff',
        purpose: 'Autonomous fuel flow regulation, RPM stabilization, and flame-out detection.',
        sourcingTip: 'Shield all sensor cables with high-temperature fiberglass silicone sleeving.',
      },
    ];

    const requiredTools: RequiredTool[] = [
      {
        id: 'tool-jet-1',
        name: 'Dynamic High-Speed Spool Balancing Machine (<0.005g)',
        category: 'Testing & Measurement',
        purpose: 'Balancing the high-speed turbine and compressor shaft up to 100,000 RPM.',
        isEssential: true,
      },
      {
        id: 'tool-jet-2',
        name: 'High-Pressure Nitrogen Leak & Fuel Spray Test Bench',
        category: 'Testing & Measurement',
        purpose: 'Verifying fuel manifold atomization spray cone and zero fuel leaks.',
        isEssential: true,
      },
      {
        id: 'tool-jet-3',
        name: 'Precision Micrometer Bore Gauges (0.001mm Resolution)',
        category: 'Mechanical & Machining',
        purpose: 'Measuring exact bearing seat clearances and turbine tip shroud clearances.',
        isEssential: true,
      },
      {
        id: 'tool-jet-4',
        name: 'Dual K-Type High-Temp Exhaust Gas Temperature (EGT) Pyrometer',
        category: 'Testing & Measurement',
        purpose: 'Monitoring turbine inlet and exhaust temperatures up to 1200°C.',
        isEssential: true,
      },
      {
        id: 'tool-jet-5',
        name: 'Heavy-Duty CO2 Fire Extinguishing System & Blast Shield',
        category: 'Safety Equipment',
        purpose: 'Immediate emergency fire suppression during static test cell hot runs.',
        isEssential: true,
      },
    ];

    const buildGuide: BuildGuide = {
      title: 'Micro-Turbofan Jet Propulsion Engine Assembly & Test Cell Protocol',
      estimatedTotalTime: '4 - 6 Days',
      difficultyLevel: 'Industrial / Contractor Grade',
      estimatedTotalCost: '$3,800 - $6,500 / 4,30,000 - 7,40,000',
      overview: 'Precision aerospace turbine assembly, high-speed ceramic bearing alignment, combustion liner fitting, FADEC electronic governor integration, and static thrust stand qualification.',
      prerequisites: [
        'Balanced turbine and compressor rotors with balancing certificates.',
        'High-pressure test bench and clean Jet-A / Kerosene fuel with 5% turbine synthetic oil mix.',
        'Outdoor static test stand equipped with load cell, blast barrier, and fire suppression.',
      ],
      safetyOverview: [
        'Never stand in the rotational plane of the turbine during high-speed spinning.',
        'Always maintain a pressurized CO2 fire extinguisher directly next to the test stand.',
        'Wear Class-5 ear defenders (noise levels exceed 115 dB during full thrust).',
      ],
      steps: [
        {
          stepNumber: 1,
          phaseTitle: 'Phase 1: Spool Shaft Machining & Ceramic Bearing Installation',
          estimatedDuration: '6 Hours',
          instruction: 'Fit high-speed ceramic hybrid bearings onto the central hardened steel shaft and verify preload.',
          detailedSteps: [
            'Measure shaft bearing journals with 0.001mm micrometer to ensure exact interference fit.',
            'Heat ceramic bearings to 80°C in induction heater and slide onto shaft against shoulder stop.',
            'Install wave spring washer to apply constant 45N axial preload on bearing outer races.',
            'Check shaft free spin; must spin smoothly for >15 seconds with zero drag.',
          ],
          requiredTools: ['Induction Bearing Heater', 'Micrometer Bore Gauge', 'Preload Gauge'],
          safetyPrecautions: ['Use insulated thermal gloves when handling hot bearings'],
          qualityChecks: ['Shaft radial runout <0.003mm along entire length'],
        },
        {
          stepNumber: 2,
          phaseTitle: 'Phase 2: Compressor & Inconel Turbine Rotor Dynamic Balancing',
          estimatedDuration: '8 Hours',
          instruction: 'Mount titanium compressor and Inconel turbine disc to shaft and perform two-plane dynamic balancing.',
          detailedSteps: [
            'Assemble compressor wheel, shaft, turbine disc, and lock with high-temperature locking nut.',
            'Place spool assembly onto dynamic balancing rig and spin up to 15,000 RPM.',
            'Measure phase and magnitude of residual unbalance on both planes.',
            'Carefully remove material from designated balancing rims until residual unbalance is <0.005g·mm.',
          ],
          requiredTools: ['Dynamic Balancing Rig', 'Micro-Die Grinder', 'Precision Gram Scale'],
          safetyPrecautions: ['Ensure protective polycarbonate enclosure is closed during high-speed balancing spins'],
          qualityChecks: ['Residual unbalance certified below ISO G1.0 balancing grade'],
        },
        {
          stepNumber: 3,
          phaseTitle: 'Phase 3: Annular Combustion Chamber & Fuel Injector Manifold Fitting',
          estimatedDuration: '6 Hours',
          instruction: 'Install annular combustion liner, thermal ceramic heat shields, and 12-point fuel injection ring.',
          detailedSteps: [
            'Slide ceramic-coated combustion chamber inside outer stainless steel case.',
            'Install 12 swirl atomizer nozzles evenly spaced around combustion liner periphery.',
            'Connect stainless steel fuel manifold ring and pressurize with nitrogen to 100 PSI to check seals.',
            'Install high-energy plasma spark igniter / ceramic glow plug.',
          ],
          requiredTools: ['Pressure Test Rig', 'Torque Wrench', 'Inspection Mirror'],
          safetyPrecautions: ['Ensure zero fuel residue inside combustion case before electrical spark test'],
          qualityChecks: ['All 12 nozzles produce uniform 60° conical atomized fuel spray'],
        },
        {
          stepNumber: 4,
          phaseTitle: 'Phase 4: Turbine Nozzle Guide Vanes & Exhaust Casing Integration',
          estimatedDuration: '6 Hours',
          instruction: 'Assemble stator nozzle guide vanes, set turbine blade tip clearance (0.25mm), and install outer nacelle.',
          detailedSteps: [
            'Install stator nozzle guide vane ring to direct hot combustion gas at optimal angle onto turbine blades.',
            'Measure and set radial blade tip clearance between Inconel turbine and shroud ring to 0.25mm ±0.03mm.',
            'Torque rear exhaust cone with ceramic high-temperature anti-seize paste.',
            'Install outer bypass nacelle and connect lubrication return ports.',
          ],
          requiredTools: ['Feeler Gauges', 'Dial Indicator', 'Torque Wrench'],
          safetyPrecautions: ['Blade tip clearance must not be less than 0.20mm to prevent thermal expansion binding'],
          qualityChecks: ['Confirm 360-degree blade tip clearance uniformity with feeler gauge'],
        },
        {
          stepNumber: 5,
          phaseTitle: 'Phase 5: FADEC Electronics, Sensors & Cold Starter Motor Test',
          estimatedDuration: '5 Hours',
          instruction: 'Wire FADEC engine control computer, EGT thermocouple probes, optical RPM counter, and electric starter motor.',
          detailedSteps: [
            'Mount FADEC engine controller and connect dual high-response EGT thermocouples.',
            'Install optical reflection RPM sensor on compressor intake spinner.',
            'Connect electric brushless starter motor with overrunning clutch mechanism.',
            'Perform cold spin test: starter spins spool to 25,000 RPM; FADEC reads RPM and oil pressure correctly.',
          ],
          requiredTools: ['FADEC Terminal Software', 'Multimeter', 'Optical Tachometer'],
          safetyPrecautions: ['Verify auto-abort safety triggers if starter current spikes'],
          qualityChecks: ['FADEC receives stable RPM telemetry at 25,000 RPM with zero electrical noise'],
        },
        {
          stepNumber: 6,
          phaseTitle: 'Phase 6: Static Test Stand Hot Run, Ignition & Thrust Curve Certification',
          estimatedDuration: '6 Hours',
          instruction: 'Mount jet engine onto calibrated thrust measurement test bench, execute automated hot startup, and log thrust curves.',
          detailedSteps: [
            'Secure engine onto linear rolling test stand connected to 500N S-beam load cell.',
            'Initiate automated FADEC startup sequence: Starter spins to 20k RPM -> Glow plug activates -> Fuel solenoid pulses -> Smooth ignition strike.',
            'Monitor EGT temperature during light-off (must remain below 750°C during ramp).',
            'Progressively advance throttle from idle (45k RPM) to 100% full thrust (110k RPM).',
            'Log thrust output (250N peak), specific fuel consumption, and vibration telemetry.',
          ],
          requiredTools: ['Thrust Load Cell Stand', 'EGT Data Logger', 'CO2 Fire Suppression System'],
          safetyPrecautions: ['All personnel behind polycarbonate blast wall during hot thrust runs'],
          qualityChecks: ['Engine produces rated 250N (25.5 kg) thrust with EGT <680°C and instant throttle response'],
        },
      ],
    };

    return { billOfMaterials, requiredTools, buildGuide };
  }

  // 5. LASER LIGHT / LASER POINTER / FLASHLIGHT / TORCH / LIGHTSABER / OPTICAL GADGETS
  if (
    promptLower.includes('laser') ||
    promptLower.includes('লেজার') ||
    promptLower.includes('torch') ||
    promptLower.includes('flashlight') ||
    promptLower.includes('lightsaber') ||
    promptLower.includes('pointer') ||
    promptLower.includes('light beam') ||
    promptLower.includes('বাতি')
  ) {
    const billOfMaterials: BillOfMaterialsItem[] = [
      {
        id: 'mat-laser-1',
        name: '532nm DPSS / Direct Diode High-Power Green Laser Core Module',
        category: 'Electronics',
        quantity: '1 Optical Emitter (500mW - 1000mW CW)',
        approximateCost: '$45.00 / ৳5,200',
        specs: '532nm emerald wavelength, TO-56 / 9mm brass package, integrated photodiode',
        purpose: 'Emits intense coherent monochromatic photon beam.',
        sourcingTip: 'Use a copper heat-sink host sleeve for continuous duty heat dissipation.',
      },
      {
        id: 'mat-laser-2',
        name: 'CNC Machined 6061-T6 Aerospace Aluminum Alloy Grip Body & Bezel',
        category: 'Casing & Facade',
        quantity: '1 Unibody Barrel + Tailcap + Crown (3 Parts)',
        approximateCost: '$28.00 / ৳3,200',
        specs: 'Type-III hard-anodized matte black finish, knurled anti-slip diamond grip, IP68 O-ring seals',
        purpose: 'Provides rigid structural housing, ergonomic hand grip, and thermal heatsink.',
        sourcingTip: 'Ensure CNC lathe cutting tolerances within ±0.02mm for seamless waterproof threading.',
      },
      {
        id: 'mat-laser-3',
        name: 'Constant-Current Boost Switching Laser Driver Circuit Board',
        category: 'Electronics',
        quantity: '1 Driver PCB (1.8A Buck-Boost)',
        approximateCost: '$18.00 / ৳2,100',
        specs: 'Adjustable 300mA - 2200mA constant current, soft-start surge protection, reverse polarity diode',
        purpose: 'Regulates stable current to laser diode regardless of battery voltage drops.',
        sourcingTip: 'Calibrate output current using dummy load resistor before connecting diode.',
      },
      {
        id: 'mat-laser-4',
        name: '3.7V 3000mAh 18650 High-Drain Li-Ion Rechargeable Battery Cell',
        category: 'Power & Energy',
        quantity: '1 Cell (10A Continuous Discharge)',
        approximateCost: '$12.00 / ৳1,400',
        specs: 'Button-top 18650 lithium-ion cell with built-in PCB protection circuit against over-discharge',
        purpose: 'Powers the high-output driver and optical laser module for 2.5+ hours of operation.',
        sourcingTip: 'Charge with dedicated intelligent Li-ion CC/CV charger at 1.0A rate.',
      },
      {
        id: 'mat-laser-5',
        name: 'Multi-Coated AR Optical Glass Focusing Collimator Lens',
        category: 'Mechanical',
        quantity: '1 3-Element Glass Lens Set (M9x0.5 Thread)',
        approximateCost: '$15.00 / ৳1,700',
        specs: 'Anti-reflective (AR) broadband coating (400-700nm), 99.2% optical transmission, brass threaded housing',
        purpose: 'Focuses divergent raw laser light into a pin-point parallel beam or concentrated burn point.',
        sourcingTip: 'Adjust focal length by rotating the front knurled brass focusing crown.',
      },
      {
        id: 'mat-laser-6',
        name: 'Tactile Clicky Push-Button Switch & Gold-Plated Phosphor Bronze Spring',
        category: 'Fasteners & Hardware',
        quantity: '1 Tailcap Switch Assembly',
        approximateCost: '$6.50 / ৳750',
        specs: 'Forward-clicky momentary/constant on, rated 3A 250V, low-resistance gold spring',
        purpose: 'User on/off power switching and high-conductivity negative battery contact.',
        sourcingTip: 'Apply conductive de-oxit grease on tailcap threads for maximum electrical flow.',
      },
    ];

    const requiredTools: RequiredTool[] = [
      {
        id: 'tool-laser-1',
        name: 'CNC Metal Lathe Machine (হাতে ধরার অ্যালুমিনিয়াম বডি কাটার লেদ মেশিন)',
        category: 'Mechanical & Machining',
        purpose: 'Precision turning, knurling, and internal M9/M20 threading of aluminum flashlight barrel and tailcap.',
        isEssential: true,
      },
      {
        id: 'tool-laser-2',
        name: 'Optical Collimator & Laser Alignment Bench (অপটিক্যাল ফোকাসিং বেঞ্চ)',
        category: 'Testing & Measurement',
        purpose: 'Aligning diode optical axis and calibrating the 3-element focusing lens for minimal beam divergence (<1.2 mRad).',
        isEssential: true,
      },
      {
        id: 'tool-laser-3',
        name: 'Micro-Soldering Station & Hot Air Heat Gun (সোল্ডারিং স্টেশন)',
        category: 'Electronic & Soldering',
        purpose: 'Soldering high-current silicone wires to laser diode pins and driver circuit with ESD protection.',
        isEssential: true,
      },
      {
        id: 'tool-laser-4',
        name: 'Digital Laser Power Meter / Optical Sensor (লেজার ওয়াট ও পাওয়ার মাপার মিটার)',
        category: 'Testing & Measurement',
        purpose: 'Measuring exact milliwatt/watt optical power output and beam stability over 10-minute duty cycles.',
        isEssential: true,
      },
      {
        id: 'tool-laser-5',
        name: 'True-RMS Digital Multimeter & DC Benchtop Power Supply',
        category: 'Testing & Measurement',
        purpose: 'Verifying constant current regulation (1.8A) and voltage drops across driver circuit.',
        isEssential: true,
      },
      {
        id: 'tool-laser-6',
        name: 'Ultrasonic Parts Cleaner & Hard-Anodizing Tank',
        category: 'Civil & Construction',
        purpose: 'Degreasing aluminum shavings in ultrasonic bath and applying hard-anodized corrosion-proof finish.',
        isEssential: true,
      },
      {
        id: 'tool-laser-7',
        name: 'Class-4 OD6+ Optical Laser Safety Goggles (চোখ রক্ষার বিশেষ চশমা)',
        category: 'Safety Equipment',
        purpose: 'Mandatory 100% eye protection against diffuse reflections and direct green laser rays.',
        isEssential: true,
      },
    ];

    const buildGuide: BuildGuide = {
      title: 'High-Power Tactical Laser Light / Pointer Engineering & Manufacturing Guide',
      estimatedTotalTime: '4 - 6 Hours',
      difficultyLevel: 'Advanced Engineering',
      estimatedTotalCost: '$120 - $180 / ৳14,000 - ৳21,000',
      overview: 'Step-by-step manufacturing and assembly protocol for a high-intensity laser emitter: CNC lathe body machining, diode thermal pressing, constant-current driver soldering, optical collimation, and beam power certification.',
      prerequisites: [
        'CNC machined aluminum host parts cleaned, deburred, and anodized.',
        'ESD-safe workbench equipped with grounded wrist strap and soldering station.',
        'OD6+ 532nm green laser safety goggles worn at all times during diode energization.',
      ],
      safetyOverview: [
        'DANGER: Never look directly into laser aperture or point at reflective mirrors, vehicles, or aircraft.',
        'Always wear certified OD6+ safety glasses before inserting the battery cell.',
        'Do not exceed recommended 3-minute continuous duty cycle without adequate heatsink airflow.',
      ],
      steps: [
        {
          stepNumber: 1,
          phaseTitle: 'Phase 1: CNC Lathe Machining of Aluminum Barrel, Knurling & Threading',
          estimatedDuration: '1.5 Hours',
          instruction: 'Machine the 6061-T6 aluminum grip tube on a CNC metal lathe, turn external knurled grip pattern, and tap M9x0.5 lens threads and M20x1.0 tailcap threads.',
          detailedSteps: [
            'Chuck 25mm 6061 aluminum rod into lathe, face ends, and bore central 19.2mm battery cavity.',
            'Turn outer profile, cut decorative heat sink cooling fins, and apply diamond knurling tool.',
            'Single-point thread internal front aperture to M9x0.5mm for optical lens carrier.',
            'Cut tailcap threads to M20x1.0mm and groove for silicone O-ring waterproof seal.',
            'Degrease in ultrasonic cleaner and submerge in hard-anodizing sulfuric acid bath for matte protective finish.',
          ],
          requiredTools: ['CNC Metal Lathe Machine', 'Ultrasonic Cleaner', 'Thread Pitch Gauge'],
          safetyPrecautions: ['Wear eye shield and do not wear loose clothing near spinning lathe spindle'],
          qualityChecks: ['Verify thread smooth engagement by hand with zero wobble or cross-threading'],
        },
        {
          stepNumber: 2,
          phaseTitle: 'Phase 2: Press-Fitting Laser Diode into Copper Thermal Heatsink Host',
          estimatedDuration: '45 Minutes',
          instruction: 'Carefully press the 532nm semiconductor laser diode into the high-thermal-conductivity copper host module with thermal paste.',
          detailedSteps: [
            'Clean copper diode module bore with isopropyl alcohol.',
            'Apply micro-film of non-conductive thermal paste on diode outer casing.',
            'Align laser diode into copper host module and press squarely using mechanical arbor press tool (never hammer directly).',
            'Verify diode flange sits completely flush against the internal copper shoulder stop for maximum heat conduction.',
          ],
          requiredTools: ['Arbor Press & Diode Press Tool', 'Thermal Paste', 'ESD Grounded Mat'],
          safetyPrecautions: ['Ground yourself with ESD wrist strap; laser diodes are extremely sensitive to static shock'],
          qualityChecks: ['Zero gap between diode base and copper host; 100% surface contact for cooling'],
        },
        {
          stepNumber: 3,
          phaseTitle: 'Phase 3: Constant-Current Driver Soldering & Electrical Potting',
          estimatedDuration: '1 Hour',
          instruction: 'Solder buck-boost driver circuit leads to the laser diode pins, calibrate output current to 1.8A, and insulate connections.',
          detailedSteps: [
            'Tin laser diode positive (+) and negative (-) pins with 63/37 lead-free solder using fine micro-iron.',
            'Solder short flexible silicone wires (26 AWG) between driver output pads and diode pins.',
            'Slide heat-shrink tubing over exposed leads and shrink with hot air gun at 120°C.',
            'Connect dummy test load and digital multimeter to driver output; adjust potentiometer to exactly 1.8A constant current.',
            'Secure driver board inside module pill using thermally conductive epoxy potting compound.',
          ],
          requiredTools: ['Micro-Soldering Station', 'Hot Air Gun', 'Digital Multimeter & Bench Power Supply'],
          safetyPrecautions: ['Do not overheat diode pins (maximum 2 seconds solder contact at 320°C)'],
          qualityChecks: ['Current output remains rock-steady at 1.8A with input voltage fluctuating from 3.2V to 4.2V'],
        },
        {
          stepNumber: 4,
          phaseTitle: 'Phase 4: Tailcap Clicky Switch Assembly & Spring Contact Installation',
          estimatedDuration: '30 Minutes',
          instruction: 'Assemble the clicky push switch, silicone waterproof rubber boot, and gold-plated negative contact spring inside tailcap.',
          detailedSteps: [
            'Insert textured silicone push button rubber cap into tailcap opening.',
            'Seat tactile clicky mechanical switch onto internal retaining ring.',
            'Solder gold-plated phosphor bronze negative battery contact spring onto brass switch PCB.',
            'Thread retaining brass ring clockwise with split-ring pliers to lock switch firmly in place.',
            'Test tactile click mechanism (forward momentary and full lock-on action).',
          ],
          requiredTools: ['Split-Ring Retaining Pliers', 'Soldering Iron', 'Silicone Grease'],
          safetyPrecautions: ['Ensure spring is aligned concentric to prevent battery short-circuit against barrel wall'],
          qualityChecks: ['Switch contact resistance <0.02 ohms when engaged'],
        },
        {
          stepNumber: 5,
          phaseTitle: 'Phase 5: Optical Lens Collimation & Beam Convergence Calibration',
          estimatedDuration: '45 Minutes',
          instruction: 'Thread the 3-element AR-coated optical glass lens into front aperture, power the unit, and focus beam onto optical target.',
          detailedSteps: [
            'Wear OD6+ laser safety goggles.',
            'Apply silicone grease onto M9 lens barrel threads and install anti-vibration tension spring.',
            'Thread 3-element glass collimator lens into front aperture.',
            'Insert 18650 battery cell, screw tailcap on, and activate laser switch.',
            'Aim laser at optical alignment target 10 meters away on collimation bench.',
            'Rotate front focusing crown until beam spot achieves minimal circular diameter (pinpoint divergence <1.2 mRad).',
          ],
          requiredTools: ['Laser Alignment Bench', 'Optical Safety Goggles', 'Spanner Wrench'],
          safetyPrecautions: ['MANDATORY: Goggles must remain on face while laser is energized'],
          qualityChecks: ['Beam profile is clean circular TEM00 mode with zero stray optical halos or artifacts'],
        },
        {
          stepNumber: 6,
          phaseTitle: 'Phase 6: Laser Power Meter Certification & Thermal Stress Test',
          estimatedDuration: '45 Minutes',
          instruction: 'Measure optical power output on digital laser power meter, conduct 5-minute thermal burn-in test, and package complete gadget.',
          detailedSteps: [
            'Direct laser beam into thermopile sensor head of digital laser power meter.',
            'Log optical power output (verify >850mW continuous green coherent light).',
            'Run continuous 5-minute stress test; monitor barrel temperature with infrared thermometer (<48°C target).',
            'Inspect O-ring seals, test IP68 waterproof integrity in shallow water bath, and certify final device.',
          ],
          requiredTools: ['Digital Laser Power Meter', 'Infrared Thermometer', 'Waterproof Test Chamber'],
          safetyPrecautions: ['Do not touch front lens with bare hands to avoid oil residue degradation'],
          qualityChecks: ['Laser delivers 100% steady optical output with instant turn-on response and zero flickering'],
        },
      ],
    };

    return { billOfMaterials, requiredTools, buildGuide };
  }

  // 6. SMART PHONES / MOBILE DEVICES / TABLETS / PORTABLE ELECTRONICS
  if (
    promptLower.includes('phone') ||
    promptLower.includes('smartphone') ||
    promptLower.includes('মোবাইল') ||
    promptLower.includes('ফোন') ||
    promptLower.includes('tablet') ||
    promptLower.includes('screen') ||
    promptLower.includes('display device')
  ) {
    const billOfMaterials: BillOfMaterialsItem[] = [
      {
        id: 'mat-phone-1',
        name: '6.7-inch 120Hz LTPO Dynamic AMOLED Display Panel with Glass',
        category: 'Casing & Facade',
        quantity: '1 Display Assembly (3200x1440 QHD+)',
        approximateCost: '$135.00 / ৳15,500',
        specs: 'Corning Gorilla Glass Armor, 2600 nits peak brightness, integrated in-display ultrasonic fingerprint sensor',
        purpose: 'Primary visual interface, touch digitizer, and biometric authentication.',
        sourcingTip: 'Store in anti-static ESD foam tray with protective adhesive film.',
      },
      {
        id: 'mat-phone-2',
        name: '3nm Octa-Core High-Performance Processor SoC & 16GB LPDDR5X RAM',
        category: 'Electronics',
        quantity: '1 PoP (Package-on-Package) BGA Chip Stack',
        approximateCost: '$160.00 / ৳18,500',
        specs: '3.4GHz prime core, 16-core neural engine (NPU), integrated 5G sub-6 & mmWave modem',
        purpose: 'Central computational computing, graphics processing, and AI neural inference.',
        sourcingTip: 'Requires high-precision reflow soldering with lead-free SAC305 micro-solder balls.',
      },
      {
        id: 'mat-phone-3',
        name: '5000mAh High-Density Dual-Cell Li-Polymer Battery Pack',
        category: 'Power & Energy',
        quantity: '1 Dual-Cell Pack (19.25Wh)',
        approximateCost: '$25.00 / ৳2,900',
        specs: 'Dual-cell configuration for 65W ultra-fast charging, integrated thermal protection BMS',
        purpose: 'Powers the smartphone for 36+ hours of standard mixed usage.',
        sourcingTip: 'Never puncture, bend, or heat battery cell above 60°C.',
      },
      {
        id: 'mat-phone-4',
        name: 'CNC Machined Grade-5 Titanium / Aerospace Aluminum Frame',
        category: 'Structural',
        quantity: '1 Unibody Midframe Chassis',
        approximateCost: '$42.00 / ৳4,800',
        specs: 'Laser-welded antenna isolation bands, internal vapor chamber thermal channels, PVD colored finish',
        purpose: 'Provides rigid structural integrity, drop protection, and heat dissipation.',
        sourcingTip: 'Check internal mounting boss threads with go/no-go plug gauges.',
      },
      {
        id: 'mat-phone-5',
        name: 'Triple-Camera Imaging Array (200MP Main + 50MP Periscope + 12MP Ultra-Wide)',
        category: 'Sensors & IoT',
        quantity: '1 Camera Sub-Assembly Module',
        approximateCost: '$75.00 / ৳8,600',
        specs: 'Dual OIS (Optical Image Stabilization), 5x optical periscope prism, multi-directional phase detection AF',
        purpose: 'High-resolution photography, 8K video capture, and depth sensing.',
        sourcingTip: 'Keep cleanroom dust cap sealed until mounting onto logic board.',
      },
    ];

    const requiredTools: RequiredTool[] = [
      {
        id: 'tool-phone-1',
        name: 'Automated SMD Pick-and-Place Machine & Solder Stencil Printer',
        category: 'Electronic & Soldering',
        purpose: 'High-speed robotic placement of 0201 passives, BGA SoC chips, and PMICs onto multi-layer logic board.',
        isEssential: true,
      },
      {
        id: 'tool-phone-2',
        name: 'SMD Hot Air Rework Station & Micro-Soldering Microscope (45X)',
        category: 'Electronic & Soldering',
        purpose: 'Precision manual jumper wiring, connector soldering, and micro-component alignment under magnification.',
        isEssential: true,
      },
      {
        id: 'tool-phone-3',
        name: 'Vacuum OCA Screen Laminating & Bubble Removing Autoclave',
        category: 'Mechanical & Machining',
        purpose: 'Bubble-free optical bonding of AMOLED flexible display panel to cover glass under 0.6 MPa pressure.',
        isEssential: true,
      },
      {
        id: 'tool-phone-4',
        name: 'Precision Laser Glass Cutter & CNC Frame Router',
        category: 'Mechanical & Machining',
        purpose: 'High-speed laser profiling of Gorilla Glass and 5-axis CNC contour milling of titanium midframe.',
        isEssential: true,
      },
      {
        id: 'tool-phone-5',
        name: 'Battery Resistance Tester & Pneumatic Spot Welder',
        category: 'Testing & Measurement',
        purpose: 'Welding nickel battery tabs to BMS circuit and verifying internal DC resistance (<15 mΩ).',
        isEssential: true,
      },
      {
        id: 'tool-phone-6',
        name: 'RF Network Analyzer & 5G Wireless Chamber',
        category: 'Testing & Measurement',
        purpose: 'Calibrating antenna VSWR and checking MIMO wireless throughput in anechoic environment.',
        isEssential: true,
      },
    ];

    const buildGuide: BuildGuide = {
      title: 'Next-Gen Flagship Smartphone Manufacturing & Assembly Blueprint',
      estimatedTotalTime: '1 - 2 Days',
      difficultyLevel: 'Industrial / Contractor Grade',
      estimatedTotalCost: '$450 - $700 / ৳52,000 - ৳80,000',
      overview: 'Full manufacturing protocol for a high-end smartphone: logic board SMD assembly, display optical bonding, vapor chamber thermal cooling, camera calibration, and water-resistance sealing.',
      prerequisites: [
        'Class-1000 cleanroom environment for dust-free optical display bonding.',
        'Pre-tested high-density motherboard with bootloader flashed.',
        'ESD grounding wristbands and antistatic lab coats worn by all technicians.',
      ],
      safetyOverview: [
        'Handle lithium battery with extreme care using non-conductive ceramic tweezers.',
        'Wear safety goggles when operating laser cutting machines and pressure autoclaves.',
        'Maintain emergency sand bucket and fire-retardant blanket near battery testing station.',
      ],
      steps: [
        {
          stepNumber: 1,
          phaseTitle: 'Phase 1: Motherboard SMD Placement, BGA Reflow & X-Ray Inspection',
          estimatedDuration: '4 Hours',
          instruction: 'Print solder paste with laser-cut stencil, place SoC and memory chips with automated SMT machine, and reflow in 10-zone nitrogen oven.',
          detailedSteps: [
            'Apply lead-free SAC305 solder paste onto 10-layer substrate using automated stencil printer.',
            'Pick and place 0201 resistors, power management ICs, and BGA SoC chip with high-speed placement robot.',
            'Pass board through reflow oven following precise thermal ramp profile (peak 245°C for 40 seconds).',
            'Inspect BGA solder ball joints using 3D X-ray inspection machine for zero solder bridges or voids (<5%).',
          ],
          requiredTools: ['Automated SMT Machine', '10-Zone Reflow Oven', '3D X-Ray Inspection Unit'],
          safetyPrecautions: ['Wear ESD protection; do not touch unreflowed solder paste with bare skin'],
          qualityChecks: ['100% automated optical inspection (AOI) pass rate with zero solder shorts'],
        },
        {
          stepNumber: 2,
          phaseTitle: 'Phase 2: Vapor Chamber Heat Sink & Midframe Structural Preparation',
          estimatedDuration: '2 Hours',
          instruction: 'Laser-weld ultra-thin copper vapor chamber onto titanium chassis frame and apply graphite thermal sheets.',
          detailedSteps: [
            'Inspect CNC milled titanium midframe for zero burrs and verify antenna dielectric isolation gaps.',
            'Adhere 0.3mm vacuum-sealed copper vapor chamber with phase-change thermal interface material (TIM).',
            'Layer multi-directional pyrolytic graphite heat spreading sheets over battery and processor zones.',
            'Mount volume/power tactile switch flex cables and stereo speaker acoustic chambers.',
          ],
          requiredTools: ['CNC Frame Router', 'Thermal Paste Applicator', 'Torx T2 Screwdriver'],
          safetyPrecautions: ['Ensure vapor chamber is not bent or punctured during installation'],
          qualityChecks: ['Thermal conductivity verified across midframe chassis with zero thermal bottlenecks'],
        },
        {
          stepNumber: 3,
          phaseTitle: 'Phase 3: AMOLED Display Vacuum Lamination & Autoclave De-Bubbling',
          estimatedDuration: '3 Hours',
          instruction: 'Optically bond the flexible AMOLED display panel to the Gorilla Glass cover in a vacuum laminating machine and autoclave.',
          detailedSteps: [
            'Align flexible AMOLED panel and glass in dust-free Class-100 laminar flow workbench.',
            'Apply optically clear adhesive (OCA) film and press with vacuum roller laminator at -98 kPa.',
            'Transfer display assembly to pressurized autoclave chamber (0.5 MPa @ 45°C for 20 minutes) to eliminate all micro-bubbles.',
            'Connect digitizer flex cable and verify touch sampling rate (480Hz) on diagnostic screen tester.',
          ],
          requiredTools: ['Vacuum OCA Laminator', 'Autoclave De-Bubbler', 'Touch Panel Tester'],
          safetyPrecautions: ['Wear cleanroom hairnet, gloves, and antistatic smock'],
          qualityChecks: ['100% optical clarity with zero trapped dust particles or air bubbles'],
        },
        {
          stepNumber: 4,
          phaseTitle: 'Phase 4: Camera Matrix, Battery & Internal Sub-Assembly Integration',
          estimatedDuration: '3 Hours',
          instruction: 'Install motherboard into midframe, connect triple camera modules, lock in 5000mAh battery pack, and fasten shielding plates.',
          detailedSteps: [
            'Secure logic board into chassis using calibrated torque screwdriver (0.08 Nm).',
            'Connect triple-camera OIS modules with gold-plated board-to-board (FPC) micro-connectors.',
            'Seat 5000mAh battery pack using stretch-release pull tabs and connect dual-cell battery connector.',
            'Attach laser-etched stainless steel EMI shielding plates over high-frequency RF circuits.',
          ],
          requiredTools: ['Calibrated Torque Screwdriver', 'Ceramic Tweezers', 'Magnifying Lamp'],
          safetyPrecautions: ['Never apply metal tools directly against the lithium battery pouch'],
          qualityChecks: ['All connectors snap with positive tactile click and lock securely'],
        },
        {
          stepNumber: 5,
          phaseTitle: 'Phase 5: Automated Firmware Flashing, Sensor Calibration & RF Tuning',
          estimatedDuration: '2 Hours',
          instruction: 'Flash operating system and neural engine firmware via high-speed USB-C, calibrate cameras and 5G antennas.',
          detailedSteps: [
            'Connect high-speed automated test fixture and flash core operating system.',
            'Execute automated camera OIS optical centering and color temperature matrix calibration.',
            'Calibrate ultrasonic in-display fingerprint sensor and gyroscope/accelerometer 6-axis zero offsets.',
            'Run RF radiated power (TRP) and sensitivity (TIS) test in wireless anechoic test box.',
          ],
          requiredTools: ['Automated Flashing Rig', 'RF Anechoic Test Box', 'Optical Calibration Chart'],
          safetyPrecautions: ['Maintain ESD grounding during diagnostic cable connections'],
          qualityChecks: ['100% pass on all 48 automated hardware telemetry diagnostic checks'],
        },
        {
          stepNumber: 6,
          phaseTitle: 'Phase 6: Waterproof Gasket Sealing, Pressure Testing & Final Packaging',
          estimatedDuration: '2 Hours',
          instruction: 'Apply hot-melt polyurethane structural adhesive, press back glass cover, test IP68 water resistance, and package device.',
          detailedSteps: [
            'Dispense continuous bead of waterproof PUR adhesive around midframe perimeter using robotic dispenser.',
            'Align ceramic-coated rear glass cover and clamp in heated pneumatic press (60°C for 5 minutes).',
            'Perform barometric differential pressure decay test to certify IP68 submersible water resistance.',
            'Conduct final cosmetic optical inspection, wipe with microfiber cloth, and apply retail protective films.',
          ],
          requiredTools: ['Robotic Glue Dispenser', 'Pneumatic Heated Press', 'IP68 Pressure Leak Tester'],
          safetyPrecautions: ['Ensure uniform clamping pressure to avoid cracking rear glass'],
          qualityChecks: ['Zero pressure decay on IP68 air-pressure test; device 100% waterproof to 1.5m depth'],
        },
      ],
    };

    return { billOfMaterials, requiredTools, buildGuide };
  }

  // 7. DEFAULT / CUSTOM INVENTIONS / SCI-FI PROTOTYPES / VEHICLES / GADGETS
  const billOfMaterials: BillOfMaterialsItem[] = [
    {
      id: 'mat-gen-1',
      name: 'CNC 6061-T6 Aluminum Structural Chassis & Enclosure',
      category: 'Structural',
      quantity: '1 Set (Precision Machined)',
      approximateCost: '$320.00 / ৳36,500',
      specs: 'Milled unibody chassis with hard-anodized protective finish and electromagnetic shielding',
      purpose: 'Houses internal sub-assemblies, providing rigid structural alignment and impact resistance.',
      sourcingTip: 'Request deburred edges and bead-blasted matte finish.',
    },
    {
      id: 'mat-gen-2',
      name: 'Core Embedded System Controller & Sensor Board',
      category: 'Electronics',
      quantity: '1 Unit (Multi-Layer SMD)',
      approximateCost: '$85.00 / ৳9,700',
      specs: '32-Bit ARM processor with multi-channel telemetry ADCs and wireless telemetry interface',
      purpose: 'Coordinates real-time operations, actuator control, and system telemetry logging.',
      sourcingTip: 'Order with conformal moisture-proof coating.',
    },
    {
      id: 'mat-gen-3',
      name: 'High-Torque Actuators & Precision Drive Mechanism',
      category: 'Mechanical',
      quantity: '4 Units (Direct-Drive / Gearing)',
      approximateCost: '$190.00 / ৳21,500',
      specs: 'Brushless DC motor with precision planetary gearheads and optical feedback',
      purpose: 'Generates mechanical displacement, articulation, or rotational torque.',
      sourcingTip: 'Select motors with pre-installed magnetic encoders.',
    },
    {
      id: 'mat-gen-4',
      name: 'High-Density Lithium-Polymer (LiPo) / Solid-State Battery Pack',
      category: 'Power & Energy',
      quantity: '1 Pack (24V 10Ah / 240Wh)',
      approximateCost: '$140.00 / ৳16,000',
      specs: 'Grade-A cells with integrated Smart Battery Management System (BMS)',
      purpose: 'Delivers continuous uninterrupted DC power with short-circuit and over-discharge protection.',
      sourcingTip: 'Store at 3.85V storage charge when not actively in use.',
    },
    {
      id: 'mat-gen-5',
      name: 'Active Thermal Vapor Heat Pipe & Cooling Array',
      category: 'Cooling',
      quantity: '1 Heat Sink Module with PWM Blower',
      approximateCost: '$45.00 / ৳5,100',
      specs: 'Sintered copper heat pipes with aluminum micro-fins and fluid dynamic bearing fan',
      purpose: 'Transfers waste thermal energy away from high-power components.',
      sourcingTip: 'Use non-conductive thermal paste (minimum 8.5 W/m·K).',
    },
    {
      id: 'mat-gen-6',
      name: 'OLED System Telemetry Display & Diagnostic Port',
      category: 'Sensors & IoT',
      quantity: '1 Graphical Display Module',
      approximateCost: '$25.00 / ৳2,800',
      specs: 'High-contrast 2.4" full-color display with real-time status telemetry readouts',
      purpose: 'Displays operational voltage, current draw, core temperature, and system state.',
      sourcingTip: 'Ensure scratch-resistant tempered glass cover is fitted.',
    },
  ];

  const requiredTools: RequiredTool[] = [
    {
      id: 'tool-gen-1',
      name: 'Precision Metric Hex & Torx Screwdriver Kit',
      category: 'Mechanical & Machining',
      purpose: 'Assembling mechanical linkages, structural casing, and internal sub-assemblies.',
      isEssential: true,
    },
    {
      id: 'tool-gen-2',
      name: 'Temperature-Controlled Soldering & Desoldering Station',
      category: 'Electronic & Soldering',
      purpose: 'Interconnecting electrical harnesses, power bus wires, and sensor headers.',
      isEssential: true,
    },
    {
      id: 'tool-gen-3',
      name: 'Digital Multimeter with True-RMS & Diode Tester',
      category: 'Testing & Measurement',
      purpose: 'Validating voltage levels, continuity, and ground isolation across sub-assemblies.',
      isEssential: true,
    },
    {
      id: 'tool-gen-4',
      name: 'Digital Vernier Caliper (0.01mm Precision)',
      category: 'Testing & Measurement',
      purpose: 'Verifying dimensional tolerances and component fit clearances.',
      isEssential: true,
    },
    {
      id: 'tool-gen-5',
      name: 'ESD-Safe Workstation & Grounded Wrist Strap',
      category: 'Safety Equipment',
      purpose: 'Preventing electrostatic damage to sensitive internal electronic modules.',
      isEssential: true,
    },
  ];

  const buildGuide: BuildGuide = {
    title: `${title} - Engineering Assembly & Build Protocol`,
    estimatedTotalTime: '1 - 2 Days',
    difficultyLevel: 'Advanced Engineering',
    estimatedTotalCost: '$800 - $1,400 / ৳90,000 - ৳1,60,000',
    overview: `Complete engineering fabrication and calibration guide for ${title}. Covers mechanical framing, electronics integration, power bus harness, and system verification.`,
    prerequisites: [
      'All structural chassis components and hardware fasteners organized and deburred.',
      'Electronics and motor controllers bench-tested and pre-flashed.',
      'Grounded ESD-safe assembly workbench with precision toolset ready.',
    ],
    safetyOverview: [
      'Disconnect all battery power packs prior to assembling or modifying wiring.',
      'Wear safety glasses when assembling spring-loaded or high-torque mechanical linkages.',
      'Verify thermal limits and ensure cooling airflow is completely unobstructed.',
    ],
    steps: [
      {
        stepNumber: 1,
        phaseTitle: 'Phase 1: Mechanical Chassis & Structural Frame Erection',
        estimatedDuration: '3 Hours',
        instruction: 'Assemble the primary structural frame and secure load-bearing mounting brackets with vibration-resistant fasteners.',
        detailedSteps: [
          'Inspect milled aluminum chassis components for dimensional accuracy.',
          'Assemble main structural skeleton using M3/M4 stainless steel hex fasteners and threadlocker.',
          'Install rubber vibration-damping isolation grommets for sensitive sensor mounts.',
          'Verify squareness and structural rigidity under torsional load.',
        ],
        requiredTools: ['Metric Hex Set', 'Digital Caliper', 'Threadlocker'],
        safetyPrecautions: ['Do not over-torque aluminum threads to prevent stripping'],
        qualityChecks: ['Chassis alignment within 0.1mm with zero mechanical distortion'],
      },
      {
        stepNumber: 2,
        phaseTitle: 'Phase 2: Actuators, Motors & Mechanical Drive Train Installation',
        estimatedDuration: '4 Hours',
        instruction: 'Mount actuators, align transmission gearboxes, and verify smooth backlash-free mechanical travel.',
        detailedSteps: [
          'Bolt actuators to chassis mounting plates with specified torque values.',
          'Fit drive gears / pulleys and adjust belt tension according to deflection gauge.',
          'Rotate all mechanical mechanisms by hand to confirm zero binding or friction pinch points.',
          'Apply high-grade synthetic grease to all gear teeth and sliding bushings.',
        ],
        requiredTools: ['Torque Screwdriver', 'Tension Gauge', 'Synthetic Grease'],
        safetyPrecautions: ['Keep fingers away from pinch points when testing mechanical linkages'],
        qualityChecks: ['Smooth mechanical travel across entire motion range with <0.05mm backlash'],
      },
      {
        stepNumber: 3,
        phaseTitle: 'Phase 3: Electronic Control Unit & Sensor Harness Integration',
        estimatedDuration: '4 Hours',
        instruction: 'Mount the core electronic control unit, route sensor wiring harnesses, and secure with braided cable sleeves.',
        detailedSteps: [
          'Mount main electronic controller board onto vibration-damped nylon standoffs.',
          'Route sensor signal wires inside shielded braided sleeving away from high-current motor cables.',
          'Connect multi-pin sensor headers with locking latch connectors.',
          'Secure wiring looms to chassis anchor points using nylon cable ties.',
        ],
        requiredTools: ['Soldering Station', 'Wire Strippers', 'Heat Shrink Gun'],
        safetyPrecautions: ['Ensure signal wires are shielded from electromagnetic interference (EMI)'],
        qualityChecks: ['100% continuity verified on all sensor and communication channels'],
      },
      {
        stepNumber: 4,
        phaseTitle: 'Phase 4: Power Management Bus & Thermal Cooling Setup',
        estimatedDuration: '3 Hours',
        instruction: 'Install power distribution board, connect lithium battery pack, and mount thermal heat sink cooling array.',
        detailedSteps: [
          'Mount power distribution board and wire heavy-gauge silicone power cables.',
          'Apply thermal interface material (TIM) between heat-generating silicon and copper heat sink.',
          'Mount cooling fan assembly and verify directional exhaust airflow path.',
          'Connect lithium battery pack through in-line high-current safety fuse.',
        ],
        requiredTools: ['Digital Multimeter', 'Thermal Paste Applicator', 'Hex Screwdriver'],
        safetyPrecautions: ['Double check polarity before connecting main battery leads'],
        qualityChecks: ['Zero voltage drop across power switches under 10A simulated load'],
      },
      {
        stepNumber: 5,
        phaseTitle: 'Phase 5: Sub-System Power-Up & Firmware Calibration',
        estimatedDuration: '3 Hours',
        instruction: 'Apply benchtop current-limited power, flash firmware, and run automated sensor zero-point calibration.',
        detailedSteps: [
          'Connect current-limited benchtop power supply set to 500mA cutoff threshold.',
          'Power on system and verify all onboard LED status indicators illuminate green.',
          'Flash operational firmware and connect diagnostic PC terminal interface.',
          'Execute automated sensor zero-point and actuator range-of-motion calibration.',
        ],
        requiredTools: ['Benchtop Power Supply', 'PC Diagnostic Terminal', 'Digital Multimeter'],
        safetyPrecautions: ['Disconnect power immediately if any component exceeds 50°C during standby'],
        qualityChecks: ['All sensor telemetry values read within expected ±1% nominal baseline'],
      },
      {
        stepNumber: 6,
        phaseTitle: 'Phase 6: Full Operational Load Benchmark & Final Verification',
        estimatedDuration: '3 Hours',
        instruction: 'Run full-power operational stress test, monitor thermal equilibrium, and certify readiness.',
        detailedSteps: [
          'Run continuous automated operational stress loop for 60 minutes.',
          'Log thermal data with infrared thermometer (verify all temperatures remain <60°C).',
          'Test all user interface controls, display screens, and wireless communication links.',
          'Assemble outer protective casing and conduct final quality inspection.',
        ],
        requiredTools: ['Infrared Thermometer', 'Diagnostic Host PC', 'Torque Driver'],
        safetyPrecautions: ['Ensure all casing covers are securely fastened before full-speed operation'],
        qualityChecks: ['System operates with 100% reliability, zero fault errors, and full structural stability'],
      },
    ],
  };

  return { billOfMaterials, requiredTools, buildGuide };
}
