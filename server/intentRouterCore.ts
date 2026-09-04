/**
 * ULTRON Core Unified Intent Router
 * 
 * 17 Canonical Intents:
 * - CONVERSATION
 * - QUESTION
 * - RESEARCH
 * - CODING
 * - FILE_OPERATION
 * - CODE_EXECUTION
 * - WEB_SEARCH
 * - PROJECT_OPERATION
 * - DEVICE_CONTROL
 * - COMPUTER_CONTROL
 * - VISION
 * - 3D_GENERATION
 * - MULTI_STEP_TASK
 * - TASK_STATUS
 * - CANCEL_TASK
 * - SYSTEM_COMMAND
 * - UNKNOWN
 * 
 * Multilingual & Banglish Understanding:
 * Native recognition of English, Bangla Unicode, and colloquial Banglish commands.
 */

import { CanonicalIntent, IntentClassificationResult } from './types.js';

export class IntentRouterCore {
  private static instance: IntentRouterCore;

  private constructor() {}

  public static getInstance(): IntentRouterCore {
    if (!IntentRouterCore.instance) {
      IntentRouterCore.instance = new IntentRouterCore();
    }
    return IntentRouterCore.instance;
  }

  /**
   * Normalize raw input string and detect language
   */
  public normalizeInput(rawInput: string): {
    normalized: string;
    detectedLanguage: 'English' | 'Bangla' | 'Banglish' | 'Hindi' | 'Other';
    isWakeWordOnly: boolean;
  } {
    let text = (rawInput || '').trim();

    // Check wake word only
    const wakeOnlyRegex = /^(?:hey\s+)?ultron[!?.,\s]*$/i;
    const isWakeWordOnly = wakeOnlyRegex.test(text);

    // Strip wake word prefix for classification
    text = text.replace(/^(?:hey\s+)?ultron[,\s:]*/i, '').trim();

    // Detect language
    const hasBanglaUnicode = /[\u0980-\u09FF]/.test(text);
    const hasBanglishTokens = /\b(kemon|asos|acho|kor|koro|banaw|banano|dekhaw|dekhao|bolo|bolbo|chalao|shuno|bhalo|shanti|thakun|beday|oita|eita|khobor|kaj|ki|kivabe|keno)\b/i.test(text);

    let detectedLanguage: 'English' | 'Bangla' | 'Banglish' | 'Hindi' | 'Other' = 'English';
    if (hasBanglaUnicode) {
      detectedLanguage = 'Bangla';
    } else if (hasBanglishTokens) {
      detectedLanguage = 'Banglish';
    }

    return {
      normalized: text || rawInput,
      detectedLanguage,
      isWakeWordOnly,
    };
  }

  /**
   * Fast rule-based and entity-extracting intent classifier
   */
  public classify(rawInput: string): IntentClassificationResult {
    const { normalized, detectedLanguage, isWakeWordOnly } = this.normalizeInput(rawInput);
    const text = normalized.toLowerCase();
    const entities: Record<string, string> = {};

    if (isWakeWordOnly) {
      return {
        intent: 'CONVERSATION',
        confidence: 0.99,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        isWakeWordOnly: true,
        extractedEntities: {},
        routingExplanation: 'Wake word detected. ULTRON standing by for command.',
        suggestedTools: [],
      };
    }

    // 1. CANCEL TASK / STOP
    if (
      /^(stop|halt|cancel|abort|terminate|pause|bondho koro|thamo|chup|chup koro|sthopit|stop execution|cancel task)[.!?\s]*$/i.test(text) ||
      (/\b(cancel|stop|halt|abort|terminate|bondho kor|thamo)\b/i.test(text) && /\b(task|process|execution|job|work|kaj|operation|everything|all)\b/i.test(text))
    ) {
      return {
        intent: 'CANCEL_TASK',
        confidence: 0.99,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'User requested immediate task cancellation or emergency stop.',
        suggestedTools: ['cancel_task'],
      };
    }

    // 2. TASK STATUS / QUEUE
    if (
      /\b(task status|job status|progress|koto dur|task er obostha|what is the status|show tasks|list tasks)\b/i.test(text)
    ) {
      return {
        intent: 'TASK_STATUS',
        confidence: 0.96,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'User queried active task queue and progress.',
        suggestedTools: ['get_task_status'],
      };
    }

    // 3. SYSTEM COMMAND / DIAGNOSTICS
    if (
      /\b(system status|diagnostics|self-diagnostic|health check|system health|hardware monitor|ultron status|status dekhao)\b/i.test(text)
    ) {
      return {
        intent: 'SYSTEM_COMMAND',
        confidence: 0.97,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'System level health check and diagnostic inspection.',
        suggestedTools: ['inspect_error'],
      };
    }

    // 4. DEVICE CONTROL (Flashlight, IoT, Mobile)
    if (
      /\b(turn on|turn off|switch on|switch off|toggle|jalao|nibhao|chalu)\s+(?:the\s+)?(flashlight|torch|light|wifi|bluetooth|camera)\b/i.test(text) ||
      /\b(flashlight on|flashlight off|torch on|torch off|vibrate phone)\b/i.test(text)
    ) {
      const actionMatch = text.match(/\b(on|off|toggle|jalao|nibhao)\b/i);
      if (actionMatch) entities.action = actionMatch[1];
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.98,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Hardware device automation command.',
        suggestedTools: ['device_action'],
      };
    }

