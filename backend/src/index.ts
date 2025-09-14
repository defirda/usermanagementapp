import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import auditRoutes from './routes/audit.routes';
import { swaggerUiHandler, swaggerUiSetup } from './swagger';
import { logger } from './utils/logger';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import pinoHttp from 'pino-http';
import { rateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';

dotenv.config();

const app = express();

// Konfigurasi CORS dinamis
const corsOptions: CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Integrasi pino-http dengan customProps
app.use(
  pinoHttp({
    logger,
    customProps: (req: import('http').IncomingMessage) => ({
      requestId: (req as any).requestId,
    }),
  })
);

// Integrasi rateLimiter
app.use(rateLimiter);

// Health endpoint
app.get('/ping', (req, res) => {
  req.log.info('Ping endpoint hit');
  res.send('pong');
});

// Inisiasi swagger
app.use('/api-docs', swaggerUiHandler, swaggerUiSetup);

app.get('/', (req: Request, res: Response) => {
  req.log.info('API is up and running!');
  res.send('API is up and running!');
});

// Inisiasi route auth
app.use('/api/auth', authRoutes);

// Inisiasi route users
app.use('/api/users', userRoutes);

// Inisiasi route audit
app.use('/api/audit', auditRoutes);

// Integrasi errorHandler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info('Server running on port 3000');
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
