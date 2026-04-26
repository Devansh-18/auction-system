import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Activity Log Schema
 * Tracks all auction events: bids placed, extensions, rank changes.
 */
const activityLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  rfqId: {
    type: String,
    required: [true, 'RFQ ID is required'],
    index: true,
  },
  eventType: {
    type: String,
    enum: {
      values: ['BID_PLACED', 'EXTENSION', 'RANK_CHANGE'],
      message: 'Invalid event type: {VALUE}',
    },
    required: [true, 'Event type is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for fetching logs by RFQ in chronological order
activityLogSchema.index({ rfqId: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
