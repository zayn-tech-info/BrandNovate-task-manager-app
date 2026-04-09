import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const inputClass =
  'w-full rounded-xl border border-white/8 bg-[#0d0f14] px-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30';

const selectClass = `${inputClass} app-select cursor-pointer appearance-none pr-10`;

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'review', label: 'Review' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];
const CATEGORY_OPTIONS = ['Coding', 'Design', 'Homework', 'Other'];

const SelectChevron = () => (
  <FiChevronDown
    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
    aria-hidden
  />
);

const formatDateInputValue = (value) => {
  if (!value) return '';
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return '';
  return dateValue.toISOString().slice(0, 10);
};

const TaskForm = ({
  onAddTask,
  onSubmit,
  isSubmitting,
  isLoading,
  onSuccess,
  variant = 'inline',
  initialValues = null,
  submitLabel = null
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const submitHandler = onAddTask || onSubmit;
  const submitting = Boolean(isSubmitting || isLoading);
  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title || '');
    setDescription(initialValues.description || '');
    setCategoryId(initialValues.categoryId || '');
    setPriority(initialValues.priority || 'medium');
    setStatus(initialValues.status || 'todo');
    setDueDate(formatDateInputValue(initialValues.dueDate));
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submitHandler) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
    };

    if (categoryId) {
      payload.category = categoryId;
    }

    if (dueDate) {
      payload.dueDate = new Date(`${dueDate}T12:00:00`).toISOString();
    }

    try {
      await submitHandler(payload);

      setTitle('');
      setDescription('');
      setCategoryId('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
      onSuccess?.();
    } catch {
      // Parent handles toast / state; keep modal open
    }
  };

  const formClass =
    variant === 'modal'
      ? 'space-y-5'
      : 'mb-6 space-y-5 rounded-2xl border border-white/5 bg-[#111420] p-6';
  const buttonLabel = submitting ? 'Saving...' : submitLabel || '+ Add Task';

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <div>
        <label htmlFor="task-title" className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
          What needs to get done?
        </label>
        <input
          id="task-title"
          type="text"
          className={inputClass}
          placeholder="Fix login bug"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus={variant === 'modal'}
        />
      </div>

      <div>
        <label
          htmlFor="task-description"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400"
        >
          Add a description (optional)
        </label>
        <textarea
          id="task-description"
          className={`${inputClass} h-24 resize-none`}
          placeholder="Describe the task details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="task-category" className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
            Category
          </label>
          <div className="relative">
            <select
              id="task-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectClass}
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div>
          <label htmlFor="task-priority" className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
            Priority
          </label>
          <div className="relative">
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={selectClass}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="task-status" className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
            Status
          </label>
          <div className="relative">
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div>
          <label htmlFor="task-due" className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
            Due date (optional)
          </label>
          <input
            id="task-due"
            type="date"
            className={inputClass}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-95 sm:w-auto"
        disabled={submitting}
      >
        {buttonLabel}
      </button>
    </form>
  );
};

export default TaskForm;
