import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    try {
      return await this.userRepository.save({ firstName, lastName, email, password });
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      const err = createHttpError(500, 'Failed to create user in database');
      throw err;
    }
  }
}
