import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const formatDateTime = (value) => {
  if (!value) return '-';
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return '-';
  return dateValue.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (value) =>
  String(value || 'todo')
    .replace(/_/g, '-')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatPriority = (value) => {
  const normalized = String(value || 'medium').toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
};

const Field = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-[#111420]">
    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-500">{label}</p>
    <p className="mt-1.5 text-sm text-slate-800 dark:text-gray-200">{value || '-'}</p>
  </div>
);

const TaskViewModal = ({ task, onClose }) => {
  useEffect(() => {
    if (!task) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [task, onClose]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-view-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-[#0f1320]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="task-view-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            Task details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-[#111420]">
          <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{task.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-gray-300">
            {task.description || 'No description provided.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Category" value={task.category || 'Other'} />
          <Field label="Priority" value={formatPriority(task.priority)} />
          <Field label="Status" value={formatStatus(task.status)} />
          <Field label="Due date" value={formatDateTime(task.dueDate)} />
          <Field label="Created" value={formatDateTime(task.createdAt)} />
          <Field label="Last updated" value={formatDateTime(task.updatedAt)} />
        </div>
      </div>
    </div>
  );
};

export default TaskViewModal;
