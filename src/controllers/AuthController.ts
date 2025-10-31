import { NextFunction, Request, Response } from 'express';
import { UserData } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { JwtPayload, Secret, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { Config } from '../config';

interface RegisterRequest extends Request {
  body: UserData;
}

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const err = createHttpError(400, 'Validation failed');
      next(err);
      return;
    }
    this.logger.debug(`Registering user ${firstName} ${lastName} with email ${email}`);

    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(path.join(__dirname, '../../certs/private.pem'));
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      const err = createHttpError(500, 'Failed to read private key');
      next(err);
      return;
    }

    try {
      const user = await this.userService.create({ firstName, lastName, email, password });
      this.logger.info(`User ${firstName} ${lastName} registered successfully`);

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h',
        issuer: 'auth-service',
      });

      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET as Secret, {
        algorithm: 'HS256',
        expiresIn: '1d',
        issuer: 'auth-service',
      });
      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      });
      res.status(201).json({ id: user.id, role: user.role });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default AuthController;
