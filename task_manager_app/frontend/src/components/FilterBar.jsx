import React from 'react';

const FilterBar = ({
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  hideCompleted,
  setHideCompleted
}) => {
  return (
    <div className="card mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {['all', 'high', 'medium', 'low'].map((priority) => (
          <button
            key={priority}
            className={`rounded-md px-3 py-1.5 text-sm ${
              priorityFilter === priority
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setPriorityFilter(priority)}
          >
            {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600 dark:text-slate-300">
          Sort:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="newest">Newest</option>
            <option value="priority">Priority</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700"
          />
          Hide completed
        </label>
      </div>
    </div>
  );
};

export default FilterBar;
