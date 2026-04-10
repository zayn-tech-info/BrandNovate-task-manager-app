function flattenErrorText(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;

  let text = error.message || String(error);

  if (typeof text === 'string' && text.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const err = parsed?.error || parsed;
      if (err?.message) {
        const code = err.code != null ? String(err.code) : '';
        return [code, err.message].filter(Boolean).join(' ');
      }
    } catch {
      return text;
    }
  }

  const data = error.response?.data;
  if (data && typeof data === 'object') {
    const err = data.error || data;
    if (err?.message) {
      const code = err.code != null ? String(err.code) : '';
      return [code, err.message].filter(Boolean).join(' ');
    }
  }

  return text;
}

function providerLabel(error) {
  const p = error?.aiProvider;
  if (p === 'groq') return { name: 'Groq', envVar: 'GROQ_API_KEY', modelVar: 'GROQ_MODEL' };
  if (p === 'gemini') return { name: 'Gemini', envVar: 'GEMINI_API_KEY', modelVar: 'GEMINI_MODEL' };
  return { name: 'AI', envVar: 'GROQ_API_KEY or GEMINI_API_KEY', modelVar: 'GROQ_MODEL / GEMINI_MODEL' };
}

function looksLikeAuthFailure(t) {
  if (/\binvalid_api_key\b/i.test(t)) return true;
  if (/authentication_error|invalid_api_key|unauthenticated/i.test(t)) return true;
  if (/\b401\b/.test(t)) return true;
  if (/\b403\b/.test(t) && /forbidden|permission|denied|key/i.test(t)) return true;
  if (/invalid api key|incorrect api key|api key.*invalid|invalid.*api key|api key provided.*invalid/i.test(t)) {
    return true;
  }
  if (/api key not found|missing api key|no api key|authentication failed|invalid credentials/i.test(t)) {
    return true;
  }
  return false;
}

function looksLikeModelFailure(t) {
  return (
    /model_decommission|decommission|model not found|unknown model|does not exist|invalid model|no such model/i.test(
      t
    ) || (/model/i.test(t) && /not available|not supported|deprecated/i.test(t))
  );
}

function looksLikeRateLimitOrQuota(t, error) {
  if (error?.statusCode === 429) return true;
  const code = String(error?.providerCode || '').toLowerCase();
  if (code && /rate_limit|too_many_requests/i.test(code)) return true;
  const typ = String(error?.providerType || '').toLowerCase();
  if (typ && /rate_limit/i.test(typ)) return true;

  if (/resource_exhausted|resource exhausted/i.test(t)) return true;
  if (/\b429\b/.test(t)) return true;
  if (/\brate[\s_-]?limit|rate_limit_error|too many requests|over capacity/i.test(t)) return true;
  if (/requests?\s+per|tokens?\s+per|\btpm\b|\brpm\b|quota_exceeded|exceeded your quota|billing_hard/i.test(t)) {
    return true;
  }
  if (/\bquota\b/i.test(t) && /(exceed|exhausted|rate|limit)/i.test(t)) return true;
  return false;
}

function humanizeAiFailure(error) {
  const { name, envVar, modelVar } = providerLabel(error);
  const raw = flattenErrorText(error);
  const t = raw.toLowerCase();

  if (t.includes('not configured')) {
    return `(AI paused: set ${envVar} in backend/.env with no quotes/extra spaces, then restart the server.)`;
  }

  if (looksLikeModelFailure(t)) {
    return `(AI paused: ${name} rejected the model name—update ${modelVar} to a current model ID.)`;
  }

  if (looksLikeRateLimitOrQuota(t, error)) {
    return '(AI paused: API quota or rate limit—check your provider dashboard.)';
  }

  if (looksLikeAuthFailure(t)) {
    return `(AI paused: ${name} rejected the key—copy a fresh ${envVar} from the provider console, save .env, restart.)`;
  }

  if (t.includes('timeout') || t.includes('timed out')) {
    return '(AI paused: request timed out.)';
  }

  return `(AI paused: ${name} request failed—see server logs for details.)`;
}

module.exports = { humanizeAiFailure, flattenErrorText };
