import { UniversalTranslationOutput } from '../src/types/jarvis.js';
import { generateAiContent } from './gemini.js';

export class UniversalTranslatorEngine {
  private static instance: UniversalTranslatorEngine;

  private constructor() {}

  public static getInstance(): UniversalTranslatorEngine {
    if (!UniversalTranslatorEngine.instance) {
      UniversalTranslatorEngine.instance = new UniversalTranslatorEngine();
    }
    return UniversalTranslatorEngine.instance;
  }

  public async translateText(
    text: string,
    targetLanguage: string = 'bn-BD',
    sourceLanguage: string = 'auto'
  ): Promise<UniversalTranslationOutput> {
    const prompt = `You are ULTRON Universal Translation & Polyglot Engine.
Original text: "${text}"
Target language code/name: "${targetLanguage}"
Source language: "${sourceLanguage}"

Perform high-fidelity contextual translation.
If translating between English and Bangla/Banglish:
- Preserve technical idioms, code keywords, and architectural jargon.
- Provide natural Bangla script translation.
- If target is Bangla, also provide Romanized Banglish for phonetic voice reading.
- Identify cultural nuances and tone.

Return ONLY valid JSON matching:
{
  "originalText": "${text.replace(/"/g, '\\"')}",
  "sourceLanguage": "Detected source language (e.g., English, Bangla, Spanish)",
  "targetLanguage": "${targetLanguage}",
  "translatedText": "High-fidelity translated string",
  "banglishRomanized": "Optional Romanized phonetic transcription",
  "detectedNuances": ["Nuance 1: ...", "Nuance 2: ..."],
  "phoneticAudioGuide": "Phonetic pronunciation hints"
}`;

    try {
      const aiRes = await generateAiContent({
        prompt,
        systemInstruction: 'You are ULTRON Master Polyglot Engine. Output valid JSON only.',
        temperature: 0.2,
      });

      const cleanJson = aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        originalText: text,
        sourceLanguage: parsed.sourceLanguage || 'Auto-Detected',
        targetLanguage: parsed.targetLanguage || targetLanguage,
        translatedText: parsed.translatedText || text,
        banglishRomanized: parsed.banglishRomanized,
        detectedNuances: parsed.detectedNuances || ['Contextual register preserved.'],
        phoneticAudioGuide: parsed.phoneticAudioGuide,
      };
    } catch {
      return {
        originalText: text,
        sourceLanguage: 'English',
        targetLanguage,
        translatedText: text,
        banglishRomanized: text,
        detectedNuances: ['Direct translation fallback applied.'],
      };
    }
  }
}
