import createHttpError from 'http-errors';
import { UserService } from '../services/UserService';
import { NextFunction, Request, Response } from 'express';

export class UserController {
  constructor(private userService: UserService) {
    this.userService = userService;
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      const err = createHttpError(500, 'Failed to get users');
      next(err);
      return;
    }
  }
}
