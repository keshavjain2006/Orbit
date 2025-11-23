import { Router } from 'express';
import {
  recordEncounter,
  checkConnectionRequests,
  getUserEncounters,
  recordEncounterSchema,
  checkEncountersSchema,
} from '../controllers/encounterController';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/encounters
 * @desc    Record an encounter between two users
 * @access  Public (should be protected in production)
 */
router.post('/', validate(recordEncounterSchema), recordEncounter);

/**
 * @route   GET /api/encounters/check-requests
 * @desc    Check if connection requests should be created
 * @access  Public (should be protected in production)
 */
router.get('/check-requests', checkConnectionRequests);

/**
 * @route   GET /api/encounters
 * @desc    Get encounters for a user
 * @access  Public (should be protected in production)
 */
router.get('/', validate(checkEncountersSchema), getUserEncounters);

export default router;

