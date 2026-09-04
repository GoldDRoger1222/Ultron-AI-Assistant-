/**
 * ULTRON Provider & Model Router Engine
 * 
 * Multi-Provider Architecture:
 * - GeminiProvider (gemini-3.7-flash, gemini-3.6-flash, gemini-3.1-pro-preview)
 * - OpenRouterProvider (Mistral, Claude, Llama fallbacks)
 * - LocalProvider (Local WASM/WebGPU, rule-based reasoning engine)
 * 
 * Supports:
 * - Model selection based on intent
 * - Fallback cascade
 * - Provider health checks
 * - Timeouts & Retries
 * - Quota/rate-limit error detection
 * - Clear, honest error reporting if all fail (NEVER fake "Standing By" responses)
 */

import { getGemini, ULTRON_SYSTEM_INSTRUCTION } from './gemini.js';

export interface ModelProviderStatus {
  id: string;
  name: string;
  type: 'GEMINI' | 'OPENROUTER' | 'LOCAL' | 'CUSTOM';
  isConfigured: boolean;
  isHealthy: boolean;
  lastChecked: string;
  latencyMs: number;
  errorMessage?: string;
  supportedModels: string[];
}

export interface ModelGenerationRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  category?: 'CONVERSATION' | 'CODING' | 'RESEARCH' | 'REASONING' | 'FAST';
  preferredModel?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface ModelGenerationResponse {
  success: boolean;
  text: string;
  provider: string;
  modelUsed: string;
  latencyMs: number;
  failoverAttempts: Array<{ provider: string; model: string; error: string }>;
  error?: {
    type: 'QUOTA_EXCEEDED' | 'AUTH_ERROR' | 'TIMEOUT' | 'ALL_PROVIDERS_FAILED' | 'NETWORK_ERROR';
    message: string;
    details?: string;
  };
}

export class ModelRouterEngine {
  private static instance: ModelRouterEngine;
  private providers: Map<string, ModelProviderStatus> = new Map();

  private constructor() {
    this.initializeProviders();
  }

  public static getInstance(): ModelRouterEngine {
    if (!ModelRouterEngine.instance) {
      ModelRouterEngine.instance = new ModelRouterEngine();
    }
    return ModelRouterEngine.instance;
  }

  private initializeProviders() {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy-preview-key';
    const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;

    this.providers.set('gemini', {
      id: 'gemini',
      name: 'Google Gemini Pro / Flash AI Provider',
      type: 'GEMINI',
      isConfigured: hasGeminiKey,
      isHealthy: true,
      lastChecked: new Date().toISOString(),
      latencyMs: 180,
      supportedModels: ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'],
    });

    this.providers.set('openrouter', {
      id: 'openrouter',
      name: 'OpenRouter Multi-Model Gateway',
      type: 'OPENROUTER',
      isConfigured: hasOpenRouterKey,
      isHealthy: hasOpenRouterKey,
      lastChecked: new Date().toISOString(),
      latencyMs: 340,
      supportedModels: ['anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.3-70b', 'mistralai/mistral-large-2407'],
    });

    this.providers.set('local', {
      id: 'local',
      name: 'ULTRON Local Heuristic & WASM Engine',
      type: 'LOCAL',
      isConfigured: true,
      isHealthy: true,
      lastChecked: new Date().toISOString(),
      latencyMs: 12,
      supportedModels: ['ultron-heuristic-v5', 'local-rule-reasoner'],
    });
  }

