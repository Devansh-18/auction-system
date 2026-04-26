import Bid from '../models/Bid.js';
import RFQ from '../models/RFQ.js';
import { computeStatus } from './rfqService.js';
import { logEvent } from './activityLogService.js';

/**
 * Bid Service
 * Handles bid submission, ranking computation, and the extension engine.
 * This is the most critical service in the application.
 */

/**
 * Submit a new bid for an RFQ.
 * Handles the complete bidding flow:
 * 1. Validate RFQ is ACTIVE
 * 2. Reject if past close/forced close time
 * 3. Compute totalCost and save bid
 * 4. Compute rankings
 * 5. Detect rank changes / L1 changes
 * 6. Run extension engine
 * 7. Log events
 *
 * @param {string} rfqId - The RFQ identifier
 * @param {Object} bidData - The bid details from the request
 * @returns {Promise<Object>} - The saved bid with ranking info
 */
export const submitBid = async (rfqId, bidData) => {
  // Step 1: Fetch the RFQ
  const rfq = await RFQ.findOne({ rfqId });
  if (!rfq) {
    const error = new Error('RFQ not found');
    error.statusCode = 404;
    throw error;
  }

  // Step 2: Use server time only — never trust client time
  const now = new Date();

  // Step 3: Compute current status
  const currentStatus = computeStatus(rfq);
  if (currentStatus !== 'ACTIVE') {
    const error = new Error(
      `Cannot place bid. RFQ status is ${currentStatus}. Bids are only accepted when status is ACTIVE.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Step 4: Additional time checks for safety
  if (now > new Date(rfq.bidCloseTime)) {
    const error = new Error('Bid close time has passed. No more bids accepted.');
    error.statusCode = 400;
    throw error;
  }
  if (now > new Date(rfq.forcedCloseTime)) {
    const error = new Error('Forced close time has passed. Auction is permanently closed.');
    error.statusCode = 400;
    throw error;
  }

  // Step 5: Capture previous rankings BEFORE saving new bid
  // This snapshot is critical for rank change detection
  const previousBids = await Bid.find({ rfqId }).sort({ totalCost: 1 }).lean();
  const previousL1 = previousBids.length > 0 ? previousBids[0].supplierName : null;
  const previousRankMap = {};
  previousBids.forEach((bid, index) => {
    previousRankMap[bid.bidId] = index + 1; // rank 1, 2, 3...
  });

  // Step 6: Create or update the bid (totalCost computed in pre-save hook)
  let newBid = await Bid.findOne({ rfqId, supplierName: bidData.supplierName });
  if (newBid) {
    newBid.freightCharges = bidData.freightCharges;
    newBid.originCharges = bidData.originCharges;
    newBid.destinationCharges = bidData.destinationCharges;
    newBid.transitTime = bidData.transitTime;
    newBid.validity = bidData.validity;
    await newBid.save();
  } else {
    newBid = new Bid({
      rfqId,
      supplierName: bidData.supplierName,
      freightCharges: bidData.freightCharges,
      originCharges: bidData.originCharges,
      destinationCharges: bidData.destinationCharges,
      transitTime: bidData.transitTime,
      validity: bidData.validity,
    });
    await newBid.save();
  }

  // Step 7: Compute new rankings
  const newBids = await Bid.find({ rfqId }).sort({ totalCost: 1 }).lean();
  const newL1 = newBids.length > 0 ? newBids[0].supplierName : null;
  const newRankMap = {};
  newBids.forEach((bid, index) => {
    newRankMap[bid.bidId] = index + 1;
  });

  // Step 8: Detect rank changes
  let anyRankChanged = false;
  let l1Changed = false;

  // Check if any existing bid's rank changed
  for (const bid of previousBids) {
    if (previousRankMap[bid.bidId] !== newRankMap[bid.bidId]) {
      anyRankChanged = true;
      break;
    }
  }

  // Check if L1 (lowest bidder) changed
  if (previousL1 !== null && previousL1 !== newL1) {
    l1Changed = true;
    anyRankChanged = true; // L1 change implies rank change
  }

  // If this is the first bid, there's no rank change
  if (previousBids.length === 0) {
    anyRankChanged = false;
    l1Changed = false;
  }

  // Step 9: Log bid placed event
  await logEvent(
    rfqId,
    'BID_PLACED',
    `Bid placed by ${bidData.supplierName} with total cost ₹${newBid.totalCost}`
  );

  // Step 10: Log rank change if detected
  if (anyRankChanged) {
    await logEvent(
      rfqId,
      'RANK_CHANGE',
      l1Changed
        ? `L1 changed from ${previousL1} to ${newL1}`
        : `Ranking positions changed after bid by ${bidData.supplierName}`
    );
  }

  // Step 11: Run Extension Engine
  await runExtensionEngine(rfq, anyRankChanged, l1Changed);

  // Step 12: Return the new bid with ranking info
  const rankedBids = newBids.map((bid, index) => ({
    ...bid,
    rank: `L${index + 1}`,
  }));

  return {
    bid: {
      ...newBid.toObject(),
      rank: `L${newRankMap[newBid.bidId]}`,
    },
    rankings: rankedBids,
    extensionApplied: false, // Will be updated by extension engine context
  };
};

/**
 * Extension Engine (CRITICAL)
 *
 * Determines whether the auction close time should be extended
 * based on the trigger window, trigger type, and current conditions.
 *
 * Steps:
 * 1. Check if current time is within trigger window
 * 2. Evaluate trigger condition (BID_RECEIVED / ANY_RANK_CHANGE / L1_CHANGE)
 * 3. Compute new close time with forced close cap
 * 4. Atomically update RFQ bidCloseTime
 * 5. Log extension event
 *
 * @param {Object} rfq - The RFQ document
 * @param {boolean} anyRankChanged - Whether any rank positions changed
 * @param {boolean} l1Changed - Whether the L1 (lowest) bidder changed
 */
const runExtensionEngine = async (rfq, anyRankChanged, l1Changed) => {
  const now = new Date();
  const bidCloseTime = new Date(rfq.bidCloseTime);
  const forcedCloseTime = new Date(rfq.forcedCloseTime);
  const triggerWindowMs = rfq.triggerWindow * 60 * 1000; // convert minutes to ms
  const extensionMs = rfq.extensionDuration * 60 * 1000; // convert minutes to ms

  // Step 1: Check if current time is within the trigger window
  const triggerWindowStart = new Date(bidCloseTime.getTime() - triggerWindowMs);

  if (now < triggerWindowStart) {
    // Not within trigger window — no extension needed
    return;
  }

  // Step 2: Unconditionally trigger extension since any bid within the window counts
  const conditionMet = true;
  const reason = 'Bid received within trigger window';

  // Step 3: Calculate new close time
  let newCloseTime = new Date(bidCloseTime.getTime() + extensionMs);

  // Step 4: Apply forced close time cap — auction must NEVER exceed forcedCloseTime
  if (newCloseTime > forcedCloseTime) {
    newCloseTime = forcedCloseTime;
  }

  // Step 5: Atomically update the RFQ bidCloseTime
  // Using findOneAndUpdate for atomic operation to handle concurrency
  await RFQ.findOneAndUpdate(
    { rfqId: rfq.rfqId },
    { $set: { bidCloseTime: newCloseTime } },
    { new: true }
  );

  // Step 6: Log the extension event with detailed reason
  const extensionMinutes = rfq.extensionDuration;
  await logEvent(
    rfq.rfqId,
    'EXTENSION',
    `Auction extended by ${extensionMinutes} min. Reason: ${reason}. ` +
      `New close time: ${newCloseTime.toISOString()}` +
      (newCloseTime.getTime() === forcedCloseTime.getTime()
        ? ' (capped at forced close time)'
        : '')
  );
};
