import { Context } from './types';
import { verifyToken } from './utils/auth';
import { db } from './database/mockDb';

export async function createContext({ req }: { req: any }): Promise<Context> {
  let user = null;

  // Extract token from Authorization header
  const authorization = req.headers.authorization;
  if (authorization) {
    try {
      const token = authorization.replace('Bearer ', '');
      const decoded = verifyToken(token);
      
      // Find user in database
      const foundUser = db.users.findById(decoded.userId);
      if (foundUser && foundUser.isActive) {
        user = {
          id: foundUser.id,
          email: foundUser.email,
          role: 'user', // Default role
        };
      }
    } catch (error) {
      // Token is invalid, user remains null
      console.log('Invalid token:', error);
    }
  }

  return {
    user,
    db, // Mock database for development
    prisma: null, // Will be initialized with actual PrismaClient later
    mongodb: null, // Will be initialized with MongoDB connection later
    redis: null, // Will be initialized with Redis client later
  };
}
