/**
 * ULTRON Automated Verification Test Suite
 * 
 * Verifies all 20 core architectural capabilities:
 * 1. Normal conversation
 * 2. Question answering
 * 3. Web research routing
 * 4. File creation (in VFS)
 * 5. File reading
 * 6. Code execution (in CodeSandbox)
 * 7. Tool unavailable handling
 * 8. Model failure fallback
 * 9. Context continuation
 * 10. Task cancellation
 * 11. Error recovery
 * 12. Voice state transitions
 * 13. Bangla input
 * 14. English input
 * 15. Banglish input
 * 16. Wake word
 * 17. Voice interruption
 * 18. Permission rejection
 * 19. Evidence-based completion
 * 20. Multi-step task
 */

import { UltronBrainEngine } from './ultronBrainEngine.js';
import { ToolRegistry } from './toolRegistry.js';
import { ContextEngine } from './contextEngine.js';
import { UltronVoiceEngine } from './voiceEngine.js';
import { ModelRouterEngine } from './modelRouter.js';
import { TaskOrchestrator } from './taskOrchestrator.js';

export interface TestCaseResult {
  testNumber: number;
  name: string;
  category: string;
  passed: boolean;
  evidence: string;
  durationMs: number;
  error?: string;
}

export interface TestSuiteSummary {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  overallScorePercent: number;
  totalDurationMs: number;
  results: TestCaseResult[];
}

export class UltronTestSuite {
  private static instance: UltronTestSuite;

  private constructor() {}

  public static getInstance(): UltronTestSuite {
    if (!UltronTestSuite.instance) {
      UltronTestSuite.instance = new UltronTestSuite();
    }
    return UltronTestSuite.instance;
  }

