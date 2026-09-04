/**
 * ULTRON Planner & Reasoning Engine
 * 
 * Simple Queries:
 * INPUT -> THINK -> ANSWER
 * 
 * Complex Multi-Step Tasks:
 * INPUT -> UNDERSTAND -> PLAN -> EXECUTE -> VERIFY -> FIX IF NECESSARY -> FINAL RESULT
 * 
 * Generates concise action summaries without leaking internal raw tokens.
 */

import { MemoryEngine } from './memoryEngine.js';

export interface PlannedExecutionStep {
  stepNumber: number;
  name: string;
  description: string;
  toolToUse?: string;
  expectedOutcome: string;
  isCompleted: boolean;
}

export interface TaskPlan {
  goal: string;
  isSimpleQuery: boolean;
  intentCategory: string;
  steps: PlannedExecutionStep[];
  reasoningSummary: string;
  relevantContextMemories: string[];
}

export class PlannerEngine {
  private static instance: PlannerEngine;

  private constructor() {}

  public static getInstance(): PlannerEngine {
    if (!PlannerEngine.instance) {
      PlannerEngine.instance = new PlannerEngine();
    }
    return PlannerEngine.instance;
  }

  public async createPlan(goal: string, intent: string): Promise<TaskPlan> {
    const memory = MemoryEngine.getInstance();
    const relevantMemories = memory.searchMemory(goal, { limit: 3 }).map((m) => `${m.title}: ${m.content}`);

    const simpleIntents = ['CONVERSATION', 'QUESTION', 'TASK_STATUS', 'CANCEL_TASK'];
    const isSimple = simpleIntents.includes(intent);

    if (isSimple) {
      return {
        goal,
        isSimpleQuery: true,
        intentCategory: intent,
        steps: [
          {
            stepNumber: 1,
            name: 'Direct Cognitive Response',
            description: 'Synthesize articulate, helpful response using model router and contextual memory.',
            expectedOutcome: 'Direct answer or conversational acknowledgment.',
            isCompleted: false,
          },
        ],
        reasoningSummary: 'Single-turn informational or conversational request.',
        relevantContextMemories: relevantMemories,
      };
    }

    // Complex multi-step task decomposition
    let decomposedSteps: PlannedExecutionStep[] = [];

    const lower = goal.toLowerCase();

    if (lower.includes('website') || lower.includes('portfolio') || lower.includes('app') || lower.includes('build')) {
      decomposedSteps = [
        { stepNumber: 1, name: 'Inspect Project & Workspace', toolToUse: 'inspect_project', description: 'Analyze existing files and directory layout', expectedOutcome: 'VFS directory tree', isCompleted: false },
        { stepNumber: 2, name: 'Create Directory Structure & Core Files', toolToUse: 'create_file', description: 'Scaffold HTML/CSS/TS source templates in /projects', expectedOutcome: 'Verified source files created', isCompleted: false },
        { stepNumber: 3, name: 'Implement UI Components & Styling', toolToUse: 'create_file', description: 'Write responsive Tailwind/CSS styling and markup', expectedOutcome: 'Components written', isCompleted: false },
        { stepNumber: 4, name: 'Syntactic Validation & Sandbox Test', toolToUse: 'run_code', description: 'Execute build or test assertions in sandbox', expectedOutcome: 'Exit code 0 execution', isCompleted: false },
        { stepNumber: 5, name: 'Evidence Verification & Completion Report', toolToUse: 'get_task_status', description: 'Validate tangible outputs and synthesize summary', expectedOutcome: 'Verified completed report', isCompleted: false },
      ];
    } else if (lower.includes('python') || lower.includes('calculator') || lower.includes('script') || lower.includes('code')) {
      decomposedSteps = [
        { stepNumber: 1, name: 'Scaffold Code Implementation', toolToUse: 'create_file', description: 'Write clean code script into VFS storage', expectedOutcome: 'File created in /projects', isCompleted: false },
        { stepNumber: 2, name: 'Sandbox Execution & Test Harness', toolToUse: 'run_code', description: 'Execute script in isolated sandbox environment', expectedOutcome: 'Clean stdout output', isCompleted: false },
        { stepNumber: 3, name: 'Verification & Final Summary', toolToUse: 'read_file', description: 'Verify outputs and provide user status', expectedOutcome: 'Evidence-verified result', isCompleted: false },
      ];
    } else if (intent === 'RESEARCH' || intent === 'WEB_SEARCH') {
      decomposedSteps = [
        { stepNumber: 1, name: 'Search Web Intelligence', toolToUse: 'web_search', description: 'Query multiple live web sources for authoritative information', expectedOutcome: 'Structured search results and sources', isCompleted: false },
        { stepNumber: 2, name: 'Cross-Verify & Synthesize', toolToUse: 'extract_web_content', description: 'Cross-reference facts and synthesize concise summary', expectedOutcome: 'Verified factual analysis', isCompleted: false },
      ];
    } else {
      decomposedSteps = [
        { stepNumber: 1, name: 'Prepare Environment & Resources', toolToUse: 'inspect_project', description: 'Check required sandbox tools and context', expectedOutcome: 'Environment verified', isCompleted: false },
        { stepNumber: 2, name: 'Execute Task Operations', toolToUse: 'run_command', description: 'Run primary operations', expectedOutcome: 'Execution complete', isCompleted: false },
        { stepNumber: 3, name: 'Verify Results with Evidence', toolToUse: 'get_task_status', description: 'Ensure tangible artifacts exist', expectedOutcome: 'Verified success', isCompleted: false },
      ];
    }

    return {
      goal,
      isSimpleQuery: false,
      intentCategory: intent,
      steps: decomposedSteps,
      reasoningSummary: `Decomposed into ${decomposedSteps.length} discrete execution steps with validation loops.`,
      relevantContextMemories: relevantMemories,
    };
  }
}
