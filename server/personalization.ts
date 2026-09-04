import { UserPersonalizationSettings } from '../src/types/jarvis.js';

export class PersonalizationEngine {
  private static instance: PersonalizationEngine;
  private settings: UserPersonalizationSettings = {
    language: 'bn-BD',
    responseLength: 'BALANCED',
    explanationDifficulty: 'INTERMEDIATE',
    voiceStyle: 'STARK_BRITISH',
    speakingSpeed: 1.0,
    preferredAiModel: 'gemini-3.7-flash',
    preferredTools: ['internet_search', 'computer_agent', 'verifier', 'code_runner'],
    uiTheme: 'CYBER_DARK',
    personalizationEnabled: true,
  };

  private constructor() {}

  public static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine();
    }
    return PersonalizationEngine.instance;
  }

  public getSettings(): UserPersonalizationSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<UserPersonalizationSettings>): UserPersonalizationSettings {
    this.settings = {
      ...this.settings,
      ...partial,
    };
    return this.getSettings();
  }

  /**
   * Formats prompt instructions tailored specifically to the user's active personalization preferences.
   */
  public generatePersonalizationInstruction(): string {
    if (!this.settings.personalizationEnabled) return '';

    const langInstruction =
      this.settings.language === 'bn-BD'
        ? 'Respond naturally in Bengali or Banglish where appropriate, preserving English technical terms.'
        : this.settings.language === 'banglish'
        ? 'Respond in conversational Banglish with clear English technical words.'
        : 'Respond in clean, authoritative English.';

    const lengthInstruction =
      this.settings.responseLength === 'CONCISE'
        ? 'Keep responses highly succinct, direct, and actionable.'
        : this.settings.responseLength === 'THOROUGH'
        ? 'Provide thorough explanations covering all nuances and edge cases.'
        : 'Provide balanced responses with executive clarity and structured points.';

    const diffInstruction =
      this.settings.explanationDifficulty === 'BEGINNER'
        ? 'Explain concepts using simple intuitive analogies.'
        : this.settings.explanationDifficulty === 'EXPERT'
        ? 'Assume senior engineering competence; use precise technical language and rigorous specifics.'
        : 'Explain clearly for professional developers.';

    return `\n[USER PERSONALIZATION DIRECTIVES]:\n- Language: ${langInstruction}\n- Length: ${lengthInstruction}\n- Depth: ${diffInstruction}\n`;
  }
}
