import React from 'react';

const formatPriority = (priority) => {
  const p = String(priority || 'medium').toLowerCase();
  if (p === 'high') return 'High';
  if (p === 'low') return 'Low';
  return 'Medium';
};

const getPriorityClasses = (priority) => {
  const p = String(priority || 'medium').toLowerCase();
  if (p === 'high') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300';
  if (p === 'low') return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300';
  return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
};

const AiBadge = ({ task }) => {
  if (task.aiPending) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        Analysing...
      </span>
    );
  }

  const priority = formatPriority(task.priority);
  const category = task.category?.name || task.category || 'General';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(priority)}`}>
      {priority} · {category}
    </span>
  );
};

export default AiBadge;
