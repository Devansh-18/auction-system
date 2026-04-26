import * as rfqService from '../services/rfqService.js';

/**
 * RFQ Controller
 * Handles HTTP request/response for RFQ endpoints.
 */

/**
 * POST /api/rfq - Create a new RFQ
 */
export const createRFQ = async (req, res, next) => {
  try {
    const rfq = await rfqService.createRFQ(req.body);
    res.status(201).json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rfq - Get all RFQs with computed status and lowest bid
 */
export const getAllRFQs = async (req, res, next) => {
  try {
    const rfqs = await rfqService.getAllRFQs();
    res.status(200).json({
      success: true,
      count: rfqs.length,
      data: rfqs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rfq/:id - Get RFQ details with bids and logs
 */
export const getRFQDetails = async (req, res, next) => {
  try {
    const result = await rfqService.getRFQById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