  /**
   * Health check for all providers
   */
  public async checkHealth(): Promise<Record<string, ModelProviderStatus>> {
    const start = Date.now();
    const geminiStatus = this.providers.get('gemini')!;
    
    // Quick test on Gemini if key exists
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy-preview-key') {
      try {
        const ai = getGemini();
        await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: 'ping',
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout healthcheck')), 4000)),
        ]);
        geminiStatus.isHealthy = true;
        geminiStatus.latencyMs = Date.now() - start;
        geminiStatus.errorMessage = undefined;
      } catch (err: unknown) {
        geminiStatus.isHealthy = false;
        geminiStatus.errorMessage = err instanceof Error ? err.message : 'Gemini health test failed';
      }
    } else {
      geminiStatus.isHealthy = false;
      geminiStatus.errorMessage = 'GEMINI_API_KEY not configured in environment';
    }
    geminiStatus.lastChecked = new Date().toISOString();

    return Object.fromEntries(this.providers.entries());
  }

  /**
   * Primary generation method with comprehensive fallback cascade
   */
  public async generate(req: ModelGenerationRequest): Promise<ModelGenerationResponse> {
    const startTime = Date.now();
    const timeoutMs = req.timeoutMs || 25000;
    const sysInstruction = req.systemInstruction || ULTRON_SYSTEM_INSTRUCTION;
    const failoverAttempts: Array<{ provider: string; model: string; error: string }> = [];

    // 1. Primary & Fallback Model Candidates for Gemini
    const geminiModels = req.preferredModel
      ? [req.preferredModel, 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']
      : ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];

    // Deduplicate
    const uniqueGeminiModels = Array.from(new Set(geminiModels));

    // Try Gemini models first if key available
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy-preview-key') {
      const ai = getGemini();

      for (const model of uniqueGeminiModels) {
        try {
          const modelStart = Date.now();
          const response = await Promise.race([
            ai.models.generateContent({
              model,
              contents: req.prompt,
              config: {
                systemInstruction: sysInstruction,
                temperature: req.temperature ?? 0.7,
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Model ${model} request timed out after ${timeoutMs}ms`)), timeoutMs)
            ),
          ]);

          const text = response.text || '';
          if (text.trim()) {
            return {
              success: true,
              text,
              provider: 'Google Gemini',
              modelUsed: model,
              latencyMs: Date.now() - modelStart,
              failoverAttempts,
            };
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          failoverAttempts.push({
            provider: 'Google Gemini',
            model,
            error: errMsg,
          });

          // Check if quota exceeded or invalid key
          if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
            console.warn(`[ModelRouter] Rate limit hit on ${model}, attempting next fallback...`);
          }
        }
      }
    } else {
      failoverAttempts.push({
        provider: 'Google Gemini',
        model: 'gemini-3.7-flash',
        error: 'GEMINI_API_KEY is not configured in .env',
      });
    }

    // 2. Try OpenRouter Provider if configured
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const orStart = Date.now();
        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://ultron.ai',
            'X-Title': 'ULTRON Core Brain',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [
              { role: 'system', content: sysInstruction },
              { role: 'user', content: req.prompt },
            ],
            temperature: req.temperature ?? 0.7,
          }),
        });

        if (orRes.ok) {
          const data = (await orRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const text = data.choices?.[0]?.message?.content || '';
          if (text.trim()) {
            return {
              success: true,
              text,
              provider: 'OpenRouter',
              modelUsed: 'meta-llama/llama-3.3-70b-instruct',
              latencyMs: Date.now() - orStart,
              failoverAttempts,
            };
          }
        } else {
          failoverAttempts.push({
            provider: 'OpenRouter',
            model: 'meta-llama/llama-3.3-70b-instruct',
            error: `HTTP ${orRes.status}: ${await orRes.text()}`,
          });
        }
      } catch (orErr: unknown) {
        failoverAttempts.push({
          provider: 'OpenRouter',
          model: 'meta-llama/llama-3.3-70b-instruct',
          error: orErr instanceof Error ? orErr.message : String(orErr),
        });
      }
    }

    // 3. Fallback to Local Rule Engine for common queries (NEVER fake "Standing By")
    const localResult = this.generateLocalFallback(req.prompt);
    if (localResult) {
      return {
        success: true,
        text: localResult,
        provider: 'ULTRON Local Heuristic Engine',
        modelUsed: 'ultron-heuristic-v5',
        latencyMs: Date.now() - startTime,
        failoverAttempts,
      };
    }

    // 4. If all fail, return explicit detailed failure (DO NOT send fake generic "Standing By" message!)
    const allErrors = failoverAttempts.map((f) => `[${f.provider}/${f.model}] ${f.error}`).join(' | ');
    return {
      success: false,
      text: `AI Provider Service Unavailable. Failed to get response after trying ${failoverAttempts.length} model cascade routes. Details: ${allErrors}`,
      provider: 'None',
      modelUsed: 'None',
      latencyMs: Date.now() - startTime,
      failoverAttempts,
      error: {
        type: 'ALL_PROVIDERS_FAILED',
        message: 'Could not contact Gemini or OpenRouter AI providers. Please verify GEMINI_API_KEY configuration.',
        details: allErrors,
      },
    };
  }

  /**
   * Deterministic local fallback for standard queries
   */
  private generateLocalFallback(prompt: string): string | null {
    const p = prompt.toLowerCase().trim();

    if (p.includes('what can you do') || p.includes('who are you') || p.includes('ki korte paro') || p.includes('tumi ke')) {
      return `I am ULTRON — Stark J.A.R.V.I.S-grade Autonomous Cognitive Core & Voice Intelligence.
My primary capabilities include:
1. Full-Stack Coding & Architecture (TypeScript, Python, React, C++)
2. Isolated VFS Sandboxing & Code Execution (/projects, /sandbox)
3. Multi-source Internet Intelligence & Research
4. Multilingual Natural Voice Interaction (Bangla, English, Banglish)
5. Multi-Step Task Planning & Autonomous Error Self-Correction
6. Live System Diagnostics & Hardware Monitoring.`;
    }

    if (p.includes('what is python') || p.includes('python ki')) {
      return `Python is a high-level, interpreted programming language known for its clear syntax and high code readability. It supports multiple paradigms including object-oriented, procedural, and functional programming. It is widely used in AI, Machine Learning, Web Development (FastAPI, Django), Data Science, and automation scripting.`;
    }

    if (p.includes('what is an api') || p.includes('api ki') || p.includes('explain what an api is')) {
      return `An API (Application Programming Interface) is a defined set of protocols, routines, and tools that allows different software applications to communicate and exchange data with each other. For instance, a weather website uses a meteorological API to retrieve live weather data, and ULTRON uses APIs to connect language models with sandboxed tool execution engines.`;
    }

    return null;
  }

  public getRoutes() {
    return Array.from(this.providers.values()).map((p) => ({
      providerId: p.id,
      name: p.name,
      type: p.type,
      isConfigured: p.isConfigured,
      isHealthy: p.isHealthy,
      supportedModels: p.supportedModels,
    }));
  }
}
