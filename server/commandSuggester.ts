export interface CommandSuggestion {
  id: string;
  originalInput: string;
  suggestedCommand: string;
  category: string;
  confidence: number;
  explanation: string;
}

export const CANONICAL_JARVIS_COMMANDS: { command: string; category: string; keywords: string[]; explanation: string }[] = [
  {
    command: 'JARVIS MODE',
    category: 'Security Matrix',
    keywords: ['jarvis mode', 'security mode', 'activate security', 'defense mode', 'securty mod', 'attack mode', 'jarvis mod'],
    explanation: 'Activate defensive and offensive cybersecurity matrix',
  },
  {
    command: 'JARVIS NORMAL',
    category: 'Security Matrix',
    keywords: ['jarvis normal', 'normal mode', 'exit security', 'exit defense', 'securty exit', 'normal mod'],
    explanation: 'Return to standard AI assistant workspace',
  },
  {
    command: 'Build 3D holographic Iron Man Arc Reactor',
    category: '3D Hologram & Schematic',
    keywords: ['hologram arc reactor', 'arc reactor', 'iron man reactor', '3d arc reactor', 'hologrm reactor'],
    explanation: 'Generate interactive 3D Arc Reactor with exploded view & BOM',
  },
  {
    command: 'Build 3D Quantum Drone',
    category: '3D Hologram & Schematic',
    keywords: ['3d drone', 'quantum drone', 'hologram drone', 'drone blueprint', 'buil 3d dron', 'hologrm drone'],
    explanation: 'Generate 3D autonomous drone model with bill of materials & steps',
  },
  {
    command: 'Build 3D Smart Cybernetic House',
    category: '3D Hologram & Schematic',
    keywords: ['3d house', 'smart house', 'cybernetic house', 'hologram building', 'buil 3d room', '3d smart home'],
    explanation: 'Architect 3D multi-layer smart infrastructure blueprint',
  },
  {
    command: 'Explode 3D hologram components',
    category: '3D Hologram',
    keywords: ['explode hologram', 'explode view', 'exlpode view', 'expand parts', 'disassemble 3d', 'explode scene'],
    explanation: 'Disassemble 3D model into inspectable layer components',
  },
  {
    command: 'Show Bill of Materials and Construction Guide',
    category: 'Hologram & Fabrication',
    keywords: ['bill of materials', 'bom', 'ki ki lagbe', 'malikana list', 'materials list', 'construction guide', 'kivabe banabo', 'build guide'],
    explanation: 'View full categorized materials list and step-by-step assembly protocol',
  },
  {
    command: 'Run full system diagnostics and latency audit',
    category: 'System Diagnostics',
    keywords: ['run diagnostics', 'diagostics', 'system audit', 'test providers', 'latency check', 'diaganostic test'],
    explanation: 'Perform end-to-end health audit across all AI providers & hardware bridges',
  },
  {
    command: 'YouTube e gan chalao',
    category: 'Mobile Automation',
    keywords: ['youtube e gan', 'youtube music', 'play song youtube', 'youtub gan', 'youtube a gun', 'gun chalao', 'yotube'],
    explanation: 'Launch YouTube media playback via mobile device bridge',
  },
  {
    command: 'Turn on flashlight',
    category: 'Mobile Automation',
    keywords: ['turn on flashlight', 'torch jalao', 'light jalao', 'turn on torch', 'flashligh', 'torch on'],
    explanation: 'Toggle hardware flashlight / torch on mobile device',
  },
  {
    command: 'Open WhatsApp and send message',
    category: 'Mobile Automation',
    keywords: ['open whatsapp', 'whatsapp message', 'whatspp', 'watsapp', 'whatsapp e message'],
    explanation: 'Open WhatsApp quick messaging bridge',
  },
  {
    command: 'Create a full-stack web application with React and Node',
    category: 'Coding & Architecture',
    keywords: ['create full stack', 'create fullstack', 'build web app', 'cretae full stack', 'develop app', 'react node app', 'make website'],
    explanation: 'Architect and generate production-ready full-stack software project',
  },
  {
    command: 'Start Multi-AI Think Tank Debate',
    category: 'Think Tank',
    keywords: ['think tank', 'multi ai debate', 'ai discussion', 'think tnk', 'claude vs gemini', 'ai council'],
    explanation: 'Initiate autonomous multi-model brainstorming and synthesis',
  },
  {
    command: 'Inspect Long-Term Vector Memory Engine',
    category: 'Memory',
    keywords: ['memory engine', 'vector memory', 'long term memory', 'check memor', 'view memory', 'memor vector'],
    explanation: 'Access semantic vector memory graphs and historical context snapshots',
  },
  {
    command: 'Run automated cybersecurity vulnerability scan',
    category: 'Cybersecurity',
    keywords: ['run pentest', 'vulnerability scan', 'security scan', 'scan port', 'audit security', 'ctf scan'],
    explanation: 'Execute sandbox defensive vulnerability and misconfiguration analysis',
  },
];

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function detectHighConfidenceAlternative(input: string, threshold = 0.65): CommandSuggestion | null {
  if (!input || input.trim().length < 3) return null;
  const cleanInput = input.trim().toLowerCase();

  let bestMatch: CommandSuggestion | null = null;
  let highestScore = 0;

  for (const item of CANONICAL_JARVIS_COMMANDS) {
    const canonicalLower = item.command.toLowerCase();
    if (cleanInput === canonicalLower) continue;

    for (const keyword of item.keywords) {
      const kw = keyword.toLowerCase();
      if (cleanInput === kw && cleanInput !== canonicalLower) {
        return {
          id: `sug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          originalInput: input,
          suggestedCommand: item.command,
          category: item.category,
          confidence: 0.95,
          explanation: item.explanation,
        };
      }

      if (cleanInput.length >= 4 && (kw.startsWith(cleanInput) || cleanInput.startsWith(kw))) {
        const score = 0.88;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = {
            id: `sug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            originalInput: input,
            suggestedCommand: item.command,
            category: item.category,
            confidence: score,
            explanation: item.explanation,
          };
        }
      }

      const maxLen = Math.max(cleanInput.length, kw.length);
      const dist = levenshteinDistance(cleanInput, kw);
      const similarity = 1 - dist / maxLen;

      if (similarity > highestScore && similarity >= threshold) {
        highestScore = similarity;
        bestMatch = {
          id: `sug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          originalInput: input,
          suggestedCommand: item.command,
          category: item.category,
          confidence: Number(similarity.toFixed(2)),
          explanation: item.explanation,
        };
      }
    }
  }

  return highestScore >= threshold ? bestMatch : null;
}
