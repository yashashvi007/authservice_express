import express, { NextFunction, Request, Response } from 'express';
import authenticate from '../middleware/authenticate';
import { canAccess } from '../middleware/canAccess';
import { ROLES } from '../constants';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { CreateUserRequest } from '../types/index';

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);
const router = express.Router();

router.get(
  '/',
  authenticate,
  canAccess([ROLES.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => void userController.getUsers(req, res, next),
);

router.post(
  '/',
  authenticate,
  canAccess([ROLES.ADMIN]),
  (req: CreateUserRequest, res: Response, next: NextFunction) => void userController.createUser(req, res, next),
);
export default router;
