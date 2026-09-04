import { VoiceUserProfile, CredentialVaultItem, PermissionLevel } from '../src/types/jarvis.js';

export class VaultAndVoiceProfilesEngine {
  private static instance: VaultAndVoiceProfilesEngine;
  private voiceProfiles: VoiceUserProfile[] = [];
  private vaultCredentials: (CredentialVaultItem & { rawSecret?: string })[] = [];

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): VaultAndVoiceProfilesEngine {
    if (!VaultAndVoiceProfilesEngine.instance) {
      VaultAndVoiceProfilesEngine.instance = new VaultAndVoiceProfilesEngine();
    }
    return VaultAndVoiceProfilesEngine.instance;
  }

  private seedDefaults() {
    this.voiceProfiles = [
      {
        id: 'voice-user-prime',
        name: 'Commander (jarvis6852@gmail.com)',
        voicePreference: 'Aoede-En-US-HighDefinition',
        language: 'bn-BD',
        permissionLevel: 'EXECUTE_STANDARD',
        confidenceThreshold: 0.88,
        customKeywords: ['Heyy ULTRON', 'ULTRON', 'Jarvis SuperBrain'],
        isActive: true,
      },
      {
        id: 'voice-user-guest',
        name: 'Authorized Guest Engineer',
        voicePreference: 'Charon-Neutral',
        language: 'en-US',
        permissionLevel: 'SUGGEST_ONLY',
        confidenceThreshold: 0.92,
        customKeywords: ['ULTRON ReadOnly'],
        isActive: false,
      },
    ];

    this.vaultCredentials = [
      {
        id: 'vault-gemini-key',
        serviceName: 'Google Gemini API Key',
        keyName: 'GEMINI_API_KEY',
        maskedValue: 'AIzaSy••••••••••••••••••••••',
        category: 'AI_PROVIDER',
        environmentVarName: 'GEMINI_API_KEY',
        lastAccessed: new Date().toISOString(),
        isEncrypted: true,
        rawSecret: process.env.GEMINI_API_KEY ? 'CONFIGURED_IN_ENV' : undefined,
      },
      {
        id: 'vault-firebase-key',
        serviceName: 'Firebase Service Account Token',
        keyName: 'FIREBASE_AUTH_SECRET',
        maskedValue: 'fb-sec-••••••••••••••••••••',
        category: 'CLOUD_SERVICE',
        environmentVarName: 'FIREBASE_CONFIG',
        lastAccessed: new Date(Date.now() - 3600000 * 24).toISOString(),
        isEncrypted: true,
      },
      {
        id: 'vault-stripe-key',
        serviceName: 'Stripe Gateway Secret Key',
        keyName: 'STRIPE_SECRET_KEY',
        maskedValue: 'sk_live_•••••••••••••••••••',
        category: 'CUSTOM_API',
        environmentVarName: 'STRIPE_SECRET_KEY',
        lastAccessed: new Date(Date.now() - 3600000 * 5).toISOString(),
        isEncrypted: true,
      },
    ];
  }

  public getVoiceProfiles(): VoiceUserProfile[] {
    return this.voiceProfiles;
  }

  public addVoiceProfile(profile: Omit<VoiceUserProfile, 'id'>): VoiceUserProfile {
    const newProfile: VoiceUserProfile = {
      ...profile,
      id: `voice-${Date.now()}`,
    };
    this.voiceProfiles.push(newProfile);
    return newProfile;
  }

  public setActiveVoiceProfile(id: string): VoiceUserProfile | null {
    this.voiceProfiles.forEach((p) => (p.isActive = p.id === id));
    return this.voiceProfiles.find((p) => p.id === id) || null;
  }

  public getMaskedVaultItems(): CredentialVaultItem[] {
    // Return items without revealing raw secret
    return this.vaultCredentials.map(({ rawSecret, ...safeItem }) => safeItem);
  }

  public storeCredential(item: {
    serviceName: string;
    keyName: string;
    secretValue: string;
    category: CredentialVaultItem['category'];
    environmentVarName?: string;
  }): CredentialVaultItem {
    const masked = item.secretValue.length > 8
      ? `${item.secretValue.slice(0, 4)}••••••••${item.secretValue.slice(-4)}`
      : '••••••••';

    const newItem = {
      id: `vault-${Date.now()}`,
      serviceName: item.serviceName,
      keyName: item.keyName,
      maskedValue: masked,
      category: item.category,
      environmentVarName: item.environmentVarName,
      lastAccessed: new Date().toISOString(),
      isEncrypted: true,
      rawSecret: item.secretValue,
    };

    this.vaultCredentials.unshift(newItem);
    const { rawSecret, ...safe } = newItem;
    return safe;
  }

  public deleteCredential(id: string): boolean {
    const initLen = this.vaultCredentials.length;
    this.vaultCredentials = this.vaultCredentials.filter((c) => c.id !== id);
    return this.vaultCredentials.length < initLen;
  }
}
