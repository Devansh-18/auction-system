import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * RFQ Schema
 * Represents a Request for Quotation with British Auction settings.
 */
const rfqSchema = new mongoose.Schema(
  {
    rfqId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'RFQ name is required'],
      trim: true,
    },
    bidStartTime: {
      type: Date,
      required: [true, 'Bid start time is required'],
    },
    bidCloseTime: {
      type: Date,
      required: [true, 'Bid close time is required'],
    },
    forcedCloseTime: {
      type: Date,
      required: [true, 'Forced close time is required'],
    },
    triggerWindow: {
      type: Number, // in minutes
      required: [true, 'Trigger window is required'],
      min: [1, 'Trigger window must be at least 1 minute'],
    },
    extensionDuration: {
      type: Number, // in minutes
      required: [true, 'Extension duration is required'],
      min: [1, 'Extension duration must be at least 1 minute'],
    },

    status: {
      type: String,
      enum: ['SCHEDULED', 'ACTIVE', 'CLOSED', 'FORCE_CLOSED'],
      default: 'SCHEDULED',
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Index for efficient querying
rfqSchema.index({ createdAt: -1 });

const RFQ = mongoose.model('RFQ', rfqSchema);

export default RFQ;
