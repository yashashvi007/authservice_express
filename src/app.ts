import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRoutes from './routes/auth';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/auth', authRoutes);

app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message);

  const statusCode = err.statusCode || 500;

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
