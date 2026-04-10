import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import TaskTableRowSkeleton from './TaskTableRowSkeleton';

const tableHead = (
  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-[#121726] dark:text-gray-500">
    <tr>
      <th className="w-12 px-4 py-3" aria-hidden />
      <th className="px-4 py-3">Title</th>
      <th className="min-w-[140px] whitespace-nowrap px-4 py-3">Deadline</th>
      <th className="min-w-[140px] whitespace-nowrap px-4 py-3">Importance</th>
      <th className="min-w-[140px] whitespace-nowrap px-4 py-3">Status</th>
      <th className="min-w-[140px] whitespace-nowrap px-4 py-3">Date</th>
      <th className="w-16 whitespace-nowrap px-4 py-3 text-right">Actions</th>
    </tr>
  </thead>
);

const TaskCardSkeleton = () => (
  <div className="p-3.5">
    <div className="flex gap-3">
      <Skeleton
        variant="rectangular"
        width={16}
        height={16}
        sx={{ borderRadius: '4px', flexShrink: 0, mt: 0.5 }}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton variant="text" width="78%" height={22} sx={{ maxWidth: 280 }} />
          <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px', flexShrink: 0 }} />
        </div>
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="55%" height={14} />
        <div className="flex flex-wrap gap-2 pt-0.5">
          <Skeleton variant="rounded" width={56} height={22} sx={{ borderRadius: 9999 }} />
          <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 9999 }} />
          <Skeleton variant="text" width={72} height={16} />
        </div>
      </div>
    </div>
  </div>
);

const TaskSectionSkeleton = ({ titleWidth, rowCount = 4, cardRowCount = 3 }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between gap-3 lg:block">
      <Skeleton variant="text" width={titleWidth} height={18} />
      <div className="flex items-center gap-2 lg:hidden">
        <Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: '4px' }} />
        <Skeleton variant="text" width={24} height={14} />
      </div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/5 dark:bg-[#0f1320]">
      <div className="divide-y divide-slate-100 dark:divide-white/[0.06] lg:hidden">
        {Array.from({ length: cardRowCount }, (_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
      <div className="hidden overflow-x-auto lg:block">
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
  <div className="space-y-4 lg:space-y-6">
    <TaskSectionSkeleton titleWidth={100} rowCount={2} cardRowCount={2} />
    <TaskSectionSkeleton titleWidth={140} rowCount={5} cardRowCount={3} />
    <TaskSectionSkeleton titleWidth={120} rowCount={3} cardRowCount={2} />
  </div>
);

export default TasksPageSkeleton;
