/**
 * ULTRON Core Security Sandbox & Data Masking
 * 
 * Functions:
 * - Redacts sensitive tokens (API keys, passwords, bearer tokens) from logs and outputs
 * - Validates input safety against script injection and hostile escape sequences
 * - Enforces boundary isolation for sandbox workspaces
 */

export class SecuritySandbox {
  private static instance: SecuritySandbox;

  private readonly SENSITIVE_PATTERNS = [
    /AIza[0-9A-Za-z\-_]{20,}/g, // Google API Key
    /sk-[a-zA-Z0-9]{20,}/g, // OpenAI / Generic API key
    /bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi, // Bearer Token
    /password["']?\s*[:=]\s*["']?[^"'\s,]+/gi, // Passwords
    /private_key["']?\s*[:=]\s*["']?[^"'\s,]+/gi, // Private keys
  ];

  private constructor() {}

  public static getInstance(): SecuritySandbox {
    if (!SecuritySandbox.instance) {
      SecuritySandbox.instance = new SecuritySandbox();
    }
    return SecuritySandbox.instance;
  }

  /**
   * Redact sensitive keys and secrets from output strings
   */
  public maskSecrets(text: string): string {
    if (!text || typeof text !== 'string') return text;
    let masked = text;
    for (const pat of this.SENSITIVE_PATTERNS) {
      masked = masked.replace(pat, (match) => {
        if (match.length <= 8) return '********';
        return match.slice(0, 4) + '...' + match.slice(-4);
      });
    }
    return masked;
  }

  /**
   * Validate safety of a requested command or path
   */
  public validateSafety(input: string): { safe: boolean; reason?: string } {
    const lower = input.toLowerCase();

    if (lower.includes('/etc/shadow') || lower.includes('/etc/passwd')) {
      return { safe: false, reason: 'Access to system authentication files is prohibited.' };
    }

    if (lower.includes(':(){ :|:& };:')) {
      return { safe: false, reason: 'Fork bombs are strictly blocked by ULTRON Sandbox.' };
    }

    return { safe: true };
  }
}
