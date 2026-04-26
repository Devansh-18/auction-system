import axios from 'axios';

/**
 * API client for communicating with the backend.
 * All API functions are centralized here.
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a new RFQ
 * @param {Object} data - RFQ creation payload
 */
export const createRFQ = async (data) => {
  const response = await api.post('/rfq', data);
  return response.data;
};

/**
 * Get all RFQs with computed status and lowest bid
 */
export const getAllRFQs = async () => {
  const response = await api.get('/rfq');
  return response.data;
};

/**
 * Get RFQ details by ID (includes bids + logs)
 * @param {string} rfqId - The RFQ identifier
 */
export const getRFQById = async (rfqId) => {
  const response = await api.get(`/rfq/${rfqId}`);
  return response.data;
};

// ==================== Bid APIs ====================

/**
 * Submit a bid for a specific RFQ
 * @param {string} rfqId - The RFQ identifier
 * @param {Object} bidData - Bid details
 */
export const submitBid = async (rfqId, bidData) => {
  const response = await api.post(`/rfq/${rfqId}/bid`, bidData);
  return response.data;
};
