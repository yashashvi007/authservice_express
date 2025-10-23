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
    this.logger.debug(`Registering user ${firstName} ${lastName} with email ${email}`);
    try {
      const user = await this.userService.create({ firstName, lastName, email, password });
      this.logger.info(`User ${firstName} ${lastName} registered successfully`);
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default AuthController;
