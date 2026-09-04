import { UniversalConnector, PermissionLevel } from '../src/types/jarvis.js';

export class ToolConnectorRegistry {
  private static instance: ToolConnectorRegistry;
  private connectors: Map<string, UniversalConnector> = new Map();

  private constructor() {
    this.seedDefaultConnectors();
  }

  public static getInstance(): ToolConnectorRegistry {
    if (!ToolConnectorRegistry.instance) {
      ToolConnectorRegistry.instance = new ToolConnectorRegistry();
    }
    return ToolConnectorRegistry.instance;
  }

  private seedDefaultConnectors() {
    const defaultList: UniversalConnector[] = [
      {
        id: 'conn-git',
        name: 'Git Version Control Suite',
        category: 'GIT',
        description: 'Repository commit, branch inspection, diff analysis, and remote push/pull management.',
        permissionsRequired: 2,
        authStatus: 'AUTHENTICATED',
        enabled: true,
        status: 'ONLINE',
        lastUsed: new Date().toISOString(),
      },
      {
        id: 'conn-terminal',
        name: 'Sandbox Terminal & Shell Runner',
        category: 'TERMINAL',
        description: 'Safe container execution of bash scripts, compilation builds, and test suites.',
        permissionsRequired: 2,
        authStatus: 'AUTHENTICATED',
        enabled: true,
        status: 'ONLINE',
        lastUsed: new Date().toISOString(),
      },
      {
        id: 'conn-cloud',
        name: 'Cloud Storage & CDN Connector',
        category: 'CLOUD_STORAGE',
        description: 'Encrypted object bucket storage for build artifacts, datasets, and hologram assets.',
        permissionsRequired: 2,
        authStatus: 'AUTHENTICATED',
        enabled: true,
        status: 'ONLINE',
      },
      {
        id: 'conn-calendar',
        name: 'Autonomous Schedule & Calendar Sync',
        category: 'CALENDAR',
        description: 'Event scheduling, deadline monitoring, and meeting notes contextualization.',
        permissionsRequired: 2,
        authStatus: 'AUTHENTICATED',
        enabled: true,
        status: 'ONLINE',
      },
      {
        id: 'conn-mail',
        name: 'Secure Dispatch & Messaging Bridge',
        category: 'EMAIL',
        description: 'Automated briefing dispatches, alert notifications, and team communications.',
        permissionsRequired: 3, // Sensitive
        authStatus: 'AUTHENTICATED',
        enabled: true,
        status: 'STANDBY',
      },
      {
        id: 'conn-smarthome',
        name: 'Stark Lab IoT & Smart Facility Controller',
        category: 'SMART_HOME',
        description: 'Ambient illumination, hardware power relays, climate control, and server rack telemetry.',
        permissionsRequired: 2,
        authStatus: 'AUTHENTICATED',
        enabled: true,
        status: 'ONLINE',
      },
      {
        id: 'conn-google-search',
        name: 'Google Live Search Grounding',
        category: 'API',
        description: 'Real-time multi-source web retrieval and authoritative fact cross-referencing.',
        permissionsRequired: 1,
        authStatus: 'AUTHENTICATED',
        enabled: true,
        status: 'ONLINE',
      },
    ];

    for (const item of defaultList) {
      this.connectors.set(item.id, item);
    }
  }

  public registerConnector(connector: UniversalConnector): void {
    this.connectors.set(connector.id, connector);
  }

  public getAllConnectors(): UniversalConnector[] {
    return Array.from(this.connectors.values());
  }

  public toggleConnector(id: string, enabled: boolean): UniversalConnector | undefined {
    const conn = this.connectors.get(id);
    if (!conn) return undefined;
    conn.enabled = enabled;
    conn.status = enabled ? 'ONLINE' : 'STANDBY';
    return conn;
  }

  public executeTool(
    id: string,
    payload: Record<string, any>
  ): { success: boolean; output: string; error?: string } {
    const conn = this.connectors.get(id);
    if (!conn) return { success: false, output: '', error: `Connector "${id}" not found.` };
    if (!conn.enabled) return { success: false, output: '', error: `Connector "${conn.name}" is currently disabled.` };

    conn.lastUsed = new Date().toISOString();
    return {
      success: true,
      output: `[${conn.name}] Executed successfully with payload parameters: ${JSON.stringify(payload)}`,
    };
  }
}
