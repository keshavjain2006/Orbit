import { Router } from 'express';
import {
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  sendMessageSchema,
  getMessagesSchema,
  markAsReadSchema,
} from '../controllers/messageController';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Public (should be protected in production)
 */
router.post('/', validate(sendMessageSchema), sendMessage);

/**
 * @route   GET /api/messages/conversation/:conversationId
 * @desc    Get chat history for a conversation
 * @access  Public (should be protected in production)
 */
router.get('/conversation/:conversationId', validate(getMessagesSchema), getConversationMessages);

/**
 * @route   PATCH /api/messages/conversation/:conversationId/read
 * @desc    Mark messages as read
 * @access  Public (should be protected in production)
 */
router.patch('/conversation/:conversationId/read', validate(markAsReadSchema), markMessagesAsRead);

export default router;

