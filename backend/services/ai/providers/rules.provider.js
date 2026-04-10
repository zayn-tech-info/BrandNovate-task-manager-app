const statusCompleted = 'completed';
const statusInProgress = 'in-progress';
const statusReview = 'review';
const statusTodo = 'todo';
const priorityHigh = 'high';

const dayMs = 24 * 60 * 60 * 1000;

const normalizeStatus = (status, completed) => {
  if (completed === true) return statusCompleted;
  const normalized = String(status || statusTodo).toLowerCase().trim();
  if (normalized === 'in_progress' || normalized === 'inprogress') return statusInProgress;
  if (
    normalized === statusTodo ||
    normalized === statusInProgress ||
    normalized === statusReview ||
    normalized === statusCompleted
  ) {
    return normalized;
  }
  return statusTodo;
};

const normalizePriority = (priority) => {
  const normalized = String(priority || '').toLowerCase().trim();
  if (normalized === '3') return priorityHigh;
  if (normalized === '2') return 'medium';
  if (normalized === '1') return 'low';
  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') return normalized;
  return 'medium';
};

const getStartOfDay = (date = new Date()) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const buildOverviewMetrics = (tasks) => {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * dayMs);
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  let dueToday = 0;
  let overdue = 0;
  let completedCount = 0;

  const needsAttention = [];
  const todayTasks = [];

  safeTasks.forEach((task) => {
    const status = normalizeStatus(task.status, task.completed);
    const priority = normalizePriority(task.priority);
    const dueDate = parseDate(task.dueDate);

    if (status === statusCompleted) {
      completedCount += 1;
    }

    if (dueDate && status !== statusCompleted) {
      if (isSameDay(dueDate, now)) {
        dueToday += 1;
        todayTasks.push(task);
      }
      if (getStartOfDay(dueDate) < todayStart) {
        overdue += 1;
      }
    }

    if (
      status !== statusCompleted &&
      ((dueDate && getStartOfDay(dueDate) < todayStart) || priority === priorityHigh)
    ) {
      needsAttention.push(task);
    }
  });

  needsAttention.sort((a, b) => {
    const aDue = parseDate(a.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER;
    const bDue = parseDate(b.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  todayTasks.sort((a, b) => {
    const aDue = parseDate(a.dueDate)?.getTime() || 0;
    const bDue = parseDate(b.dueDate)?.getTime() || 0;
    return aDue - bDue;
  });

  return {
    kpis: {
      total: safeTasks.length,
      dueToday,
      overdue,
      completionRate: safeTasks.length ? Math.round((completedCount / safeTasks.length) * 100) : 0
    },
    lists: {
      needsAttention: needsAttention.slice(0, 8),
      today: todayTasks.slice(0, 8)
    }
  };
};

const toSuggestion = (id, title, reason, actionLabel, severity = 'medium') => ({
  id,
  title,
  reason,
  actionLabel,
  actionRoute: '/tasks',
  severity
});

const buildRulesInsights = ({ tasks, reason }) => {
  const overview = buildOverviewMetrics(tasks);
  const { kpis, lists } = overview;
  const suggestions = [];

  if (kpis.overdue > 0) {
    suggestions.push(
      toSuggestion(
        'overdue-focus',
        `Resolve ${kpis.overdue} overdue task${kpis.overdue > 1 ? 's' : ''} first`,
        'Overdue tasks are the biggest delivery risk.',
        'Open overdue tasks',
        'high'
      )
    );
  }

  if (kpis.dueToday > 0) {
    suggestions.push(
      toSuggestion(
        'daily-focus',
        `Focus on ${Math.min(3, lists.today.length)} key task${lists.today.length > 1 ? 's' : ''} today`,
        'A smaller focus list improves completion quality.',
        'See today list',
        'medium'
      )
    );
  }

  if (lists.needsAttention.length > 0) {
    const sample = lists.needsAttention[0];
    suggestions.push(
      toSuggestion(
        'next-task',
        `Suggested next task: ${sample.title}`,
        'It is either high priority or time-sensitive.',
        'Open tasks board',
        'medium'
      )
    );
  }

  if (!suggestions.length) {
    suggestions.push(
      toSuggestion(
        'momentum',
        'You are in a stable state',
        'No urgent blockers detected right now.',
        'Create a new task',
        'low'
      )
    );
  }

  const baseSummary = `You have ${kpis.total} total task${kpis.total !== 1 ? 's' : ''}, ${kpis.overdue} overdue, and a ${kpis.completionRate}% completion rate.`;
  return {
    summary: reason ? `${baseSummary} ${reason}` : baseSummary,
    suggestions: suggestions.slice(0, 4),
    generatedAt: new Date().toISOString(),
    source: 'rules'
  };
};

const buildRulesTaskDraft = ({
  tasks,
  prompt,
  draftTitle,
  draftDescription,
  kpis,
  existingTitles,
  reason
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const normalizedPrompt = String(prompt || '').trim();
  const formTitle = String(draftTitle || '').trim();
  const formDesc = String(draftDescription || '').trim();

  const titleSet = new Set(
    (Array.isArray(existingTitles) && existingTitles.length
      ? existingTitles
      : safeTasks.map((t) => String(t.title || '').trim())
    )
      .filter(Boolean)
      .map((t) => t.toLowerCase())
  );

  const pickUniqueTitle = (base) => {
    let candidate = base.slice(0, 120);
    let n = 2;
    while (titleSet.has(candidate.toLowerCase()) && n < 40) {
      candidate = `${base.slice(0, 100)} (${n})`;
      n += 1;
    }
    titleSet.add(candidate.toLowerCase());
    return candidate;
  };

  const counts = safeTasks.reduce(
    (acc, task) => {
      const p = normalizePriority(task.priority);
      const s = normalizeStatus(task.status, task.completed);
      acc.priority[p] = (acc.priority[p] || 0) + 1;
      acc.status[s] = (acc.status[s] || 0) + 1;
      acc.categories[String(task.category || 'Other')] = (acc.categories[String(task.category || 'Other')] || 0) + 1;
      return acc;
    },
    { priority: {}, status: {}, categories: {} }
  );

  const mostUsed = (obj, fallback) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;

  const category = mostUsed(counts.categories, 'Other');
  const defaultPriority = mostUsed(counts.priority, 'medium');
  const status = 'todo';

  const now = new Date();
  const todayStart = getStartOfDay(now);

  const incomplete = safeTasks.filter((task) => normalizeStatus(task.status, task.completed) !== statusCompleted);

  const overdueTasks = incomplete.filter((task) => {
    const due = parseDate(task.dueDate);
    return due && getStartOfDay(due) < todayStart;
  });

  const dueTodayTasks = incomplete.filter((task) => {
    const due = parseDate(task.dueDate);
    return due && isSameDay(due, now);
  });

  const highOpen = incomplete.filter((task) => normalizePriority(task.priority) === priorityHigh);

  const due = new Date();
  due.setDate(due.getDate() + (defaultPriority === 'high' || overdueTasks.length ? 1 : 2));
  due.setHours(12, 0, 0, 0);

  const aiNote = reason || '';

  if (normalizedPrompt.length >= 2) {
    const title = pickUniqueTitle(
      normalizedPrompt.length > 100 ? `${normalizedPrompt.slice(0, 97)}...` : normalizedPrompt
    );
    return {
      title,
      description: `Turn this into a concrete outcome: write the first deliverable, estimate time, and define "done".${formDesc ? ` Optional context from your draft: ${formDesc.slice(0, 200)}` : ''}`,
      priority: overdueTasks.length ? 'high' : defaultPriority,
      status,
      category,
      dueDate: due.toISOString(),
      reason: aiNote
        ? `Suggestion from your instruction. ${aiNote}`
        : 'Suggestion from your instruction.',
      generatedAt: new Date().toISOString(),
      source: 'rules'
    };
  }

  if (overdueTasks.length) {
    const t = overdueTasks[0];
    const title = pickUniqueTitle(`Ship next step on: ${String(t.title || 'overdue task').slice(0, 80)}`);
    return {
      title,
      description: `This work looks overdue. Identify the smallest action that reduces risk today (e.g. unblock, clarify scope, or complete one sub-part).`,
      priority: 'high',
      status,
      category: String(t.category || category),
      dueDate: due.toISOString(),
      reason: aiNote
        ? `Prioritize overdue work (${kpis?.overdue ?? overdueTasks.length} overdue). ${aiNote}`
        : `Prioritize overdue work (${kpis?.overdue ?? overdueTasks.length} overdue).`,
      generatedAt: new Date().toISOString(),
      source: 'rules'
    };
  }

  if (dueTodayTasks.length) {
    const t = dueTodayTasks[0];
    const title = pickUniqueTitle(`Finish today: ${String(t.title || 'due task').slice(0, 80)}`);
    return {
      title,
      description: `Time-box 45–90 minutes and close one measurable slice of this task before end of day.`,
      priority: 'high',
      status,
      category: String(t.category || category),
      dueDate: due.toISOString(),
      reason: aiNote
        ? `Focus on work due today (${kpis?.dueToday ?? dueTodayTasks.length} due today). ${aiNote}`
        : `Focus on work due today (${kpis?.dueToday ?? dueTodayTasks.length} due today).`,
      generatedAt: new Date().toISOString(),
      source: 'rules'
    };
  }

  if (highOpen.length) {
    const t = highOpen[0];
    const title = pickUniqueTitle(`Advance high-priority: ${String(t.title || 'task').slice(0, 72)}`);
    return {
      title,
      description: `Break this into the next single milestone and block time on your calendar to execute it.`,
      priority: 'high',
      status,
      category: String(t.category || category),
      dueDate: due.toISOString(),
      reason: aiNote
        ? `Open high-priority work needs attention. ${aiNote}`
        : 'Open high-priority work needs attention.',
      generatedAt: new Date().toISOString(),
      source: 'rules'
    };
  }

  if (incomplete.length) {
    const t = incomplete[0];
    const title = pickUniqueTitle(`Next: ${String(t.title || 'open task').slice(0, 88)}`);
    return {
      title,
      description: `Define the next concrete action and what "done" looks like for this step.`,
      priority: defaultPriority,
      status,
      category: String(t.category || category),
      dueDate: due.toISOString(),
      reason: aiNote
        ? `Continue your next open task. ${aiNote}`
        : 'Continue your next open task.',
      generatedAt: new Date().toISOString(),
      source: 'rules'
    };
  }

  const seedTitle = formTitle
    ? pickUniqueTitle(`New: ${formTitle.slice(0, 80)}`)
    : pickUniqueTitle('Capture one outcome for today');

  return {
    title: seedTitle,
    description: formDesc
      ? `Expand this idea into steps with owners and deadlines: ${formDesc.slice(0, 240)}`
      : 'Write one outcome you want by end of day and the first 30-minute action toward it.',
    priority: defaultPriority,
    status,
    category,
    dueDate: due.toISOString(),
    reason: `Rule-based starter task.${aiNote}`,
    generatedAt: new Date().toISOString(),
    source: 'rules'
  };
};

module.exports = {
  buildRulesInsights,
  buildRulesTaskDraft
};
