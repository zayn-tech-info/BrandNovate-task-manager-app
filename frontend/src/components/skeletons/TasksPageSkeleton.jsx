import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import TaskTableRowSkeleton from './TaskTableRowSkeleton';

const tableHead = (
  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-[#121726] dark:text-gray-500">
    <tr>
      <th className="w-12 px-4 py-3" aria-hidden />
      <th className="px-4 py-3">Title</th>
      <th className="min-w-[140px] px-4 py-3 whitespace-nowrap">Deadline</th>
      <th className="min-w-[140px] px-4 py-3 whitespace-nowrap">Importance</th>
      <th className="min-w-[140px] px-4 py-3 whitespace-nowrap">Status</th>
      <th className="min-w-[140px] px-4 py-3 whitespace-nowrap">Date</th>
      <th className="w-[220px] px-4 py-3 text-right whitespace-nowrap">Actions</th>
    </tr>
  </thead>
);

const TaskSectionSkeleton = ({ titleWidth, rowCount = 4 }) => (
  <section className="space-y-3">
    <Skeleton variant="text" width={titleWidth} height={18} />
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/5 dark:bg-[#0f1320]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          {tableHead}
          <tbody>
            {Array.from({ length: rowCount }, (_, i) => (
              <TaskTableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

const TasksPageSkeleton = () => (
  <div className="space-y-6">
    <TaskSectionSkeleton titleWidth={100} rowCount={2} />
    <TaskSectionSkeleton titleWidth={140} rowCount={5} />
    <TaskSectionSkeleton titleWidth={120} rowCount={3} />
  </div>
);

export default TasksPageSkeleton;
