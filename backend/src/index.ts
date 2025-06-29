import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { createContext } from './context';
import { connectDatabases } from './database/connection';
import { logger } from './utils/logger';
import { 
  generalLimiter, 
  authLimiter, 
  transactionLimiter,
  accountCreationLimiter
} from './utils/rateLimiting';
import { 
  formatGraphQLError, 
  errorHandler, 
  CustomError 
} from './utils/errorHandling';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Connect to databases
    await connectDatabases();

    const app = express();
    const httpServer = http.createServer(app);

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));

    // Rate limiting middleware
    app.use('/graphql', generalLimiter);
    
    // Specific rate limiters for different operations
    app.use('/auth', authLimiter);
    app.use('/transactions', transactionLimiter);
    app.use('/accounts', accountCreationLimiter);

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
      ],
      formatError: formatGraphQLError,
      includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
    });

    await server.start();

    // Apply middleware
    app.use(
      '/graphql',
      cors<cors.CorsRequest>({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      }),
      express.json({ limit: '50mb' }),
      expressMiddleware(server, {
        context: createContext,
      })
    );

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Metrics endpoint
    app.get('/metrics', (req, res) => {
      res.json({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        timestamp: new Date().toISOString()
      });
    });

    // Error handling middleware
    app.use(errorHandler);

    // Global error handlers
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

    logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    logger.info(`📊 Health check at http://localhost:${PORT}/health`);
    logger.info(`📈 Metrics at http://localhost:${PORT}/metrics`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
