import { Router } from 'express';
import { createRFQ, getAllRFQs, getRFQDetails } from '../controllers/rfqController.js';

const router = Router();

/**
 * RFQ Routes
 * POST   /api/rfq     - Create a new RFQ
 * GET    /api/rfq     - List all RFQs
 * GET    /api/rfq/:id - Get RFQ details with bids and logs
 */

router.post('/', createRFQ);
router.get('/', getAllRFQs);
router.get('/:id', getRFQDetails);

export default router;