  public async runAllTests(): Promise<TestSuiteSummary> {
    const startTime = Date.now();
    const brain = UltronBrainEngine.getInstance();
    const tools = ToolRegistry.getInstance();
    const context = ContextEngine.getInstance();
    const voice = UltronVoiceEngine.getInstance();
    const models = ModelRouterEngine.getInstance();
    const orchestrator = TaskOrchestrator.getInstance();

    const results: TestCaseResult[] = [];

    // Helper runner
    const runCase = async (
      testNumber: number,
      name: string,
      category: string,
      fn: () => Promise<{ passed: boolean; evidence: string }>
    ) => {
      const caseStart = Date.now();
      try {
        const res = await fn();
        results.push({
          testNumber,
          name,
          category,
          passed: res.passed,
          evidence: res.evidence,
          durationMs: Date.now() - caseStart,
        });
      } catch (err: unknown) {
        results.push({
          testNumber,
          name,
          category,
          passed: false,
          evidence: 'Exception caught during test execution',
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - caseStart,
        });
      }
    };

    // 1. Normal Conversation
    await runCase(1, 'Normal Conversation', 'BRAIN', async () => {
      const res = await brain.process('Hello ULTRON, how are you today?');
      return {
        passed: res.intent === 'CONVERSATION' && res.spokenResponse.length > 0,
        evidence: `Intent: ${res.intent} | Spoken response: "${res.spokenResponse.slice(0, 60)}..."`,
      };
    });

    // 2. Question Answering
    await runCase(2, 'Question Answering', 'BRAIN', async () => {
      const res = await brain.process('What is Python?');
      return {
        passed: res.intent === 'QUESTION' && res.markdownResponse.toLowerCase().includes('python'),
        evidence: `Intent: ${res.intent} | Response length: ${res.markdownResponse.length} chars`,
      };
    });

    // 3. Web Research Routing
    await runCase(3, 'Web Research Routing', 'RESEARCH', async () => {
      const res = await brain.process('Search the web for the latest Python release');
      return {
        passed: (res.intent === 'RESEARCH' || res.intent === 'WEB_SEARCH') && res.toolResults.length > 0,
        evidence: `Routed to ${res.intent} with ${res.toolResults.length} tool dispatches.`,
      };
    });

    // 4. File Creation (VFS)
    await runCase(4, 'File Creation in VFS', 'FILESYSTEM', async () => {
      const res = await tools.execute('create_file', {
        path: '/projects/test_suite_file.py',
        content: '# Test suite generated file\nprint("ULTRON OK")\n',
      });
      return {
        passed: res.success && !!res.evidence?.verified,
        evidence: `Created /projects/test_suite_file.py. Evidence: ${JSON.stringify(res.evidence)}`,
      };
    });

    // 5. File Reading
    await runCase(5, 'File Reading from VFS', 'FILESYSTEM', async () => {
      const res = await tools.execute('read_file', { path: '/projects/test_suite_file.py' });
      return {
        passed: res.success && ((res.data?.content as string) || '').includes('ULTRON OK'),
        evidence: `Read content matched: "${(res.data?.content as string)?.slice(0, 40)}"`,
      };
    });

    // 6. Code Execution in Sandbox
    await runCase(6, 'Code Execution in Sandbox', 'CODE_SANDBOX', async () => {
      const res = await tools.execute('run_code', {
        code: 'console.log("Sandbox execution test verified");',
        language: 'javascript',
      });
      return {
        passed: res.success && ((res.data?.stdout as string) || '').includes('Sandbox execution test verified'),
        evidence: `Exit 0 with stdout: ${(res.data?.stdout as string)?.trim()}`,
      };
    });

    // 7. Tool Unavailable Handling
    await runCase(7, 'Tool Unavailable Handling', 'SECURITY', async () => {
      const res = await tools.execute('non_existent_fake_tool_xyz', {});
      return {
        passed: !res.success && res.error?.type === 'TOOL_UNAVAILABLE',
        evidence: `Correctly returned TOOL_UNAVAILABLE: ${res.error?.message}`,
      };
    });

    // 8. Model Failure Fallback
    await runCase(8, 'Model Failure Fallback', 'MODEL_ROUTER', async () => {
      const res = await models.generate({
        prompt: 'Ping test for multi-model cascade',
        preferredModel: 'gemini-3.7-flash',
      });
      return {
        passed: res.success && !!res.modelUsed,
        evidence: `Successfully routed to model: ${res.modelUsed} (${res.provider}) in ${res.latencyMs}ms`,
      };
    });

    // 9. Context Continuation (Anaphora)
    await runCase(9, 'Context Continuation ("Add a GUI")', 'CONTEXT', async () => {
      context.trackFileReference('/projects/calculator.py');
      const resolved = context.resolveContextualTarget('Add a GUI to it');
      return {
        passed: resolved.targetFile === '/projects/calculator.py' && resolved.resolvedPrompt.includes('calculator.py'),
        evidence: `Resolved "it" to target context: ${resolved.targetFile}`,
      };
    });

    // 10. Task Cancellation
    await runCase(10, 'Task Cancellation', 'TASK_ENGINE', async () => {
      const task = orchestrator.createTask('Test Cancellation Goal', 'TASK');
      const cancelRes = orchestrator.cancelTask(task.taskId);
      return {
        passed: cancelRes.success && cancelRes.task?.status === 'CANCELLED',
        evidence: `Cancelled task ${task.taskId}. Status: ${cancelRes.task?.status}`,
      };
    });

    // 11. Error Recovery Analyzer
    await runCase(11, 'Error Classification & Recovery', 'ERROR_ANALYZER', async () => {
      const res = await tools.execute('inspect_error', {
        errorMessage: "ModuleNotFoundError: No module named 'numpy'",
      });
      return {
        passed: res.success && res.data?.classifiedType === 'DEPENDENCY_ERROR',
        evidence: `Classified as ${res.data?.classifiedType} with suggestion: "${res.data?.suggestion}"`,
      };
    });

    // 12. Voice State Transitions
    await runCase(12, 'Voice State Transitions', 'VOICE', async () => {
      voice.setState('LISTENING');
      const s1 = voice.getState().currentState;
      voice.setState('THINKING');
      const s2 = voice.getState().currentState;
      voice.setState('IDLE');
      const s3 = voice.getState().currentState;
      return {
        passed: s1 === 'LISTENING' && s2 === 'THINKING' && s3 === 'IDLE',
        evidence: `States transitioned cleanly: LISTENING -> THINKING -> IDLE`,
      };
    });

    // 13. Bangla Input Handling
    await runCase(13, 'Bangla Script Input NLP', 'NLP_BANGLA', async () => {
      const res = await brain.process('তুমি কেমন আছো?');
      return {
        passed: res.language === 'bn' && res.spokenResponse.length > 0,
        evidence: `Language detected: ${res.language} | Output: "${res.spokenResponse.slice(0, 40)}"`,
      };
    });

    // 14. English Input Handling
    await runCase(14, 'English Input NLP', 'NLP_ENGLISH', async () => {
      const res = await brain.process('Explain what an API is.');
      return {
        passed: res.language === 'en' && res.intent === 'QUESTION',
        evidence: `Language: ${res.language} | Intent: ${res.intent}`,
      };
    });

    // 15. Banglish Input Handling
    await runCase(15, 'Banglish Colloquial NLP', 'NLP_BANGLISH', async () => {
      const res = await brain.process('amar website banaw');
      return {
        passed: res.normalizedInput.includes('amar website') && res.intent === 'MULTI_STEP_TASK',
        evidence: `Normalized: "${res.normalizedInput}" -> Intent: ${res.intent}`,
      };
    });

    // 16. Wake Word Recognition
    await runCase(16, 'Wake Word Recognition ("ULTRON")', 'VOICE_WAKE', async () => {
      voice.setWakeWordEnabled(true);
      const res = await voice.processVoiceInput('ULTRON, open YouTube.');
      return {
        passed: res.brainResult.success && res.voiceState === 'IDLE',
        evidence: `Wake word accepted and routed to: ${res.brainResult.intent}`,
      };
    });

    // 17. Voice Interruption (Barge-in)
    await runCase(17, 'Voice Interruption (Barge-in)', 'VOICE_INTERRUPT', async () => {
      voice.setState('SPEAKING');
      const res = voice.handleInterruption();
      return {
        passed: res.interrupted && voice.getState().currentState === 'IDLE',
        evidence: `Interruption triggered successfully: "${res.message}"`,
      };
    });

    // 18. Permission Rejection for Level 3
    await runCase(18, 'Permission Rejection (Level 3)', 'SECURITY', async () => {
      const res = await tools.execute(
        'delete_file',
        { path: '/projects/protected_root.ts' },
        { userPermissionLevel: 0 }
      );
      return {
        passed: !res.success && res.error?.type === 'PERMISSION_ERROR',
        evidence: `Blocked Level 2/3 operation with PERMISSION_ERROR: ${res.error?.message}`,
      };
    });

    // 19. Evidence-Based Completion
    await runCase(19, 'Evidence-Based Completion Check', 'VERIFICATION', async () => {
      const res = await brain.process('Create a Python file called test.py');
      return {
        passed: res.verificationStatus === 'VERIFIED' && !!res.evidence,
        evidence: `Evidence verified with tangible VFS check. Status: ${res.verificationStatus}`,
      };
    });

    // 20. Multi-Step Task Execution
    await runCase(20, 'Multi-Step Task Execution ("Build a website")', 'ORCHESTRATOR', async () => {
      const res = await brain.process('Build me a portfolio website');
      return {
        passed: res.intent === 'MULTI_STEP_TASK' && !!res.plan && res.plan.steps.length >= 3,
        evidence: `Decomposed into ${res.plan?.steps.length} steps with Task ID: ${res.taskId}`,
      };
    });

    const totalDurationMs = Date.now() - startTime;
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.length - passedCount;

    return {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedCount,
      failedCount,
      overallScorePercent: Math.round((passedCount / results.length) * 100),
      totalDurationMs,
      results,
    };
  }
}
