import { Router } from 'express';
import {
  createConnectionRequests,
  respondToConnectionRequest,
  getUserConnections,
  getPendingRequests,
  createConnectionRequestSchema,
  respondToRequestSchema,
  getUserConnectionsSchema,
  getPendingRequestsSchema,
} from '../controllers/connectionController';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/connections/create-requests
 * @desc    Create connection requests for qualifying pairs
 * @access  Public (should be protected in production - run as scheduled job)
 */
router.post('/create-requests', createConnectionRequests);

/**
 * @route   PATCH /api/connections/requests/:requestId/respond
 * @desc    Accept or reject a connection request
 * @access  Public (should be protected in production)
 */
router.patch(
  '/requests/:requestId/respond',
  validate(respondToRequestSchema),
  respondToConnectionRequest
);

/**
 * @route   GET /api/connections/user/:userId
 * @desc    Get user's active connections
 * @access  Public (should be protected in production)
 */
router.get('/user/:userId', validate(getUserConnectionsSchema), getUserConnections);

/**
 * @route   GET /api/connections/pending/:userId
 * @desc    Get user's pending connection requests
 * @access  Public (should be protected in production)
 */
router.get('/pending/:userId', validate(getPendingRequestsSchema), getPendingRequests);

export default router;

