import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

const TaskTableRowSkeleton = () => (
  <tr className="border-b border-slate-100 dark:border-white/[0.04]">
    <td className="px-4 py-3 align-middle">
      <Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: '4px' }} />
    </td>
    <td className="px-4 py-3 align-middle">
      <Skeleton variant="text" width="72%" height={22} sx={{ maxWidth: 280 }} />
      <Skeleton variant="text" width="48%" height={16} sx={{ maxWidth: 200, mt: 0.5 }} />
    </td>
    <td className="px-4 py-3 align-middle whitespace-nowrap">
      <Skeleton variant="text" width={88} height={20} />
    </td>
    <td className="px-4 py-3 align-middle whitespace-nowrap">
      <Skeleton variant="rounded" width={72} height={26} sx={{ borderRadius: 9999 }} />
    </td>
    <td className="px-4 py-3 align-middle whitespace-nowrap">
      <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: 9999 }} />
    </td>
    <td className="px-4 py-3 align-middle whitespace-nowrap">
      <Skeleton variant="text" width={88} height={20} />
    </td>
    <td className="px-4 py-3 align-middle">
      <Box className="flex items-center justify-end gap-2">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} variant="circular" width={32} height={32} />
        ))}
      </Box>
    </td>
  </tr>
);

export default TaskTableRowSkeleton;
