import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import AiBadge from './AiBadge';

const isCompleted = (task) => task.completed === true || task.status === 'completed';

const formatShortDate = (value) => {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
};

const metaLine = (task) => {
  const cat = task.category?.name || task.category || 'General';
  const created = formatShortDate(task.createdAt);
  const due = task.dueDate ? formatShortDate(task.dueDate) : null;

  const parts = [cat];
  if (created) parts.push(created);
  if (due) parts.push(`Due ${due}`);
  return parts.join(' · ');
};

const TaskCard = ({ task, onToggleComplete, onDelete }) => {
  const done = isCompleted(task);

  return (
    <div className="group flex items-start justify-between gap-3 rounded-2xl border border-white/5 bg-[#111420] px-5 py-4 transition-all hover:border-white/10">
      <div className="flex min-w-0 items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggleComplete(task)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-gray-700 transition-colors group-hover:border-gray-500 checked:border-green-500/40 checked:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${done ? 'text-gray-600 line-through' : 'text-white'}`}>{task.title}</p>
          {task.description ? (
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{task.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-gray-600">{metaLine(task)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AiBadge task={task} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(task)}
        className="shrink-0 text-xs text-gray-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
        aria-label="Delete task"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
};

export default TaskCard;
