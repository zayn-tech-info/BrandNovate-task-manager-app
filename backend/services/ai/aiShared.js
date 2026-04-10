const normalizeSuggestion = (item, idx) => ({
  id: String(item?.id || `ai-${idx + 1}`),
  title: String(item?.title || 'Suggestion'),
  reason: String(item?.reason || 'No reason provided.'),
  actionLabel: String(item?.actionLabel || 'Open tasks'),
  actionRoute: '/tasks',
  severity: ['low', 'medium', 'high'].includes(String(item?.severity || '').toLowerCase())
    ? String(item.severity).toLowerCase()
    : 'medium'
});

const normalizeInsightsPayload = (raw, source) => ({
  summary: String(raw?.summary || 'Here is your current task overview.'),
  suggestions: Array.isArray(raw?.suggestions) ? raw.suggestions.slice(0, 4).map(normalizeSuggestion) : [],
  generatedAt: new Date().toISOString(),
  source
});

const extractJson = (text) => {
  if (!text || typeof text !== 'string') return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
};

const normalizeTaskDraft = (raw, source) => {
  const priority = String(raw?.priority || 'medium').toLowerCase();
  const status = String(raw?.status || 'todo').toLowerCase();
  const category = String(raw?.category || 'Other').trim() || 'Other';
  const dueRaw = raw?.dueDate;
  const dueStr = typeof dueRaw === 'string' ? dueRaw.trim() : '';
  const dueDate = dueStr ? new Date(dueStr) : null;

  return {
    title: String(raw?.title || '').trim(),
    description: String(raw?.description || '').trim(),
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
    status: ['todo', 'in-progress', 'review'].includes(status) ? status : 'todo',
    category,
    dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.toISOString() : null,
    reason: String(raw?.reason || 'Suggested from your workload and recent activity.'),
    generatedAt: new Date().toISOString(),
    source
  };
};

const buildOverviewInsightsPrompt = ({ tasks, kpis }) => {
  const compactTasks = tasks.slice(0, 40).map((task) => ({
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate
  }));

  return [
    'You are a productivity assistant for a task manager app.',
    'Return ONLY valid JSON. No markdown, no prose outside JSON.',
    'The JSON schema is:',
    '{',
    '  "summary": "string",',
    '  "suggestions": [',
    '    {',
    '      "id": "string",',
    '      "title": "string",',
    '      "reason": "string",',
    '      "actionLabel": "string",',
    '      "actionRoute": "/tasks",',
    '      "severity": "low|medium|high"',
    '    }',
    '  ]',
    '}',
    'Generate up to 4 suggestions for:',
    '1) Suggested next task based on history/context.',
    '2) Priority/status recommendations.',
    '3) Daily focus plan for due today and overdue tasks.',
    `Current KPI snapshot: ${JSON.stringify(kpis)}`,
    `Task snapshot: ${JSON.stringify(compactTasks)}`
  ].join('\n');
};

const buildTaskDraftPrompt = ({
  tasks,
  prompt,
  draftTitle,
  draftDescription,
  kpis,
  existingTitles
}) => {
  const compactTasks = tasks.slice(0, 40).map((task) => ({
    title: task.title,
    status: task.status,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate
  }));

  const userPrompt = String(prompt || '').trim();
  const formTitle = String(draftTitle || '').trim();
  const formDesc = String(draftDescription || '').trim();

  return [
    'You are a task planning assistant. Return ONLY one JSON object, no markdown fences.',
    '',
    'CRITICAL RULES:',
    '1) Propose exactly ONE new, actionable task the user could add to their list.',
    '2) The suggested title and description must NOT be a copy or light paraphrase of the "Form draft" fields unless the user explicitly asked you to refine that exact draft in the AI instruction.',
    '3) Do NOT repeat any existing task title (case-insensitive). Invent a genuinely different next step.',
    '4) If the AI instruction is empty, infer the best next task from overdue items, due-today work, open high-priority items, and category patterns.',
    '5) If the AI instruction is non-empty, that instruction is the primary source of truth.',
    '6) "reason" must briefly explain why this task helps.',
    '',
    'JSON shape (all keys required):',
    '{"title":"string","description":"string","priority":"low|medium|high","status":"todo|in-progress|review","category":"string","dueDate":"ISO8601 string or empty string","reason":"string"}',
    '',
    `Workload KPIs: ${JSON.stringify(kpis || {})}`,
    `Existing task titles (do not duplicate): ${JSON.stringify((existingTitles || []).slice(0, 60))}`,
    `Task snapshot: ${JSON.stringify(compactTasks)}`,
    '',
    'Form draft (optional context only):',
    `- title: ${JSON.stringify(formTitle)}`,
    `- description: ${JSON.stringify(formDesc)}`,
    '',
    `User AI instruction (primary when non-empty): ${JSON.stringify(userPrompt)}`
  ].join('\n');
};

const validateTaskDraftOutput = (normalized, ctx) => {
  if (!normalized.title) {
    throw new Error('Model returned draft without title.');
  }

  const banned = new Set(
    (ctx.existingTitles || []).map((t) => String(t).trim().toLowerCase()).filter(Boolean)
  );
  if (banned.has(normalized.title.toLowerCase())) {
    throw new Error('Model duplicated an existing task title.');
  }

  const formT = String(ctx.draftTitle || '').trim().toLowerCase();
  const formD = String(ctx.draftDescription || '').trim().toLowerCase();
  const userPrompt = String(ctx.prompt || '').trim();
  if (
    userPrompt.length < 2 &&
    formT.length > 8 &&
    normalized.title.toLowerCase() === formT &&
    (formD.length === 0 || normalized.description.toLowerCase() === formD)
  ) {
    throw new Error('Model echoed the form draft; refusing duplicate output.');
  }
};

module.exports = {
  extractJson,
  normalizeInsightsPayload,
  normalizeTaskDraft,
  buildOverviewInsightsPrompt,
  buildTaskDraftPrompt,
  validateTaskDraftOutput
};
