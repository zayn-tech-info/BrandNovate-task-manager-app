const STATUS_COMPLETED = 'completed';
const STATUS_IN_PROGRESS = 'in-progress';
const STATUS_REVIEW = 'review';
const STATUS_TODO = 'todo';
const PRIORITY_HIGH = 'high';

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeStatus = (status, completed) => {
  if (completed === true) return STATUS_COMPLETED;
  const normalized = String(status || STATUS_TODO).toLowerCase().trim();
  if (normalized === 'in_progress' || normalized === 'inprogress') return STATUS_IN_PROGRESS;
  if (
    normalized === STATUS_TODO ||
    normalized === STATUS_IN_PROGRESS ||
    normalized === STATUS_REVIEW ||
    normalized === STATUS_COMPLETED
  ) {
    return normalized;
  }
  return STATUS_TODO;
};

const normalizePriority = (priority) => {
  const normalized = String(priority || '').toLowerCase().trim();
  if (normalized === 'high') return PRIORITY_HIGH;
  if (normalized === 'medium') return 'medium';
  if (normalized === 'low') return 'low';
  return 'medium';
};

const getStartOfDay = (date = new Date()) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isCompletedTask = (task) => {
  if (!task || typeof task !== 'object') return false;
  return normalizeStatus(task.status, task.completed) === STATUS_COMPLETED;
};

export const buildOverviewMetrics = (tasks) => {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * DAY_MS);
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const statusDistribution = {
    [STATUS_TODO]: 0,
    [STATUS_IN_PROGRESS]: 0,
    [STATUS_REVIEW]: 0,
    [STATUS_COMPLETED]: 0
  };

  let dueToday = 0;
  let overdue = 0;
  let completedCount = 0;
  let completedLast7Days = 0;

  const needsAttention = [];
  const todayTasks = [];
  const recentActivity = [];

  safeTasks.forEach((task) => {
    if (!task || typeof task !== 'object') return;
    const status = normalizeStatus(task.status, task.completed);
    const priority = normalizePriority(task.priority);
    const dueDate = parseDate(task.dueDate);
    const createdAt = parseDate(task.createdAt);
    const updatedAt = parseDate(task.updatedAt);

    statusDistribution[status] += 1;

    if (status === STATUS_COMPLETED) {
      completedCount += 1;
      const completionDate = updatedAt || createdAt;
      if (completionDate && completionDate >= sevenDaysAgo) {
        completedLast7Days += 1;
      }
    }

    if (dueDate && status !== STATUS_COMPLETED) {
      if (isSameDay(dueDate, now)) {
        dueToday += 1;
        todayTasks.push(task);
      }
      if (getStartOfDay(dueDate) < todayStart) {
        overdue += 1;
      }
    }

    if (
      status !== STATUS_COMPLETED &&
      ((dueDate && getStartOfDay(dueDate) < todayStart) || priority === PRIORITY_HIGH)
    ) {
      needsAttention.push(task);
    }

    if (createdAt && createdAt >= sevenDaysAgo) {
      recentActivity.push({
        type: 'created',
        date: createdAt,
        task
      });
    }

    if (status === STATUS_COMPLETED && updatedAt && updatedAt >= sevenDaysAgo) {
      recentActivity.push({
        type: 'completed',
        date: updatedAt,
        task
      });
    }
  });

  needsAttention.sort((a, b) => {
    const aDue = parseDate(a.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER;
    const bDue = parseDate(b.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;
    const aCreated = parseDate(a.createdAt)?.getTime() || 0;
    const bCreated = parseDate(b.createdAt)?.getTime() || 0;
    return bCreated - aCreated;
  });

  todayTasks.sort((a, b) => {
    const aDue = parseDate(a.dueDate)?.getTime() || 0;
    const bDue = parseDate(b.dueDate)?.getTime() || 0;
    return aDue - bDue;
  });

  recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

  const completionRate = safeTasks.length ? Math.round((completedCount / safeTasks.length) * 100) : 0;

  const completionTrend = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sevenDaysAgo.getTime() + index * DAY_MS);
    const label = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return {
      date: day.toISOString().slice(0, 10),
      label,
      completed: 0
    };
  });

  safeTasks.forEach((task) => {
    if (!task || typeof task !== 'object') return;
    if (!isCompletedTask(task)) return;
    const when = parseDate(task.updatedAt || task.createdAt);
    if (!when || when < sevenDaysAgo) return;
    const idx = Math.floor((getStartOfDay(when).getTime() - sevenDaysAgo.getTime()) / DAY_MS);
    if (idx >= 0 && idx < completionTrend.length) {
      completionTrend[idx].completed += 1;
    }
  });

  return {
    kpis: {
      total: safeTasks.length,
      dueToday,
      overdue,
      completed7d: completedLast7Days,
      completionRate
    },
    statusDistribution,
    completionTrend,
    lists: {
      needsAttention: needsAttention.slice(0, 8),
      today: todayTasks.slice(0, 8),
      recentActivity: recentActivity.slice(0, 8)
    }
  };
};

export const buildDeterministicInsights = (overview, generatedAt) => {
  const o = overview && typeof overview === 'object' ? overview : {};
  const kpisRaw = o.kpis && typeof o.kpis === 'object' ? o.kpis : {};
  const listsRaw = o.lists && typeof o.lists === 'object' ? o.lists : {};
  const kpis = {
    total: Number(kpisRaw.total) || 0,
    dueToday: Number(kpisRaw.dueToday) || 0,
    overdue: Number(kpisRaw.overdue) || 0,
    completionRate: Number(kpisRaw.completionRate) || 0
  };
  const lists = {
    needsAttention: Array.isArray(listsRaw.needsAttention) ? listsRaw.needsAttention : []
  };
  const suggestions = [];

  if (kpis.overdue > 0) {
    suggestions.push({
      id: 'overdue-focus',
      title: `You have ${kpis.overdue} overdue task${kpis.overdue > 1 ? 's' : ''}`,
      reason: 'Overdue tasks increase delivery risk and stress.',
      actionLabel: 'Review overdue tasks',
      actionRoute: '/tasks',
      severity: 'high'
    });
  }

  if (kpis.dueToday > 0) {
    suggestions.push({
      id: 'today-plan',
      title: `${kpis.dueToday} task${kpis.dueToday > 1 ? 's are' : ' is'} due today`,
      reason: 'A quick plan can help you finish today without spillover.',
      actionLabel: 'Open today tasks',
      actionRoute: '/tasks',
      severity: 'medium'
    });
  }

  if (lists.needsAttention.length === 0 && kpis.total > 0) {
    suggestions.push({
      id: 'momentum',
      title: 'Great momentum',
      reason: 'No urgent blockers found right now.',
      actionLabel: 'Create next task',
      actionRoute: '/tasks',
      severity: 'low'
    });
  }

  return {
    summary: `You have ${kpis.total} total task${kpis.total !== 1 ? 's' : ''} and ${kpis.completionRate}% completion rate.`,
    suggestions,
    generatedAt: typeof generatedAt === 'string' ? generatedAt : '1970-01-01T00:00:00.000Z',
    source: 'rules'
  };
};
