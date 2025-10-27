import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const err = createHttpError(400, 'Email already in use');
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      return await this.userRepository.save({ firstName, lastName, email, password: hashedPassword, role: 'customer' });
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      const err = createHttpError(500, 'Failed to create user in database');
      throw err;
    }
  }
}
