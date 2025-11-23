import { Router } from 'express';
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  createUserSchema,
  getUserSchema,
  getUsersSchema,
  updateUserSchema,
} from '../controllers/userController';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public (should be protected in production)
 */
router.post('/', validate(createUserSchema), createUser);

/**
 * @route   GET /api/users/:userId
 * @desc    Get a user by ID
 * @access  Public (should be protected in production)
 */
router.get('/:userId', validate(getUserSchema), getUser);

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Public (should be protected in production)
 */
router.get('/', validate(getUsersSchema), getUsers);

/**
 * @route   PATCH /api/users/:userId
 * @desc    Update a user
 * @access  Public (should be protected in production)
 */
router.patch('/:userId', validate(updateUserSchema), updateUser);

export default router;

