import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid(),
    senderId: z.string().uuid(),
    content: z.string().min(1).max(5000),
    messageType: z.enum(['text', 'image', 'video', 'location', 'system']).optional(),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid(),
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const markAsReadSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid(),
  }),
  body: z.object({
    userId: z.string().uuid(),
  }),
});

/**
 * Send a message
 * POST /api/messages
 */
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId, senderId, content, messageType = 'text' } = req.body;

    // Verify conversation exists and user is part of it
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        connection: true,
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    if (!conversation.connection.isActive) {
      throw new AppError(400, 'Connection is not active');
    }

    // Verify sender is part of the connection
    if (
      conversation.connection.user1Id !== senderId &&
      conversation.connection.user2Id !== senderId
    ) {
      throw new AppError(403, 'User is not part of this conversation');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        messageType,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            pronouns: true,
            photoUrl: true,
          },
        },
      },
    });

    // Update conversation's last message (trigger does this, but we can also do it explicitly)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: message.createdAt,
        lastMessagePreview: content.substring(0, 100),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: message.id,
        conversationId: message.conversationId,
        sender: message.sender,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat history for a conversation
 * GET /api/messages/conversation/:conversationId
 */
export const getConversationMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId } = req.params;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            pronouns: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: {
        conversationId,
        deletedAt: null,
      },
    });

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark messages as read
 * PATCH /api/messages/conversation/:conversationId/read
 */
export const markMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    // Verify conversation exists and user is part of it
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        connection: true,
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    if (
      conversation.connection.user1Id !== userId &&
      conversation.connection.user2Id !== userId
    ) {
      throw new AppError(403, 'User is not part of this conversation');
    }

    // Mark messages as read (only messages not sent by the user)
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: `Marked ${result.count} message(s) as read`,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

