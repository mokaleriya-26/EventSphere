import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { checkDatabaseReadiness } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Route modules
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/events.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import registrationRoutes from './routes/registrations.routes.js';
import organizerRoutes from './routes/organizer.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import userRoutes from './routes/users.routes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS Configuration with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin === env.FRONTEND_URL ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Origin not allowed.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body and Cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseReadiness();
  const statusCode = dbHealth.isConnected ? 200 : 503;

  res.status(statusCode).json({
    success: true,
    status: dbHealth.isConnected ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    service: 'EventSphere API',
    database: {
      status: dbHealth.isConnected ? 'connected' : 'disconnected',
      message: dbHealth.message
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
