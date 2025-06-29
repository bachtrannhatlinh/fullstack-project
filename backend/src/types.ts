export interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
  prisma: any; // PrismaClient
  mongodb: any; // MongoDB connection
  redis: any; // Redis client
}
