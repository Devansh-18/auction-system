import React from 'react';

/**
 * ActivityLog Component
 * Displays a timeline of auction events (bids, extensions, rank changes).
 */
const ActivityLog = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No activity yet.</p>
      </div>
    );
  }

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'BID_PLACED':
        return { icon: '📩', color: 'bg-blue-100 text-blue-600' };
      case 'EXTENSION':
        return { icon: '⏰', color: 'bg-amber-100 text-amber-600' };
      case 'RANK_CHANGE':
        return { icon: '🔄', color: 'bg-purple-100 text-purple-600' };
      default:
        return { icon: '📋', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const { icon, color } = getEventIcon(log.eventType);
        return (
          <div
            key={log.logId}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${color}`}>
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {log.eventType.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{log.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityLog;
