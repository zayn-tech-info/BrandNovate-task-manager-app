import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

const KpiCardSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-[#111420] p-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="min-w-0 flex-1">
        <Skeleton variant="text" width="55%" height={14} />
        <Skeleton variant="text" width="40%" height={28} sx={{ mt: 0.5 }} />
      </div>
    </div>
  </div>
);

const MiniListSkeleton = ({ rows = 3 }) => (
  <div className="rounded-2xl border border-white/10 bg-[#111420] p-4">
    <Skeleton variant="text" width={140} height={20} />
    <div className="mt-3 space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="rounded-lg border border-white/5 bg-[#0d1018] px-3 py-2">
          <Skeleton variant="text" width="90%" height={18} />
          <Skeleton variant="text" width="45%" height={14} sx={{ mt: 0.75 }} />
        </div>
      ))}
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-[#111420] p-4">
    <Skeleton variant="text" width={120} height={20} />
    <div className="mt-3 space-y-2">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="rounded-lg border border-white/5 bg-[#0d1018] px-3 py-2">
          <Skeleton variant="text" width="85%" height={18} />
          <Skeleton variant="text" width="55%" height={12} sx={{ mt: 0.75 }} />
        </div>
      ))}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Skeleton variant="text" width={200} height={36} />
        <Skeleton variant="text" width={280} height={20} sx={{ mt: 1 }} />
      </div>
      <Skeleton variant="rounded" width={160} height={44} sx={{ borderRadius: '12px' }} />
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }, (_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <MiniListSkeleton rows={3} />
      <MiniListSkeleton rows={3} />
      <ActivitySkeleton />
    </div>

    <div className="rounded-2xl border border-white/10 bg-[#111420] p-4">
      <Box className="mb-3 flex items-center justify-between">
        <Skeleton variant="text" width={200} height={22} />
        <Skeleton variant="text" width={56} height={16} />
      </Box>
      <div className="grid grid-cols-7 gap-2">
        {[20, 32, 16, 28, 18, 24, 88].map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end rounded-md bg-[#0d1018] p-1">
              <Skeleton variant="rounded" sx={{ width: '100%', height: h, borderRadius: '4px' }} />
            </div>
            <Skeleton variant="text" width={28} height={12} />
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-[#111420] p-4">
      <Box className="mb-3 flex items-center justify-between">
        <Skeleton variant="text" width={120} height={22} />
        <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 9999 }} />
      </Box>
      <Skeleton variant="text" width="95%" height={20} />
      <Skeleton variant="text" width="78%" height={20} sx={{ mt: 1 }} />
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-white/5 bg-[#0d1018] p-3">
          <Box className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton variant="text" width="70%" height={20} />
              <Skeleton variant="text" width="90%" height={16} sx={{ mt: 1 }} />
              <Skeleton variant="text" width={100} height={16} sx={{ mt: 1.5 }} />
            </div>
            <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: 9999 }} />
          </Box>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
