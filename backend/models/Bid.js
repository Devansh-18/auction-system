import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Bid Schema
 * Represents a supplier's bid on an RFQ.
 * totalCost is computed as the sum of freight, origin, and destination charges.
 */
const bidSchema = new mongoose.Schema({
  bidId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  rfqId: {
    type: String,
    required: [true, 'RFQ ID is required'],
    index: true,
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
  },
  freightCharges: {
    type: Number,
    required: [true, 'Freight charges are required'],
    min: [0, 'Freight charges cannot be negative'],
  },
  originCharges: {
    type: Number,
    required: [true, 'Origin charges are required'],
    min: [0, 'Origin charges cannot be negative'],
  },
  destinationCharges: {
    type: Number,
    required: [true, 'Destination charges are required'],
    min: [0, 'Destination charges cannot be negative'],
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  transitTime: {
    type: Number, // in days
    required: [true, 'Transit time is required'],
    min: [1, 'Transit time must be at least 1 day'],
  },
  validity: {
    type: String,
    required: [true, 'Validity is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to compute totalCost
bidSchema.pre('save', function () {
  this.totalCost = this.freightCharges + this.originCharges + this.destinationCharges;
});

// Indexes for efficient querying
bidSchema.index({ rfqId: 1, totalCost: 1 });
bidSchema.index({ createdAt: -1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
