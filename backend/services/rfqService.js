import RFQ from '../models/RFQ.js';
import Bid from '../models/Bid.js';
import { getLogsByRFQ } from './activityLogService.js';

/**
 * RFQ Service
 * Handles RFQ creation, retrieval, and status computation.
 */

/**
 * Compute the current status of an RFQ based on server time.
 * Uses server time only — never trust client time.
 * @param {Object} rfq - The RFQ document
 * @returns {string} - SCHEDULED | ACTIVE | CLOSED | FORCE_CLOSED
 */
export const computeStatus = (rfq) => {
  const now = new Date();
  const start = new Date(rfq.bidStartTime);
  const close = new Date(rfq.bidCloseTime);
  const forcedClose = new Date(rfq.forcedCloseTime);

  if (now >= forcedClose) return 'FORCE_CLOSED';
  if (now >= close) return 'CLOSED';
  if (now >= start) return 'ACTIVE';
  return 'SCHEDULED';
};

/**
 * Create a new RFQ with validation.
 * Validates that forcedCloseTime > bidCloseTime.
 * @param {Object} data - RFQ creation data
 */
export const createRFQ = async (data) => {
  const { bidStartTime, bidCloseTime, forcedCloseTime } = data;

  // Validation: bidCloseTime must be greater than bidStartTime
  if (new Date(bidCloseTime) <= new Date(bidStartTime)) {
    const error = new Error('Bid close time must be greater than bid start time');
    error.statusCode = 400;
    throw error;
  }

  // Validation: forcedCloseTime must be greater than bidCloseTime
  if (new Date(forcedCloseTime) <= new Date(bidCloseTime)) {
    const error = new Error('Forced close time must be greater than bid close time');
    error.statusCode = 400;
    throw error;
  }

  const rfq = new RFQ(data);
  await rfq.save();

  // Set computed status
  const rfqObj = rfq.toObject();
  rfqObj.status = computeStatus(rfq);

  return rfqObj;
};

/**
 * Get all RFQs with computed status and current lowest bid.
 */
export const getAllRFQs = async () => {
  const rfqs = await RFQ.find().sort({ createdAt: -1 });

  const result = await Promise.all(
    rfqs.map(async (rfq) => {
      const rfqObj = rfq.toObject();
      rfqObj.status = computeStatus(rfq);

      // Get the lowest bid for this RFQ
      const lowestBid = await Bid.findOne({ rfqId: rfq.rfqId })
        .sort({ totalCost: 1 })
        .lean();

      rfqObj.lowestBid = lowestBid ? lowestBid.totalCost : null;
      rfqObj.lowestBidSupplier = lowestBid ? lowestBid.supplierName : null;

      return rfqObj;
    })
  );

  return result;
};

/**
 * Get an RFQ by ID with all bids (ranked) and activity logs.
 * @param {string} rfqId - The RFQ identifier
 */
export const getRFQById = async (rfqId) => {
  const rfq = await RFQ.findOne({ rfqId });

  if (!rfq) {
    const error = new Error('RFQ not found');
    error.statusCode = 404;
    throw error;
  }

  const rfqObj = rfq.toObject();
  rfqObj.status = computeStatus(rfq);

  // Fetch all bids sorted by totalCost ascending for ranking
  const bids = await Bid.find({ rfqId }).sort({ totalCost: 1 }).lean();

  // Assign rankings (L1, L2, L3...)
  const rankedBids = bids.map((bid, index) => ({
    ...bid,
    rank: `L${index + 1}`,
  }));

  // Fetch activity logs
  const logs = await getLogsByRFQ(rfqId);

  return {
    rfq: rfqObj,
    bids: rankedBids,
    logs,
  };
};
