import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { createContext } from './context';
import { connectDatabases } from './database/connection';
import { logger } from './utils/logger';

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

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    });
    app.use('/graphql', limiter);

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
      ],
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
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

    logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    logger.info(`📊 Health check at http://localhost:${PORT}/health`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
