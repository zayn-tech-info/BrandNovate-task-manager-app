import React from 'react';

const formatPriority = (priority) => {
  const p = String(priority || 'medium').toLowerCase();
  if (p === 'high') return 'High';
  if (p === 'low') return 'Low';
  return 'Medium';
};

const getPriorityClasses = (priority) => {
  const p = String(priority || 'medium').toLowerCase();
  if (p === 'high') return 'border border-red-500/15 bg-red-500/10 text-red-400';
  if (p === 'low') return 'border border-green-500/15 bg-green-500/10 text-green-400';
  return 'border border-amber-500/15 bg-amber-500/10 text-amber-400';
};

const AiBadge = ({ task }) => {
  if (task.aiPending) {
    return (
      <span className="inline-flex animate-pulse rounded-md border border-blue-500/15 bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400">
        Analysing...
      </span>
    );
  }

  const priority = formatPriority(task.priority);

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${getPriorityClasses(priority)}`}
    >
      {priority}
    </span>
  );
};

export default AiBadge;
