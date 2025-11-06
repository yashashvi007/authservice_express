import express, { NextFunction, Request, Response } from 'express';
import AuthController from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import logger from '../config/logger';
import { AuthRequest, LoginRequest, RegisterRequest } from '../types/index';
import registerValidator from '../validators/register-validator';
import loginValidator from '../validators/login-validator';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
import { CredentialService } from '../services/CredentialsService';
import authenticate from '../middleware/authenticate';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(userService, logger, tokenService, credentialService);
router.post('/register', registerValidator, (req: RegisterRequest, res: Response, next: NextFunction) =>
  authController.register(req, res, next),
);

router.post('/login', loginValidator, (req: LoginRequest, res: Response, next: NextFunction) =>
  authController.login(req, res, next),
);

router.get('/self', authenticate, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  void authController.self(authReq, res);
});

export default router;
