import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
export const recordEncounterSchema = z.object({
  body: z.object({
    user1Id: z.string().uuid(),
    user2Id: z.string().uuid(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const checkEncountersSchema = z.object({
  query: z.object({
    userId: z.string().uuid().optional(),
  }),
});

/**
 * Record an encounter between two users
 * POST /api/encounters
 */
export const recordEncounter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user1Id, user2Id, latitude, longitude } = req.body;

    // Ensure user1Id < user2Id for consistency
    const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    // Check if users exist
    const users = await prisma.user.findMany({
      where: {
        id: { in: [smallerId, largerId] },
      },
    });

    if (users.length !== 2) {
      throw new AppError(404, 'One or both users not found');
    }

    // Record encounter (will fail silently if duplicate due to unique constraint)
    const encounter = await prisma.encounter.create({
      data: {
        user1Id: smallerId,
        user2Id: largerId,
        latitude: latitude ? new Prisma.Decimal(latitude) : null,
        longitude: longitude ? new Prisma.Decimal(longitude) : null,
      },
    }).catch((error: any) => {
      // Handle duplicate encounter (within same minute)
      if (error.code === 'P2002') {
        return null; // Duplicate, ignore
      }
      throw error;
    });

    if (!encounter) {
      return res.status(200).json({
        success: true,
        message: 'Encounter already recorded (duplicate ignored)',
        data: null,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Encounter recorded successfully',
      data: {
        id: encounter.id,
        user1Id: encounter.user1Id,
        user2Id: encounter.user2Id,
        encounteredAt: encounter.encounteredAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if connection requests should be created
 * GET /api/encounters/check-requests
 */
export const checkConnectionRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Call the database function
    const result = await prisma.$queryRaw<Array<{
      user1_id: string;
      user2_id: string;
      encounter_count: bigint;
      first_encounter: Date;
      last_encounter: Date;
    }>>`
      SELECT 
        e.user1_id,
        e.user2_id,
        COUNT(*)::bigint as encounter_count,
        MIN(e.encountered_at) as first_encounter,
        MAX(e.encountered_at) as last_encounter
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

    const pairs = result.map((row) => ({
      user1Id: row.user1_id,
      user2Id: row.user2_id,
      encounterCount: Number(row.encounter_count),
      firstEncounter: row.first_encounter,
      lastEncounter: row.last_encounter,
    }));

    res.json({
      success: true,
      data: pairs,
      count: pairs.length,
    });
  } catch (error: any) {
    console.error('❌ Error in checkConnectionRequests:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    next(error);
  }
};

/**
 * Get encounters for a user
 * GET /api/encounters
 */
export const getUserEncounters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw new AppError(400, 'userId query parameter is required');
    }

    const encounters = await prisma.encounter.findMany({
      where: {
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
            bio: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            pronouns: true,
            bio: true,
          },
        },
      },
      orderBy: {
        encounteredAt: 'desc',
      },
      take: 100, // Limit to recent 100
    });

    res.json({
      success: true,
      data: encounters,
      count: encounters.length,
    });
  } catch (error) {
    next(error);
  }
};

