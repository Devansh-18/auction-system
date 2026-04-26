import * as bidService from '../services/bidService.js';

/**
 * Bid Controller
 * Handles HTTP request/response for bid submission.
 */

/**
 * POST /api/rfq/:id/bid - Submit a new bid
 */
export const submitBid = async (req, res, next) => {
  try {
    const result = await bidService.submitBid(req.params.id, req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
