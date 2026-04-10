import React, { useMemo, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import TaskForm from './TaskForm';

const CreateTaskModal = ({
  open,
  onClose,
  onAddTask,
  isSubmitting,
  mode = 'create',
  initialTask = null
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !dialogRef.current) return undefined;

    const root = dialogRef.current;
    const previouslyFocused = document.activeElement;
    const selector =
      'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () => Array.from(root.querySelectorAll(selector));

    const focusables = getFocusable();
    (focusables[0] || root).focus();

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const nodes = getFocusable();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    root.addEventListener('keydown', onKeyDown);
    return () => {
      root.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus();
        } catch {}
      }
    };
  }, [open]);

  const initialValues = useMemo(() => {
    if (!initialTask) return null;
    return {
      title: initialTask.title || '',
      description: initialTask.description || '',
      categoryId: typeof initialTask.category === 'string' ? initialTask.category : '',
      priority: initialTask.priority || 'medium',
      status: initialTask.status || 'todo',
      dueDate: initialTask.dueDate || ''
    };
  }, [initialTask]);

  const isEditMode = mode === 'edit';
  const heading = isEditMode ? 'Edit task' : 'New task';
  const submitLabel = isEditMode ? 'Save changes' : '+ Add Task';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-modal-title"
        tabIndex={-1}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 outline-none dark:border-white/5 dark:bg-[#111420]"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="create-task-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {heading}
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

        <TaskForm
          onAddTask={onAddTask}
          isSubmitting={isSubmitting}
          onSuccess={onClose}
          variant="modal"
          initialValues={initialValues}
          submitLabel={submitLabel}
        />
      </div>
    </div>
  );
};

export default CreateTaskModal;
