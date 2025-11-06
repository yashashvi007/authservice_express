import { NextFunction, Request, Response } from 'express';
import { AuthRequest, LoginRequest, UserData } from '../types/index';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';
import { CredentialService } from '../services/CredentialsService';

interface RegisterRequest extends Request {
  body: UserData;
}

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
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

    try {
      const user = await this.userService.create({ firstName, lastName, email, password });
      this.logger.info(`User ${firstName} ${lastName} registered successfully`);

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const persistedRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: persistedRefreshToken.id,
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
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });
      res.status(201).json({ id: user.id, role: user.role });
    } catch (error) {
      next(error);
      return;
    }
  }

  async login(req: LoginRequest, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const err = createHttpError(400, 'Validation failed');
      next(err);
      return;
    }
    this.logger.debug(`Logging in user with email ${email} and password ${password}`);
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        const err = createHttpError(400, 'Email or password does not match');
        next(err);
        return;
      }

      const isPasswordValid = await this.credentialService.compare(password, user.password);
      if (!isPasswordValid) {
        const err = createHttpError(400, 'Email or password does not match');
        next(err);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };
      const accessToken = this.tokenService.generateAccessToken(payload);

      const persistedRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: persistedRefreshToken.id,
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
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      this.logger.info(`User ${user.firstName} ${user.lastName} logged in successfully`);
      res.status(201).json({ id: user.id, role: user.role });
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth?.sub));
    res.status(200).json(user);
  }
}

export default AuthController;
