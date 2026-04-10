const { generateGeminiInsights, generateGeminiTaskDraft } = require('./providers/gemini.provider');
const { generateGroqInsights, generateGroqTaskDraft } = require('./providers/groq.provider');
const { buildRulesInsights, buildRulesTaskDraft } = require('./providers/rules.provider');
const { humanizeAiFailure } = require('./humanizeAiError');

const getOverviewSnapshot = (tasks) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const isOverdue = (task) => {
    if (!task?.dueDate || task?.status === 'completed') return false;
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < start;
  };

  const isToday = (task) => {
    if (!task?.dueDate || task?.status === 'completed') return false;
    const due = new Date(task.dueDate);
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    );
  };

  const completed = safeTasks.filter((task) => task.status === 'completed' || task.completed === true).length;
  const overdue = safeTasks.filter(isOverdue).length;
  const dueToday = safeTasks.filter(isToday).length;

  return {
    total: safeTasks.length,
    completed,
    overdue,
    dueToday,
    completionRate: safeTasks.length ? Math.round((completed / safeTasks.length) * 100) : 0
  };
};

const resolvePrimaryProvider = () => {
  const explicit = String(process.env.AI_PROVIDER || '')
    .trim()
    .toLowerCase();
  if (explicit === 'groq') return 'groq';
  if (explicit === 'gemini') return 'gemini';
  if (explicit === 'rules') return null;

  const hasGroq = Boolean(String(process.env.GROQ_API_KEY || '').trim());
  const hasGemini = Boolean(String(process.env.GEMINI_API_KEY || '').trim());

  // When both keys exist, it's better to prefer Gemini unless AI_PROVIDER says otherwise.
  if (hasGemini && hasGroq) return 'gemini';
  if (hasGemini) return 'gemini';
  if (hasGroq) return 'groq';
  return null;
};

const secondaryProvider = (primary) => {
  if (primary === 'groq' && String(process.env.GEMINI_API_KEY || '').trim()) return 'gemini';
  if (primary === 'gemini' && String(process.env.GROQ_API_KEY || '').trim()) return 'groq';
  return null;
};

const tagProviderError = (err, provider) => {
  const wrapped = new Error(err?.message || String(err));
  wrapped.aiProvider = provider;
  wrapped.cause = err;
  return wrapped;
};

const runInsightsChain = async ({ tasks, kpis }) => {
  const primary = resolvePrimaryProvider();
  const order = [];
  if (primary === 'groq') {
    order.push({ name: 'groq', run: () => generateGroqInsights({ tasks, kpis }) });
    const sec = secondaryProvider('groq');
    if (sec === 'gemini') order.push({ name: 'gemini', run: () => generateGeminiInsights({ tasks, kpis }) });
  } else if (primary === 'gemini') {
    order.push({ name: 'gemini', run: () => generateGeminiInsights({ tasks, kpis }) });
    const sec = secondaryProvider('gemini');
    if (sec === 'groq') order.push({ name: 'groq', run: () => generateGroqInsights({ tasks, kpis }) });
  }

  if (!order.length) {
    return buildRulesInsights({ tasks, kpis });
  }

  let lastError = null;
  for (const step of order) {
    try {
      return await step.run();
    } catch (err) {
      lastError = tagProviderError(err, step.name);
    }
  }

  return buildRulesInsights({
    tasks,
    kpis,
    reason: lastError ? humanizeAiFailure(lastError) : undefined
  });
};

const runTaskDraftChain = async (ctx) => {
  const primary = resolvePrimaryProvider();
  const order = [];
  if (primary === 'groq') {
    order.push({ name: 'groq', run: () => generateGroqTaskDraft(ctx) });
    if (secondaryProvider('groq') === 'gemini') {
      order.push({ name: 'gemini', run: () => generateGeminiTaskDraft(ctx) });
    }
  } else if (primary === 'gemini') {
    order.push({ name: 'gemini', run: () => generateGeminiTaskDraft(ctx) });
    if (secondaryProvider('gemini') === 'groq') {
      order.push({ name: 'groq', run: () => generateGroqTaskDraft(ctx) });
    }
  }

  if (!order.length) {
    return buildRulesTaskDraft({ ...ctx, reason: '' });
  }

  let lastError = null;
  for (const step of order) {
    try {
      return await step.run();
    } catch (err) {
      lastError = tagProviderError(err, step.name);
    }
  }

  return buildRulesTaskDraft({
    ...ctx,
    reason: lastError ? humanizeAiFailure(lastError) : ''
  });
};

const generateOverviewInsights = async ({ tasks }) => {
  const kpis = getOverviewSnapshot(tasks);
  return runInsightsChain({ tasks, kpis });
};

const generateTaskDraftSuggestion = async ({ tasks, prompt, draftTitle, draftDescription }) => {
  const kpis = getOverviewSnapshot(tasks);
  const existingTitles = tasks
    .map((t) => String(t.title || '').trim())
    .filter(Boolean);
  const ctx = { tasks, prompt, draftTitle, draftDescription, kpis, existingTitles };
  return runTaskDraftChain(ctx);
};

module.exports = {
  generateOverviewInsights,
  generateTaskDraftSuggestion
};
