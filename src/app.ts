import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenant';
import userRoutes from './routes/user';

import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import { Config } from './config/index';

const app = express();

const corsOptions = {
  origin: Config.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

// Explicit route for JWKS endpoint
app.get('/.well-known/jwks.json', (req, res) => {
  res.sendFile('jwks.json', { root: 'public/.well-known' });
});

app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/users', userRoutes);

app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: '',
      },
    ],
  });
});

export default app;
