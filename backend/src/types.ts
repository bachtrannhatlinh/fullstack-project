export interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
  db: any; // Mock database for development
  prisma: any; // PrismaClient
  mongodb: any; // MongoDB connection
  redis: any; // Redis client
}
