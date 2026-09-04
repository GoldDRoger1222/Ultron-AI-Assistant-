import { DiscoveredLocalDevice } from '../src/types/jarvis.js';

export class IoTDeviceFrameworkEngine {
  private static instance: IoTDeviceFrameworkEngine;
  private devices: DiscoveredLocalDevice[] = [];

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): IoTDeviceFrameworkEngine {
    if (!IoTDeviceFrameworkEngine.instance) {
      IoTDeviceFrameworkEngine.instance = new IoTDeviceFrameworkEngine();
    }
    return IoTDeviceFrameworkEngine.instance;
  }

  private seedDefaults() {
    this.devices = [
      {
        id: 'dev-light-01',
        name: 'Stark Lab Main Overhead RGB Matrix',
        deviceType: 'LIGHT',
        ipAddress: '192.168.1.104',
        macAddress: 'B8:27:EB:4A:12:F1',
        status: 'ONLINE',
        isAuthorized: true,
        permissionScope: 'CONTROL_ALLOWED',
        telemetryData: { power: 'ON', brightness: 85, colorHex: '#06b6d4', mode: 'FUTURISTIC_CYAN' },
      },
      {
        id: 'dev-plug-02',
        name: 'Quantum Compute Bench Smart Plug',
        deviceType: 'SMART_PLUG',
        ipAddress: '192.168.1.108',
        macAddress: 'DC:A6:32:98:B3:21',
        status: 'ONLINE',
        isAuthorized: true,
        permissionScope: 'CONTROL_ALLOWED',
        telemetryData: { power: 'ON', currentWatts: 340, voltage: 120.4 },
      },
      {
        id: 'dev-sensor-03',
        name: 'Cleanroom Environmental Multi-Sensor',
        deviceType: 'SENSOR',
        ipAddress: '192.168.1.112',
        status: 'ONLINE',
        isAuthorized: true,
        permissionScope: 'READ_ONLY',
        telemetryData: { temperatureC: 21.4, humidityPercent: 44, co2Ppm: 412, airQuality: 'EXCELLENT' },
      },
      {
        id: 'dev-media-04',
        name: 'Living Room 8K Spatial Audio Hub',
        deviceType: 'MEDIA_PLAYER',
        ipAddress: '192.168.1.120',
        status: 'ONLINE',
        isAuthorized: false, // Discovered, pending approval
        permissionScope: 'READ_ONLY',
        telemetryData: { playback: 'PAUSED', volume: 60, currentTrack: 'AC/DC - Back in Black' },
      },
    ];
  }

  public getDevices(): DiscoveredLocalDevice[] {
    return this.devices;
  }

  public scanLocalNetwork(): { scannedCount: number; newDevicesFound: number; devices: DiscoveredLocalDevice[] } {
    // Discovery scan simulation with randomized newly detected node if needed
    const count = this.devices.length;
    return {
      scannedCount: 254, // Full /24 subnet scan
      newDevicesFound: this.devices.filter((d) => !d.isAuthorized).length,
      devices: this.devices,
    };
  }

  public authorizeDevice(deviceId: string, permissionScope: DiscoveredLocalDevice['permissionScope']): { success: boolean; message: string } {
    const dev = this.devices.find((d) => d.id === deviceId);
    if (!dev) return { success: false, message: 'Device not found' };

    dev.isAuthorized = true;
    dev.permissionScope = permissionScope;
    return {
      success: true,
      message: `Device "${dev.name}" authorized with [${permissionScope}] permissions.`,
    };
  }

  public revokeDeviceAccess(deviceId: string): { success: boolean; message: string } {
    const dev = this.devices.find((d) => d.id === deviceId);
    if (!dev) return { success: false, message: 'Device not found' };

    dev.isAuthorized = false;
    dev.permissionScope = 'READ_ONLY';
    return {
      success: true,
      message: `Device "${dev.name}" authorization revoked. Access blocked.`,
    };
  }

  public executeDeviceCommand(
    deviceId: string,
    action: string,
    payload: Record<string, any>
  ): { success: boolean; message: string; updatedTelemetry?: Record<string, any> } {
    const dev = this.devices.find((d) => d.id === deviceId);
    if (!dev) return { success: false, message: 'Device not found' };
    if (!dev.isAuthorized || dev.permissionScope === 'READ_ONLY') {
      return {
        success: false,
        message: `Execution blocked: Device "${dev.name}" is either unauthorized or in READ_ONLY mode.`,
      };
    }

    if (!dev.telemetryData) dev.telemetryData = {};
    Object.assign(dev.telemetryData, payload);

    return {
      success: true,
      message: `Command "${action}" executed on ${dev.name} [IP: ${dev.ipAddress}].`,
      updatedTelemetry: dev.telemetryData,
    };
  }
}
