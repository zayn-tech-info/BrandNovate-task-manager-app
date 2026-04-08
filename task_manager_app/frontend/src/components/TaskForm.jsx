import React, { useState } from 'react';

const TaskForm = ({ onAddTask, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAddTask({
      title: title.trim(),
      description: description.trim()
    });

    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-4 space-y-3">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          What needs to get done?
        </label>
        <input
          id="title"
          type="text"
          className="input"
          placeholder="Fix login bug"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Add a description (optional)
        </label>
        <textarea
          id="description"
          className="input min-h-[96px]"
          placeholder="Describe the task details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : '+ Add Task'}
      </button>
    </form>
  );
};

export default TaskForm;
