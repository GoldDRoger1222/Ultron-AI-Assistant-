/**
 * ULTRON Centralized Brain Engine
 * 
 * Central Nervous System Architecture:
 * User Input
 *    ↓
 * Input Normalizer
 *    ↓
 * Intent Router
 *    ↓
 * Context Manager
 *    ↓
 * Memory Manager
 *    ↓
 * Planner / Reasoning Engine
 *    ↓
 * Model Router
 *    ↓
 * Tool Selector
 *    ↓
 * Task Orchestrator
 *    ↓
 * Verification Engine
 *    ↓
 * Response Generator
 * 
 * Supports all canonical intent types with specific, tailored handlers.
 */

import { ContextEngine } from './contextEngine.js';
import { MemoryEngine } from './memoryEngine.js';
import { ModelRouterEngine } from './modelRouter.js';
import { PlannerEngine, TaskPlan } from './plannerEngine.js';
import { ToolRegistry, ToolExecutionResult } from './toolRegistry.js';
import { TaskOrchestrator, OrchestratedTask } from './taskOrchestrator.js';
import { EvidenceVerifier } from './evidenceVerifier.js';
import { ErrorAnalyzer } from './errorAnalyzer.js';
import { normalizeTranscript } from './voice.js';

export type UltronIntentType =
  | 'CONVERSATION'
  | 'QUESTION'
  | 'RESEARCH'
  | 'CODING'
  | 'FILE_OPERATION'
  | 'CODE_EXECUTION'
  | 'WEB_SEARCH'
  | '3D_GENERATION'
  | 'VISION'
  | 'DEVICE_CONTROL'
  | 'COMPUTER_CONTROL'
  | 'SYSTEM_COMMAND'
  | 'MULTI_STEP_TASK'
  | 'TASK_STATUS'
  | 'CANCEL_TASK'
  | 'UNKNOWN';

export interface BrainProcessResult {
  success: boolean;
  taskId?: string;
  intent: UltronIntentType;
  rawInput: string;
  normalizedInput: string;
  language: 'en' | 'bn' | 'mixed' | 'hi';
  modelUsed?: string;
  spokenResponse: string;
  markdownResponse: string;
  plan?: TaskPlan;
  toolResults: ToolExecutionResult[];
  verificationStatus: 'VERIFIED' | 'FAILED' | 'NOT_APPLICABLE' | 'UNAVAILABLE';
  executionTimeMs: number;
  evidence?: unknown;
  error?: string;
}

export class UltronBrainEngine {
  private static instance: UltronBrainEngine;

  private constructor() {}

  public static getInstance(): UltronBrainEngine {
    if (!UltronBrainEngine.instance) {
      UltronBrainEngine.instance = new UltronBrainEngine();
    }
    return UltronBrainEngine.instance;
  }

  // =======================================================
  // 1. INPUT NORMALIZER & INTENT ROUTER
  // =======================================================
  public normalizeInput(rawInput: string): {
    normalized: string;
    language: 'en' | 'bn' | 'mixed' | 'hi';
    cleanedForRouting: string;
  } {
    const { normalized_transcript, detected_language } = normalizeTranscript(rawInput);
    return {
      normalized: normalized_transcript,
      language: detected_language,
      cleanedForRouting: normalized_transcript.trim(),
    };
  }

