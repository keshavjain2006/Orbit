import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Validation schemas
export const createConnectionRequestSchema = z.object({
  body: z.object({
    requesterId: z.string().uuid(),
    requestedId: z.string().uuid(),
  }),
});

export const respondToRequestSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
  body: z.object({
    userId: z.string().uuid(),
    accept: z.boolean(),
  }),
});

export const getUserConnectionsSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

export const getPendingRequestsSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

/**
 * Create connection requests for qualifying pairs
 * POST /api/connections/create-requests
 */
export const createConnectionRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get pairs that qualify (3+ encounters in 14 days)
    const qualifyingPairs = await prisma.$queryRaw<Array<{
      user1_id: string;
      user2_id: string;
    }>>`
      SELECT 
        e.user1_id,
        e.user2_id
      FROM encounters e
      WHERE e.encountered_at >= NOW() - INTERVAL '14 days'
      GROUP BY e.user1_id, e.user2_id
      HAVING COUNT(*) >= 3
      AND NOT EXISTS (
        SELECT 1 FROM connection_requests cr
        WHERE ((cr.requester_id = e.user1_id AND cr.requested_id = e.user2_id)
           OR (cr.requester_id = e.user2_id AND cr.requested_id = e.user1_id))
        AND cr.status IN ('pending', 'accepted')
      )
      AND NOT EXISTS (
        SELECT 1 FROM connections c
        WHERE ((c.user1_id = e.user1_id AND c.user2_id = e.user2_id)
           OR (c.user1_id = e.user2_id AND c.user2_id = e.user1_id))
        AND c.is_active = TRUE
      )
    `;

    let createdCount = 0;

    for (const pair of qualifyingPairs) {
      const [requesterId, requestedId] = 
        pair.user1_id < pair.user2_id 
          ? [pair.user1_id, pair.user2_id]
          : [pair.user2_id, pair.user1_id];

      try {
        await prisma.connectionRequest.create({
          data: {
            requesterId,
            requestedId,
            status: 'pending',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });
        createdCount++;
      } catch (error: any) {
        // Ignore duplicate errors (P2002)
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }

    res.json({
      success: true,
      message: `Created ${createdCount} connection request(s)`,
      data: {
        created: createdCount,
        total: qualifyingPairs.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept or reject a connection request
 * PATCH /api/connections/requests/:requestId/respond
 */
export const respondToConnectionRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { requestId } = req.params;
    const { userId, accept } = req.body;

    // Get the request
    const request = await prisma.connectionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError(404, 'Connection request not found');
    }

    if (request.status !== 'pending') {
      throw new AppError(400, 'Connection request is not pending');
    }

    // Verify user is part of the request
    if (request.requesterId !== userId && request.requestedId !== userId) {
      throw new AppError(403, 'User is not part of this connection request');
    }

    if (!accept) {
      // Reject the request
      await prisma.connectionRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      return res.json({
        success: true,
        message: 'Connection request rejected',
        data: null,
      });
    }

    // Accept the request
    const updateData: Prisma.ConnectionRequestUpdateInput = {};
    if (request.requesterId === userId) {
      updateData.requesterAcceptedAt = new Date();
    } else {
      updateData.requestedAcceptedAt = new Date();
    }

    const updatedRequest = await prisma.connectionRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Check if both users have accepted
    if (updatedRequest.requesterAcceptedAt && updatedRequest.requestedAcceptedAt) {
      // Both accepted! Create the connection
      const [user1Id, user2Id] = 
        updatedRequest.requesterId < updatedRequest.requestedId
          ? [updatedRequest.requesterId, updatedRequest.requestedId]
          : [updatedRequest.requestedId, updatedRequest.requesterId];

      let connection;
      try {
        connection = await prisma.connection.create({
          data: {
            user1Id,
            user2Id,
            connectionRequestId: requestId,
          },
        });

        // Update request status
        await prisma.connectionRequest.update({
          where: { id: requestId },
          data: { status: 'accepted' },
        });

        // Conversation will be created automatically by trigger
        // But we can also create it explicitly if needed
        await prisma.conversation.upsert({
          where: { connectionId: connection.id },
          create: {
            connectionId: connection.id,
          },
          update: {},
        });

        return res.json({
          success: true,
          message: 'Connection established successfully',
          data: {
            connectionId: connection.id,
            conversationId: (await prisma.conversation.findUnique({
              where: { connectionId: connection.id },
            }))?.id,
          },
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Connection already exists
          const existingConnection = await prisma.connection.findUnique({
            where: {
              user1Id_user2Id: {
                user1Id,
                user2Id,
              },
            },
          });

          return res.json({
            success: true,
            message: 'Connection already exists',
            data: {
              connectionId: existingConnection?.id,
            },
          });
        }
        throw error;
      }
    }

    // Waiting for other user to accept
    res.json({
      success: true,
      message: 'Request accepted, waiting for other user',
      data: {
        requestId: updatedRequest.id,
        status: updatedRequest.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's connections
 * GET /api/connections/user/:userId
 */
export const getUserConnections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const connections = await prisma.connection.findMany({
      where: {
        isActive: true,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            pronouns: true,
            photoUrl: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            pronouns: true,
            photoUrl: true,
          },
        },
        conversation: {
          select: {
            id: true,
            lastMessageAt: true,
            lastMessagePreview: true,
          },
        },
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });

    // Format response to show "other user" for each connection
    const formattedConnections = connections.map((conn) => {
      const otherUser = conn.user1Id === userId ? conn.user2 : conn.user1;
      return {
        connectionId: conn.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          pronouns: otherUser.pronouns,
          photoUrl: otherUser.photoUrl,
        },
        connectedAt: conn.connectedAt,
        conversationId: conn.conversation?.id,
        lastMessageAt: conn.conversation?.lastMessageAt,
        lastMessagePreview: conn.conversation?.lastMessagePreview,
      };
    });

    res.json({
      success: true,
      data: formattedConnections,
      count: formattedConnections.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's pending connection requests
 * GET /api/connections/pending/:userId
 */
export const getPendingRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const requests = await prisma.connectionRequest.findMany({
      where: {
        status: 'pending',
        OR: [
          { requesterId: userId },
          { requestedId: userId },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            pronouns: true,
            photoUrl: true,
          },
        },
        requested: {
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
    });

    // Format response
    const formattedRequests = requests.map((req) => {
      const otherUser = req.requesterId === userId ? req.requested : req.requester;
      const isRequester = req.requesterId === userId;

      return {
        requestId: req.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          pronouns: otherUser.pronouns,
          photoUrl: otherUser.photoUrl,
        },
        isRequester,
        createdAt: req.createdAt,
        expiresAt: req.expiresAt,
      };
    });

    res.json({
      success: true,
      data: formattedRequests,
      count: formattedRequests.length,
    });
  } catch (error) {
    next(error);
  }
};

