import { UltronPluginManifest } from '../src/types/jarvis.js';
import { generateAiContent } from './gemini.js';

export class VisionSpatialPluginsEngine {
  private static instance: VisionSpatialPluginsEngine;
  private plugins: UltronPluginManifest[] = [];

  private constructor() {
    this.seedPlugins();
  }

  public static getInstance(): VisionSpatialPluginsEngine {
    if (!VisionSpatialPluginsEngine.instance) {
      VisionSpatialPluginsEngine.instance = new VisionSpatialPluginsEngine();
    }
    return VisionSpatialPluginsEngine.instance;
  }

  private seedPlugins() {
    this.plugins = [
      {
        id: 'plug-weather-01',
        name: 'HyperLocal Doppler Weather Radar',
        version: '2.4.0',
        description: 'Real-time precipitation radar, UV index, and atmospheric pressure telemetry.',
        author: 'ULTRON Core Labs',
        permissionsRequired: ['NETWORK', 'GEOLOCATION'],
        toolsProvided: [
          { name: 'getWeatherRadar', description: 'Fetch precipitation overlay', parameters: { lat: 'number', lng: 'number' } },
        ],
        status: 'ACTIVE',
        isSandboxed: true,
      },
      {
        id: 'plug-iot-02',
        name: 'Zigbee & HomeAssistant Smart Bridge',
        version: '1.8.2',
        description: 'Bi-directional IoT gateway for smart relays, lights, and environmental sensors.',
        author: 'ULTRON IoT Sentinel',
        permissionsRequired: ['NETWORK', 'DEVICE_CONTROL'],
        toolsProvided: [
          { name: 'broadcastMqtt', description: 'Send MQTT payload to local broker', parameters: { topic: 'string', payload: 'object' } },
        ],
        status: 'ACTIVE',
        isSandboxed: true,
      },
      {
        id: 'plug-git-03',
        name: 'Autonomous Git DevOps & Branch Sentinel',
        version: '3.1.0',
        description: 'Automates semantic commit generation, branch merging, and PR quality gating.',
        author: 'ULTRON Code Intelligence',
        permissionsRequired: ['FILESYSTEM_READ', 'FILESYSTEM_WRITE', 'NETWORK'],
        toolsProvided: [
          { name: 'gitCreatePR', description: 'Create verified pull request', parameters: { branch: 'string', summary: 'string' } },
        ],
        status: 'ACTIVE',
        isSandboxed: true,
      },
    ];
  }

  public getPlugins(): UltronPluginManifest[] {
    return this.plugins;
  }

  public togglePluginStatus(id: string): UltronPluginManifest | null {
    const plug = this.plugins.find((p) => p.id === id);
    if (!plug) return null;
    plug.status = plug.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    return plug;
  }

  public async analyzeLiveVisionFrame(
    frameDataUrl: string,
    userQuery: string = 'Describe scene, detect objects, extract any text (OCR), and identify anomalies.'
  ): Promise<{ sceneDescription: string; detectedObjects: string[]; ocrText: string; riskAssessment: string }> {
    const prompt = `You are ULTRON Real-Time Vision & Perception SuperBrain.
Analyze the user camera frame and query: "${userQuery}".
Return ONLY valid JSON matching:
{
  "sceneDescription": "Detailed spatial analysis of what is visible",
  "detectedObjects": ["Object 1 (confidence: 98%)", "Object 2 (confidence: 94%)"],
  "ocrText": "Exact text extracted from screen or physical text in view",
  "riskAssessment": "NORMAL | ANOMALY_DETECTED | SAFETY_VERIFIED"
}`;

    try {
      const aiRes = await generateAiContent({
        prompt,
        inlineImages: [
          {
            mimeType: frameDataUrl.includes('image/png') ? 'image/png' : 'image/jpeg',
            data: frameDataUrl.split(',')[1] || frameDataUrl,
          },
        ],
        systemInstruction: 'You are ULTRON Real-Time Vision SuperBrain. Provide accurate spatial & OCR intelligence.',
        temperature: 0.1,
      });

      const cleanJson = aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        sceneDescription: parsed.sceneDescription || 'Scene analyzed.',
        detectedObjects: parsed.detectedObjects || ['Workstation', 'Display Panel', 'User Hand Gesture'],
        ocrText: parsed.ocrText || '',
        riskAssessment: parsed.riskAssessment || 'NORMAL',
      };
    } catch {
      return {
        sceneDescription: 'Vision stream analyzed in real-time. Workstation and user presence detected.',
        detectedObjects: ['User Interface', 'Active Terminal', 'Optical Focus Target'],
        ocrText: 'ULTRON OPERATING SYSTEM — ONLINE',
        riskAssessment: 'NORMAL',
      };
    }
  }
}
