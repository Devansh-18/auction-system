import React from 'react';

/**
 * StatusBadge Component
 * Displays a color-coded status pill for RFQ status.
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    SCHEDULED: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    ACTIVE: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-500',
    },
    CLOSED: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      dot: 'bg-gray-500',
    },
    FORCE_CLOSED: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500',
    },
  };

  const config = statusConfig[status] || statusConfig.CLOSED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {status === 'FORCE_CLOSED' ? 'Force Closed' : status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

export default StatusBadge;
