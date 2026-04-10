import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

const AppShellSkeleton = () => (
  <div className="flex h-screen bg-[#0d0f14]">
    <aside className="hidden w-64 flex-col border-r border-white/5 bg-[#0a0b0f] lg:flex">
      <Box className="flex h-16 items-center justify-center border-b border-white/5">
        <Skeleton variant="text" width={100} height={28} />
      </Box>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Skeleton variant="rounded" height={48} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" height={48} sx={{ borderRadius: '8px' }} />
      </div>
      <div className="p-4">
        <Skeleton variant="rounded" height={48} sx={{ borderRadius: '8px' }} />
      </div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="z-10 border-b border-white/5 bg-[#0a0b0f]">
        <div className="flex items-center justify-between px-6 py-3">
          <Skeleton variant="circular" width={40} height={40} />
          <Box className="flex items-center gap-3">
            <Skeleton variant="rounded" width={40} height={36} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width={80} height={20} sx={{ display: { xs: 'none', md: 'block' } }} />
          </Box>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-[#0d0f14] px-6 py-4">
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px', mb: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: '16px' }} />
      </main>
    </div>
  </div>
);

export default AppShellSkeleton;
