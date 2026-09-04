/**
 * ULTRON Core Intent Router & Multilingual Semantic Classifier
 * 
 * Pipeline:
 * USER INPUT -> LANGUAGE DETECTION -> CONTEXT ANALYSIS -> INTENT CLASSIFICATION -> AGENT SELECTION -> AI RESPONSE / TOOL EXECUTION
 */

export type SupportedIntent =
  | 'SELF_DIAGNOSTIC'
  | 'CONVERSATION'
  | 'QUESTION'
  | 'KNOWLEDGE'
  | 'RESEARCH'
  | 'CODING'
  | '3D_GENERATION'
  | 'VISION'
  | 'DEVICE_CONTROL'
  | 'TASK'
  | 'REMINDER'
  | 'SYSTEM_COMMAND'
  | 'SETTINGS'
  | 'TRANSLATION'
  | 'ANALYSIS'
  | 'CREATIVE'
  | 'OTHER';

export type ResponseMode = 'CHAT' | 'EXECUTE' | 'RESEARCH' | 'CREATE' | 'ANALYZE' | 'SYSTEM';

export type DetectedLanguage = 'Bangla' | 'English' | 'Banglish' | 'Mixed';

export interface IntentRoutingResult {
  rawInput: string;
  normalizedInput: string;
  detectedLanguage: DetectedLanguage;
  intent: SupportedIntent;
  secondaryIntents: string[];
  responseMode: ResponseMode;
  isQuestion: boolean;
  isCommand: boolean;
  isWakeWordOnly: boolean;
  isSystemStatus: boolean;
  selectedAgent: string;
  recommendedModel: string;
  toolRequired: string | null;
  confidence: number;
  extractedEntities: Record<string, string>;
  debugTrace: {
    languageConfidence: number;
    intentReasoning: string;
    contextReferenced: boolean;
  };
}

export class IntentRouter {
  private static instance: IntentRouter;

  private constructor() {}

  public static getInstance(): IntentRouter {
    if (!IntentRouter.instance) {
      IntentRouter.instance = new IntentRouter();
    }
    return IntentRouter.instance;
  }

  /**
   * 1. LANGUAGE DETECTION
   * Accurately detects Bangla script, Banglish phonetics, English, or Mixed.
   */
  public detectLanguage(text: string): { language: DetectedLanguage; confidence: number } {
    const raw = text.trim();
    if (!raw) return { language: 'English', confidence: 1.0 };

    const banglaScriptRegex = /[\u0980-\u09FF]/;
    const hasBanglaScript = banglaScriptRegex.test(raw);

    const banglishKeywords = [
      'amar', 'amader', 'tumi', 'tui', 'apni', 'kemon', 'acho', 'asos', 'asen',
      'kivabe', 'ki', 'korte', 'paro', 'paro na', 'koro', 'kore', 'dao', 'de',
      'lagbo', 'lagbe', 'bujho', 'bujhsos', 'bujhlen', 'hobe', 'hole', 'hoite',
      'bhalo', 'valo', 'khobor', 'bolo', 'shono', 'suno', 'dekhao', 'banaw',
      'banao', 'chalao', 'aro', 'ar', 'arekta', 'ekta', 'eta', 'oita', 'sheta',
      'thik', 'koi', 'kothay', 'keno', 'khuje', 'dharves', 'bede', 'bhai'
    ];

    const lower = raw.toLowerCase();
    const words = lower.split(/[\s,?.!:;।]+/).filter(Boolean);
    const banglishMatches = words.filter((w) => banglishKeywords.includes(w));

    if (hasBanglaScript) {
      const englishWordCount = words.filter((w) => /^[a-z0-9]+$/i.test(w)).length;
      if (englishWordCount > 0) {
        return { language: 'Mixed', confidence: 0.95 };
      }
      return { language: 'Bangla', confidence: 0.98 };
    }

    if (banglishMatches.length >= 1) {
      const englishWordCount = words.length - banglishMatches.length;
      if (englishWordCount > 2) {
        return { language: 'Mixed', confidence: 0.92 };
      }
      return { language: 'Banglish', confidence: 0.94 };
    }

    return { language: 'English', confidence: 0.96 };
  }

