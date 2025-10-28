import express, { NextFunction, Response } from 'express';
import AuthController from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import logger from '../config/logger';
import { RegisterRequest } from '../types/index';
import registerValidator from '../validators/register-validator';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);
router.post('/register', registerValidator, (req: RegisterRequest, res: Response, next: NextFunction) =>
  authController.register(req, res, next),
);

export default router;
