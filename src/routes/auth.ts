import express from 'express';
import AuthController from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import logger from '../config/logger';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);
router.post('/register', (req, res, next) => authController.register(req, res, next));

export default router;
