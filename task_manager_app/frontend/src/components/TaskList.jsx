import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ title, tasks, onToggleComplete, onDelete }) => {
  if (!tasks.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task._id || task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
};

export default TaskList;
