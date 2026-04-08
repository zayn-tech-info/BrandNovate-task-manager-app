import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import AiBadge from './AiBadge';

const isCompleted = (task) => task.completed === true || task.status === 'completed';

const TaskCard = ({ task, onToggleComplete, onDelete }) => {
  return (
    <div className="card flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isCompleted(task)}
          onChange={() => onToggleComplete(task)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700"
        />
        <div>
          <p className={`font-medium ${isCompleted(task) ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
            {task.title}
          </p>
          {task.description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.description}</p>
          ) : null}
          <div className="mt-2">
            <AiBadge task={task} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(task)}
        className="text-slate-500 hover:text-red-500 dark:text-slate-400"
        aria-label="Delete task"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
};

export default TaskCard;
