import React from 'react';
import { FiCheck, FiEdit2, FiEye, FiRotateCcw, FiTrash2 } from 'react-icons/fi';

const isCompleted = (task) => task.completed === true || task.status === 'completed';

const formatDate = (value) => {
  if (!value) return '-';
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return '-';
  return dateValue.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const priorityClass = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low'
};

const priorityLabel = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const statusClass = {
  todo: 'status-todo',
  'in-progress': 'status-in-progress',
  review: 'status-review',
  completed: 'status-completed'
};

const normalizeStatus = (task) => {
  if (task.completed === true) return 'completed';
  const rawStatus = String(task.status || 'todo').toLowerCase().trim().replace(/\s+/g, '-');
  if (rawStatus === 'in_progress') return 'in-progress';
  if (rawStatus === 'inprogress') return 'in-progress';
  return statusClass[rawStatus] ? rawStatus : 'todo';
};

const formatStatusLabel = (status) =>
  status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const normalizePriority = (priority) => {
  const rawPriority = String(priority ?? '').toLowerCase().trim();
  if (rawPriority === 'high') return 'high';
  if (rawPriority === 'medium') return 'medium';
  if (rawPriority === 'low') return 'low';
  return 'medium';
};

const TaskList = ({
  title,
  tasks,
  selectedTaskIds,
  onSelectTask,
  onSelectAllTasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onView
}) => {
  if (!tasks.length) return null;

  const allSelected = tasks.length > 0 && tasks.every((task) => selectedTaskIds.has(task._id || task.id));

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-gray-600">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/5 dark:bg-[#0f1320]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700 dark:text-gray-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-[#121726] dark:text-gray-500">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => onSelectAllTasks(tasks, event.target.checked)}
                    aria-label={`Select all ${title.toLowerCase()}`}
                    className="h-4 w-4 cursor-pointer rounded border border-slate-300 bg-white dark:border-white/15 dark:bg-[#0d0f14]"
                  />
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="min-w-[140px] px-4 py-3 whitespace-nowrap">Deadline</th>
                <th className="min-w-[140px] px-4 py-3 whitespace-nowrap">Importance</th>
                <th className="min-w-[140px] px-4 py-3 whitespace-nowrap">Status</th>
                <th className="min-w-[140px] px-4 py-3 whitespace-nowrap">Date</th>
                <th className="w-[220px] px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const taskId = task._id || task.id;
                const done = isCompleted(task);
                const normalizedPriority = normalizePriority(task.priority);
                const normalizedStatus = normalizeStatus(task);

                return (
                  <tr
                    key={taskId}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(taskId)}
                        onChange={(event) => onSelectTask(taskId, event.target.checked)}
                        aria-label={`Select ${task.title}`}
                        className="h-4 w-4 cursor-pointer rounded border border-slate-300 bg-white dark:border-white/15 dark:bg-[#0d0f14]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onView(task)}
                        className={`font-medium text-left transition-colors hover:text-blue-600 dark:hover:text-blue-300 ${
                          done ? 'line-through text-slate-500 dark:text-gray-500' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </button>
                      {task.description ? (
                        <p className="mt-1 max-w-md truncate text-xs text-slate-500 dark:text-gray-500">{task.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-gray-400">{formatDate(task.dueDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${
                          priorityClass[normalizedPriority] || priorityClass.medium
                        }`}
                      >
                        {priorityLabel[normalizedPriority] || priorityLabel.medium}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${
                          statusClass[normalizedStatus] || statusClass.todo
                        }`}
                      >
                        {formatStatusLabel(normalizedStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-gray-400">{formatDate(task.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onView(task)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-500/25 dark:text-blue-300 dark:hover:bg-blue-500/10"
                          aria-label="View task"
                        >
                          <FiEye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleComplete(task)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
                          aria-label={done ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {done ? <FiRotateCcw size={14} /> : <FiCheck size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(task)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
                          aria-label="Edit task"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(task)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                          aria-label="Delete task"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default TaskList;
