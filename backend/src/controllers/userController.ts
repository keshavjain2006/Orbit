import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
// Helper to convert empty strings to undefined for optional fields
const optionalString = (maxLength?: number) => {
  return z
    .string()
    .max(maxLength || 1000)
    .transform((val) => {
      const trimmed = val.trim();
      return trimmed === '' ? undefined : trimmed;
    })
    .optional();
};

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    pronouns: optionalString(50),
    bio: optionalString(500),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

export const getUsersSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    pronouns: optionalString(50),
    bio: optionalString(500),
  }),
});

/**
 * Create a new user
 * POST /api/users
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, pronouns, bio } = req.body;

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        pronouns: pronouns || null,
        bio: bio || null,
      },
      select: {
        id: true,
        name: true,
        pronouns: true,
        bio: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a user by ID
 * GET /api/users/:userId
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        pronouns: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (paginated)
 * GET /api/users
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          pronouns: true,
          bio: true,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({
        where: { isActive: true },
      }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user
 * PATCH /api/users/:userId
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { name, pronouns, bio } = req.body;

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new AppError(404, 'User not found');
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(pronouns !== undefined && { pronouns }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        name: true,
        pronouns: true,
        bio: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