    // 5. 3D GENERATION & HOLOGRAMS
    if (
      /\b(3d|hologram|mesh|model|render|procedural 3d|generate 3d|create 3d|arc reactor|reactor)\b/i.test(text) &&
      /\b(generate|create|render|show|banaw|make|build)\b/i.test(text)
    ) {
      return {
        intent: '3D_GENERATION',
        confidence: 0.96,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Parametric 3D model generation and holographic projection.',
        suggestedTools: ['generate_3d'],
      };
    }

    // 6. VISION & PERCEPTION
    if (
      /\b(analyze image|inspect picture|what is in this image|camera frame|visual perception|chobi dekho|chobite ki ache)\b/i.test(text)
    ) {
      return {
        intent: 'VISION',
        confidence: 0.95,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Visual perception and multimodal image analysis.',
        suggestedTools: ['analyze_image'],
      };
    }

    // 7. FILE OPERATION (create, read, update, delete, list)
    const fileTargetMatch = text.match(/\b([a-zA-Z0-9_\-./]+\.(?:py|js|ts|tsx|jsx|html|css|json|md|txt|sh|c|cpp))\b/i);
    if (fileTargetMatch) {
      entities.fileName = fileTargetMatch[1];
    }

    const isExplicitFileRead = /\b(read|open|show|inspect|cat|dekhao)\s+(?:the\s+)?(?:file\s+)?([a-zA-Z0-9_\-./]+\.(?:py|js|ts|tsx|jsx|html|css|json|md|txt|sh|c|cpp))\b/i.test(text);
    const isExplicitFileDelete = /\b(delete|remove|unlink|muche felo)\s+(?:the\s+)?(?:file\s+)?([a-zA-Z0-9_\-./]+\.(?:py|js|ts|tsx|jsx|html|css|json|md|txt|sh|c|cpp))\b/i.test(text);

    const isBanglaFileOp =
      /(?:ফাইল|file)\s*(?:তৈরি|বানাও|খুলো|পড়ো|মুছে|ডিলিট)/i.test(text) ||
      /(?:তৈরি করো|বানাও)\s*(?:একটি|একটা)?\s*(?:পাইথন|জাভাস্ক্রিপ্ট|টেক্সট)?\s*ফাইল/i.test(text) ||
      /(?:একটি|একটা)\s*(?:[^\s]+\s+)?ফাইল\s*(?:তৈরি|বানাও)/i.test(text);

    const isFileOp =
      isExplicitFileRead ||
      isExplicitFileDelete ||
      isBanglaFileOp ||
      /\b(create|make|write|scaffold|banaw)\s+(?:a\s+)?(?:new\s+)?(?:test\s+)?file\b/i.test(text) ||
      /\b(read|open|show|inspect|cat|dekhao)\s+(?:the\s+)?file\b/i.test(text) ||
      /\b(delete|remove|unlink|muche felo)\s+(?:the\s+)?file\b/i.test(text) ||
      /\b(list files|search files|file list)\b/i.test(text);

