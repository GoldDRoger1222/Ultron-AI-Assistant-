// Safe API Fetch utility with automatic retry on transient network drops and fast timeout abort

export interface AIModelConfig {
  defaultModel: string;
  recommendedModels: string[];
  fallbackModels: string[];
}

export const AI_CONFIG: AIModelConfig = {
  defaultModel: 'gemini-3.6-flash',
  recommendedModels: ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview'],
  fallbackModels: ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'],
};

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiFetch<T = any>(
  url: string,
  options?: ApiFetchOptions,
  retries = 1
): Promise<T> {
  const timeoutMs = options?.timeoutMs || 25000;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchOptions: RequestInit = {
        ...options,
        signal: options?.signal || controller.signal,
      };

      const res = await fetch(url, fetchOptions);
      clearTimeout(timer);
      const contentType = res.headers.get('content-type') || '';

      // If HTTP error status (4xx, 5xx)
      if (!res.ok) {
        let errorMessage = `Server responded with status ${res.status}`;
        if (contentType.includes('application/json')) {
          try {
            const errData = await res.json();
            errorMessage = errData.error || errData.message || errorMessage;
          } catch {
            // ignore parsing error
          }
        } else {
          const text = await res.text().catch(() => '');
          if (text && !text.startsWith('<!doctype') && !text.startsWith('<html')) {
            errorMessage = text.slice(0, 160);
          } else {
            errorMessage = `Service endpoint ${url} unavailable (${res.status})`;
          }
        }

        // Retry on 502/503/504 or server reload
        if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
          continue;
        }

        throw new Error(errorMessage);
      }

      // Response is OK, verify it's JSON
      if (contentType.includes('application/json')) {
        return (await res.json()) as T;
      } else {
        // If server returned non-JSON (like HTML during dev server reload)
        const text = await res.text().catch(() => '');
        if (text.startsWith('<!doctype') || text.startsWith('<html')) {
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
            continue;
          }
          throw new Error('Server connection was interrupted or reloaded. Please retry.');
        }
        return text as unknown as T;
      }
    } catch (err: any) {
      clearTimeout(timer);
      const isAbortErr = err.name === 'AbortError';
      const isNetworkErr =
        isAbortErr ||
        (err.name === 'TypeError' && (err.message?.includes('fetch') || err.message?.includes('network')));

      if (isNetworkErr && attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      if (isAbortErr) {
        throw new Error(`Request to ${url} timed out after ${timeoutMs}ms. Fallback to Local-Only mode.`);
      }
      if (isNetworkErr) {
        throw new Error('Network connection offline or unavailable.');
      }
      throw err;
    }
  }
  throw new Error('Network connection failed. Please ensure the backend is running.');
}