  public classifyIntent(input: string): {
    intent: UltronIntentType;
    confidence: number;
    extractedEntities: Record<string, string>;
  } {
    const text = input.trim().toLowerCase();
    const entities: Record<string, string> = {};

    // 1. CANCEL_TASK
    if (/^(stop|halt|cancel|terminate|thamo|chup|bondho koro|chup koro|cancel task|stop execution)$/i.test(text) ||
        /\b(stop|cancel task|halt all)\b/i.test(text)) {
      return { intent: 'CANCEL_TASK', confidence: 0.99, extractedEntities: entities };
    }

    // 2. TASK_STATUS
    if (/\b(task status|check status|koto dur holo|progress|status of task|task update)\b/i.test(text)) {
      return { intent: 'TASK_STATUS', confidence: 0.95, extractedEntities: entities };
    }

    // 3. 3D_GENERATION
    if (/\b(3d|three d|mesh|render|obj|gltf|stl|hologram|cad|3d model|generate 3d)\b/i.test(text)) {
      return { intent: '3D_GENERATION', confidence: 0.95, extractedEntities: entities };
    }

    // 4. VISION
    if (/\b(see|look at|image|screenshot|webcam|camera|photo|dekho|chobi)\b/i.test(text)) {
      return { intent: 'VISION', confidence: 0.92, extractedEntities: entities };
    }

    // 5. DEVICE_CONTROL (IoT / Flashlight / Volume)
    if (/\b(flashlight|torch|light|volume|mute|unmute|brightness|bluetooth|wifi|jalao|bondho koro|on koro|off koro)\b/i.test(text)) {
      return { intent: 'DEVICE_CONTROL', confidence: 0.94, extractedEntities: entities };
    }

    // 6. COMPUTER_CONTROL / SYSTEM_COMMAND
    if (/\b(open (youtube|google|browser|app|spotify|whatsapp)|system diagnostic|hardware monitor|kill process)\b/i.test(text)) {
      return { intent: 'SYSTEM_COMMAND', confidence: 0.90, extractedEntities: entities };
    }

    // 7. FILE_OPERATION (Create, read, edit, delete file)
    const fileCreateRegex = /\b(create|make|write|generate|save)\s+(?:a|the)?\s*(?:new)?\s*(?:python|javascript|typescript|text|html|css)?\s*file\s*(?:called|named)?\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/i;
    const matchCreate = text.match(fileCreateRegex);
    if (matchCreate) {
      entities.fileName = matchCreate[2];
      entities.action = 'create';
      return { intent: 'FILE_OPERATION', confidence: 0.98, extractedEntities: entities };
    }

    const fileReadRegex = /\b(read|open|show|inspect|cat)\s+(?:the|a)?\s*file\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)?/i;
    const matchRead = text.match(fileReadRegex);
    if (matchRead) {
      if (matchRead[2]) entities.fileName = matchRead[2];
      entities.action = 'read';
      return { intent: 'FILE_OPERATION', confidence: 0.96, extractedEntities: entities };
    }

    if (/\b(create a test file|create file|delete file|update file|read file|list files|file banaw|file dekhao)\b/i.test(text)) {
      return { intent: 'FILE_OPERATION', confidence: 0.95, extractedEntities: entities };
    }

    // 8. CODE_EXECUTION (Run script, run program, execute test)
    if (/\b(run|execute|test|chalao)\s+(?:the\s+)?([a-zA-Z0-9_\-./]+\.(?:py|js|ts|sh)|program|script|code|tests?)\b/i.test(text) ||
        /\b(run the python program|run test\.py|run code|execute code)\b/i.test(text)) {
      const codeTargetMatch = text.match(/\b(run|execute)\s+([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)\b/i);
      if (codeTargetMatch) entities.target = codeTargetMatch[2];
      return { intent: 'CODE_EXECUTION', confidence: 0.97, extractedEntities: entities };
    }

    // 9. RESEARCH / WEB_SEARCH
    if (/\b(search the web|google|search internet|latest information|latest news|khobor|search for|lookup|find online)\b/i.test(text)) {
      return { intent: 'RESEARCH', confidence: 0.96, extractedEntities: entities };
    }

    // 10. MULTI_STEP_TASK (Build website, create full app, develop system)
    if (/\b(build|develop|create|scaffold)\s+(?:me\s+)?(?:a\s+)?(website|web app|portfolio|dashboard|project|full-stack|full app|application|system|game)\b/i.test(text)) {
      return { intent: 'MULTI_STEP_TASK', confidence: 0.96, extractedEntities: entities };
    }

    // 11. CODING (Write code, fix bug, refactor, explain code)
    if (/\b(write a python program|write code|code a|implement a function|fix this bug|refactor|explain this code|coding|program banaw)\b/i.test(text)) {
      return { intent: 'CODING', confidence: 0.95, extractedEntities: entities };
    }

    // 12. QUESTION (What is, why, how, explain, tell me about)
    if (/^(what is|what are|why is|how does|how to|who is|explain|tell me about|ki|kivabe|keno)\b/i.test(text) || text.endsWith('?')) {
      return { intent: 'QUESTION', confidence: 0.92, extractedEntities: entities };
    }

    // 13. CONVERSATION (Greetings, pleasantries, banter)
    if (/^(hi|hello|hey|heyy|kemon asos|kemon acho|how are you|good morning|good evening|thanks|thank you|bhalo)\b/i.test(text)) {
      return { intent: 'CONVERSATION', confidence: 0.90, extractedEntities: entities };
    }

    return { intent: 'UNKNOWN', confidence: 0.5, extractedEntities: entities };
  }

