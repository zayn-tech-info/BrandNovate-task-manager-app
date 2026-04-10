const { GoogleGenAI } = require('@google/genai');
const {
  extractJson,
  normalizeInsightsPayload,
  normalizeTaskDraft,
  buildOverviewInsightsPrompt,
  buildTaskDraftPrompt,
  validateTaskDraftOutput
} = require('../aiShared');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 12000);

const TASK_DRAFT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
    status: { type: 'string', enum: ['todo', 'in-progress', 'review'] },
    category: { type: 'string' },
    dueDate: {
      type: 'string',
      description: 'ISO 8601 datetime string, or empty string if no due date'
    },
    reason: { type: 'string' }
  },
  required: ['title', 'description', 'priority', 'status', 'category', 'dueDate', 'reason']
};

const extractModelText = (response) => {
  if (!response) return '';
  let direct = response.text;
  if (typeof direct === 'function') {
    try {
      direct = direct.call(response);
    } catch {
      direct = '';
    }
  }
  if (typeof direct === 'string' && direct.trim()) return direct;

  const parts = response.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('');
    if (joined.trim()) return joined;
  }
  return '';
};

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini request timed out.')), timeoutMs);
    })
  ]);

const generateGeminiInsights = async ({ tasks, kpis }) => {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildOverviewInsightsPrompt({ tasks, kpis });
  const response = await withTimeout(
    ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 2048
      }
    }),
    TIMEOUT_MS
  );

  const text = extractModelText(response);
  const jsonText = extractJson(text);
  if (!jsonText) {
    throw new Error('Gemini returned non-JSON content.');
  }

  const parsed = JSON.parse(jsonText);
  const normalized = normalizeInsightsPayload(parsed, 'gemini');
  if (!normalized.suggestions.length) {
    throw new Error('Gemini returned empty suggestions.');
  }
  return normalized;
};

const generateGeminiTaskDraft = async (ctx) => {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const promptText = buildTaskDraftPrompt(ctx);

  let response;
  try {
    response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: TASK_DRAFT_JSON_SCHEMA,
          temperature: 0.9,
          maxOutputTokens: 1024
        }
      }),
      TIMEOUT_MS
    );
  } catch {
    response = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: promptText,
        config: {
          temperature: 0.9,
          maxOutputTokens: 1024
        }
      }),
      TIMEOUT_MS
    );
  }

  const text = extractModelText(response);
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    const jsonText = extractJson(text);
    if (!jsonText) {
      throw new Error('Gemini returned non-JSON draft.');
    }
    parsed = JSON.parse(jsonText);
  }

  const normalized = normalizeTaskDraft(parsed, 'gemini');
  validateTaskDraftOutput(normalized, ctx);
  return normalized;
};

module.exports = {
  generateGeminiInsights,
  generateGeminiTaskDraft
};
