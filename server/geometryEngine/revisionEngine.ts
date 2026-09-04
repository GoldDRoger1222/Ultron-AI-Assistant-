import { HologramScene, HologramComponent, HologramMaterialType } from '../../src/types/hologram.js';

export class RevisionEngine {
  /**
   * Applies natural language revisions to an existing 3D scene while preserving the model's structure.
   */
  public static applyRevision(scene: HologramScene, modificationPrompt: string): { updatedScene: HologramScene; explanation: string } {
    const lower = modificationPrompt.toLowerCase();
    const updated = JSON.parse(JSON.stringify(scene)) as HologramScene;
    let explanation = 'Updated 3D model properties.';

    // 1. Color / Glow / Emissive changes
    if (lower.includes('glow red') || lower.includes('make it red') || lower.includes('red core') || lower.includes('color red')) {
      updated.components.forEach((c) => {
        if (c.layer === 'CORE' || c.name.toLowerCase().includes('core') || lower.includes(c.name.toLowerCase())) {
          c.color = '#ef4444';
          c.emissiveColor = '#f87171';
          c.emissiveIntensity = 1.4;
        }
      });
      explanation = 'Changed core plasma emissive frequency to crimson red (650nm).';
    } else if (lower.includes('glow blue') || lower.includes('cyan') || lower.includes('blue core')) {
      updated.components.forEach((c) => {
        if (c.layer === 'CORE' || c.name.toLowerCase().includes('core')) {
          c.color = '#00f0ff';
          c.emissiveColor = '#38bdf8';
          c.emissiveIntensity = 1.5;
        }
      });
      explanation = 'Configured central core emission to high-intensity electric cyan blue.';
    } else if (lower.includes('gold') || lower.includes('yellow')) {
      updated.components.forEach((c) => {
        if (c.layer === 'ELECTRONICS' || c.name.toLowerCase().includes('ring') || c.name.toLowerCase().includes('coil')) {
          c.color = '#eab308';
          c.emissiveColor = '#facc15';
          c.materialType = 'gold';
        }
      });
      explanation = 'Upgraded induction conductors and contacts to high-conductivity 24K gold plating.';
    }

    // 2. Material Modifications
    if (lower.includes('titanium')) {
      updated.components.forEach((c) => {
        if (c.layer === 'CASING' || c.layer === 'STRUCTURAL') {
          c.materialType = 'titanium';
          c.color = '#475569';
        }
      });
      explanation = 'Re-machined outer casing with grade-5 aerospace titanium alloy.';
    } else if (lower.includes('carbon fiber') || lower.includes('carbon-fiber')) {
      updated.components.forEach((c) => {
        if (c.layer === 'CASING' || c.layer === 'STRUCTURAL') {
          c.materialType = 'carbon_fiber';
          c.color = '#0f172a';
        }
      });
      explanation = 'Applied lightweight Toray T800 twill carbon fiber composite to structural housing.';
    } else if (lower.includes('transparent') || lower.includes('glass')) {
      updated.components.forEach((c) => {
        if (c.layer === 'CASING') {
          c.materialType = 'hologram_glass';
          c.opacity = 0.6;
          c.transparent = true;
        }
      });
      explanation = 'Switched exterior casing to high-translucency quartz optical glass.';
    }

    // 3. Dimensional Scale Adjustments
    if (lower.includes('bigger') || lower.includes('scale up') || lower.includes('increase size') || lower.includes('double')) {
      const factor = 1.35;
      updated.components.forEach((c) => {
        c.scale = [c.scale[0] * factor, c.scale[1] * factor, c.scale[2] * factor];
        c.position = [c.position[0] * factor, c.position[1] * factor, c.position[2] * factor];
      });
      if (updated.dimensions) {
        updated.dimensions.x = Math.round(updated.dimensions.x * factor);
        updated.dimensions.y = Math.round(updated.dimensions.y * factor);
        updated.dimensions.z = Math.round(updated.dimensions.z * factor);
      }
      explanation = 'Scaled all component dimensions proportionally by +35%.';
    } else if (lower.includes('smaller') || lower.includes('scale down') || lower.includes('compact') || lower.includes('decrease size')) {
      const factor = 0.75;
      updated.components.forEach((c) => {
        c.scale = [c.scale[0] * factor, c.scale[1] * factor, c.scale[2] * factor];
        c.position = [c.position[0] * factor, c.position[1] * factor, c.position[2] * factor];
      });
      if (updated.dimensions) {
        updated.dimensions.x = Math.round(updated.dimensions.x * factor);
        updated.dimensions.y = Math.round(updated.dimensions.y * factor);
        updated.dimensions.z = Math.round(updated.dimensions.z * factor);
      }
      explanation = 'Miniaturized assembly dimensions proportionally by 25%.';
    }

    // 4. Exploded View Adjustments
    if (lower.includes('explode') || lower.includes('expand')) {
      updated.explodedFactor = 0.75;
      explanation = 'Engaged CAD exploded disassembly view at 75% spacing.';
    } else if (lower.includes('assemble') || lower.includes('collapse') || lower.includes('combine')) {
      updated.explodedFactor = 0.0;
      explanation = 'Re-assembled all sub-components into unified physical configuration.';
    }

    updated.version = (updated.version || 1) + 1;
    updated.updatedAt = new Date().toISOString();
    updated.history.push({
      timestamp: new Date().toISOString(),
      action: 'COMPONENT_MODIFIED',
      details: `Revision: "${modificationPrompt}" -> ${explanation}`,
      modifiedBy: 'VOICE_COMMAND',
    });

    return { updatedScene: updated, explanation };
  }
}
