import createHttpError from 'http-errors';
import { UserService } from '../services/UserService';
import { NextFunction, Request, Response } from 'express';
import { CreateUserRequest, UpdateUserData, UpdateUserRequest, UserQueryParams } from '../types/index';
import { matchedData, validationResult } from 'express-validator';

export class UserController {
  constructor(private userService: UserService) {
    this.userService = userService;
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    const data = matchedData(req, { includeOptionals: true });
    try {
      const [users, total] = await this.userService.getAllUsers(data as UserQueryParams);
      return res.status(200).json({
        currentPage: data.currentPage as number,
        perPage: data.perPage as number,
        total,
        data: users,
      });
    } catch {
      const err = createHttpError(500, 'Failed to get users');
      next(err);
      return;
    }
  }

  async createUser(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0]?.msg as string));
    }

    const { firstName, lastName, email, password, role, tenantId } = req.body;
    try {
      const userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: string;
        tenantId?: number;
      } = {
        firstName,
        lastName,
        email,
        password,
        role,
      };
      if (tenantId !== undefined) {
        userData.tenantId = tenantId;
      }
      const user = await this.userService.create(userData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: UpdateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0]?.msg as string));
    }

    const { firstName, lastName, email, role, tenantId } = req.body;
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      next(createHttpError(400, 'Invalid user ID'));
      return;
    }

    try {
      const updateData: UpdateUserData = {
        firstName,
        lastName,
        email,
        role,
      };
      if (tenantId !== undefined) {
        updateData.tenantId = tenantId;
      }
      await this.userService.updateUser(userId, updateData);
      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      next(error);
      return;
    }
  }
}
