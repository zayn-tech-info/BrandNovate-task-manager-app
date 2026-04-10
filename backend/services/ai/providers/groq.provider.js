const {
  extractJson,
  normalizeInsightsPayload,
  normalizeTaskDraft,
  buildOverviewInsightsPrompt,
  buildTaskDraftPrompt,
  validateTaskDraftOutput
} = require('../aiShared');

const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const groqTimeoutMs = Number(process.env.GROQ_TIMEOUT_MS || 25000);

const groqFetch = async (body) => {
  const apiKey = String(process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), groqTimeoutMs);

  try {
    const res = await fetch(groqApiUrl, {
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
      const groqErr = data?.error;
      const msg = groqErr?.message || data?.message || rawText || res.statusText;
      const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(groqErr || data));
      err.statusCode = res.status;
      if (groqErr?.code != null) err.providerCode = String(groqErr.code);
      if (groqErr?.type != null) err.providerType = String(groqErr.type);
      throw err;
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
    model: groqModel,
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
    model: groqModel,
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
