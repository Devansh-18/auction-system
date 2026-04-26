import { Router } from 'express';
import { submitBid } from '../controllers/bidController.js';

const router = Router();

/**
 * Bid Routes
 * POST /api/rfq/:id/bid - Submit a bid for a specific RFQ
 */

router.post('/:id/bid', submitBid);

export default router;
