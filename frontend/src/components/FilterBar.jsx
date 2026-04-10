import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

const FilterBar = ({
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  hideCompleted,
  setHideCompleted,
}) => {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 pt-1 dark:border-white/[0.06] md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {['all', 'high', 'medium', 'low'].map((priority) => (
          <button
            key={priority}
            type="button"
            className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs transition-all duration-150 ${priorityFilter === priority
                ? 'border border-slate-300 bg-slate-100 font-medium text-slate-900 ring-1 ring-inset ring-slate-200 dark:border-white/10 dark:bg-white/[0.08] dark:text-white dark:ring-white/[0.06]'
                : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/5 dark:text-gray-500 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.03] dark:hover:text-gray-300'
              }`}
            onClick={() => setPriorityFilter(priority)}
          >
            {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-5 md:gap-6">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-500">Sort</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort tasks"
              className="app-select min-w-[9.5rem] cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-10 text-sm font-medium text-slate-800 ring-1 ring-inset ring-slate-200/80 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:border-white/5 dark:bg-[#0d0f14] dark:text-gray-200 dark:ring-white/[0.04] dark:hover:border-white/10 dark:hover:bg-[#111420]"
            >
              <option value="newest">Newest</option>
              <option value="priority">Priority</option>
            </select>
            <FiChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-gray-500"
              aria-hidden
            />
          </div>
        </div>

        <label className="group inline-flex cursor-pointer select-none items-center gap-2.5 text-xs text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-400">
          <span className="relative flex h-4 w-4 items-center justify-center">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all checked:border-blue-500/50 checked:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 focus:ring-offset-white dark:border-white/10 dark:bg-[#0d0f14] dark:focus:ring-offset-[#0d0f14]"
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M2 6l3 3 5-6" />
            </svg>
          </span>
          Hide completed
        </label>
      </div>
    </div>
  );
};

export default FilterBar;
