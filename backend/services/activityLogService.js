import ActivityLog from '../models/ActivityLog.js';

/**
 * Activity Log Service
 * Handles creation and retrieval of auction event logs.
 */

/**
 * Log an event for an RFQ.
 * @param {string} rfqId - The RFQ identifier
 * @param {string} eventType - BID_PLACED | EXTENSION | RANK_CHANGE
 * @param {string} description - Human-readable event description
 */
export const logEvent = async (rfqId, eventType, description) => {
  const log = new ActivityLog({
    rfqId,
    eventType,
    description,
    timestamp: new Date(),
  });
  await log.save();
  return log;
};

/**
 * Get all activity logs for an RFQ, sorted by newest first.
 * @param {string} rfqId - The RFQ identifier
 */
export const getLogsByRFQ = async (rfqId) => {
  return ActivityLog.find({ rfqId }).sort({ timestamp: -1 });
};
