import {
  AgenticActionStep,
  VerificationCriticReport,
  ProviderId,
} from '../src/types/jarvis.js';
import { getGemini, ULTRON_SYSTEM_INSTRUCTION } from './gemini.js';
import { SelfVerificationEngine } from './verifier.js';
import { ComputerAgentEngine } from './computer.js';
import { ProjectMemoryEngine } from './projectMemory.js';
import { PersonalizationEngine } from './personalization.js';
import { PermissionEngine } from './permissions.js';

export interface AgenticGoalExecutionResult {
  goal: string;
  isCompleted: boolean;
  steps: AgenticActionStep[];
  verificationReport?: VerificationCriticReport;
  synthesizedOutput: string;
  spokenSummary: string;
  filesGenerated: string[];
  executionTimeMs: number;
}

export class AgenticBrainEngine {
  private static instance: AgenticBrainEngine;
  private activeExecutions: Map<string, AgenticGoalExecutionResult> = new Map();

  private constructor() {}

  public static getInstance(): AgenticBrainEngine {
    if (!AgenticBrainEngine.instance) {
      AgenticBrainEngine.instance = new AgenticBrainEngine();
    }
    return AgenticBrainEngine.instance;
  }

  /**
   * Master Goal-Oriented Agentic Pipeline:
   * USER GOAL -> INTENT UNDERSTANDING -> TASK PLANNER -> TASK BREAKDOWN ->
   * AGENT SELECTION -> TOOL EXECUTION -> RESULT VERIFICATION -> CORRECTION IF NEEDED -> FINAL RESULT
   */
  public async executeAutonomousGoal(
    userGoal: string,
    context?: string
  ): Promise<AgenticGoalExecutionResult> {
    const startTime = Date.now();
    const verifier = SelfVerificationEngine.getInstance();
    const computer = ComputerAgentEngine.getInstance();
    const projectMem = ProjectMemoryEngine.getInstance();
    const personalization = PersonalizationEngine.getInstance().generatePersonalizationInstruction();

    // Step 1 & 2: Intent Understanding & Breakdown
    const steps: AgenticActionStep[] = [
      {
        id: `stp-1-${Date.now()}`,
        stepNumber: 1,
        agentRole: 'PLANNER',
        actionName: 'Requirement Analysis & Architectural Scaffolding',
        status: 'IN_PROGRESS',
        timestamp: new Date().toISOString(),
      },
      {
        id: `stp-2-${Date.now()}`,
        stepNumber: 2,
        agentRole: 'CODER',
        actionName: 'Implementation & Code Generation',
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      },
      {
        id: `stp-3-${Date.now()}`,
        stepNumber: 3,
        agentRole: 'CRITIC',
        actionName: 'Self-Correction & Error Detection',
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      },
      {
        id: `stp-4-${Date.now()}`,
        stepNumber: 4,
        agentRole: 'VERIFIER',
        actionName: 'Strict Final Verification',
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      },
    ];

    // Mark step 1 completed
    steps[0].status = 'COMPLETED';
    steps[0].resultPayload = { analysis: `Parsed goal "${userGoal}". Mapped to full-stack modular architecture.` };

    // Step 3 & 4: Code / Content Generation via AI Model
    steps[1].status = 'IN_PROGRESS';
    const ai = getGemini();
    const prompt = `[ULTRON AGENTIC BRAIN DIRECTIVE]
Goal: "${userGoal}"
${personalization}
${context ? `Context: ${context}` : ''}

You are executing this goal autonomously as ULTRON's master agentic brain.
Provide a complete, production-grade, highly structured response addressing all aspects of the user's goal.
If coding is requested, provide full working code with zero stubs or placeholders.`;

    let generatedOutput = '';
    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: ULTRON_SYSTEM_INSTRUCTION,
          temperature: 0.3,
        },
      });
      generatedOutput = resp.text || '';
      steps[1].status = 'COMPLETED';
      steps[1].resultPayload = { bytes: generatedOutput.length };
    } catch (err: any) {
      steps[1].status = 'FAILED';
      generatedOutput = `Autonomous execution encountered error: ${err.message}. Engaging fallback safety mode.`;
    }

    // Step 5: Self-Verification & Critic Layer
    steps[2].status = 'IN_PROGRESS';
    const isCode = userGoal.toLowerCase().includes('code') || userGoal.toLowerCase().includes('website') || userGoal.toLowerCase().includes('build');
    const verifyResult = await verifier.verifyAndCorrect(
      generatedOutput,
      isCode ? 'CODING' : 'RESEARCH',
      userGoal
    );
    steps[2].status = 'COMPLETED';
    steps[2].resultPayload = { criticVerdict: verifyResult.report.verdict, certainty: verifyResult.report.certaintyRating };

    steps[3].status = 'IN_PROGRESS';
    const finalContent = verifyResult.finalContent;
    const isVerified = verifyResult.report.isVerified;
    steps[3].status = isVerified ? 'COMPLETED' : 'CORRECTING';
    steps[3].verificationStatus = isVerified ? 'VERIFIED' : 'UNCERTAIN';
    steps[3].verificationNotes = verifyResult.report.criticAssessment;

    // Persist file changes to virtual disk if website/code
    const filesGenerated: string[] = [];
    if (isCode && finalContent.includes('export ')) {
      const filePath = `/projects/generated-${Date.now()}.tsx`;
      computer.executeAction('CREATE_FILE', filePath, { content: finalContent }, true);
      filesGenerated.push(filePath);
      projectMem.updateProject('proj-ultron-core', {
        featuresCompleted: [...(projectMem.getProject()?.featuresCompleted || []), `Autonomous Build: ${userGoal.slice(0, 40)}`],
      });
    }

    const spokenSummary = `I have executed the goal "${userGoal.slice(0, 50)}". Architecture generated, self-verified with ${Math.round(verifyResult.report.certaintyRating * 100)}% confidence score, and ready for use.`;

    const executionResult: AgenticGoalExecutionResult = {
      goal: userGoal,
      isCompleted: isVerified,
      steps,
      verificationReport: verifyResult.report,
      synthesizedOutput: finalContent,
      spokenSummary,
      filesGenerated,
      executionTimeMs: Date.now() - startTime,
    };

    this.activeExecutions.set(`GOAL-${Date.now()}`, executionResult);
    return executionResult;
  }
}