  /**
   * 2. INTENT CLASSIFICATION & AGENT SELECTION PIPELINE
   */
  public classifyIntent(
    rawText: string,
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
  ): IntentRoutingResult {
    const text = rawText.trim();
    const lower = text.toLowerCase();
    const { language, confidence: langConfidence } = this.detectLanguage(text);

    // Strip wake word prefixes if present to analyze underlying prompt
    const strippedInput = text
      .replace(/^(?:heyy+|hey+|hi+|hello+|ok+|okay|oi+|oy+|yo+|হে+|এই+|হেই+|শোনো+|বলো+|ওহে+|হ্যালো+)\s*(?:,\s*)?(?:ultron+|altron|oltron|jarvis+|jarves|jarvish|jarbis|jarvice|আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস)[\s,.:;!?-]*/i, '')
      .replace(/^(?:ultron+|altron|oltron|jarvis+|jarves|jarvish|jarbis|jarvice|আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস)[\s,.:;!?-]*/i, '')
      .trim();

    const effectiveText = strippedInput || text;
    const effectiveLower = effectiveText.toLowerCase();

    // Check if input is Wake Word Alone
    const isWakeAlone =
      /^(?:heyy+|hey+|hi+|hello+|ok+|okay|oi+|oy+|yo+|হে+|এই+|হেই+|শোনো+|বলো+|ওহে+|হ্যালো+)?\s*(?:,\s*)?(?:ultron|altron|oltron|jarvis|jarves|আলট্রন|আল্ট্রন|অলট্রন|জার্ভিস)\s*[.?!]*$/i.test(text);

    // Check for Explicit System Status Check
    const isExplicitStatus =
      /^(?:system\s*status|status\s*check|check\s*system|are\s*you\s*online|system\s*online|সার্ভার\s*স্ট্যাটাস|সিস্টেম\s*স্ট্যাটাস|system\s*status\s*check\s*koro|shob\s*thik\s*ache|status)$/i.test(effectiveLower) ||
      (effectiveLower.includes('system status') && !effectiveLower.includes('create') && !effectiveLower.includes('how') && !effectiveLower.includes('why'));

    // Check if input is a question vs a command
    const questionIndicators = [
      'কী', 'কেমন', 'কেন', 'কীভাবে', 'কিভাবে', 'কখন', 'কোথায়', 'কার', 'কারা',
      'what', 'why', 'how', 'who', 'when', 'where', 'which', 'can you', 'could you',
      'ki', 'kivabe', 'keno', 'kemon', 'koi', 'kothay', 'kar', 'kobe', 'ki ki',
      'feature', 'advance', 'advanced', 'future', 'capability', 'capabilities', 'explain'
    ];

    const isQuestion =
      text.includes('?') ||
      text.includes('।?') ||
      text.includes('¿') ||
      questionIndicators.some((qi) => {
        if (/^[a-z0-9\s]+$/i.test(qi)) {
          const escaped = qi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|[^a-zA-Z0-9_])${escaped}(?=[^a-zA-Z0-9_]|$)`, 'i');
          return regex.test(effectiveLower);
        }
        return effectiveText.includes(qi) || effectiveLower.includes(qi.toLowerCase());
      });

    // Check context reference (e.g., "আর কী", "what else", "also", "and then", "aar ki")
    const hasContextReferenced = Boolean(
      conversationHistory &&
      conversationHistory.length > 0 &&
      (effectiveLower.startsWith('ar ki') ||
       effectiveLower.startsWith('aar ki') ||
       effectiveLower.startsWith('আর কী') ||
       effectiveLower.startsWith('আর কি') ||
       effectiveLower.startsWith('what else') ||
       effectiveLower.startsWith('what about') ||
       effectiveLower.startsWith('and also') ||
       effectiveLower.includes('previous') ||
       effectiveLower.includes('agey jeita'))
    );

    // Check if user is asking a question about previous behavior, repetitive responses, debugging, or complaints
    const isMetaQueryAboutReply =
      effectiveLower.includes('ken') ||
      effectiveLower.includes('keno') ||
      effectiveLower.includes('why') ||
      effectiveLower.includes('bar bar') ||
      effectiveLower.includes('barbar') ||
      effectiveLower.includes('ditase') ||
      effectiveLower.includes('reply dey') ||
      effectiveLower.includes('repeat') ||
      effectiveLower.includes('repeating') ||
      effectiveLower.includes('karon') ||
      effectiveLower.includes('explain') ||
      effectiveLower.includes('bujhlam na') ||
      effectiveLower.includes('bujhlam nah') ||
      effectiveLower.includes('bujhi nai') ||
      effectiveLower.includes('ki hoise') ||
      effectiveLower.includes('what happened') ||
      effectiveLower.includes('eitai') ||
      effectiveLower.includes('problem') ||
      effectiveLower.includes('somossa') ||
      effectiveLower.includes('kaj kore na') ||
      effectiveLower.includes('kaj korte dile') ||
      effectiveLower.includes('debug koira fix') ||
      effectiveLower.includes('debug kore fix');

    // 0. ULTRON LIVE SELF-DIAGNOSTIC INTENT (Strict explicit command to execute capability diagnostic test)
    const isSelfDiagnostic =
      !isMetaQueryAboutReply &&
      (
        // Explicit Bangla & Banglish Diagnostic Commands
        effectiveLower.includes('live diagnostic চালাও') ||
        effectiveLower.includes('ডায়াগনস্টিক চালাও') ||
        effectiveLower.includes('ডায়াগনস্টিক টেস্ট চালাও') ||
        effectiveLower.includes('ডায়াগনস্টিক টেস্ট করো') ||
        effectiveLower.includes('লাইভ ডায়াগনস্টিক চালাও') ||
        effectiveLower.includes('সেলফ ডায়াগনস্টিক চালাও') ||
        effectiveLower.includes('সিস্টেম ডায়াগনস্টিক চালাও') ||
        effectiveLower.includes('capabilities-এর একটা live diagnostic') ||
        effectiveLower.includes('capabilities-er ekta live diagnostic') ||
        effectiveLower.includes('live diagnostic test চালাও') ||
        (effectiveLower.includes('ডায়াগনস্টিক') && (effectiveLower.includes('চালাও') || effectiveLower.includes('run') || effectiveLower.includes('start') || effectiveLower.includes('execute'))) ||
        (effectiveLower.includes('diagnostic') && (effectiveLower.includes('run') || effectiveLower.includes('execute') || effectiveLower.includes('start') || effectiveLower.includes('perform') || effectiveLower.includes('test'))) ||
        // Explicit English Action Phrases
        effectiveLower.includes('run live diagnostic') ||
        effectiveLower.includes('run diagnostic') ||
        effectiveLower.includes('run self-diagnostic') ||
        effectiveLower.includes('run self diagnostic') ||
        effectiveLower.includes('run system diagnostic') ||
        effectiveLower.includes('test yourself') ||
        effectiveLower.includes('diagnose yourself') ||
        effectiveLower.includes('full system diagnostic') ||
        effectiveLower.includes('check system capabilities live')
      );

    if (isSelfDiagnostic) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: 'SELF_DIAGNOSTIC',
        secondaryIntents: ['CAPABILITY_REGISTRY_AUDIT', 'LIVE_MODULE_TEST', 'DIAGNOSTIC_VERIFICATION'],
        responseMode: 'SYSTEM',
        isQuestion: false,
        isCommand: true,
        isWakeWordOnly: false,
        isSystemStatus: true,
        selectedAgent: 'ULTRON_SELF_DIAGNOSTIC_ENGINE',
        recommendedModel: 'gemini-3.7-flash',
        toolRequired: 'LIVE_CAPABILITY_DIAGNOSTIC_HARNESS',
        confidence: 1.0,
        extractedEntities: { type: 'self_diagnostic', target: 'all_30_capabilities' },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: 'ULTRON live self-diagnostic intent recognized. Routing strictly to Capability Registry & Live Test Engine (bypassing research)',
          contextReferenced: false,
        },
      };
    }

    // 1. Explicit Status
    if (isExplicitStatus) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: 'SYSTEM_COMMAND',
        secondaryIntents: ['STATUS_CHECK'],
        responseMode: 'SYSTEM',
        isQuestion: false,
        isCommand: true,
        isWakeWordOnly: false,
        isSystemStatus: true,
        selectedAgent: 'SYSTEM_HEALTH_MONITOR',
        recommendedModel: 'gemini-3.1-flash-lite',
        toolRequired: 'HARDWARE_TELEMETRY',
        confidence: 0.99,
        extractedEntities: { type: 'system_status' },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: 'Explicit status check command matched',
          contextReferenced: false,
        },
      };
    }

    // 2. Wake Word Alone
    if (isWakeAlone) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: 'SYSTEM_COMMAND',
        secondaryIntents: ['WAKE_WORD_ACK'],
        responseMode: 'SYSTEM',
        isQuestion: false,
        isCommand: false,
        isWakeWordOnly: true,
        isSystemStatus: false,
        selectedAgent: 'EXECUTIVE_SUPERVISOR',
        recommendedModel: 'gemini-3.1-flash-lite',
        toolRequired: null,
        confidence: 0.98,
        extractedEntities: { wakeWord: 'ultron' },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: 'Wake word alone detected without trailing command',
          contextReferenced: false,
        },
      };
    }

    // 3. 3D Model Generation / Hologram Command
    const is3DCommand =
      /^(?:create|build|generate|make|render|বানাও|বানান|তৈরি\s*করো|3d|হোলোগ্রাম|hologram|spatial)/i.test(effectiveLower) &&
      (effectiveLower.includes('3d') || effectiveLower.includes('model') || effectiveLower.includes('hologram') || effectiveLower.includes('reactor') || effectiveLower.includes('phone') || effectiveLower.includes('drone') || effectiveLower.includes('car') || effectiveLower.includes('robot') || effectiveLower.includes('spacecraft') || effectiveLower.includes('gun') || effectiveLower.includes('sword') || effectiveLower.includes('house') || effectiveLower.includes('suit') || effectiveLower.includes('shield'));

    if (is3DCommand && !isQuestion) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: '3D_GENERATION',
        secondaryIntents: ['SPATIAL_BLUEPRINT', 'MESH_SYNTHESIS'],
        responseMode: 'CREATE',
        isQuestion: false,
        isCommand: true,
        isWakeWordOnly: false,
        isSystemStatus: false,
        selectedAgent: 'SPATIAL_3D_ARCHITECT',
        recommendedModel: 'gemini-3.7-flash',
        toolRequired: 'THREEJS_HOLOGRAM_ENGINE',
        confidence: 0.97,
        extractedEntities: { subject: effectiveText },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: '3D spatial geometry construction command detected',
          contextReferenced: hasContextReferenced,
        },
      };
    }

    // 4. Device Hardware Control (Torch, Flashlight, YouTube playback, Calls, WhatsApp)
    const isDeviceAction =
      (effectiveLower.includes('torch') || effectiveLower.includes('flashlight') || effectiveLower.includes('jalo') || effectiveLower.includes('jalao') || effectiveLower.includes('on koro') || effectiveLower.includes('off koro')) &&
      !isQuestion;
    const isYouTubeAction =
      (effectiveLower.includes('youtube') || effectiveLower.includes('গান চালাও') || effectiveLower.includes('gan chalao') || effectiveLower.includes('play music')) &&
      !isQuestion;
    const isCommAction =
      (effectiveLower.includes('call') || effectiveLower.includes('dial') || effectiveLower.includes('whatsapp') || effectiveLower.includes('message dao')) &&
      !isQuestion;

    if (isDeviceAction || isYouTubeAction || isCommAction) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: 'DEVICE_CONTROL',
        secondaryIntents: [isYouTubeAction ? 'MEDIA_PLAYBACK' : isDeviceAction ? 'HARDWARE_TOGGLE' : 'COMMUNICATION'],
        responseMode: 'EXECUTE',
        isQuestion: false,
        isCommand: true,
        isWakeWordOnly: false,
        isSystemStatus: false,
        selectedAgent: 'MOBILE_DEVICE_COMPANION',
        recommendedModel: 'gemini-3.1-flash-lite',
        toolRequired: 'DEVICE_BRIDGE_INTEGRATION',
        confidence: 0.96,
        extractedEntities: { actionTarget: effectiveText },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: 'Native device hardware automation command',
          contextReferenced: false,
        },
      };
    }

    // 5. Research & Web Search Intent
    const isResearch =
      effectiveLower.includes('khuje dao') ||
      effectiveLower.includes('khuje de') ||
      effectiveLower.includes('search') ||
      effectiveLower.includes('latest news') ||
      effectiveLower.includes('খুঁজে দাও') ||
      effectiveLower.includes('খবর') ||
      effectiveLower.includes('current weather') ||
      effectiveLower.includes('google search') ||
      effectiveLower.includes('web search') ||
      (effectiveLower.includes('news') && (effectiveLower.includes('today') || effectiveLower.includes('ajker') || effectiveLower.includes('আজকের')));

    if (isResearch) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: 'RESEARCH',
        secondaryIntents: ['WEB_INTELLIGENCE', 'MULTI_SOURCE_SYNTHESIS'],
        responseMode: 'RESEARCH',
        isQuestion: true,
        isCommand: true,
        isWakeWordOnly: false,
        isSystemStatus: false,
        selectedAgent: 'INTERNET_INTELLIGENCE_SCOUT',
        recommendedModel: 'gemini-3.7-flash',
        toolRequired: 'GOOGLE_SEARCH_GROUNDING',
        confidence: 0.94,
        extractedEntities: { query: effectiveText },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: 'Web research and live fact retrieval query detected',
          contextReferenced: hasContextReferenced,
        },
      };
    }

    // 6. Coding & Software Engineering Intent
    const isCoding =
      effectiveLower.includes('code') ||
      effectiveLower.includes('function') ||
      effectiveLower.includes('bug') ||
      effectiveLower.includes('typescript') ||
      effectiveLower.includes('javascript') ||
      effectiveLower.includes('python') ||
      effectiveLower.includes('react') ||
      effectiveLower.includes('c++') ||
      effectiveLower.includes('rust') ||
      effectiveLower.includes('algorithm') ||
      effectiveLower.includes('explain this code') ||
      effectiveLower.includes('code explain') ||
      effectiveLower.includes('refactor');

    if (isCoding) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: 'CODING',
        secondaryIntents: ['CODE_ANALYSIS', 'ALGORITHM_DESIGN'],
        responseMode: isQuestion ? 'CHAT' : 'EXECUTE',
        isQuestion,
        isCommand: !isQuestion,
        isWakeWordOnly: false,
        isSystemStatus: false,
        selectedAgent: 'AUTONOMOUS_CODER_AGENT',
        recommendedModel: 'gemini-3.7-flash',
        toolRequired: 'CODE_SANDBOX',
        confidence: 0.95,
        extractedEntities: { programmingDomain: 'software_engineering' },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: 'Code synthesis, explanation, or refactoring intent',
          contextReferenced: hasContextReferenced,
        },
      };
    }

    // 7. Conversational Capability & Feature Discussion (CRITICAL: "তোমার ভিতরে আর কী কী feature হলে তুমি আরও advance হবে?")
    const isFeatureOrAdvanceDiscussion =
      (effectiveLower.includes('feature') ||
       effectiveLower.includes('advance') ||
       effectiveLower.includes('advanced') ||
       effectiveLower.includes('future') ||
       effectiveLower.includes('capability') ||
       effectiveLower.includes('capabilities') ||
       effectiveLower.includes('উন্নত') ||
       effectiveLower.includes('ফিচার') ||
       effectiveLower.includes('ক্ষমতা') ||
       effectiveLower.includes('কী করতে পারো') ||
       effectiveLower.includes('ki korte paro') ||
       effectiveLower.includes('what can you do') ||
       effectiveLower.includes('tumi ke') ||
       effectiveLower.includes('who are you') ||
       effectiveLower.includes('tumi ki') ||
       effectiveLower.includes('তুমি কী') ||
       effectiveLower.includes('তোমাকে আরও') ||
       effectiveLower.includes('tomake aro'));

    if (isFeatureOrAdvanceDiscussion) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: 'CONVERSATION',
        secondaryIntents: ['FEATURE_DISCUSSION', 'AI_CAPABILITIES', 'COGNITIVE_ARCHITECTURE'],
        responseMode: 'CHAT',
        isQuestion: true,
        isCommand: false,
        isWakeWordOnly: false,
        isSystemStatus: false,
        selectedAgent: 'CONVERSATIONAL_CORE_AGENT',
        recommendedModel: 'gemini-3.7-flash',
        toolRequired: null,
        confidence: 0.99,
        extractedEntities: { topic: 'system_features_and_advancement' },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: 'Conversational feature roadmap & capability discussion directly routed to AI',
          contextReferenced: hasContextReferenced,
        },
      };
    }

    // 8. General Knowledge / Explanation Question
    if (isQuestion || effectiveLower.startsWith('explain') || effectiveLower.startsWith('tell me') || effectiveLower.startsWith('বলো')) {
      return {
        rawInput: text,
        normalizedInput: effectiveText,
        detectedLanguage: language,
        intent: 'QUESTION',
        secondaryIntents: ['KNOWLEDGE', 'CONCEPT_EXPLANATION'],
        responseMode: 'CHAT',
        isQuestion: true,
        isCommand: false,
        isWakeWordOnly: false,
        isSystemStatus: false,
        selectedAgent: 'KNOWLEDGE_SYNTHESIS_AGENT',
        recommendedModel: 'gemini-3.7-flash',
        toolRequired: null,
        confidence: 0.93,
        extractedEntities: { topic: effectiveText },
        debugTrace: {
          languageConfidence: langConfidence,
          intentReasoning: 'Inquisitive question requiring conversational cognitive answer',
          contextReferenced: hasContextReferenced,
        },
      };
    }

    // 9. General Conversation / Greeting / Chat
    return {
      rawInput: text,
      normalizedInput: effectiveText,
      detectedLanguage: language,
      intent: 'CONVERSATION',
      secondaryIntents: ['NATURAL_DIALOGUE'],
      responseMode: 'CHAT',
      isQuestion: false,
      isCommand: false,
      isWakeWordOnly: false,
      isSystemStatus: false,
      selectedAgent: 'CONVERSATIONAL_CORE_AGENT',
      recommendedModel: 'gemini-3.7-flash',
      toolRequired: null,
      confidence: 0.91,
      extractedEntities: { utterance: effectiveText },
      debugTrace: {
        languageConfidence: langConfidence,
        intentReasoning: 'General conversational dialogue sent to AI conversational model',
        contextReferenced: hasContextReferenced,
      },
    };
  }
}
