const {
  extractJson,
  normalizeInsightsPayload,
  normalizeTaskDraft,
  buildOverviewInsightsPrompt,
  buildTaskDraftPrompt,
  validateTaskDraftOutput
} = require('../aiShared');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS || 25000);

const groqFetch = async (body) => {
  const apiKey = String(process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const rawText = await res.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      throw new Error(rawText || `Groq HTTP ${res.status}`);
    }

    if (!res.ok) {
      const msg = data?.error?.message || data?.message || rawText || res.statusText;
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(data?.error || data));
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Groq request timed out.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

const messageContent = (data) => {
  const choice = data?.choices?.[0];
  return String(choice?.message?.content || '').trim();
};

const parseJsonFromContent = (content) => {
  try {
    return content ? JSON.parse(content) : null;
  } catch {
    const jsonText = extractJson(content);
    if (!jsonText) return null;
    return JSON.parse(jsonText);
  }
};

const generateGroqInsights = async ({ tasks, kpis }) => {
  const prompt = buildOverviewInsightsPrompt({ tasks, kpis });
  const data = await groqFetch({
    model: MODEL,
    temperature: 0.5,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const content = messageContent(data);
  const parsed = parseJsonFromContent(content);
  if (!parsed) {
    throw new Error('Groq returned non-JSON content.');
  }

  const normalized = normalizeInsightsPayload(parsed, 'groq');
  if (!normalized.suggestions.length) {
    throw new Error('Groq returned empty suggestions.');
  }
  return normalized;
};

const generateGroqTaskDraft = async (ctx) => {
  const promptText = buildTaskDraftPrompt(ctx);
  const data = await groqFetch({
    model: MODEL,
    temperature: 0.85,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: promptText
      }
    ]
  });

  const content = messageContent(data);
  const parsed = parseJsonFromContent(content);
  if (!parsed) {
    throw new Error('Groq returned non-JSON draft.');
  }

  const normalized = normalizeTaskDraft(parsed, 'groq');
  validateTaskDraftOutput(normalized, ctx);
  return normalized;
};

module.exports = {
  generateGroqInsights,
  generateGroqTaskDraft
};