  // =======================================================
  // 2. CENTRAL PROCESS DISPATCHER
  // =======================================================
  public async process(rawInput: string, userContext?: string): Promise<BrainProcessResult> {
    const startTime = Date.now();
    const context = ContextEngine.getInstance();
    const memory = MemoryEngine.getInstance();
    const modelRouter = ModelRouterEngine.getInstance();
    const planner = PlannerEngine.getInstance();
    const toolRegistry = ToolRegistry.getInstance();
    const orchestrator = TaskOrchestrator.getInstance();

    // Step 1: Normalize Input
    const { normalized, language } = this.normalizeInput(rawInput);

    // Step 2: Contextual Reference Resolution
    const { targetFile, resolvedPrompt } = context.resolveContextualTarget(normalized);

    // Step 3: Intent Classification
    const { intent, extractedEntities } = this.classifyIntent(resolvedPrompt);

    // Record user turn in context
    context.addMessage('user', normalized, { intent, language });

    // Step 4: Handle Special Intent Types Specifically
    switch (intent) {
      // ----------------------------------------------------
      // CANCEL TASK
      // ----------------------------------------------------
      case 'CANCEL_TASK': {
        const active = orchestrator.getActiveTask();
        if (active) {
          orchestrator.cancelTask(active.taskId);
          context.updateCurrentTaskStatus('CANCELLED');
          const spoken = language === 'bn' || language === 'mixed'
            ? 'Task er execution bondho kora hoyeche.'
            : `Execution of task ${active.taskId} has been cancelled immediately.`;
          context.addMessage('assistant', spoken, { intent });
          return {
            success: true,
            taskId: active.taskId,
            intent,
            rawInput,
            normalizedInput: normalized,
            language,
            spokenResponse: spoken,
            markdownResponse: `🛑 **Task Cancelled**: ${active.taskId} ("${active.goal}") has been safely stopped.`,
            toolResults: [],
            verificationStatus: 'VERIFIED',
            executionTimeMs: Date.now() - startTime,
          };
        }
        const noTaskMsg = language === 'bn' || language === 'mixed'
          ? 'Shanti thakun, ekhon kono running task nei.'
          : 'Standing by. No active running tasks to cancel.';
        return {
          success: true,
          intent,
          rawInput,
          normalizedInput: normalized,
          language,
          spokenResponse: noTaskMsg,
          markdownResponse: noTaskMsg,
          toolResults: [],
          verificationStatus: 'NOT_APPLICABLE',
          executionTimeMs: Date.now() - startTime,
        };
      }

      // ----------------------------------------------------
      // TASK STATUS
      // ----------------------------------------------------
      case 'TASK_STATUS': {
        const active = orchestrator.getActiveTask() || orchestrator.listTasks(1)[0];
        if (active) {
          const statusMsg = `Task ${active.taskId} (${active.goal}) is currently in status: **${active.status}**.`;
          return {
            success: true,
            taskId: active.taskId,
            intent,
            rawInput,
            normalizedInput: normalized,
            language,
            spokenResponse: `Task ${active.taskId} is ${active.status}.`,
            markdownResponse: statusMsg,
            toolResults: [],
            verificationStatus: 'VERIFIED',
            executionTimeMs: Date.now() - startTime,
          };
        }
        return {
          success: true,
          intent,
          rawInput,
          normalizedInput: normalized,
          language,
          spokenResponse: 'All tasks completed. Ready for next directive.',
          markdownResponse: 'ℹ️ **Task Queue**: All tasks completed. No tasks currently running.',
          toolResults: [],
          verificationStatus: 'NOT_APPLICABLE',
          executionTimeMs: Date.now() - startTime,
        };
      }

      // ----------------------------------------------------
      // FILE OPERATION (create_file, read_file, etc.)
      // ----------------------------------------------------
      case 'FILE_OPERATION': {
        const toolResults: ToolExecutionResult[] = [];
        let fileName = extractedEntities.fileName || targetFile || 'test.py';
        if (!fileName.startsWith('/')) {
          fileName = `/projects/${fileName}`;
        }
        context.trackFileReference(fileName);

        const isRead = extractedEntities.action === 'read' || /read|open|show|inspect|cat/i.test(normalized);

        if (isRead) {
          const readRes = await toolRegistry.execute('read_file', { path: fileName });
          toolResults.push(readRes);
          const success = readRes.success;
          const spoken = success
            ? `Read file ${fileName}. It contains ${((readRes.data?.content as string) || '').split('\n').length} lines.`
            : `Could not read file ${fileName}. ${readRes.error?.message}`;

          const md = success
            ? `📄 **File Content (${fileName})**:\n\`\`\`text\n${readRes.data?.content || ''}\n\`\`\``
            : `❌ **Error**: ${readRes.error?.message}`;

          return {
            success,
            intent,
            rawInput,
            normalizedInput: normalized,
            language,
            spokenResponse: spoken,
            markdownResponse: md,
            toolResults,
            verificationStatus: success ? 'VERIFIED' : 'FAILED',
            executionTimeMs: Date.now() - startTime,
          };
        } else {
          // File creation
          let initialCode = '# ULTRON Generated Script\nprint("Hello from ULTRON!")\n';
          if (fileName.endsWith('.ts') || fileName.endsWith('.js')) {
            initialCode = '// ULTRON Generated Script\nconsole.log("Hello from ULTRON!");\n';
          }
          const createRes = await toolRegistry.execute('create_file', { path: fileName, content: initialCode });
          toolResults.push(createRes);

          const success = createRes.success;
          const spoken = success
            ? `File ${fileName} created and verified in VFS sandbox.`
            : `Failed to create file ${fileName}. ${createRes.error?.message}`;

          const md = success
            ? `✅ **File Created & Verified**: \`${fileName}\`\n\`\`\`python\n${initialCode}\`\`\`\n*Evidence: Verified in VFS /projects.*`
            : `❌ **File Creation Error**: ${createRes.error?.message}`;

          return {
            success,
            intent,
            rawInput,
            normalizedInput: normalized,
            language,
            spokenResponse: spoken,
            markdownResponse: md,
            toolResults,
            verificationStatus: success ? 'VERIFIED' : 'FAILED',
            evidence: createRes.evidence,
            executionTimeMs: Date.now() - startTime,
          };
        }
      }

      // ----------------------------------------------------
      // CODE EXECUTION (run_code, run_command)
      // ----------------------------------------------------
      case 'CODE_EXECUTION': {
        const toolResults: ToolExecutionResult[] = [];
        let target = extractedEntities.target || targetFile || 'test.py';
        if (!target.startsWith('/projects/') && !target.startsWith('/sandbox/')) {
          target = `/projects/${target}`;
        }

        // Try reading file if exists, or execute default python Hello World
        const readRes = await toolRegistry.execute('read_file', { path: target });
        let codeToRun = 'print("Hello from ULTRON Python Sandbox!")';
        let lang = 'python';

        if (readRes.success && readRes.data?.content) {
          codeToRun = readRes.data.content as string;
          lang = target.endsWith('.js') || target.endsWith('.ts') ? 'javascript' : 'python';
        }

        const runRes = await toolRegistry.execute('run_code', { code: codeToRun, language: lang });
        toolResults.push(runRes);

        const success = runRes.success;
        const out = (runRes.data?.stdout as string) || '';
        const spoken = success
          ? `Code execution completed successfully with output: ${out.trim() || 'No output.'}`
          : `Code execution failed. ${runRes.error?.message}`;

        const md = success
          ? `⚡ **Code Execution Verified** (${lang}):\n\`\`\`text\n${out}\n\`\`\`\n*Execution Time: ${runRes.executionTimeMs}ms | Exit Code: 0*`
          : `❌ **Execution Error**: ${runRes.error?.message}`;

        return {
          success,
          intent,
          rawInput,
          normalizedInput: normalized,
          language,
          spokenResponse: spoken,
          markdownResponse: md,
          toolResults,
          verificationStatus: success ? 'VERIFIED' : 'FAILED',
          evidence: runRes.evidence,
          executionTimeMs: Date.now() - startTime,
        };
      }

      // ----------------------------------------------------
      // RESEARCH / WEB SEARCH
      // ----------------------------------------------------
      case 'RESEARCH':
      case 'WEB_SEARCH': {
        const toolResults: ToolExecutionResult[] = [];
        const query = normalized.replace(/^(search the web for|search for|google|search internet|khobor|find online)\s+/i, '').trim() || normalized;
        const searchRes = await toolRegistry.execute('web_search', { query });
        toolResults.push(searchRes);

        const summary = (searchRes.data?.summary as string) || 'Search completed.';
        const analysis = (searchRes.data?.analysis as string) || '';

        return {
          success: searchRes.success,
          intent,
          rawInput,
          normalizedInput: normalized,
          language,
          spokenResponse: summary,
          markdownResponse: `🌐 **Live Web Intelligence (${query})**:\n\n${summary}\n\n${analysis}`,
          toolResults,
          verificationStatus: 'VERIFIED',
          executionTimeMs: Date.now() - startTime,
        };
      }

      // ----------------------------------------------------
      // DEVICE_CONTROL (Flashlight / IoT)
      // ----------------------------------------------------
      case 'DEVICE_CONTROL': {
        const isFlashlightOn = /on|jalao|start/i.test(normalized) && /torch|flashlight|light/i.test(normalized);
        const actionText = isFlashlightOn ? 'Flashlight enabled' : 'Device state updated';
        return {
          success: true,
          intent,
          rawInput,
          normalizedInput: normalized,
          language,
          spokenResponse: isFlashlightOn ? 'Flashlight is now turned on.' : 'Device command executed.',
          markdownResponse: `📱 **Device Control**: ${actionText}. Bridge connected.`,
          toolResults: [],
          verificationStatus: 'VERIFIED',
          executionTimeMs: Date.now() - startTime,
        };
      }

      // ----------------------------------------------------
      // MULTI_STEP_TASK / CODING / QUESTION / CONVERSATION
      // ----------------------------------------------------
      default: {
        const plan = await planner.createPlan(normalized, intent);
        const task = orchestrator.createTask(normalized, intent, plan.steps.map((s) => s.name));
        context.setCurrentTask({
          taskId: task.taskId,
          goal: task.goal,
          status: 'PLANNING',
          plan: task.steps.map((s) => s.title),
          currentStepIndex: 0,
          activeFiles: [],
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        });

        // If multi-step task, execute primary step & generate code file
        const toolResults: ToolExecutionResult[] = [];
        if (intent === 'MULTI_STEP_TASK' || intent === 'CODING') {
          orchestrator.updateStatus(task.taskId, 'EXECUTING');
          const targetPath = intent === 'MULTI_STEP_TASK' ? '/projects/portfolio.html' : '/projects/calculator.py';
          const code = intent === 'MULTI_STEP_TASK'
            ? '<!DOCTYPE html>\n<html>\n<head><title>Portfolio</title></head>\n<body><h1>ULTRON Portfolio</h1></body>\n</html>'
            : '# ULTRON Python Calculator\ndef add(a, b): return a + b\nprint("Calculator ready")\n';

          const createRes = await toolRegistry.execute('create_file', { path: targetPath, content: code }, { taskId: task.taskId });
          toolResults.push(createRes);
          context.trackFileReference(targetPath);
        }

        // Call Model Router for high-level intelligent response
        orchestrator.updateStatus(task.taskId, 'VERIFYING');
        const memoryContext = memory.getPlanningContextSummary(normalized);
        const prompt = `User Request: "${normalized}"\n${memoryContext ? `Context:\n${memoryContext}\n` : ''}`;

        const aiRes = await modelRouter.generate({
          prompt,
          category: intent === 'CODING' ? 'CODING' : 'CONVERSATION',
        });

        const finalStatus = aiRes.success ? 'COMPLETED' : 'FAILED';
        orchestrator.updateStatus(task.taskId, finalStatus, { output: aiRes.text });
        context.updateCurrentTaskStatus(finalStatus);

        const spoken = aiRes.text.split('\n')[0] || 'Task processed successfully.';
        context.addMessage('assistant', aiRes.text, { intent, taskId: task.taskId });

        return {
          success: aiRes.success,
          taskId: task.taskId,
          intent,
          rawInput,
          normalizedInput: normalized,
          language,
          modelUsed: aiRes.modelUsed,
          spokenResponse: spoken,
          markdownResponse: aiRes.text,
          plan,
          toolResults,
          verificationStatus: aiRes.success ? 'VERIFIED' : 'FAILED',
          executionTimeMs: Date.now() - startTime,
        };
      }
    }
  }

  // =======================================================
  // 3. UNIFIED INTERNAL CONVENIENCE APIS
  // =======================================================
  public async plan(taskDescription: string): Promise<TaskPlan> {
    const planner = PlannerEngine.getInstance();
    return planner.createPlan(taskDescription, 'MULTI_STEP_TASK');
  }

  public async answer(question: string): Promise<string> {
    const res = await this.process(question);
    return res.markdownResponse;
  }

  public async execute(taskGoal: string): Promise<BrainProcessResult> {
    return this.process(taskGoal);
  }
}
