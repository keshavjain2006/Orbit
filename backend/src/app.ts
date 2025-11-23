import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import encounterRoutes from './routes/encounters';
import connectionRoutes from './routes/connections';
import messageRoutes from './routes/messages';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:5173',
    'http://localhost:8081',  // Expo default
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,  // Allow any local network IP
    /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/,  // Allow 172.x.x.x IPs
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,   // Allow 10.x.x.x IPs
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;

