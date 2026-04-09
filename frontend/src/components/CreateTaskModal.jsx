import React, { useMemo, useEffect } from 'react';
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
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-modal-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/5 bg-[#111420] p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="create-task-modal-title" className="text-lg font-semibold text-white">
            {heading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
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
