import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenant';
import cookieParser from 'cookie-parser';
import path from 'path';

// FtSi*Ura/mq-wv3
// b9248ead865e276e5e3a53732b2661111dd929ec

const app = express();
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Explicit route for JWKS endpoint
app.get('/.well-known/jwks.json', (req, res) => {
  res.sendFile('jwks.json', { root: 'public/.well-known' });
});

app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);

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
