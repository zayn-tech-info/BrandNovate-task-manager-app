import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

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

const menuItemClass =
  'block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-white/[0.06]';

const menuDestructiveClass =
  'block w-full px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10';

const TaskKebabMenu = ({ task, done, onView, onEdit, onToggleComplete, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 176 });
  const triggerRef = useRef(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const menuWidth = 176;
    const left = Math.min(r.right - menuWidth, window.innerWidth - menuWidth - 8);
    setPosition({
      top: r.bottom + 4,
      left: Math.max(8, left),
      width: menuWidth
    });
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);
  const run = (fn) => {
    fn();
    close();
  };

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 bg-transparent" aria-hidden="true" onClick={close} />
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-white ${open ? 'relative z-50' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Task actions"
      >
        <FiMoreVertical className="h-5 w-5" aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className="fixed z-50 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#111420]"
          style={{ top: position.top, left: position.left, minWidth: position.width }}
        >
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => run(() => onView(task))}
          >
            View
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => run(() => onEdit(task))}
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => run(() => onToggleComplete(task))}
          >
            {done ? 'Undo' : 'Done'}
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuDestructiveClass}
            onClick={() => run(() => onDelete(task))}
          >
            Delete
          </button>
        </div>
      ) : null}
    </>
  );
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
      <div className="flex items-center justify-between gap-3 lg:block">
        <h2 className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-gray-600">{title}</h2>
        <label className="flex cursor-pointer select-none items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-gray-400 lg:hidden">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(event) => onSelectAllTasks(tasks, event.target.checked)}
            aria-label={`Select all in ${title}`}
            className="h-4 w-4 cursor-pointer rounded border border-slate-300 bg-white dark:border-white/15 dark:bg-[#0d0f14]"
          />
          All
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/5 dark:bg-[#0f1320]">
        <div className="divide-y divide-slate-100 dark:divide-white/[0.06] lg:hidden">
          {tasks.map((task) => {
            const taskId = task._id || task.id;
            const done = isCompleted(task);
            const normalizedPriority = normalizePriority(task.priority);
            const normalizedStatus = normalizeStatus(task);
            const due = formatDate(task.dueDate);

            return (
              <div key={taskId} className="p-3.5">
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.has(taskId)}
                    onChange={(event) => onSelectTask(taskId, event.target.checked)}
                    aria-label={`Select ${task.title}`}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border border-slate-300 bg-white dark:border-white/15 dark:bg-[#0d0f14]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onView(task)}
                        className={`min-w-0 flex-1 text-left font-semibold leading-snug transition-colors hover:text-blue-600 dark:hover:text-blue-300 ${
                          done ? 'text-slate-500 line-through dark:text-gray-500' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </button>
                      <TaskKebabMenu
                        task={task}
                        done={done}
                        onView={onView}
                        onEdit={onEdit}
                        onToggleComplete={onToggleComplete}
                        onDelete={onDelete}
                      />
                    </div>
                    {task.description ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-gray-500">
                        {task.description}
                      </p>
                    ) : null}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight ${
                          priorityClass[normalizedPriority] || priorityClass.medium
                        }`}
                      >
                        {priorityLabel[normalizedPriority] || priorityLabel.medium}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight ${
                          statusClass[normalizedStatus] || statusClass.todo
                        }`}
                      >
                        {formatStatusLabel(normalizedStatus)}
                      </span>
                      {due !== '-' ? (
                        <span className="text-[11px] text-slate-500 dark:text-gray-500">Due {due}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto lg:block">
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
                <th className="min-w-[140px] whitespace-nowrap px-4 py-3">Deadline</th>
                <th className="min-w-[140px] whitespace-nowrap px-4 py-3">Importance</th>
                <th className="min-w-[140px] whitespace-nowrap px-4 py-3">Status</th>
                <th className="min-w-[140px] whitespace-nowrap px-4 py-3">Date</th>
                <th className="w-16 whitespace-nowrap px-4 py-3 text-right">Actions</th>
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
                        className={`text-left font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-300 ${
                          done ? 'text-slate-500 line-through dark:text-gray-500' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </button>
                      {task.description ? (
                        <p className="mt-1 max-w-md truncate text-xs text-slate-500 dark:text-gray-500">{task.description}</p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-gray-400">{formatDate(task.dueDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${
                          priorityClass[normalizedPriority] || priorityClass.medium
                        }`}
                      >
                        {priorityLabel[normalizedPriority] || priorityLabel.medium}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${
                          statusClass[normalizedStatus] || statusClass.todo
                        }`}
                      >
                        {formatStatusLabel(normalizedStatus)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-gray-400">{formatDate(task.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <TaskKebabMenu
                          task={task}
                          done={done}
                          onView={onView}
                          onEdit={onEdit}
                          onToggleComplete={onToggleComplete}
                          onDelete={onDelete}
                        />
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