    if (isFileOp) {
      if (isExplicitFileRead || /\b(read|open|cat|show|inspect|dekhao|পড়ো)\b/i.test(text)) entities.action = 'read';
      else if (isExplicitFileDelete || /\b(delete|remove|unlink|muche|মুছে)\b/i.test(text)) entities.action = 'delete';
      else entities.action = 'create';

      return {
        intent: 'FILE_OPERATION',
        confidence: 0.97,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Filesystem operation in VFS sandbox.',
        suggestedTools: [entities.action === 'read' ? 'read_file' : entities.action === 'delete' ? 'delete_file' : 'create_file'],
      };
    }

    // 8. CODE EXECUTION (run script, run code, execute test)
    if (
      /\b(run|execute|test|chalao)\s+(?:the\s+)?([a-zA-Z0-9_\-./]+\.(?:py|js|ts|sh|c|cpp)|program|script|code|tests?)\b/i.test(text) ||
      /\b(run the python program|run test\.py|run code|execute code|run python)\b/i.test(text) ||
      /\b(file|script|code|program)\s*(?:ta\s+|ti\s+|er\s+)?(?:run\s*koro|chalao|execute\s*koro)\b/i.test(text) ||
      /\b(run\s*koro|chalao)\b/i.test(text)
    ) {
      return {
        intent: 'CODE_EXECUTION',
        confidence: 0.98,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Sandboxed code execution and test verification.',
        suggestedTools: ['run_code'],
      };
    }

    // 9. WEB SEARCH / LIVE RESEARCH
    if (
      /\b(search the web|search internet|google|latest information|latest news|khobor|search for|find online|browse web)\b/i.test(text)
    ) {
      return {
        intent: 'WEB_SEARCH',
        confidence: 0.97,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Live web intelligence retrieval and search grounding.',
        suggestedTools: ['web_search'],
      };
    }

    // 10. MULTI-STEP TASK / AUTONOMOUS PROJECT
    if (
      /\b(build|develop|create|scaffold|design)\s+(?:me\s+)?(?:a\s+)?(?:full\s+)?(?:web\s+)?(?:full-stack\s+)?(website|web app|portfolio|dashboard|full-stack|full app|application|system|game)\b/i.test(text) ||
      /\b(build a full web portfolio|build full app|build a website|scaffold project)\b/i.test(text)
    ) {
      return {
        intent: 'MULTI_STEP_TASK',
        confidence: 0.96,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Autonomous multi-step architectural decomposition and scaffolding.',
        suggestedTools: ['create_file', 'run_code'],
      };
    }

    // 11. CODING / CODE GENERATION
    if (
      /\b(write|create|make|develop|implement|code)\s+(?:a\s+)?(?:new\s+)?(?:python|javascript|typescript|c\+\+|cpp|c|rust|go)?\s*(?:program|code|function|script|algorithm)\b/i.test(text) ||
      /\b(write a python program|create a python program|write code|code a|implement a function|fix this bug|refactor|explain this code|coding|program banaw)\b/i.test(text)
    ) {
      return {
        intent: 'CODING',
        confidence: 0.95,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Software engineering, algorithm design, and code generation.',
        suggestedTools: ['create_file', 'run_code'],
      };
    }

    // 12. CONVERSATION / SOCIAL GREETINGS (Checked before question mark)
    if (
      /^(hi|hello|hey|heyy|greetings|kemon asos|kemon acho|how are you|good morning|good evening|good afternoon|thanks|thank you|bhalo|shanti)\b/i.test(text) ||
      /\b(how are you|how are you today|how are you doing|kemon achen|kemon cholche)\b/i.test(text)
    ) {
      return {
        intent: 'CONVERSATION',
        confidence: 0.95,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Conversational turn and persona greeting.',
        suggestedTools: [],
      };
    }

    // 13. QUESTION / TECHNICAL EXPLANATION
    if (
      /^(what is|what are|why is|how does|how to|who is|explain|tell me about|ki|kivabe|keno)\b/i.test(text) ||
      text.endsWith('?')
    ) {
      return {
        intent: 'QUESTION',
        confidence: 0.92,
        rawInput,
        normalizedInput: normalized,
        detectedLanguage,
        extractedEntities: entities,
        routingExplanation: 'Information query and reasoning explanation.',
        suggestedTools: [],
      };
    }

    // 14. DEFAULT UNKNOWN
    return {
      intent: 'UNKNOWN',
      confidence: 0.5,
      rawInput,
      normalizedInput: normalized,
      detectedLanguage,
      extractedEntities: entities,
      routingExplanation: 'General intent, delegating to central cognitive brain.',
      suggestedTools: [],
    };
  }
}
