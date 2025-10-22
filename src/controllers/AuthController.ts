import { NextFunction, Request, Response } from 'express';
import { UserData } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';

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
    try {
      await this.userService.create({ firstName, lastName, email, password });
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default AuthController;
