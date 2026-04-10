import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiChevronDown } from 'react-icons/fi';
import insightsService from '../services/insights.service';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-white/8 dark:bg-[#0d0f14] dark:text-white dark:placeholder:text-gray-600';

const selectClass = `${inputClass} app-select cursor-pointer appearance-none pr-10`;

const statusOptions = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'review', label: 'Review' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];
const categoryOptions = ['Coding', 'Design', 'Homework', 'Other'];

const fieldSuggestMinChars = 8;
const fieldSuggestDebounceMs = 600;

const SelectChevron = () => (
  <FiChevronDown
    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-gray-500"
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
  const [suggestionPrompt, setSuggestionPrompt] = useState('');
  const [suggestionDraft, setSuggestionDraft] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [fieldSuggestReason, setFieldSuggestReason] = useState('');
  const categoryManualRef = useRef(false);
  const priorityManualRef = useRef(false);
  const fieldSuggestSeqRef = useRef(0);
  const submitHandler = onAddTask || onSubmit;
  const submitting = Boolean(isSubmitting || isLoading);

  useEffect(() => {
    if (!initialValues) {
      categoryManualRef.current = false;
      priorityManualRef.current = false;
      setFieldSuggestReason('');
      return;
    }
    categoryManualRef.current = true;
    priorityManualRef.current = true;
    setFieldSuggestReason('');
  }, [initialValues]);

  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title || '');
    setDescription(initialValues.description || '');
    setCategoryId(initialValues.categoryId || '');
    setPriority(initialValues.priority || 'medium');
    setStatus(initialValues.status || 'todo');
    setDueDate(formatDateInputValue(initialValues.dueDate));
  }, [initialValues]);

  useEffect(() => {
    if (initialValues) return;

    const combined = `${title} ${description}`.trim();
    if (combined.length < fieldSuggestMinChars) {
      setFieldSuggestReason('');
      return undefined;
    }

    const timer = setTimeout(async () => {
      const seq = ++fieldSuggestSeqRef.current;
      try {
        const { data } = await insightsService.getTaskFieldSuggestions({
          draftTitle: title.trim(),
          draftDescription: description.trim()
        });
        if (fieldSuggestSeqRef.current !== seq) return;
        if (!categoryManualRef.current && data?.category) {
          setCategoryId(data.category);
        }
        if (!priorityManualRef.current && data?.priority) {
          setPriority(data.priority);
        }
        setFieldSuggestReason(typeof data?.reason === 'string' ? data.reason : '');
      } catch {
        if (fieldSuggestSeqRef.current !== seq) return;
        setFieldSuggestReason('');
      }
    }, fieldSuggestDebounceMs);

    return () => clearTimeout(timer);
  }, [title, description, initialValues]);

  const handleSuggestTaskDraft = async () => {
    setIsSuggesting(true);
    try {
      const response = await insightsService.getTaskDraftSuggestion({
        prompt: suggestionPrompt.trim(),
        draftTitle: title.trim(),
        draftDescription: description.trim()
      });
      setSuggestionDraft(response.data);
    } catch (err) {
      setSuggestionDraft(null);
      const msg = err.response?.data?.message || err.message || 'Could not generate a suggestion.';
      toast.error(msg);
    } finally {
      setIsSuggesting(false);
    }
  };

  const applySuggestionDraft = () => {
    if (!suggestionDraft) return;
    setTitle(suggestionDraft.title || '');
    setDescription(suggestionDraft.description || '');
    setCategoryId(suggestionDraft.category || '');
    setPriority(suggestionDraft.priority || 'medium');
    setStatus(suggestionDraft.status || 'todo');
    setDueDate(formatDateInputValue(suggestionDraft.dueDate));
    setSuggestionDraft(null);
  };

  const rejectSuggestionDraft = () => {
    setSuggestionDraft(null);
  };

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
      categoryManualRef.current = false;
      priorityManualRef.current = false;
      setFieldSuggestReason('');
      onSuccess?.();
    } catch {
      // Parent handles toast / state; keep modal open
    }
  };

  const formClass =
    variant === 'modal'
      ? 'space-y-5'
      : 'mb-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-[#111420]';
  const buttonLabel = submitting ? 'Saving...' : submitLabel || '+ Add Task';

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <div>
        <label htmlFor="task-title" className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
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
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400"
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

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-[#0d0f14]">
        <label
          htmlFor="ai-task-prompt"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400"
        >
          AI task suggestion (optional)
        </label>
        <div className="space-y-2">
          <input
            id="ai-task-prompt"
            type="text"
            className={inputClass}
            placeholder="e.g. suggest my next task for today"
            value={suggestionPrompt}
            onChange={(e) => setSuggestionPrompt(e.target.value)}
          />
          <button
            type="button"
            onClick={handleSuggestTaskDraft}
            disabled={isSuggesting || submitting}
            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-500/20 disabled:opacity-60"
          >
            {isSuggesting ? 'Generating suggestion...' : 'Suggest task with AI'}
          </button>
        </div>
        {suggestionDraft ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#111420]">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-500">Suggested draft</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{suggestionDraft.title}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{suggestionDraft.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-700 dark:text-gray-300">
              <span className="rounded border border-slate-200 px-2 py-1 dark:border-white/10">Priority: {suggestionDraft.priority}</span>
              <span className="rounded border border-slate-200 px-2 py-1 dark:border-white/10">Status: {suggestionDraft.status}</span>
              <span className="rounded border border-slate-200 px-2 py-1 dark:border-white/10">Category: {suggestionDraft.category}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-gray-500">{suggestionDraft.reason}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={applySuggestionDraft}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Accept suggestion
              </button>
              <button
                type="button"
                onClick={rejectSuggestionDraft}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Reject
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="task-category" className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Category
          </label>
          <div className="relative">
            <select
              id="task-category"
              value={categoryId}
              onChange={(e) => {
                categoryManualRef.current = true;
                setCategoryId(e.target.value);
              }}
              className={selectClass}
            >
              <option value="">Select a category</option>
              {categoryOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div>
          <label htmlFor="task-priority" className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Priority
          </label>
          <div className="relative">
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => {
                priorityManualRef.current = true;
                setPriority(e.target.value);
              }}
              className={selectClass}
            >
              {priorityOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>
      </div>

      {fieldSuggestReason && !initialValues ? (
        <p className="text-xs leading-relaxed text-slate-500 dark:text-gray-500">{fieldSuggestReason}</p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="task-status" className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Status
          </label>
          <div className="relative">
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div>
          <label htmlFor="task-due" className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
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
