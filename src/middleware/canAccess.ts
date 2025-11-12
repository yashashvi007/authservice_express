import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { AuthRequest } from '../types/index';

export const canAccess = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as AuthRequest;
    const roleFromToken = _req.auth?.role;
    if (!roleFromToken || !roles.includes(roleFromToken)) {
      const error = createHttpError(403, 'You dont have enough permissions');
      next(error);
      return;
    }
    next();
  };
};
